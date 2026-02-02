import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getOrCreateConversation,
  getConversationMessages,
  streamAgentMessage,
} from '@/lib/xano';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import apeBot from '@/assets/ape-bot.jpeg';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { xanoUser, user } = useAuth();

  // Initialize conversation and load messages on mount
  useEffect(() => {
    const initConversation = async () => {
      try {
        const { data: conv, error } = await getOrCreateConversation();
        
        if (error || !conv) {
          console.error('Failed to create conversation:', error);
          return;
        }

        setConversationId(conv.id);

        // Try to load existing messages from Xano
        if (conv.id) {
          try {
            const { data: savedMessages } = await getConversationMessages(conv.id);
            if (savedMessages && savedMessages.length > 0) {
              // Convert saved messages to our Message format
              const loadedMessages: Message[] = savedMessages.map((msg: any) => ({
                id: msg.id?.toString() || Date.now().toString(),
                role: msg.role as 'user' | 'assistant',
                content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
                timestamp: new Date(msg.created_at || Date.now()),
              }));
              setMessages(loadedMessages);
              return; // Don't show welcome message if we have history
            }
          } catch (loadError) {
            console.log('No previous messages found, starting fresh conversation');
          }
        }

        // Add welcome message if no previous messages
        const currentUser = xanoUser || user;
        if (currentUser) {
            const userName = 'name' in currentUser ? currentUser.name : currentUser.user_metadata?.name;
            const welcomeMessage: Message = {
            id: 'welcome-' + Date.now(),
            role: 'assistant',
            content: `Hello ${userName || 'there'}! I'm your Freight Dispatch Assistant. I can help you with:

* **Quoting freight rates**
* **Booking shipments**
* **Tracking shipment status**

How can I assist you today?`,
            timestamp: new Date(),
          };
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
      }
    };
    
    // Only init if we have a user (wait for auth)
    if (xanoUser || user) {
        initConversation();
    }
  }, [xanoUser, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare user context for the agent
      const userContext = {
        agent_name: 'Manager Agent',
        user_id: xanoUser?.id || user?.id,
        name: xanoUser?.name || user?.user_metadata?.name,
        email: xanoUser?.email || user?.email,
        tenant_id: xanoUser?.tenant_id,
      };

      // Prepare assistant message placeholder
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      let assistantContent = '';

      await streamAgentMessage(
        {
          message: userMessage.content,
          conversation_id: conversationId?.toString(),
          context: userContext,
        },
        (chunk) => {
          // Fix escaped unicode characters in response (from MVP logic)
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
        },
        (error) => {
            console.error('Chat error:', error);
            toast({
                title: 'Error',
                description: 'Failed to get response from Freight Flow Agent.',
                variant: 'destructive',
            });
            
             // Add fallback message
            setMessages((prev) => [
                ...prev,
                {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: "I'm having trouble processing your request. Please try again or contact support if the issue persists.",
                timestamp: new Date(),
                },
            ]);
            setIsLoading(false);
        }
      );

    } catch (error) {
      console.error('Chat error:', error);
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="relative flex h-full flex-col">
      {/* Ape Bot Photo - Top Right Corner */}
      <div className="absolute right-4 top-4 z-10">
        <img 
          src={apeBot} 
          alt="Ape Bot" 
          className="h-12 w-12 rounded-full border-2 border-primary shadow-lg transition-transform hover:scale-110"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about shipments, quotes, or rates..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
