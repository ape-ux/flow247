import { useState, useEffect } from 'react';
import { Save, Key, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const [llmApiKey, setLlmApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem('llm_api_key');
    if (savedKey) {
      setLlmApiKey(savedKey);
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('llm_api_key', llmApiKey);
      toast({
        title: 'Settings saved',
        description: 'Your LLM API key has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 font-display text-2xl font-bold">Settings</h1>

        {/* Profile Section */}
        <div className="glass-card mb-6 p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Profile</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="mt-1 text-foreground">{user?.email}</p>
            </div>
            {user?.name && (
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="mt-1 text-foreground">{user.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* LLM API Key Section */}
        <div className="glass-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            LLM API Configuration
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Enter your LLM API key to enable AI-powered features. This key will be stored locally and used for chat interactions.
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="llmApiKey">API Key</Label>
              <div className="relative">
                <Input
                  id="llmApiKey"
                  type={showKey ? 'text' : 'password'}
                  value={llmApiKey}
                  onChange={(e) => setLlmApiKey(e.target.value)}
                  placeholder="Enter your LLM API key..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
