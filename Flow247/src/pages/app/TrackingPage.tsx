import { useState, useCallback } from 'react';
import {
  MapPin,
  Search,
  Ship,
  Clock,
  CheckCircle2,
  Package,
  Loader2,
  Radio,
  Hash,
  Type,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useRealtimeTracking, useShipmentRealtime } from '@/hooks/useRealtimeTracking';
import { useShipment, useShipments } from '@/hooks/useXanoQuery';
import { exfreightTrackShipment } from '@/lib/xano';
import type { Shipment } from '@/lib/xano';

interface TrackingEvent {
  date: string;
  status: string;
  location: string;
}

export default function TrackingPage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchMode, setSearchMode] = useState<'id' | 'tracking'>('tracking');
  const [searchedId, setSearchedId] = useState<number | null>(null);
  const [exfreightEvents, setExfreightEvents] = useState<TrackingEvent[]>([]);
  const [exfreightLoading, setExfreightLoading] = useState(false);
  const [searchedTrackingNumber, setSearchedTrackingNumber] = useState<string | null>(null);

  // Realtime tracking for live updates banner
  const { updates: realtimeUpdates, isConnected } = useRealtimeTracking({ showToasts: false });

  // Load a shipment by ID when searched
  const { data: shipment, isLoading: shipmentLoading } = useShipment(searchedId || 0);

  // Active shipments for quick lookup
  const { data: activeShipmentsData } = useShipments({ status: 'in_transit', limit: 5 });
  const activeShipments: Shipment[] = activeShipmentsData?.items || [];

  // Realtime events for the searched shipment
  const { events: shipmentEvents } = useShipmentRealtime(
    shipment?.tracking_number || (searchedId ? String(searchedId) : undefined)
  );

  const handleTrack = useCallback(async () => {
    const trimmed = searchInput.trim();
    if (!trimmed) {
      toast.error('Please enter a tracking number or shipment ID');
      return;
    }

    // Reset previous results
    setExfreightEvents([]);
    setSearchedTrackingNumber(null);
    setSearchedId(null);

    if (searchMode === 'id') {
      const numId = parseInt(trimmed, 10);
      if (isNaN(numId)) {
        toast.error('Please enter a valid numeric shipment ID');
        return;
      }
      setSearchedId(numId);
    } else {
      // Tracking number search via ExFreight
      setExfreightLoading(true);
      setSearchedTrackingNumber(trimmed);
      try {
        const result = await exfreightTrackShipment(trimmed);
        if (result.error) {
          toast.error('Tracking lookup failed: ' + result.error);
          setExfreightEvents([]);
        } else if (result.data?.events) {
          setExfreightEvents(result.data.events);
          if (result.data.events.length === 0) {
            toast.info('No tracking events found for this number');
          }
        }
      } catch (err) {
        toast.error('Failed to look up tracking number');
      } finally {
        setExfreightLoading(false);
      }

      // Also try numeric ID fallback
      const numId = parseInt(trimmed, 10);
      if (!isNaN(numId)) {
        setSearchedId(numId);
      }
    }
  }, [searchInput, searchMode]);

  const handleQuickLookup = (ship: Shipment) => {
    if (ship.tracking_number) {
      setSearchInput(ship.tracking_number);
      setSearchMode('tracking');
    } else {
      setSearchInput(String(ship.id));
      setSearchMode('id');
    }
    // Trigger search
    setSearchedId(ship.id);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'text-green-500';
      case 'in_transit':
      case 'in transit':
        return 'text-blue-500';
      case 'at port':
      case 'booked':
        return 'text-amber-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatLocation = (loc: any): string => {
    if (!loc) return '-';
    if (typeof loc === 'string') return loc;
    const parts = [loc.city, loc.state, loc.country].filter(Boolean);
    return parts.join(', ') || loc.zip || '-';
  };

  const isSearching = shipmentLoading || exfreightLoading;
  const hasResults = shipment || exfreightEvents.length > 0;
  const hasSearched = searchedId || searchedTrackingNumber;

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
        {isConnected && (
          <Badge variant="outline" className="ml-auto text-xs gap-1">
            <Radio className="h-3 w-3 text-green-500 animate-pulse" />
            Live
          </Badge>
        )}
      </div>

      {/* Realtime Updates Banner */}
      {realtimeUpdates.length > 0 && (
        <div className="glass-card rounded-xl p-4 border-l-4 border-blue-500 bg-blue-500/5 animate-slide-up">
          <div className="flex items-center gap-3">
            <Radio className="h-5 w-5 text-blue-500 animate-pulse" />
            <div>
              <p className="font-medium text-blue-500">
                {realtimeUpdates.length} recent tracking update
                {realtimeUpdates.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-muted-foreground">
                Latest: {realtimeUpdates[0]?.event_description || realtimeUpdates[0]?.status?.replace(/_/g, ' ')} —
                Shipment {realtimeUpdates[0]?.shipment_id}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Box */}
      <div className="glass-card rounded-xl p-6 animate-slide-up">
        <h2 className="mb-4 text-lg font-semibold">Enter Tracking Information</h2>

        <Tabs
          value={searchMode}
          onValueChange={(v) => setSearchMode(v as 'id' | 'tracking')}
          className="mb-4"
        >
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="tracking" className="gap-1.5">
              <Type className="h-3.5 w-3.5" />
              Tracking #
            </TabsTrigger>
            <TabsTrigger value="id" className="gap-1.5">
              <Hash className="h-3.5 w-3.5" />
              Shipment ID
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={
                searchMode === 'tracking'
                  ? 'Enter tracking number (e.g., MSCU1234567)...'
                  : 'Enter shipment ID (e.g., 42)...'
              }
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              className="pl-10 bg-muted/50 border-border/50"
            />
          </div>
          <Button
            onClick={handleTrack}
            className="gradient-primary glow-cyan"
            disabled={isSearching}
          >
            {isSearching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Track
          </Button>
        </div>
      </div>

      {/* Quick Lookup: Active Shipments */}
      {activeShipments.length > 0 && !hasSearched && (
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Ship className="h-4 w-4" />
            Where's my shipment? — Quick Lookup
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeShipments.map((ship) => (
              <div
                key={ship.id}
                className="glass-card rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleQuickLookup(ship)}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-primary">
                    {ship.tracking_number || `SHP-${ship.id}`}
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${getStatusColor(ship.status)}`}
                  >
                    {ship.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{formatLocation((ship as any).origin)}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>{formatLocation((ship as any).destination)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {ship.carrier_name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {isSearching && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* No result */}
      {hasSearched && !isSearching && !hasResults && (
        <div className="glass-card rounded-xl p-12 text-center animate-slide-up">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">No shipment found</p>
          <p className="text-sm text-muted-foreground">
            No results for "{searchInput}". Check the number and try again.
          </p>
        </div>
      )}

      {/* ============ ExFreight Tracking Events ============ */}
      {exfreightEvents.length > 0 && !exfreightLoading && (
        <div className="glass-card rounded-xl p-6 animate-slide-up">
          <h3 className="mb-6 text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Tracking Events — {searchedTrackingNumber}
          </h3>
          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border/50" />
            <div className="space-y-6">
              {exfreightEvents.map((event, i) => (
                <div key={i} className="relative flex gap-4 pl-10">
                  <div
                    className={`absolute left-0 flex h-10 w-10 items-center justify-center rounded-full ${
                      i === 0
                        ? 'bg-blue-500/20 ring-2 ring-blue-500'
                        : 'bg-muted/50'
                    }`}
                  >
                    {i === 0 ? (
                      <Ship className="h-4 w-4 text-blue-500" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          i === 0 ? 'text-blue-500' : ''
                        }`}
                      >
                        {event.status}
                      </span>
                      {event.location && (
                        <span className="text-xs text-muted-foreground">
                          • {event.location}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============ Shipment Result (by ID) ============ */}
      {shipment && !shipmentLoading && (
        <>
          {/* Shipment Overview */}
          <div
            className="glass-card rounded-xl p-6 animate-slide-up"
            style={{ animationDelay: '100ms' }}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Ship className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shipment</p>
                  <p className="text-xl font-bold">
                    {shipment.tracking_number || `SHP-${shipment.id}`}
                  </p>
                  <p className="text-sm text-muted-foreground">ID: {shipment.id}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Carrier
                  </p>
                  <p className="font-medium">{shipment.carrier_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Status
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className={`font-medium ${getStatusColor(shipment.status)}`}>
                      {shipment.status?.replace(/_/g, ' ') || 'Unknown'}
                    </span>
                  </div>
                </div>
                {(shipment as any).estimated_delivery && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      ETA
                    </p>
                    <p className="font-medium text-primary">
                      {new Date((shipment as any).estimated_delivery).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {formatLocation((shipment as any).origin)}
                </span>
                <span className="text-muted-foreground">
                  {formatLocation((shipment as any).destination)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{
                    width: `${
                      (shipment.status as string) === 'delivered' || shipment.status === 'Delivered'
                        ? 100
                        : (shipment.status as string) === 'in_transit' || shipment.status === 'InTransit'
                          ? 60
                          : (shipment.status as string) === 'booked' || shipment.status === 'Booked'
                            ? 15
                            : (shipment.status as string) === 'at port' || shipment.status === 'Ready'
                              ? 30
                              : 5
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Route Cards */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div
              className="glass-card rounded-xl p-4 animate-slide-up text-center"
              style={{ animationDelay: '200ms' }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 mx-auto mb-3">
                <Package className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Origin</p>
              <p className="font-semibold">{formatLocation((shipment as any).origin)}</p>
            </div>
            <div
              className="glass-card rounded-xl p-4 animate-slide-up text-center"
              style={{ animationDelay: '300ms' }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 mx-auto mb-3">
                <Ship className="h-6 w-6 text-blue-500 animate-pulse" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
              <p className="font-semibold">
                {shipment.status?.replace(/_/g, ' ') || 'Unknown'}
              </p>
            </div>
            <div
              className="glass-card rounded-xl p-4 animate-slide-up text-center"
              style={{ animationDelay: '400ms' }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-3">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Destination
              </p>
              <p className="font-semibold">{formatLocation((shipment as any).destination)}</p>
            </div>
          </div>

          {/* Realtime Events for this shipment */}
          {shipmentEvents.length > 0 && (
            <div
              className="glass-card rounded-xl p-6 animate-slide-up"
              style={{ animationDelay: '500ms' }}
            >
              <h3 className="mb-6 text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Live Updates
              </h3>
              <div className="relative">
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border/50" />
                <div className="space-y-6">
                  {shipmentEvents.map((event, i) => (
                    <div key={event.id || i} className="relative flex gap-4 pl-10">
                      <div
                        className={`absolute left-0 flex h-10 w-10 items-center justify-center rounded-full ${
                          i === 0
                            ? 'bg-blue-500/20 ring-2 ring-blue-500'
                            : 'bg-muted/50'
                        }`}
                      >
                        {i === 0 ? (
                          <Ship className="h-4 w-4 text-blue-500" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-sm font-medium ${
                              i === 0 ? 'text-blue-500' : ''
                            }`}
                          >
                            {event.status?.replace(/_/g, ' ')}
                          </span>
                          {event.location && (
                            <span className="text-xs text-muted-foreground">
                              • {event.location}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.event_description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state: nothing searched yet */}
      {!hasSearched && !isSearching && activeShipments.length === 0 && (
        <div
          className="glass-card rounded-xl p-12 text-center animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          <Ship className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">Enter a tracking number to get started</p>
          <p className="text-sm text-muted-foreground">
            Track your shipments in real-time with live updates
          </p>
        </div>
      )}
    </div>
  );
}
