import { useState, useEffect, useRef } from 'react';
import {
  Save, User, Mail, Phone, Briefcase, Building2, Globe, Loader2, Camera,
  Shield, Bell, Settings, Key, Eye, EyeOff, Users, Calendar, MapPin,
  Hash, Clock, Link2, CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth, type Profile } from '@/contexts/AuthContext';
import { uploadProfilePhoto } from '@/lib/xano';
import { supabase } from '@/lib/supabase';

type Tab = 'general' | 'work' | 'notifications' | 'security';

export default function ProfilePage() {
  const { user, profile, refreshUser, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showLlmKey, setShowLlmKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    job_title: '',
    department: '',
    timezone: '',
    llm_api_key: '',
    notification_settings: {} as Record<string, unknown>,
    email_settings: {} as Record<string, unknown>,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || profile.full_name?.split(' ')[0] || '',
        last_name: profile.last_name || profile.full_name?.split(' ').slice(1).join(' ') || '',
        phone: profile.phone || '',
        job_title: profile.job_title || '',
        department: profile.department || '',
        timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        llm_api_key: profile.llm_api_key || '',
        notification_settings: (profile.notification_settings as Record<string, unknown>) || {},
        email_settings: (profile.email_settings as Record<string, unknown>) || {},
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const fullName = `${form.first_name} ${form.last_name}`.trim();
      const { error } = await updateProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        full_name: fullName,
        phone: form.phone,
        job_title: form.job_title,
        department: form.department,
        timezone: form.timezone,
        llm_api_key: form.llm_api_key,
        notification_settings: form.notification_settings,
        email_settings: form.email_settings,
      });

      if (error) {
        toast.error(error);
        return;
      }

      toast.success('Profile updated');
      setIsEditing(false);
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast.error(uploadError.message);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with the new URL
      await updateProfile({
        avatar_url: publicUrl,
        profile_photo_url: publicUrl,
      });

      // Best-effort sync to Xano
      try { await uploadProfilePhoto(file); } catch { /* non-critical */ }

      toast.success('Photo updated');
      await refreshUser();
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    if (profile) {
      setForm({
        first_name: profile.first_name || profile.full_name?.split(' ')[0] || '',
        last_name: profile.last_name || profile.full_name?.split(' ').slice(1).join(' ') || '',
        phone: profile.phone || '',
        job_title: profile.job_title || '',
        department: profile.department || '',
        timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        llm_api_key: profile.llm_api_key || '',
        notification_settings: (profile.notification_settings as Record<string, unknown>) || {},
        email_settings: (profile.email_settings as Record<string, unknown>) || {},
      });
    }
  };

  const displayName = profile?.full_name || user?.user_metadata?.name || user?.email || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const photoUrl = profile?.profile_photo_url || profile?.avatar_url;

  const roleBadge = profile?.is_super_admin
    ? 'Super Admin'
    : profile?.user_type || profile?.role || 'User';

  const formatTimestamp = (ts?: string | null) => {
    if (!ts) return '-';
    return new Date(ts).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (ts?: string | null) => {
    if (!ts) return '-';
    return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'general', label: 'General', icon: User },
    { id: 'work', label: 'Work & Role', icon: Briefcase },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & API', icon: Shield },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your account information</p>
          </div>
        </div>
        <div>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit Profile</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={cancelEditing}>Cancel</Button>
              <Button size="sm" className="gradient-primary glow-cyan" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="glass-card rounded-xl p-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative group">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-3xl font-bold text-primary ring-4 ring-primary/10 overflow-hidden">
              {photoUrl ? (
                <img src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
              ) : initials}
            </div>
            <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {isUploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Camera className="h-6 w-6 text-white" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{displayEmail}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">{roleBadge}</Badge>
              {profile?.employee_role && <Badge variant="outline" className="text-xs">{profile.employee_role}</Badge>}
              {profile?.department && <Badge variant="outline" className="text-xs">{profile.department}</Badge>}
              {profile?.status && (
                <Badge variant={profile.status === 'active' ? 'default' : 'secondary'} className="text-xs">{profile.status}</Badge>
              )}
              {profile?.is_sales_agent && <Badge variant="outline" className="text-xs">Sales Agent</Badge>}
            </div>
          </div>
          <div className="hidden md:flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{profile?.tenant_id || '-'}</p>
              <p className="text-xs text-muted-foreground">Tenant</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{profile?.account_id || '-'}</p>
              <p className="text-xs text-muted-foreground">Account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-muted/50 w-fit">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* Tab: General */}
      {activeTab === 'general' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass-card rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><User className="h-5 w-5 text-primary" />Personal Information</h3>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldRow label="First Name" icon={User} editing={isEditing} value={form.first_name} onChange={(v) => handleChange('first_name', v)} />
                <FieldRow label="Last Name" icon={User} editing={isEditing} value={form.last_name} onChange={(v) => handleChange('last_name', v)} />
              </div>
              <FieldRow label="Email" icon={Mail} value={displayEmail} />
              <FieldRow label="Phone" icon={Phone} editing={isEditing} value={form.phone} onChange={(v) => handleChange('phone', v)} placeholder="+1 (555) 000-0000" />
              <FieldRow label="Timezone" icon={Globe} editing={isEditing} value={form.timezone} onChange={(v) => handleChange('timezone', v)} placeholder="America/New_York" />
            </div>
          </div>
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Settings className="h-5 w-5 text-primary" />Account Details</h3>
            <div className="space-y-4">
              <ReadOnlyField label="User ID" icon={Hash} value={profile?.xano_user_id} />
              <ReadOnlyField label="Supabase ID" icon={Link2} value={profile?.id} mono />
              <ReadOnlyField label="Account ID" icon={Hash} value={profile?.account_id} />
              <ReadOnlyField label="Member Since" icon={Calendar} value={formatTimestamp(profile?.created_at)} />
              <ReadOnlyField label="Last Updated" icon={Clock} value={formatDateTime(profile?.updated_at)} />
              <ReadOnlyField label="Last Login" icon={Clock} value={formatDateTime(profile?.last_login)} />
              {profile?.last_ip && <ReadOnlyField label="Last IP" icon={Globe} value={profile.last_ip} mono />}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Work & Role */}
      {activeTab === 'work' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass-card rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Briefcase className="h-5 w-5 text-primary" />Work Details</h3>
            <div className="space-y-4">
              <FieldRow label="Job Title" icon={Briefcase} editing={isEditing} value={form.job_title} onChange={(v) => handleChange('job_title', v)} placeholder="e.g. Operations Manager" />
              <FieldRow label="Department" icon={Building2} editing={isEditing} value={form.department} onChange={(v) => handleChange('department', v)} placeholder="e.g. Operations" />
              <ReadOnlyField label="Tenant ID" icon={Hash} value={profile?.tenant_id} />
              <ReadOnlyField label="Customer ID" icon={Users} value={profile?.customer_id || '-'} />
            </div>
          </div>
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Shield className="h-5 w-5 text-primary" />Roles & Permissions</h3>
            <div className="space-y-4">
              <ReadOnlyField label="User Type" icon={Shield} value={profile?.user_type || '-'} />
              <ReadOnlyField label="Role" icon={Shield} value={profile?.role || '-'} />
              <ReadOnlyField label="Role V2" icon={Shield} value={profile?.user_role_v2 || '-'} />
              <ReadOnlyField label="Employee Role" icon={Briefcase} value={profile?.employee_role || '-'} />
              <ReadOnlyField label="Super Admin" icon={Shield} value={profile?.is_super_admin ? 'Yes' : 'No'} />
              <ReadOnlyField label="Status" icon={Shield} value={profile?.status || '-'} />
              <Separator className="my-2" />
              <h4 className="text-sm font-medium text-muted-foreground">Sales</h4>
              <ReadOnlyField label="Sales Agent" icon={Users} value={profile?.is_sales_agent ? 'Yes' : 'No'} />
              <ReadOnlyField label="Sales Agent ID" icon={Hash} value={profile?.sales_agent_id || '-'} />
              <ReadOnlyField label="Commission Rate" icon={CreditCard} value={profile?.commission_rate != null ? `${profile.commission_rate}%` : '-'} />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Notifications */}
      {activeTab === 'notifications' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass-card rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Bell className="h-5 w-5 text-primary" />Notification Preferences</h3>
            <div className="space-y-3">
              {profile?.notification_settings && Object.keys(profile.notification_settings).length > 0 ? (
                Object.entries(profile.notification_settings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                    <Badge variant={value ? 'default' : 'secondary'} className="text-xs">{value ? 'On' : 'Off'}</Badge>
                  </div>
                ))
              ) : <p className="text-sm text-muted-foreground py-4">No notification preferences configured.</p>}
            </div>
          </div>
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Mail className="h-5 w-5 text-primary" />Email Settings</h3>
            <div className="space-y-3">
              {profile?.email_settings && Object.keys(profile.email_settings).length > 0 ? (
                Object.entries(profile.email_settings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm text-muted-foreground">{String(value)}</span>
                  </div>
                ))
              ) : <p className="text-sm text-muted-foreground py-4">No email settings configured.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Security & API */}
      {activeTab === 'security' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass-card rounded-xl p-6 animate-slide-up">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Shield className="h-5 w-5 text-primary" />Authentication</h3>
            <div className="space-y-4">
              <ReadOnlyField label="Auth Provider" icon={Shield} value={profile?.auth_provider || 'email'} />
              {profile?.google_oauth && (profile.google_oauth as any)?.email && (
                <ReadOnlyField label="Google Account" icon={Mail} value={(profile.google_oauth as any).email} />
              )}
              {profile?.google_id && <ReadOnlyField label="Google ID" icon={Link2} value={profile.google_id} mono />}
              <ReadOnlyField label="Last Login" icon={Clock} value={formatDateTime(profile?.last_login)} />
              {profile?.last_ip && <ReadOnlyField label="Last IP" icon={MapPin} value={profile.last_ip} mono />}
              {profile?.invited_by ? (
                <>
                  <Separator className="my-2" />
                  <ReadOnlyField label="Invited By" icon={Users} value={`User #${profile.invited_by}`} />
                  <ReadOnlyField label="Invited At" icon={Calendar} value={formatTimestamp(profile.invited_at)} />
                </>
              ) : null}
            </div>
          </div>
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Key className="h-5 w-5 text-primary" />API Configuration</h3>
            <p className="mb-4 text-sm text-muted-foreground">Your LLM API key enables AI-powered features.</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="llmApiKey" className="text-muted-foreground text-xs uppercase tracking-wider">LLM API Key</Label>
                <div className="relative">
                  <Input id="llmApiKey" type={showLlmKey ? 'text' : 'password'} value={form.llm_api_key}
                    onChange={(e) => handleChange('llm_api_key', e.target.value)} placeholder="sk-..."
                    disabled={!isEditing} className="pr-10 bg-muted/30 border-border/50 focus:border-primary/50" />
                  <button type="button" onClick={() => setShowLlmKey(!showLlmKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showLlmKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Separator className="my-2" />
              <h4 className="text-sm font-medium text-muted-foreground">LLM Settings</h4>
              {profile?.llm_settings && Object.keys(profile.llm_settings).length > 0 ? (
                Object.entries(profile.llm_settings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-1">
                    <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm text-muted-foreground font-mono">{String(value)}</span>
                  </div>
                ))
              ) : <p className="text-sm text-muted-foreground">No LLM settings configured.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldRow({ label, icon: Icon, value, editing, onChange, placeholder }: {
  label: string; icon: typeof User; value: string; editing?: boolean; onChange?: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5"><Icon className="h-3 w-3" /> {label}</Label>
      {editing && onChange ? (
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-muted/30 border-border/50 focus:border-primary/50" />
      ) : <p className="text-sm font-medium py-1">{value || '-'}</p>}
    </div>
  );
}

function ReadOnlyField({ label, icon: Icon, value, mono }: {
  label: string; icon: typeof User; value?: string | number | null; mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" /> {label}</span>
      <span className={`text-sm font-medium ${mono ? 'font-mono text-xs' : ''} max-w-[200px] truncate`}>{value != null ? String(value) : '-'}</span>
    </div>
  );
}
