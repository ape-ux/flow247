import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowLeft, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NewQuotePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMetric, setIsMetric] = useState(false);
  const [freightClass, setFreightClass] = useState<string>('');
  const [density, setDensity] = useState<number>(0);

  const calculateFreightClass = (weight: number, length: number, width: number, height: number) => {
    // Calculate cubic feet
    const cubicInches = length * width * height;
    const cubicFeet = cubicInches / 1728; // 1728 cubic inches in a cubic foot
    
    // Calculate density (lbs per cubic foot)
    const calculatedDensity = weight / cubicFeet;
    setDensity(calculatedDensity);

    // Determine freight class based on density
    let freightClassValue = '';
    if (calculatedDensity > 50) freightClassValue = '50';
    else if (calculatedDensity > 35) freightClassValue = '55';
    else if (calculatedDensity > 30) freightClassValue = '60';
    else if (calculatedDensity > 22.5) freightClassValue = '65';
    else if (calculatedDensity > 15) freightClassValue = '70';
    else if (calculatedDensity > 13.5) freightClassValue = '77.5';
    else if (calculatedDensity > 12) freightClassValue = '85';
    else if (calculatedDensity > 10.5) freightClassValue = '92.5';
    else if (calculatedDensity > 9) freightClassValue = '100';
    else if (calculatedDensity > 8) freightClassValue = '110';
    else if (calculatedDensity > 7) freightClassValue = '125';
    else if (calculatedDensity > 6) freightClassValue = '150';
    else if (calculatedDensity > 5) freightClassValue = '175';
    else if (calculatedDensity > 4) freightClassValue = '200';
    else if (calculatedDensity > 3) freightClassValue = '250';
    else if (calculatedDensity > 2) freightClassValue = '300';
    else if (calculatedDensity > 1) freightClassValue = '400';
    else freightClassValue = '500';

    setFreightClass(freightClassValue);
    
    toast({
      title: "Freight Class Calculated",
      description: `Class ${freightClassValue} (Density: ${calculatedDensity.toFixed(2)} lbs/cu ft)`,
    });
  };

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const form = e.target.form;
    if (!form) return;

    setTimeout(() => {
      const weight = parseFloat((form.elements.namedItem('weight') as HTMLInputElement)?.value || '0');
      const length = parseFloat((form.elements.namedItem('length') as HTMLInputElement)?.value || '0');
      const width = parseFloat((form.elements.namedItem('width') as HTMLInputElement)?.value || '0');
      const height = parseFloat((form.elements.namedItem('height') as HTMLInputElement)?.value || '0');

      if (weight > 0 && length > 0 && width > 0 && height > 0) {
        calculateFreightClass(weight, length, width, height);
      }
    }, 100);
  };

  const handleZipLookup = async (zipCode: string, type: 'origin' | 'destination') => {
    if (zipCode.length === 5) {
      try {
        // Use a zip code API (example: zippopotam.us - free API)
        const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
        
        if (response.ok) {
          const data = await response.json();
          const place = data.places[0];
          
          // Update form fields based on type
          const form = document.querySelector('form');
          if (form) {
            // Handle 'destination' shorthand as 'dest'
            const prefix = type === 'destination' ? 'dest' : type;
            const cityField = form.querySelector(`#${prefix}_city`) as HTMLInputElement;
            const stateField = form.querySelector(`#${prefix}_state`) as HTMLInputElement;
            
            if (cityField) cityField.value = place['place name'];
            if (stateField) stateField.value = place['state abbreviation'];
          }
          
          toast({
            title: "Zip Code Found",
            description: `${place['place name']}, ${place['state abbreviation']}`,
          });
        } else {
          toast({
            title: "Zip Code Not Found",
            description: "Please enter a valid US zip code",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Zip lookup error:', error);
        toast({
          title: "Lookup Failed",
          description: "Could not connect to zip code service",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formData = {
      origin: {
        zip: (form.elements.namedItem('origin_zip') as HTMLInputElement).value,
        city: (form.elements.namedItem('origin_city') as HTMLInputElement).value,
        state: (form.elements.namedItem('origin_state') as HTMLInputElement).value,
      },
      destination: {
        zip: (form.elements.namedItem('dest_zip') as HTMLInputElement).value,
        city: (form.elements.namedItem('dest_city') as HTMLInputElement).value,
        state: (form.elements.namedItem('dest_state') as HTMLInputElement).value,
      },
      commodity: (form.elements.namedItem('commodity') as HTMLInputElement).value,
      weight: parseFloat((form.elements.namedItem('weight') as HTMLInputElement).value),
      length: parseFloat((form.elements.namedItem('length') as HTMLInputElement).value),
      width: parseFloat((form.elements.namedItem('width') as HTMLInputElement).value),
      height: parseFloat((form.elements.namedItem('height') as HTMLInputElement).value),
      nrPieces: parseInt((form.elements.namedItem('nr_pieces') as HTMLInputElement).value),
      nrHandlingUnits: parseInt((form.elements.namedItem('nr_handling_units') as HTMLInputElement).value),
      freightClass,
      isMetric,
    };

    // Navigate to results page with form data
    navigate('/app/quotes/results', { state: { formData } });
  };


  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/app/quotes')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Quotes
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Request New Quote
          </CardTitle>
          <CardDescription>
            Fill out the shipment details to get an accurate quote
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Measurement Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <Label htmlFor="metric-toggle" className="flex items-center gap-2">
                {isMetric ? '📏 Metric (kg, cm)' : '📐 Imperial (lbs, inches)'}
              </Label>
              <Switch
                id="metric-toggle"
                checked={isMetric}
                onCheckedChange={setIsMetric}
              />
            </div>

            {/* Origin Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Origin</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="origin_zip">ZIP/Postal Code *</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="origin_zip" 
                      placeholder="33131" 
                      required 
                      maxLength={5}
                      onChange={(e) => {
                        if (e.target.value.length === 5) {
                          handleZipLookup(e.target.value, 'origin');
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        const zipInput = document.getElementById('origin_zip') as HTMLInputElement;
                        if (zipInput?.value) handleZipLookup(zipInput.value, 'origin');
                      }}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="origin_city">City</Label>
                  <Input id="origin_city" placeholder="Miami" required />
                </div>
                <div>
                  <Label htmlFor="origin_state">State/Province</Label>
                  <Input id="origin_state" placeholder="FL" required />
                </div>
              </div>
            </div>

            {/* Destination Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Destination</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="dest_zip">ZIP/Postal Code *</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="dest_zip" 
                      placeholder="10001" 
                      required 
                      maxLength={5}
                      onChange={(e) => {
                        if (e.target.value.length === 5) {
                          handleZipLookup(e.target.value, 'destination');
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        const zipInput = document.getElementById('dest_zip') as HTMLInputElement;
                        if (zipInput?.value) handleZipLookup(zipInput.value, 'destination');
                      }}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="dest_city">City</Label>
                  <Input id="dest_city" placeholder="New York" required />
                </div>
                <div>
                  <Label htmlFor="dest_state">State/Province</Label>
                  <Input id="dest_state" placeholder="NY" required />
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Package Details</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="commodity">Commodity *</Label>
                  <Input id="commodity" placeholder="Electronics, Furniture, etc." required />
                </div>
                <div>
                  <Label htmlFor="service_type">Service Type</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="overnight">Overnight</SelectItem>
                      <SelectItem value="freight">Freight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 2: Pieces and Handling Units */}
                <div>
                  <Label htmlFor="nr_pieces">Nr. of Pieces *</Label>
                  <Input 
                    id="nr_pieces" 
                    type="number" 
                    placeholder="1" 
                    defaultValue="1" 
                    min="1"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="nr_handling_units">Nr. of Handling Units *</Label>
                  <Input 
                    id="nr_handling_units" 
                    type="number" 
                    placeholder="1" 
                    defaultValue="1"
                    min="1"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight ({isMetric ? 'kg' : 'lbs'}) *</Label>
                  <Input 
                    id="weight" 
                    name="weight"
                    type="number" 
                    step="0.1" 
                    placeholder={isMetric ? "5" : "10"} 
                    onChange={handleDimensionChange}
                    required 
                  />
                </div>

                {/* Row 3: Dimensions */}
                <div>
                  <Label htmlFor="length">Length ({isMetric ? 'cm' : 'in'}) *</Label>
                  <Input 
                    id="length" 
                    name="length"
                    type="number" 
                    placeholder={isMetric ? "30" : "12"} 
                    onChange={handleDimensionChange}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="width">Width ({isMetric ? 'cm' : 'in'}) *</Label>
                  <Input 
                    id="width" 
                    name="width"
                    type="number" 
                    placeholder={isMetric ? "20" : "8"} 
                    onChange={handleDimensionChange}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height ({isMetric ? 'cm' : 'in'}) *</Label>
                  <Input 
                    id="height" 
                    name="height"
                    type="number" 
                    placeholder={isMetric ? "15" : "6"} 
                    onChange={handleDimensionChange}
                    required 
                  />
                </div>

                {/* Row 4: Freight Class (Auto-calculated) */}
                <div className="md:col-span-3">
                  <Label htmlFor="freight_class">Freight Class (Auto-calculated)</Label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      id="freight_class" 
                      value={freightClass} 
                      readOnly 
                      placeholder="Enter dimensions to calculate"
                      className="bg-muted/50"
                    />
                    {density > 0 && (
                      <Badge variant="outline" className="whitespace-nowrap">
                        {density.toFixed(2)} lbs/cu ft
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Freight class is automatically calculated based on weight and dimensions
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Special handling instructions, insurance requirements, etc."
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Get Quote
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/app/quotes')}
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

export default NewQuotePage;




