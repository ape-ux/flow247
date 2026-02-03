import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Loader2,
  MessageSquare,
  Plus,
  Trash2,
  History,
  X,
  FileText,
  MapPin,
  Package,
  Zap,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  getOrCreateConversation,
  getConversationMessages,
  getConversations,
  deleteConversation,
  streamAgentMessage,
} from '@/lib/xano';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import apeBot from '@/assets/ape-bot.jpeg';

// ============ Types ============

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: number;
  title?: string;
  created_at?: string;
  updated_at?: string;
  message_count?: number;
}

// ============ Quick Actions ============

const quickActions = [
  { label: 'Get a Quote', icon: FileText, message: 'I need a freight quote', color: 'text-blue-400' },
  { label: 'Track Shipment', icon: MapPin, message: 'Where is my shipment?', color: 'text-green-400' },
  { label: 'Book Shipment', icon: Package, message: 'I want to book a shipment', color: 'text-amber-400' },
  { label: 'LTL Rate', icon: Zap, message: 'Get me LTL rates from Miami to NYC for 1 pallet', color: 'text-purple-400' },
];

// ============ Typing Indicator ============

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2">
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs text-muted-foreground ml-1">Agent is thinking...</span>
    </div>
  );
}

// ============ Markdown Message ============

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="text-sm">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ children, className }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">
                {children}
              </code>
            );
          }
          return (
            <code className="block p-3 rounded-lg bg-muted/80 text-xs font-mono overflow-x-auto my-2">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <pre className="my-2">{children}</pre>,
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="min-w-full text-xs border-collapse">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => <thead className="border-b border-border/50">{children}</thead>,
        th: ({ children }) => <th className="px-2 py-1 text-left font-semibold">{children}</th>,
        td: ({ children }) => <td className="px-2 py-1 border-b border-border/20">{children}</td>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
            {children}
          </a>
        ),
        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-base font-bold mb-1.5">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground my-2">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ============ Main Component ============

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { xanoUser, user } = useAuth();

  // ============ Load conversations list ============

  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const { data, error } = await getConversations({ limit: 30 });
      if (!error && data) {
        setConversations(data as Conversation[]);
      }
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // ============ Initialize conversation ============

  useEffect(() => {
    const initConversation = async () => {
      try {
        const { data: conv, error } = await getOrCreateConversation();
        if (error || !conv) {
          console.error('Failed to create conversation:', error);
          return;
        }

        setConversationId(conv.id);

        // Load existing messages
        if (conv.id) {
          try {
            const { data: savedMessages } = await getConversationMessages(conv.id);
            if (savedMessages && savedMessages.length > 0) {
              const loadedMessages: Message[] = savedMessages.map((msg: any) => ({
                id: msg.id?.toString() || Date.now().toString(),
                role: msg.role as 'user' | 'assistant',
                content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
                timestamp: new Date(msg.created_at || Date.now()),
              }));
              setMessages(loadedMessages);
              return;
            }
          } catch {
            console.log('Starting fresh conversation');
          }
        }

        // Welcome message
        const currentUser = xanoUser || user;
        const userName = currentUser
          ? 'name' in currentUser
            ? (currentUser as any).name
            : currentUser.user_metadata?.name
          : null;

        setMessages([
          {
            id: 'welcome-' + Date.now(),
            role: 'assistant',
            content: `Hey${userName ? ` ${userName}` : ''}! 👋 I'm your **Freight Dispatch Assistant**.\n\nI can help you with:\n- **Quoting** freight rates (LTL, LCL, drayage)\n- **Booking** shipments with one confirmation\n- **Tracking** your shipments in real-time\n- **Documents** (BOL, commercial invoices, customs)\n\nWhat can I do for you?`,
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
      }
    };

    if (xanoUser || user) {
      initConversation();
      loadConversations();
    }
  }, [xanoUser, user, loadConversations]);

  // ============ Auto-scroll ============

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ============ Send message ============

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const userContext = {
        agent_name: 'Manager Agent',
        user_id: xanoUser?.id || user?.id,
        name: xanoUser?.name || user?.user_metadata?.name,
        email: xanoUser?.email || user?.email,
        tenant_id: xanoUser?.tenant_id,
      };

      const assistantMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        },
      ]);

      let assistantContent = '';

      await streamAgentMessage(
        {
          message: text,
          conversation_id: conversationId?.toString(),
          context: userContext,
        },
        (chunk) => {
          const cleanedChunk = chunk
            .replace(/\\u0027/g, "'")
            .replace(/\\u0022/g, '"')
            .replace(/\\n/g, '\n');

          assistantContent += cleanedChunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: assistantContent }
                : msg
            )
          );
        },
        async () => {
          setIsLoading(false);
          // Refresh conversation list
          loadConversations();
        },
        (error) => {
          console.error('Chat error:', error);
          toast({
            title: 'Error',
            description: 'Failed to get response from agent.',
            variant: 'destructive',
          });

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content:
                      "I'm having trouble processing your request. Please try again or contact support if the issue persists.",
                  }
                : msg
            )
          );
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Chat error:', error);
      setIsLoading(false);
    }
  };

  // ============ New conversation ============

  const startNewConversation = async () => {
    try {
      const { data: conv, error } = await getOrCreateConversation();
      if (error || !conv) return;

      setConversationId(conv.id);
      setMessages([]);
      
      const currentUser = xanoUser || user;
      const userName = currentUser
        ? 'name' in currentUser
          ? (currentUser as any).name
          : currentUser.user_metadata?.name
        : null;

      setMessages([
        {
          id: 'welcome-' + Date.now(),
          role: 'assistant',
          content: `New conversation started! 🚀\n\nHow can I help you${userName ? `, ${userName}` : ''}?`,
          timestamp: new Date(),
        },
      ]);

      loadConversations();
      setSidebarOpen(false);
    } catch (err) {
      console.error('Failed to start new conversation:', err);
    }
  };

  // ============ Load conversation ============

  const loadConversation = async (convId: number) => {
    try {
      setConversationId(convId);
      const { data: savedMessages } = await getConversationMessages(convId);
      if (savedMessages && savedMessages.length > 0) {
        setMessages(
          savedMessages.map((msg: any) => ({
            id: msg.id?.toString() || Date.now().toString(),
            role: msg.role as 'user' | 'assistant',
            content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
            timestamp: new Date(msg.created_at || Date.now()),
          }))
        );
      } else {
        setMessages([]);
      }
      setSidebarOpen(false);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  // ============ Delete conversation ============

  const handleDeleteConversation = async (convId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (conversationId === convId) {
        startNewConversation();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const showQuickActions = messages.length <= 1;

  return (
    <div className="relative flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border bg-card">
      {/* ============ Conversation Sidebar ============ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'absolute lg:relative z-50 h-full w-72 bg-card border-r flex flex-col transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-0 lg:hidden'
        )}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <History className="h-4 w-4" />
            Conversations
          </h3>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={startNewConversation}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {loadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                No previous conversations
              </p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group',
                    conv.id === conversationId
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-muted-foreground'
                  )}
                  onClick={() => loadConversation(conv.id)}
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {conv.title || `Conversation #${conv.id}`}
                    </p>
                    {conv.created_at && (
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* ============ Chat Area ============ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <History className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <img
                src={apeBot}
                alt="Ape Bot"
                className="h-8 w-8 rounded-full border-2 border-primary/50"
              />
              <div>
                <p className="text-sm font-semibold">Freight Assistant</p>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-muted-foreground">Online</span>
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={startNewConversation}>
            <Plus className="h-3 w-3 mr-1" />
            New Chat
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 mt-1">
                  <img
                    src={apeBot}
                    alt="Bot"
                    className="h-7 w-7 rounded-full border border-primary/30"
                  />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2.5',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted/60 rounded-bl-md'
                )}
              >
                {message.role === 'assistant' ? (
                  <div className="text-sm prose-sm">
                    {message.content ? (
                      <MarkdownContent content={message.content} />
                    ) : (
                      <TypingIndicator />
                    )}
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
                <p
                  className={cn(
                    'text-[10px] mt-1',
                    message.role === 'user'
                      ? 'text-primary-foreground/60'
                      : 'text-muted-foreground'
                  )}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator when loading but last message has content */}
          {isLoading && messages[messages.length - 1]?.content !== '' && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 mt-1">
                <img
                  src={apeBot}
                  alt="Bot"
                  className="h-7 w-7 rounded-full border border-primary/30"
                />
              </div>
              <div className="bg-muted/60 rounded-2xl rounded-bl-md px-4 py-2.5">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {showQuickActions && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2 justify-center">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="h-auto py-2 px-3 text-xs gap-1.5 glass-card hover:bg-muted/50"
                  onClick={() => sendMessage(action.message)}
                  disabled={isLoading}
                >
                  <action.icon className={cn('h-3.5 w-3.5', action.color)} />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t p-3 bg-background/50">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about shipments, quotes, or rates..."
              disabled={isLoading}
              className="flex-1 bg-muted/30 border-border/50"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="gradient-primary glow-cyan"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            Powered by FreightFlow AI • Manager Agent
          </p>
        </div>
      </div>
    </div>
  );
}
