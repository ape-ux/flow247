import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Truck, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { xano } from '@/lib/xano';

const NewShipmentPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get form data
      const formData = new FormData(e.currentTarget);
      
      const shipmentData = {
        sender_name: formData.get('sender_name') as string,
        sender_email: formData.get('sender_email') as string,
        sender_phone: formData.get('sender_phone') as string,
        sender_company: formData.get('sender_company') as string,
        sender_address: formData.get('sender_address') as string,
        recipient_name: formData.get('recipient_name') as string,
        recipient_email: formData.get('recipient_email') as string,
        recipient_phone: formData.get('recipient_phone') as string,
        recipient_company: formData.get('recipient_company') as string,
        recipient_address: formData.get('recipient_address') as string,
        weight: parseFloat(formData.get('weight') as string),
        length: parseFloat(formData.get('length') as string),
        width: parseFloat(formData.get('width') as string),
        height: parseFloat(formData.get('height') as string),
        service: formData.get('service') as string,
        insurance: parseFloat(formData.get('insurance') as string) || 0,
        contents: formData.get('contents') as string,
        special_instructions: formData.get('special_instructions') as string,
      };

      // Call Xano API to create shipment
      const result = await xano.createShipment(shipmentData);
      
      toast({
        title: "Shipment Created Successfully",
        description: `Shipment ID: ${result.id || 'Pending'} has been created and is ready for processing.`,
      });
      
      // Navigate to shipments page
      navigate('/app/shipments');
      
    } catch (error: any) {
      console.error('Error creating shipment:', error);
      toast({
        title: "Error Creating Shipment",
        description: error.message || "There was an error creating your shipment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/app/shipments')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Shipments
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            Create New Shipment
          </CardTitle>
          <CardDescription>
            Enter shipment details to create and track your package
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sender Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sender Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sender_name">Full Name</Label>
                  <Input id="sender_name" name="sender_name" placeholder="John Doe" required />
                </div>
                <div>
                  <Label htmlFor="sender_email">Email</Label>
                  <Input id="sender_email" name="sender_email" type="email" placeholder="john@example.com" required />
                </div>
                <div>
                  <Label htmlFor="sender_phone">Phone</Label>
                  <Input id="sender_phone" name="sender_phone" type="tel" placeholder="+1 (555) 123-4567" required />
                </div>
                <div>
                  <Label htmlFor="sender_company">Company (Optional)</Label>
                  <Input id="sender_company" name="sender_company" placeholder="Acme Corp" />
                </div>
              </div>
              <div>
                <Label htmlFor="sender_address">Complete Address</Label>
                <Textarea id="sender_address" name="sender_address" placeholder="123 Main St, Miami, FL 33131, USA" rows={2} required />
              </div>
            </div>

            {/* Recipient Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recipient Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recipient_name">Full Name</Label>
                  <Input id="recipient_name" name="recipient_name" placeholder="Jane Smith" required />
                </div>
                <div>
                  <Label htmlFor="recipient_email">Email</Label>
                  <Input id="recipient_email" name="recipient_email" type="email" placeholder="jane@example.com" required />
                </div>
                <div>
                  <Label htmlFor="recipient_phone">Phone</Label>
                  <Input id="recipient_phone" name="recipient_phone" type="tel" placeholder="+1 (555) 987-6543" required />
                </div>
                <div>
                  <Label htmlFor="recipient_company">Company (Optional)</Label>
                  <Input id="recipient_company" name="recipient_company" placeholder="XYZ Inc" />
                </div>
              </div>
              <div>
                <Label htmlFor="recipient_address">Complete Address</Label>
                <Textarea id="recipient_address" name="recipient_address" placeholder="456 Park Ave, New York, NY 10001, USA" rows={2} required />
              </div>
            </div>

            {/* Package Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Package Details</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input id="weight" name="weight" type="number" step="0.1" placeholder="10.5" required />
                </div>
                <div>
                  <Label htmlFor="length">Length (in)</Label>
                  <Input id="length" name="length" type="number" placeholder="12" required />
                </div>
                <div>
                  <Label htmlFor="width">Width (in)</Label>
                  <Input id="width" name="width" type="number" placeholder="8" required />
                </div>
                <div>
                  <Label htmlFor="height">Height (in)</Label>
                  <Input id="height" name="height" type="number" placeholder="6" required />
                </div>
                <div>
                  <Label htmlFor="service">Service Level</Label>
                  <Select name="service" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ground">Ground</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="overnight">Overnight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="insurance">Insurance Value ($)</Label>
                  <Input id="insurance" name="insurance" type="number" placeholder="100" />
                </div>
              </div>
              <div>
                <Label htmlFor="contents">Package Contents</Label>
                <Input id="contents" name="contents" placeholder="Electronics, Documents, etc." required />
              </div>
            </div>

            {/* Additional Options */}
            <div>
              <Label htmlFor="special_instructions">Special Instructions (Optional)</Label>
              <Textarea 
                id="special_instructions" 
                name="special_instructions"
                placeholder="Signature required, fragile, etc."
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating Shipment...' : 'Create Shipment'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/app/shipments')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewShipmentPage;




