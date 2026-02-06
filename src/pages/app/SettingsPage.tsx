import { useState, useEffect } from 'react';
import { Save, Building2, MapPin, CreditCard, FileText, User, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { xano } from '@/lib/xano';
import { supabase } from '@/integrations/supabase/client';

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [billingSameAsPhysical, setBillingSameAsPhysical] = useState(true);
  const [llmApiKey, setLlmApiKey] = useState('');
  const [xanoAgentId, setXanoAgentId] = useState('3');
  const { user } = useAuth();
  const { toast } = useToast();

  // Customer profile state
  const [profile, setProfile] = useState({
    // Account Info (Read-only)
    tai_customer_id: 10325638,
    customer_number: '10325638',
    account_id: 22,
    
    // Company Info
    company_name: '',
    dba: '',
    mc_number: '',
    dot_number: '',
    customer_type: 'shipper',
    
    // Physical Address
    street_address: '',
    street_address_2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'USA',
    
    // Contact Info
    contact_name: '',
    email: user?.email || '',
    phone: '',
    fax: '',
    
    // Billing Address
    billing_same_as_physical: true,
    billing_street_address: '',
    billing_city: '',
    billing_state: '',
    billing_zip_code: '',
    
    // Payment & Credit
    payment_terms: 'Net 30',
    credit_limit: 0,
    
    // Status & Notes
    is_active: true,
    notes: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      
      try {
        // Load LLM API key from Supabase profiles table
        if (user?.id) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('llm_api_key')
            .eq('id', user.id)
            .single();
          
          if (profileData && !error) {
            setLlmApiKey(profileData.llm_api_key || '');
          }
        }
        
        // Load Xano agent ID from localStorage
        const savedAgentId = localStorage.getItem('xano_agent_id');
        if (savedAgentId) {
          setXanoAgentId(savedAgentId);
        }
        
        // Try to load from database first if authenticated
        if (xano.isAuthenticated()) {
          const dbProfile = await xano.getCustomerProfile();
          if (dbProfile) {
            setProfile(prev => ({
              ...prev,
              ...dbProfile,
              tai_customer_id: dbProfile.tai_customer_id || 10325638,
              customer_number: dbProfile.customer_number || '10325638',
              account_id: dbProfile.account_id || 22,
            }));
            setBillingSameAsPhysical(dbProfile.billing_same_as_physical ?? true);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error loading profile from database:', error);
      }
      
      // Fallback to localStorage
      const savedProfile = localStorage.getItem('customer_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile(prev => ({
          ...prev,
          ...parsed,
        }));
        setBillingSameAsPhysical(parsed.billing_same_as_physical ?? true);
      }
      
      setIsLoading(false);
    };
    
    loadProfile();
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBillingSameToggle = (checked: boolean) => {
    setBillingSameAsPhysical(checked);
    if (checked) {
      // Copy physical address to billing address
      setProfile(prev => ({
        ...prev,
        billing_same_as_physical: true,
        billing_street_address: prev.street_address,
        billing_city: prev.city,
        billing_state: prev.state,
        billing_zip_code: prev.zip_code,
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        billing_same_as_physical: false,
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save LLM API key to Supabase profiles table
      if (user?.id && llmApiKey) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            llm_api_key: llmApiKey,
            updated_at: new Date().toISOString(),
          });
        
        if (profileError) {
          console.error('Error saving LLM API key:', profileError);
          toast({
            title: 'Warning',
            description: 'LLM API key could not be saved to database. Using local storage.',
            variant: 'destructive',
          });
          // Fallback to localStorage
          localStorage.setItem('llm_api_key', llmApiKey);
        }
      }
      
      // Save Xano agent ID to localStorage
      localStorage.setItem('xano_agent_id', xanoAgentId);
      
      // Save customer profile to localStorage first
      localStorage.setItem('customer_profile', JSON.stringify(profile));
      
      // If authenticated, save to database
      if (xano.isAuthenticated()) {
        await xano.updateCustomerProfile({
          company_name: profile.company_name,
          contact_name: profile.contact_name,
          email: profile.email,
          phone: profile.phone,
          street_address: profile.street_address,
          city: profile.city,
          state: profile.state,
          zip_code: profile.zip_code,
          notes: profile.notes,
        });
        
        toast({
          title: 'Profile Saved Successfully',
          description: 'Your customer profile and LLM settings have been saved to the database.',
        });
      } else {
        toast({
          title: 'Profile Saved Locally',
          description: 'Your profile has been saved locally. Sign in to sync with the database.',
        });
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Customer Profile Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your company information and account details</p>
          </div>
          <div className="flex gap-2">
            {xano.isAuthenticated() && (
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                <Shield className="h-3 w-3 mr-1" />
                Synced with Database
              </Badge>
            )}
            {profile.is_active && (
              <Badge variant="outline" className="bg-green-500/20 text-green-400">
                <Shield className="h-3 w-3 mr-1" />
                Active Account
              </Badge>
            )}
          </div>
        </div>

        <form className="space-y-6">
          {/* Account Information (Read-Only) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Your TAI account details (read-only)</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">TAI Customer ID</Label>
                <p className="font-medium text-lg">{profile.tai_customer_id}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Customer Number</Label>
                <p className="font-medium text-lg">{profile.customer_number}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Account ID</Label>
                <p className="font-medium text-lg">#{profile.account_id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>Business details and identification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input 
                    id="company_name" 
                    value={profile.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="ABC Logistics Inc."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dba">DBA (Doing Business As)</Label>
                  <Input 
                    id="dba" 
                    value={profile.dba}
                    onChange={(e) => handleInputChange('dba', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label htmlFor="mc_number">MC Number</Label>
                  <Input 
                    id="mc_number" 
                    value={profile.mc_number}
                    onChange={(e) => handleInputChange('mc_number', e.target.value)}
                    placeholder="MC-123456"
                  />
                </div>
                <div>
                  <Label htmlFor="dot_number">DOT Number</Label>
                  <Input 
                    id="dot_number" 
                    value={profile.dot_number}
                    onChange={(e) => handleInputChange('dot_number', e.target.value)}
                    placeholder="DOT-123456"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="customer_type">Customer Type *</Label>
                  <Select 
                    value={profile.customer_type}
                    onValueChange={(value) => handleInputChange('customer_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shipper">Shipper</SelectItem>
                      <SelectItem value="broker">Broker</SelectItem>
                      <SelectItem value="carrier">Carrier</SelectItem>
                      <SelectItem value="3pl">3PL Provider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Physical Address
              </CardTitle>
              <CardDescription>Primary business location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="street_address">Street Address *</Label>
                  <Input 
                    id="street_address" 
                    value={profile.street_address}
                    onChange={(e) => handleInputChange('street_address', e.target.value)}
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="street_address_2">Street Address Line 2</Label>
                  <Input 
                    id="street_address_2" 
                    value={profile.street_address_2}
                    onChange={(e) => handleInputChange('street_address_2', e.target.value)}
                    placeholder="Suite 100 (Optional)"
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="city">City *</Label>
                    <Input 
                      id="city" 
                      value={profile.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Miami"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input 
                      id="state" 
                      value={profile.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="FL"
                      maxLength={2}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip_code">ZIP Code *</Label>
                    <Input 
                      id="zip_code" 
                      value={profile.zip_code}
                      onChange={(e) => handleInputChange('zip_code', e.target.value)}
                      placeholder="33131"
                      maxLength={5}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country" 
                    value={profile.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="USA"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>Primary contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name">Contact Name *</Label>
                  <Input 
                    id="contact_name" 
                    value={profile.contact_name}
                    onChange={(e) => handleInputChange('contact_name', e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john@company.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fax">Fax Number</Label>
                  <Input 
                    id="fax" 
                    type="tel"
                    value={profile.fax}
                    onChange={(e) => handleInputChange('fax', e.target.value)}
                    placeholder="(555) 123-4568"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Billing Address
              </CardTitle>
              <CardDescription>Invoicing and payment address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <Label htmlFor="billing_same">Same as Physical Address</Label>
                <Switch 
                  id="billing_same"
                  checked={billingSameAsPhysical}
                  onCheckedChange={handleBillingSameToggle}
                />
              </div>

              {!billingSameAsPhysical && (
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="billing_street_address">Street Address</Label>
                    <Input 
                      id="billing_street_address" 
                      value={profile.billing_street_address}
                      onChange={(e) => handleInputChange('billing_street_address', e.target.value)}
                      placeholder="456 Billing Ave"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="billing_city">City</Label>
                      <Input 
                        id="billing_city" 
                        value={profile.billing_city}
                        onChange={(e) => handleInputChange('billing_city', e.target.value)}
                        placeholder="Miami"
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing_state">State</Label>
                      <Input 
                        id="billing_state" 
                        value={profile.billing_state}
                        onChange={(e) => handleInputChange('billing_state', e.target.value)}
                        placeholder="FL"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing_zip_code">ZIP Code</Label>
                      <Input 
                        id="billing_zip_code" 
                        value={profile.billing_zip_code}
                        onChange={(e) => handleInputChange('billing_zip_code', e.target.value)}
                        placeholder="33131"
                        maxLength={5}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment & Credit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment & Credit Terms
              </CardTitle>
              <CardDescription>Financial arrangements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  <Select 
                    value={profile.payment_terms}
                    onValueChange={(value) => handleInputChange('payment_terms', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Prepaid">Prepaid</SelectItem>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 45">Net 45</SelectItem>
                      <SelectItem value="Net 60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="credit_limit">Credit Limit ($)</Label>
                  <Input 
                    id="credit_limit" 
                    type="number"
                    step="0.01"
                    value={profile.credit_limit}
                    onChange={(e) => handleInputChange('credit_limit', parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Agent Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                AI Agent Configuration
              </CardTitle>
              <CardDescription>Configure your AI settings and Xano AI Agent for chat assistance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="llm_api_key">LLM API Key (Claude, OpenAI, etc.)</Label>
                <Input 
                  id="llm_api_key" 
                  type="password"
                  value={llmApiKey}
                  onChange={(e) => setLlmApiKey(e.target.value)}
                  placeholder="sk-your-api-key-here"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your LLM API key will be saved securely in Supabase database (not localStorage)
                </p>
              </div>
              
              <div>
                <Label htmlFor="xano_agent_id">Xano Agent ID</Label>
                <Input 
                  id="xano_agent_id" 
                  value={xanoAgentId}
                  onChange={(e) => setXanoAgentId(e.target.value)}
                  placeholder="3"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Default: 3 (Freight Flow Agent) - Find your Agent ID in Xano Dashboard → AI → Agents
                </p>
                <div className="mt-3 p-3 bg-muted/30 rounded-lg text-sm">
                  <p className="font-semibold text-primary mb-1">Current Agent: Freight Flow Agent (ID: {xanoAgentId})</p>
                  <ul className="text-xs space-y-0.5 text-muted-foreground">
                    <li>• Get shipping rate quotes</li>
                    <li>• Book shipments</li>
                    <li>• Track freight</li>
                    <li>• Calculate rates & freight class</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Notes
              </CardTitle>
              <CardDescription>Internal notes and special instructions</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                value={profile.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Special requirements, preferences, or internal notes..."
                rows={4}
              />
            </CardContent>
          </Card>

          <Separator />

          {/* Save Button */}
          <div className="flex gap-4 justify-end sticky bottom-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg border">
            <Button 
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
