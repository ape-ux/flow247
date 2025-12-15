import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { xano } from '@/lib/xano';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  Package,
  Truck,
  HelpCircle
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  { icon: Package, text: 'Track my shipment status' },
  { icon: Truck, text: 'Calculate shipping rates' },
  { icon: HelpCircle, text: 'Customs documentation help' },
];

export default function Chat() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your APE Global AI assistant. I can help you with shipping inquiries, rate calculations, tracking, and logistics optimization. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call Xano AI endpoint
      const response = await xano.chatWithAI(content, conversationId);
      
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response || "I apologize, but I'm unable to process your request at the moment. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      // Demo mode fallback
      const demoResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getDemoResponse(content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, demoResponse]);
      
      if (!import.meta.env.VITE_XANO_API_BASE) {
        console.log('Running in demo mode - configure VITE_XANO_API_BASE for full functionality');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('track') || lowerQuery.includes('status')) {
      return "I can help you track your shipment! In the full version, I'll connect to your tracking database. For now, you can check your Dashboard for recent shipment statuses. Would you like me to explain how our tracking system works?";
    }
    if (lowerQuery.includes('rate') || lowerQuery.includes('cost') || lowerQuery.includes('price')) {
      return "Our shipping rates vary based on destination, weight, and service level. For a precise quote, I'd need:\n\n• Origin and destination\n• Package dimensions and weight\n• Delivery timeframe\n\nWould you like to provide these details?";
    }
    if (lowerQuery.includes('customs') || lowerQuery.includes('document')) {
      return "For customs documentation, you'll typically need:\n\n• Commercial Invoice\n• Packing List\n• Bill of Lading\n• Certificate of Origin (if applicable)\n\nI can guide you through each document. Which one would you like to start with?";
    }
    
    return "Thank you for your question! I'm here to help with all your shipping and logistics needs. You can ask me about:\n\n• Tracking shipments\n• Rate calculations\n• Customs documentation\n• Delivery estimates\n• Vendor connections\n\nHow can I assist you?";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex flex-1 flex-col pt-16">
        {/* Chat Header */}
        <div className="border-b border-border/50 bg-card/30 backdrop-blur-xl">
          <div className="container mx-auto flex items-center gap-4 px-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-semibold">AI Shipping Assistant</h1>
              <p className="text-xs text-muted-foreground">Powered by APE Global Intelligence</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-4xl px-4 py-6">
            {/* Suggested Questions (show only at start) */}
            {messages.length === 1 && (
              <div className="mb-8 grid gap-3 md:grid-cols-3">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q.text}
                    onClick={() => sendMessage(q.text)}
                    className="glass-card flex items-center gap-3 p-4 text-left transition-all hover:border-primary/50"
                  >
                    <q.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm">{q.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    message.role === 'assistant' ? 'bg-primary/10' : 'bg-secondary'
                  }`}>
                    {message.role === 'assistant' ? (
                      <Bot className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'assistant'
                      ? 'bg-card border border-border/50'
                      : 'bg-primary text-primary-foreground'
                  }`}>
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    <p className={`mt-2 text-xs ${
                      message.role === 'assistant' ? 'text-muted-foreground' : 'text-primary-foreground/70'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="rounded-2xl bg-card border border-border/50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border/50 bg-card/30 backdrop-blur-xl">
          <div className="container mx-auto max-w-4xl px-4 py-4">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about shipping, rates, tracking..."
                className="flex-1 bg-secondary/50"
                disabled={isLoading}
              />
              <Button type="submit" variant="hero" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
