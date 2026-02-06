import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { xano } from '@/lib/xano';

const CustomersPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const customerData = {
        company_name: formData.get('company_name') as string,
        contact_name: formData.get('contact_name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        zip_code: formData.get('zip_code') as string,
        customer_type: formData.get('customer_type') as string,
      };

      // Call Xano API to create customer
      const result = await xano.createCustomer(customerData);
      
      toast({
        title: "Customer Added Successfully",
        description: `${customerData.company_name} has been added to your customer database.`,
      });
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      (e.target as HTMLFormElement).reset();
      
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast({
        title: "Error Adding Customer",
        description: error.message || "There was an error adding the customer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Customer Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer database and contact information
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Add a new customer to your database for quotes and shipments.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddCustomer} className="space-y-4">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input 
                      id="company_name" 
                      name="company_name"
                      placeholder="ABC Logistics Inc." 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_type">Customer Type</Label>
                    <Select name="customer_type" defaultValue="shipper">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shipper">Shipper</SelectItem>
                        <SelectItem value="consignee">Consignee</SelectItem>
                        <SelectItem value="broker">Broker</SelectItem>
                        <SelectItem value="carrier">Carrier</SelectItem>
                        <SelectItem value="3pl">3PL Provider</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_name">Contact Name *</Label>
                    <Input 
                      id="contact_name" 
                      name="contact_name"
                      placeholder="John Doe" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email"
                      placeholder="john@company.com" 
                      required 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      name="phone"
                      type="tel"
                      placeholder="(555) 123-4567" 
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address Information
                </h3>
                
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input 
                      id="address" 
                      name="address"
                      placeholder="123 Main Street" 
                      required 
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input 
                        id="city" 
                        name="city"
                        placeholder="Miami" 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input 
                        id="state" 
                        name="state"
                        placeholder="FL" 
                        maxLength={2}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip_code">ZIP Code *</Label>
                      <Input 
                        id="zip_code" 
                        name="zip_code"
                        placeholder="33131" 
                        maxLength={5}
                        required 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding Customer...' : 'Add Customer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Customer List Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Database</CardTitle>
          <CardDescription>
            Your customer list will appear here. Start by adding your first customer above.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No customers yet</h3>
            <p className="mb-4">Add your first customer to get started with customer management.</p>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Customer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersPage;