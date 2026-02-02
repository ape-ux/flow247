import { useState, useEffect } from 'react';
import { Save, Key, Eye, EyeOff, User, Bell, Shield, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const [llmApiKey, setLlmApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user, xanoUser } = useAuth();

  useEffect(() => {
    const savedKey = localStorage.getItem('llm_api_key');
    if (savedKey) {
      setLlmApiKey(savedKey);
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('llm_api_key', llmApiKey);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = user?.user_metadata?.name || xanoUser?.name || 'Demo User';
  const displayEmail = user?.email || xanoUser?.email || 'demo@flow247.com';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account preferences</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar Navigation */}
        <div className="glass-card rounded-xl p-4 h-fit animate-slide-up">
          <nav className="space-y-1">
            {[
              { icon: User, label: 'Profile', active: true },
              { icon: Key, label: 'API Keys', active: false },
              { icon: Bell, label: 'Notifications', active: false },
              { icon: Shield, label: 'Security', active: false },
              { icon: Palette, label: 'Appearance', active: false },
            ].map((item) => (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  item.active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-2xl font-bold text-primary">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{displayName}</p>
                  <p className="text-sm text-muted-foreground">{displayEmail}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Full Name</Label>
                  <Input value={displayName} disabled className="bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Email Address</Label>
                  <Input value={displayEmail} disabled className="bg-muted/30" />
                </div>
              </div>
            </div>
          </div>

          {/* LLM API Key Section */}
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              API Configuration
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Configure your LLM API key to enable AI-powered features. Your key is stored securely in your browser.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="llmApiKey">LLM API Key</Label>
                <div className="relative">
                  <Input
                    id="llmApiKey"
                    type={showKey ? 'text' : 'password'}
                    value={llmApiKey}
                    onChange={(e) => setLlmApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="pr-10 bg-muted/30 border-border/50 focus:border-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your API key is used for AI chat and intelligent features. Never share this key.
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gradient-primary glow-cyan"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card rounded-xl p-6 border-destructive/20 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h2 className="mb-4 text-lg font-semibold text-destructive">Danger Zone</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Irreversible and destructive actions. Please proceed with caution.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                Reset All Settings
              </Button>
              <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
