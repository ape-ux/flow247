import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Send, FileText, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ShipmentEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState<any>(null);

  useEffect(() => {
    // Get shipment from location state or localStorage
    if (location.state?.shipment) {
      setShipment(location.state.shipment);
    }
  }, [location]);

  const handleSave = async () => {
    const form = document.querySelector('form') as HTMLFormElement;
    if (!form || !form.checkValidity()) {
      form?.reportValidity();
      return;
    }

    setLoading(true);

    // Collect all BOL form data
    const bolData = {
      // Shipper Information
      shipper_name: (form.elements.namedItem('shipper_name') as HTMLInputElement).value,
      shipper_address: (form.elements.namedItem('shipper_address') as HTMLInputElement).value,
      shipper_city: (form.elements.namedItem('shipper_city') as HTMLInputElement).value,
      shipper_state: (form.elements.namedItem('shipper_state') as HTMLInputElement).value,
      shipper_zip: (form.elements.namedItem('shipper_zip') as HTMLInputElement).value,
      shipper_contact: (form.elements.namedItem('shipper_contact') as HTMLInputElement).value,
      shipper_phone: (form.elements.namedItem('shipper_phone') as HTMLInputElement).value,
      
      // Consignee Information
      consignee_name: (form.elements.namedItem('consignee_name') as HTMLInputElement).value,
      consignee_address: (form.elements.namedItem('consignee_address') as HTMLInputElement).value,
      consignee_city: (form.elements.namedItem('consignee_city') as HTMLInputElement).value,
      consignee_state: (form.elements.namedItem('consignee_state') as HTMLInputElement).value,
      consignee_zip: (form.elements.namedItem('consignee_zip') as HTMLInputElement).value,
      consignee_contact: (form.elements.namedItem('consignee_contact') as HTMLInputElement).value,
      consignee_phone: (form.elements.namedItem('consignee_phone') as HTMLInputElement).value,
      
      // Bill To (Third Party)
      bill_to_name: (form.elements.namedItem('bill_to_name') as HTMLInputElement).value,
      bill_to_address: (form.elements.namedItem('bill_to_address') as HTMLInputElement).value,
      bill_to_city: (form.elements.namedItem('bill_to_city') as HTMLInputElement).value,
      bill_to_state: (form.elements.namedItem('bill_to_state') as HTMLInputElement).value,
      bill_to_zip: (form.elements.namedItem('bill_to_zip') as HTMLInputElement).value,
      
      // Additional References
      shipper_reference: (form.elements.namedItem('shipper_reference') as HTMLInputElement).value,
      customer_po: (form.elements.namedItem('customer_po') as HTMLInputElement).value,
      file_number: (form.elements.namedItem('file_number') as HTMLInputElement).value,
      
      // Freight Details
      handling_units: (form.elements.namedItem('handling_units') as HTMLInputElement).value,
      package_type: (form.elements.namedItem('package_type') as HTMLInputElement).value,
      weight: (form.elements.namedItem('weight') as HTMLInputElement).value,
      commodity: (form.elements.namedItem('commodity') as HTMLInputElement).value,
      freight_class: (form.elements.namedItem('freight_class') as HTMLInputElement).value,
      nmfc: (form.elements.namedItem('nmfc') as HTMLInputElement).value,
      
      // Special Instructions
      special_instructions: (form.elements.namedItem('special_instructions') as HTMLTextAreaElement).value,
    };

    // Update shipment in localStorage
    const existingShipments = JSON.parse(localStorage.getItem('savedShipments') || '[]');
    const updatedShipments = existingShipments.map((s: any) => 
      s.id === shipment.id ? { ...s, bol_data: bolData, needs_dispatch: true } : s
    );
    localStorage.setItem('savedShipments', JSON.stringify(updatedShipments));

    setLoading(false);
    toast({
      title: "Shipment Saved",
      description: "BOL information has been saved successfully",
    });
  };

  const handleSaveAndDispatch = async () => {
    await handleSave();
    setLoading(true);

    // Send dispatch email
    try {
      const form = document.querySelector('form') as HTMLFormElement;
      const bolData = {
        shipment_id: shipment.id,
        tai_shipment_id: shipment.tai_shipment_id,
        pro_number: shipment.pro_number,
        carrier: shipment.carrier.name,
        shipper_name: (form.elements.namedItem('shipper_name') as HTMLInputElement).value,
        consignee_name: (form.elements.namedItem('consignee_name') as HTMLInputElement).value,
        shipper_reference: (form.elements.namedItem('shipper_reference') as HTMLInputElement).value,
        customer_po: (form.elements.namedItem('customer_po') as HTMLInputElement).value,
      };

      // TODO: Replace with actual email API endpoint
      // For now, we'll use mailto: link or you can integrate with your email service
      const emailSubject = encodeURIComponent(`Shipment Dispatch - ${shipment.id} - ${shipment.carrier.name}`);
      const emailBody = encodeURIComponent(`
Shipment Dispatch Information:

Shipment ID: ${shipment.id}
TAI Shipment ID: ${shipment.tai_shipment_id}
PRO Number: ${shipment.pro_number || 'Pending'}
Carrier: ${shipment.carrier.name} (${shipment.carrier.scac})

Shipper: ${bolData.shipper_name}
Consignee: ${bolData.consignee_name}
Reference: ${bolData.shipper_reference}
Customer PO: ${bolData.customer_po}

Please review and process this shipment.
      `);

      // Update shipment status
      const existingShipments = JSON.parse(localStorage.getItem('savedShipments') || '[]');
      const updatedShipments = existingShipments.map((s: any) => 
        s.id === shipment.id ? { ...s, needs_dispatch: false, status: 'Dispatched' } : s
      );
      localStorage.setItem('savedShipments', JSON.stringify(updatedShipments));

      // Open email client
      window.open(`mailto:miasupport@amassgroup.com?subject=${emailSubject}&body=${emailBody}`, '_blank');

      setLoading(false);
      toast({
        title: "Dispatch Email Sent",
        description: "Shipment has been dispatched to miasupport@amassgroup.com",
      });

      setTimeout(() => {
        navigate('/app/shipments');
      }, 2000);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Dispatch Failed",
        description: "Unable to send dispatch email. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!shipment) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Loading shipment details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/app/shipments')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Shipments
      </Button>

      <div className="flex items-center gap-4 mb-6">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Bill of Lading (BOL)</h1>
          <p className="text-muted-foreground">Shipment #{shipment.id} | {shipment.carrier.name}</p>
        </div>
        {shipment.needs_dispatch && (
          <Badge variant="outline" className="ml-auto bg-yellow-500/20 text-yellow-400">
            Needs Dispatch
          </Badge>
        )}
      </div>

      <form className="space-y-6">
        {/* Shipment Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipment Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">TAI Shipment ID</Label>
              <p className="font-medium">{shipment.tai_shipment_id}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">PRO Number</Label>
              <p className="font-medium">{shipment.pro_number || 'Pending'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">BOL Number</Label>
              <p className="font-medium">{shipment.bol_number || 'Pending'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Badge>{shipment.status}</Badge>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Transit Days</Label>
              <p className="font-medium">{shipment.transit_days} days</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Est. Delivery</Label>
              <p className="font-medium">{new Date(shipment.estimated_delivery).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Shipper Information */}
        <Card>
          <CardHeader>
            <CardTitle>Shipper Information (From)</CardTitle>
            <CardDescription>Origin address and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shipper_name">Company Name *</Label>
                <Input id="shipper_name" required placeholder="ABC Company Inc." />
              </div>
              <div>
                <Label htmlFor="shipper_contact">Contact Name *</Label>
                <Input id="shipper_contact" required placeholder="John Doe" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="shipper_address">Street Address *</Label>
                <Input id="shipper_address" required placeholder="123 Main Street" />
              </div>
              <div>
                <Label htmlFor="shipper_city">City *</Label>
                <Input id="shipper_city" required defaultValue={shipment.origin.city} />
              </div>
              <div>
                <Label htmlFor="shipper_state">State *</Label>
                <Input id="shipper_state" required defaultValue={shipment.origin.state} maxLength={2} />
              </div>
              <div>
                <Label htmlFor="shipper_zip">ZIP Code *</Label>
                <Input id="shipper_zip" required defaultValue={shipment.origin.zip} maxLength={5} />
              </div>
              <div>
                <Label htmlFor="shipper_phone">Phone *</Label>
                <Input id="shipper_phone" required type="tel" placeholder="(555) 123-4567" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consignee Information */}
        <Card>
          <CardHeader>
            <CardTitle>Consignee Information (To)</CardTitle>
            <CardDescription>Destination address and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="consignee_name">Company Name *</Label>
                <Input id="consignee_name" required placeholder="XYZ Corporation" />
              </div>
              <div>
                <Label htmlFor="consignee_contact">Contact Name *</Label>
                <Input id="consignee_contact" required placeholder="Jane Smith" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="consignee_address">Street Address *</Label>
                <Input id="consignee_address" required placeholder="456 Oak Avenue" />
              </div>
              <div>
                <Label htmlFor="consignee_city">City *</Label>
                <Input id="consignee_city" required defaultValue={shipment.destination.city} />
              </div>
              <div>
                <Label htmlFor="consignee_state">State *</Label>
                <Input id="consignee_state" required defaultValue={shipment.destination.state} maxLength={2} />
              </div>
              <div>
                <Label htmlFor="consignee_zip">ZIP Code *</Label>
                <Input id="consignee_zip" required defaultValue={shipment.destination.zip} maxLength={5} />
              </div>
              <div>
                <Label htmlFor="consignee_phone">Phone *</Label>
                <Input id="consignee_phone" required type="tel" placeholder="(555) 987-6543" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bill To (Third Party) */}
        <Card>
          <CardHeader>
            <CardTitle>Bill To (Third Party) - Optional</CardTitle>
            <CardDescription>If different from shipper or consignee</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bill_to_name">Company Name</Label>
                <Input id="bill_to_name" placeholder="Billing Company" />
              </div>
              <div>
                <Label htmlFor="bill_to_address">Street Address</Label>
                <Input id="bill_to_address" placeholder="789 Billing Blvd" />
              </div>
              <div>
                <Label htmlFor="bill_to_city">City</Label>
                <Input id="bill_to_city" placeholder="Billing City" />
              </div>
              <div>
                <Label htmlFor="bill_to_state">State</Label>
                <Input id="bill_to_state" maxLength={2} placeholder="CA" />
              </div>
              <div>
                <Label htmlFor="bill_to_zip">ZIP Code</Label>
                <Input id="bill_to_zip" maxLength={5} placeholder="90210" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional References */}
        <Card>
          <CardHeader>
            <CardTitle>Additional References</CardTitle>
            <CardDescription>Tracking and reference numbers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="shipper_reference">Shipper Reference #</Label>
                <Input id="shipper_reference" placeholder="SHIP-REF-001" />
              </div>
              <div>
                <Label htmlFor="customer_po">Customer PO #</Label>
                <Input id="customer_po" placeholder="PO-12345" />
              </div>
              <div>
                <Label htmlFor="file_number">File # / Job #</Label>
                <Input id="file_number" placeholder="FILE-2024-001" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Freight Details */}
        <Card>
          <CardHeader>
            <CardTitle>Freight Details</CardTitle>
            <CardDescription>Package and commodity information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="handling_units">Handling Units *</Label>
                <Input 
                  id="handling_units" 
                  type="number" 
                  required 
                  defaultValue={shipment.formData?.nrHandlingUnits || 1}
                  min="1" 
                />
              </div>
              <div>
                <Label htmlFor="package_type">Package Type *</Label>
                <Input id="package_type" required placeholder="Pallets, Boxes, Crates" defaultValue="Pallets" />
              </div>
              <div>
                <Label htmlFor="weight">Weight (lbs) *</Label>
                <Input 
                  id="weight" 
                  type="number" 
                  required 
                  defaultValue={shipment.formData?.weight || 0}
                  step="0.1" 
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="commodity">Commodity Description *</Label>
                <Input 
                  id="commodity" 
                  required 
                  defaultValue={shipment.formData?.commodity || ''}
                  placeholder="Electronics, Furniture, etc." 
                />
              </div>
              <div>
                <Label htmlFor="freight_class">Freight Class</Label>
                <Input 
                  id="freight_class" 
                  defaultValue={shipment.formData?.freightClass || ''}
                  placeholder="50, 70, 100, etc." 
                />
              </div>
              <div className="md:col-span-3">
                <Label htmlFor="nmfc">NMFC Number (Optional)</Label>
                <Input id="nmfc" placeholder="123456-01" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Special Instructions</CardTitle>
            <CardDescription>Additional handling or delivery instructions</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="special_instructions">Instructions</Label>
            <Textarea 
              id="special_instructions" 
              rows={4}
              placeholder="Liftgate required, inside delivery, appointment needed, fragile, etc."
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end sticky bottom-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg border">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/app/shipments')}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            variant="outline"
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button 
            type="button"
            onClick={handleSaveAndDispatch}
            disabled={loading}
            className="bg-primary"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Dispatching...' : 'Save & Dispatch'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ShipmentEditPage;




