import { useState } from 'react';
import { FileText, ArrowRight, MapPin, Package, Calculator, DollarSign, Ship, Plane, Truck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const transportModes = [
  { id: 'ocean', label: 'Ocean', icon: Ship },
  { id: 'air', label: 'Air', icon: Plane },
  { id: 'truck', label: 'Truck', icon: Truck },
];

const mockRates = [
  { carrier: 'Maersk Line', transitTime: '18-22 days', price: '$2,450', savings: '12%', recommended: true },
  { carrier: 'MSC', transitTime: '20-24 days', price: '$2,320', savings: '8%', recommended: false },
  { carrier: 'Hapag-Lloyd', transitTime: '19-23 days', price: '$2,580', savings: '', recommended: false },
  { carrier: 'CMA CGM', transitTime: '21-25 days', price: '$2,180', savings: '18%', recommended: false },
];

export default function NewQuotePage() {
  const [step, setStep] = useState(1);
  const [selectedMode, setSelectedMode] = useState('ocean');
  const [selectedRate, setSelectedRate] = useState<number | null>(null);
  const [showRates, setShowRates] = useState(false);

  const handleGetRates = () => {
    setShowRates(true);
  };

  const handleCreateQuote = () => {
    if (selectedRate === null) {
      toast.error('Please select a rate first');
      return;
    }
    toast.success('Quote created successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Create New Quote</h1>
          <p className="text-sm text-muted-foreground">Generate a freight quote for your customer</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quote Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transport Mode */}
          <div className="glass-card rounded-xl p-6 animate-slide-up">
            <h2 className="mb-4 text-lg font-semibold">Transport Mode</h2>
            <div className="flex gap-3">
              {transportModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSelectedMode(mode.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    selectedMode === mode.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                >
                  <mode.icon className="h-4 w-4" />
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Route */}
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Route
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Origin Port/City</Label>
                <Input placeholder="e.g., Shanghai, China" className="bg-muted/30" />
              </div>
              <div className="space-y-2">
                <Label>Destination Port/City</Label>
                <Input placeholder="e.g., Los Angeles, USA" className="bg-muted/30" />
              </div>
            </div>
          </div>

          {/* Cargo */}
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Cargo Details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Container Type</Label>
                <select className="w-full h-10 px-3 rounded-md bg-muted/30 border border-input text-sm">
                  <option>20' Standard</option>
                  <option>40' Standard</option>
                  <option>40' High Cube</option>
                  <option>LCL (Less than Container)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" defaultValue="1" className="bg-muted/30" />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" placeholder="0" className="bg-muted/30" />
              </div>
              <div className="space-y-2">
                <Label>Commodity</Label>
                <Input placeholder="e.g., Electronics, Textiles" className="bg-muted/30" />
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h2 className="mb-4 text-lg font-semibold">Customer Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input placeholder="Select or enter customer" className="bg-muted/30" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="customer@example.com" className="bg-muted/30" />
              </div>
            </div>
          </div>

          <Button onClick={handleGetRates} className="w-full gradient-primary glow-cyan py-6 text-lg">
            <Calculator className="mr-2 h-5 w-5" />
            Get Rates
          </Button>
        </div>

        {/* Rates Panel */}
        <div className="space-y-6">
          {showRates ? (
            <div className="glass-card rounded-xl p-6 animate-slide-up">
              <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Available Rates
              </h2>
              <div className="space-y-3">
                {mockRates.map((rate, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedRate(i)}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      selectedRate === i
                        ? 'border-primary bg-primary/10 glow-cyan'
                        : 'border-border/50 hover:border-primary/50 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{rate.carrier}</p>
                          {rate.recommended && (
                            <span className="px-2 py-0.5 text-xs bg-green-500/10 text-green-500 rounded-full">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{rate.transitTime}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{rate.price}</p>
                        {rate.savings && (
                          <p className="text-xs text-green-500">Save {rate.savings}</p>
                        )}
                      </div>
                    </div>
                    {selectedRate === i && (
                      <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-sm text-primary">
                        <Check className="h-4 w-4" />
                        Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleCreateQuote}
                className="w-full mt-4 gradient-primary glow-cyan"
                disabled={selectedRate === null}
              >
                Create Quote
              </Button>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-6 animate-slide-up">
              <div className="text-center py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">No Rates Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Fill in the shipment details and click "Get Rates" to see available carrier options.
                </p>
              </div>
            </div>
          )}

          {/* Quick Info */}
          <div className="glass-card rounded-xl p-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="font-medium mb-3 text-sm">Rate Includes:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                Ocean freight charges
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                Terminal handling
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                Documentation fees
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                Basic insurance
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
