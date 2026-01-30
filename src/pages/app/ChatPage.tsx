import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { xano } from '@/lib/xano';
import { useToast } from '@/hooks/use-toast';
import apeBot from '@/assets/ape-bot.jpeg';
import ReactMarkdown from 'react-markdown';

// Utility function to clean unicode escape sequences and format text
const cleanText = (text: string): string => {
  if (!text) return '';
  
  // First, try to parse as JSON if it looks like JSON
  let cleaned = text;
  try {
    if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
      const parsed = JSON.parse(text);
      if (typeof parsed === 'string') {
        cleaned = parsed;
      } else if (parsed.result) {
        cleaned = typeof parsed.result === 'string' ? parsed.result : JSON.stringify(parsed.result);
      } else if (parsed.content) {
        cleaned = parsed.content;
      } else if (parsed.text) {
        cleaned = parsed.text;
      }
    }
  } catch {
    // Not JSON, use as-is
  }
  
  // Decode unicode escape sequences
  cleaned = cleaned
    .replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
  
  return cleaned;
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: string[]; // Track which tools were used
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [agentId, setAgentId] = useState<string>('3'); // Freight Flow Agent ID
  const [userProfile, setUserProfile] = useState<any>({});
  const [userName, setUserName] = useState<string>('there');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load agent ID and user profile from settings/database
  useEffect(() => {
    const initializeChat = async () => {
      setIsInitializing(true);
      
      // FORCE update to agent ID 3 if it's set to old value 20
      const savedAgentId = localStorage.getItem('xano_agent_id');
      if (!savedAgentId || savedAgentId === '20') {
        localStorage.setItem('xano_agent_id', '3');
        setAgentId('3');
      } else {
        setAgentId(savedAgentId);
      }
      
      // Try to load user profile from Xano database first
      let profile: any = {};
      let name = 'there';
      
      try {
        // Check if user is authenticated
        if (xano.isAuthenticated()) {
          // Fetch customer profile from database
          const dbProfile = await xano.getCustomerProfile();
          if (dbProfile) {
            profile = dbProfile;
            name = dbProfile.contact_name || 'there';
            // Sync to localStorage
            localStorage.setItem('customer_profile', JSON.stringify(dbProfile));
          }
          
          // Get or create conversation for message logging
          const conversation = await xano.getOrCreateConversation();
          if (conversation) {
            setConversationId(conversation.id);
          }
        }
      } catch (error) {
        console.error('Error loading profile from database:', error);
      }
      
      // Fallback to localStorage if database fetch failed
      if (!profile.id) {
        profile = JSON.parse(localStorage.getItem('customer_profile') || '{}');
        name = profile.contact_name || 'there';
      }
      
      setUserProfile(profile);
      setUserName(name);
      
      // Set a personalized welcome message
      setMessages([{
        id: '0',
        role: 'assistant',
        content: `Hello, ${name}! 👋 I'm your **APE Global Freight AI Assistant**. I can help you with:\n\n*   **Quoting freight rates**\n*   **Booking shipments**\n*   **Tracking shipments**\n\nWhat can I help you with today?`,
        timestamp: new Date(),
      }]);
      
      setIsInitializing(false);
    };
    
    initializeChat();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!agentId) {
      toast({
        title: 'Agent Not Configured',
        description: 'Please set your Xano Agent ID in Settings.',
        variant: 'destructive',
      });
      return;
    }

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
      // Log user message to database if we have a conversation
      if (conversationId) {
        xano.logAgentMessage(conversationId, 'user', userMessage.content);
      }

      // Build conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Create assistant message placeholder
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        toolCalls: [],
      };
      
      setMessages((prev) => [...prev, assistantMessage]);

      // Call Xano Agent with streaming
      let fullResponse = '';
      let toolsUsed: string[] = [];
      
      try {
        fullResponse = await xano.streamAgent(
          agentId,
          userMessage.content,
          conversationHistory,
          (chunk) => {
            // Update message with streaming chunks in real-time
            fullResponse += chunk;
            
            // Clean and update message
            const cleaned = cleanText(fullResponse);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: cleaned }
                  : msg
              )
            );
          },
          {
            name: userName,
            email: userProfile.email,
            company: userProfile.company_name
          }
        );
        
        // Final cleanup of the full response
        fullResponse = cleanText(fullResponse);
        
        // Update final message with cleaned response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: fullResponse }
              : msg
          )
        );
      } catch (streamError) {
        console.log('Streaming failed, trying non-streaming call:', streamError);
      }

      // If streaming didn't work, try non-streaming call
      if (!fullResponse || fullResponse.trim() === '') {
        const response = await xano.callAgent(agentId, userMessage.content, conversationHistory, {
          name: userName,
          email: userProfile.email,
          company: userProfile.company_name
        });
        
        // Extract response content
        if (response.result) {
          fullResponse = response.result.content || response.result.text || JSON.stringify(response.result);
          
          // Track tool usage if available
          if (response.tool_calls) {
            toolsUsed = response.tool_calls.map((tc: any) => tc.tool_name || tc.name);
          }
        } else {
          fullResponse = response.content || response.text || 'No response received';
        }
        
        // Clean up unicode sequences
        fullResponse = cleanText(fullResponse);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: fullResponse, toolCalls: toolsUsed }
              : msg
          )
        );
      }

      // Log assistant response to database
      if (conversationId && fullResponse) {
        xano.logAgentMessage(conversationId, 'assistant', fullResponse, toolsUsed);
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      
      const errorMessage = error.message || 'Failed to get response from AI';
      
      toast({
        title: 'Error',
        description: errorMessage.includes('Agent not found') 
          ? 'Invalid Agent ID. Please check your Settings.'
          : errorMessage,
        variant: 'destructive',
      });
      
      // Update assistant message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === (Date.now() + 1).toString()
            ? { ...msg, content: "I'm having trouble processing your request. Please try again or check your agent configuration." }
            : msg
        )
      );
    } finally {
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
          alt="APE Bot" 
          className="h-12 w-12 rounded-full border-2 border-primary/30 object-cover shadow-md"
        />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-auto p-4 pt-20">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="mb-2 font-display text-2xl font-bold">
              APE <span className="text-primary">Assistant</span>
            </h2>
            <p className="max-w-md text-muted-foreground mb-4">
              Your AI-powered logistics assistant. Ask me about shipments, quotes, rates, or anything freight-related!
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>💡 <strong>Try asking:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>"Get me a quote from Miami to New York for 1000 lbs"</li>
                <li>"What's the status of shipment #12345?"</li>
                <li>"Show me my recent shipments"</li>
                <li>"Book a shipment with carrier XYZ"</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex max-w-[80%] items-start gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <img
                      src={apeBot}
                      alt="APE Bot"
                      className="h-8 w-8 rounded-full border border-primary/20 object-cover"
                    />
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-headings:my-3 prose-strong:font-semibold prose-code:text-sm prose-pre:bg-muted prose-pre:p-2 prose-pre:rounded">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 ml-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 ml-2">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                            pre: ({ children }) => <pre className="bg-muted p-2 rounded overflow-x-auto mb-2">{children}</pre>,
                          }}
                        >
                          {cleanText(message.content)}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                    {message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                          🛠️ Used tools: {message.toolCalls.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-3">
                  <img
                    src={apeBot}
                    alt="APE Bot"
                    className="h-8 w-8 rounded-full border border-primary/20 object-cover"
                  />
                  <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
