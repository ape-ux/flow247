import { useState } from 'react';
import { MapPin, Search, Ship, Plane, Truck, Clock, CheckCircle2, AlertCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const mockTracking = {
  id: 'SHP-2024-001',
  container: 'MSKU7234567',
  carrier: 'Maersk Line',
  vessel: 'MSC ISTANBUL',
  mode: 'ocean',
  origin: 'Shanghai, China',
  destination: 'Long Beach, CA',
  status: 'In Transit',
  eta: 'Jan 28, 2025',
  progress: 65,
  events: [
    { date: 'Jan 25, 2025 14:30', location: 'Pacific Ocean', status: 'In Transit', description: 'Vessel en route to destination' },
    { date: 'Jan 20, 2025 09:15', location: 'Busan, South Korea', status: 'Transshipment', description: 'Departed from transshipment port' },
    { date: 'Jan 18, 2025 16:45', location: 'Busan, South Korea', status: 'Arrived', description: 'Arrived at transshipment port' },
    { date: 'Jan 15, 2025 08:00', location: 'Shanghai, China', status: 'Departed', description: 'Vessel departed from origin port' },
    { date: 'Jan 14, 2025 14:00', location: 'Shanghai, China', status: 'Loaded', description: 'Container loaded onto vessel' },
    { date: 'Jan 12, 2025 10:30', location: 'Shanghai, China', status: 'Gate In', description: 'Container received at terminal' },
  ],
};

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showResult, setShowResult] = useState(true);

  const handleTrack = () => {
    setShowResult(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Track Shipment</h1>
          <p className="text-sm text-muted-foreground">Real-time visibility for your cargo</p>
        </div>
      </div>

      {/* Search Box */}
      <div className="glass-card rounded-xl p-6 animate-slide-up">
        <h2 className="mb-4 text-lg font-semibold">Enter Tracking Information</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Enter tracking number, container ID, or shipment reference..."
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="pl-10 bg-muted/50 border-border/50"
            />
          </div>
          <Button onClick={handleTrack} className="gradient-primary glow-cyan">
            <Search className="mr-2 h-4 w-4" />
            Track
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Supports: Container numbers, B/L numbers, shipment IDs, and booking references
        </p>
      </div>

      {showResult && (
        <>
          {/* Shipment Overview */}
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Ship className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shipment ID</p>
                  <p className="text-xl font-bold">{mockTracking.id}</p>
                  <p className="text-sm text-muted-foreground">Container: {mockTracking.container}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Carrier</p>
                  <p className="font-medium">{mockTracking.carrier}</p>
                  <p className="text-sm text-muted-foreground">{mockTracking.vessel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="font-medium text-blue-500">{mockTracking.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">ETA</p>
                  <p className="font-medium text-primary">{mockTracking.eta}</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">{mockTracking.origin}</span>
                <span className="text-muted-foreground">{mockTracking.destination}</span>
              </div>
              <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${mockTracking.progress}%` }}
                />
              </div>
              <p className="mt-2 text-center text-sm text-muted-foreground">{mockTracking.progress}% complete</p>
            </div>
          </div>

          {/* Route Visualization */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="glass-card rounded-xl p-4 animate-slide-up text-center" style={{ animationDelay: '200ms' }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 mx-auto mb-3">
                <Package className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Origin</p>
              <p className="font-semibold">{mockTracking.origin}</p>
            </div>
            <div className="glass-card rounded-xl p-4 animate-slide-up text-center" style={{ animationDelay: '300ms' }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 mx-auto mb-3">
                <Ship className="h-6 w-6 text-blue-500 animate-pulse" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Location</p>
              <p className="font-semibold">Pacific Ocean</p>
            </div>
            <div className="glass-card rounded-xl p-4 animate-slide-up text-center" style={{ animationDelay: '400ms' }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-3">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Destination</p>
              <p className="font-semibold">{mockTracking.destination}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
            <h3 className="mb-6 text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Shipment History
            </h3>
            <div className="relative">
              <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border/50" />
              <div className="space-y-6">
                {mockTracking.events.map((event, i) => (
                  <div key={i} className="relative flex gap-4 pl-10">
                    <div className={`absolute left-0 flex h-10 w-10 items-center justify-center rounded-full ${
                      i === 0 ? 'bg-blue-500/20 ring-2 ring-blue-500' : 'bg-muted/50'
                    }`}>
                      {i === 0 ? (
                        <Ship className="h-4 w-4 text-blue-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm font-medium ${i === 0 ? 'text-blue-500' : ''}`}>{event.status}</span>
                        <span className="text-xs text-muted-foreground">• {event.location}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
