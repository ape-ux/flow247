import { useState } from 'react';
import { Ship, ArrowRight, MapPin, Package, Calendar, Truck, Plane, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const transportModes = [
  { id: 'ocean', label: 'Ocean Freight', icon: Ship, description: 'FCL/LCL shipping' },
  { id: 'air', label: 'Air Freight', icon: Plane, description: 'Express delivery' },
  { id: 'truck', label: 'Trucking', icon: Truck, description: 'Ground transport' },
];

export default function NewShipmentPage() {
  const [selectedMode, setSelectedMode] = useState('ocean');
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Shipment created successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
          <Ship className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Create New Shipment</h1>
          <p className="text-sm text-muted-foreground">Book a new freight shipment</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 py-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
              step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {s}
            </div>
            {s < 3 && (
              <div className={`w-16 h-0.5 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="glass-card rounded-xl p-6 animate-slide-up">
            <h2 className="mb-6 text-lg font-semibold">Select Transport Mode</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {transportModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSelectedMode(mode.id)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                    selectedMode === mode.id
                      ? 'border-primary bg-primary/10 glow-cyan'
                      : 'border-border/50 hover:border-primary/50 hover:bg-muted/30'
                  }`}
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                    selectedMode === mode.id ? 'bg-primary/20' : 'bg-muted/50'
                  }`}>
                    <mode.icon className={`h-7 w-7 ${selectedMode === mode.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{mode.label}</p>
                    <p className="text-xs text-muted-foreground">{mode.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button type="button" onClick={() => setStep(2)} className="gradient-primary glow-cyan">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="glass-card rounded-xl p-6 animate-slide-up">
            <h2 className="mb-6 text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Route Details
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Origin */}
              <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-muted/20">
                <h3 className="font-medium text-green-500 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Origin
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input placeholder="Select country" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label>Port/City</Label>
                    <Input placeholder="Select port or city" className="bg-background" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address (Optional)</Label>
                  <Input placeholder="Pickup address" className="bg-background" />
                </div>
              </div>

              {/* Destination */}
              <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-muted/20">
                <h3 className="font-medium text-primary flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  Destination
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input placeholder="Select country" className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label>Port/City</Label>
                    <Input placeholder="Select port or city" className="bg-background" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address (Optional)</Label>
                  <Input placeholder="Delivery address" className="bg-background" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="button" onClick={() => setStep(3)} className="gradient-primary glow-cyan">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="glass-card rounded-xl p-6 animate-slide-up">
            <h2 className="mb-6 text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Cargo Details
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Commodity Description</Label>
                  <Input placeholder="What are you shipping?" className="bg-muted/30" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input type="number" placeholder="0" className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>Volume (CBM)</Label>
                    <Input type="number" placeholder="0" className="bg-muted/30" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Length (cm)</Label>
                    <Input type="number" placeholder="0" className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>Width (cm)</Label>
                    <Input type="number" placeholder="0" className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>Height (cm)</Label>
                    <Input type="number" placeholder="0" className="bg-muted/30" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Input placeholder="Select or add customer" className="bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Pickup Date</Label>
                  <Input type="date" className="bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label>Special Instructions</Label>
                  <Input placeholder="Any special handling requirements?" className="bg-muted/30" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button type="submit" className="gradient-primary glow-cyan">
                Create Shipment
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
