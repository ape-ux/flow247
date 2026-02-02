import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Container, Ship, MapPin, Calendar, Clock, Package, Truck,
  CheckCircle2, RefreshCw, Loader2, FileText, MessageSquare, AlertTriangle, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  getCfsMonitorContainerDetail, getCfsContainerDetail, refreshCfsContainer,
  addContainerNote, stgGetAvailability,
  type CfsContainer, type CfsContainerEvent
} from '@/lib/xano';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
};

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return dateStr; }
};

const getLifecycleProgress = (stage?: string) => {
  const stages = ['EN_ROUTE', 'ARRIVED_PORT', 'DISCHARGED', 'AT_PIER', 'AT_CFS', 'STRIPPED', 'AVAILABLE_PICKUP', 'DISPATCHED', 'DELIVERED'];
  const idx = stages.indexOf(stage?.toUpperCase() || '');
  if (idx < 0) return 10;
  return Math.round(((idx + 1) / stages.length) * 100);
};

const getStageIcon = (eventType?: string) => {
  const t = eventType?.toLowerCase() || '';
  if (t.includes('deliver')) return Truck;
  if (t.includes('dispatch')) return Truck;
  if (t.includes('pickup') || t.includes('available')) return Package;
  if (t.includes('strip')) return Package;
  if (t.includes('cfs')) return Container;
  if (t.includes('pier') || t.includes('port')) return Ship;
  if (t.includes('note') || t.includes('manual')) return MessageSquare;
  if (t.includes('alert')) return AlertTriangle;
  return CheckCircle2;
};

export default function ContainerTrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState<'container' | 'hbl'>('container');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [container, setContainer] = useState<CfsContainer | null>(null);
  const [stgData, setStgData] = useState<any>(null);
  const [noteText, setNoteText] = useState('');
  const [sendingNote, setSendingNote] = useState(false);

  const handleSearch = async (query?: string) => {
    const q = (query || searchQuery).trim();
    if (!q) return;

    setLoading(true);
    setContainer(null);
    setStgData(null);

    try {
      // Try both endpoints in parallel
      const [cfsRes, stgRes] = await Promise.allSettled([
        getCfsMonitorContainerDetail(q),
        stgGetAvailability({
          endpoint_path: searchType === 'hbl' ? 'hbl' : 'container',
          containerNumber: searchType === 'container' ? q : undefined,
          houseBillNumber: searchType === 'hbl' ? q : undefined,
        }),
      ]);

      if (cfsRes.status === 'fulfilled' && cfsRes.value.data) {
        setContainer(cfsRes.value.data);
      } else {
        // Fallback to container detail endpoint
        const fallback = await getCfsContainerDetail(q);
        if (fallback.data) setContainer(fallback.data);
      }

      if (stgRes.status === 'fulfilled' && stgRes.value.data) {
        setStgData(stgRes.value.data);
      }

      if (
        (cfsRes.status !== 'fulfilled' || !cfsRes.value.data) &&
        (stgRes.status !== 'fulfilled' || !stgRes.value.data)
      ) {
        toast.error('Container not found. Check the number and try again.');
      }
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if q param is set
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
      handleSearch(q);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    if (!container?.container_number) return;
    setRefreshing(true);
    try {
      const res = await refreshCfsContainer(container.container_number);
      if (res.data) {
        setContainer(res.data);
        toast.success('Container data refreshed from STG');
      } else {
        toast.error(res.error || 'Refresh failed');
      }
    } catch {
      toast.error('Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddNote = async () => {
    if (!container?.container_number || !noteText.trim()) return;
    setSendingNote(true);
    try {
      const res = await addContainerNote(container.container_number, noteText.trim());
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Note added');
        setNoteText('');
        // Refresh to get updated timeline
        handleSearch(container.container_number);
      }
    } catch {
      toast.error('Failed to add note');
    } finally {
      setSendingNote(false);
    }
  };

  const progress = getLifecycleProgress(container?.lifecycle_stage);
  const events = container?._events || [];
  const alerts = container?._alerts || [];
  const tasks = container?._tasks || [];
  const hbls = container?._hbls || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
          <Search className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">HBL / Container Tracking</h1>
          <p className="text-sm text-muted-foreground">Track shipments by HBL or container number</p>
        </div>
      </div>

      {/* Search Box */}
      <div className="glass-card rounded-xl p-6 animate-slide-up">
        <div className="flex gap-2 mb-4">
          <Button
            variant={searchType === 'container' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSearchType('container')}
            className={searchType === 'container' ? 'gradient-primary' : ''}
          >
            <Container className="mr-2 h-4 w-4" />
            Container #
          </Button>
          <Button
            variant={searchType === 'hbl' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSearchType('hbl')}
            className={searchType === 'hbl' ? 'gradient-primary' : ''}
          >
            <Package className="mr-2 h-4 w-4" />
            HBL #
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchType === 'container' ? 'Enter container number (e.g., FFAU2413670)' : 'Enter HBL number'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-muted/50 border-border/50"
            />
          </div>
          <Button onClick={() => handleSearch()} className="gradient-primary glow-cyan" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Track
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && container && (
        <>
          {/* Shipment Overview */}
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Container className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xl font-bold">{container.container_number}</p>
                    {container.lifecycle_stage && (
                      <Badge variant="info">{container.lifecycle_stage.replace(/_/g, ' ')}</Badge>
                    )}
                    {container.lfd_status && (
                      <Badge variant={container.lfd_status === 'CRITICAL' || container.lfd_status === 'OVERDUE' ? 'destructive' : container.lfd_status === 'WARNING' ? 'warning' : 'success'}>
                        LFD: {container.lfd_status}
                      </Badge>
                    )}
                  </div>
                  {container.mbl_number && <p className="text-sm text-muted-foreground">MBL: {container.mbl_number}</p>}
                  {container.consignee && <p className="text-sm text-muted-foreground">Consignee: {container.consignee}</p>}
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                {container.carrier && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Carrier</p>
                    <p className="font-medium">{container.carrier}</p>
                  </div>
                )}
                {container.vessel_name && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Vessel</p>
                    <p className="font-medium">{container.vessel_name}{container.voyage_number ? ` / ${container.voyage_number}` : ''}</p>
                  </div>
                )}
                {(container.eta || container.ata) && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{container.ata ? 'ATA' : 'ETA'}</p>
                    <p className="font-medium text-primary">{formatDate(container.ata || container.eta)}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span>{container.pol || 'Origin'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{container.pod || container.cfs_code || 'Destination'}</span>
                </div>
              </div>
              <div className="h-3 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 via-primary to-primary transition-all duration-500 relative"
                  style={{ width: `${progress}%` }}
                >
                  <Ship className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-5 w-5 text-white drop-shadow-lg" />
                </div>
              </div>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {container.lifecycle_stage?.replace(/_/g, ' ') || 'Unknown'} - {progress}% complete
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'CFS Location', value: container.cfs_code || container.cfs_location || '-', icon: MapPin },
              { label: 'Pier LFD', value: formatDate(container.pier_lfd), icon: Calendar },
              { label: 'Warehouse LFD', value: formatDate(container.warehouse_lfd), icon: Calendar },
              { label: 'Days Until LFD', value: container.effective_days_until_lfd != null ? `${container.effective_days_until_lfd} days` : '-', icon: Clock },
              { label: 'Total HBLs', value: container.total_hbls ?? hbls.length ?? '-', icon: FileText },
              { label: 'Pieces', value: container.total_pieces ?? '-', icon: Package },
              { label: 'Weight', value: container.total_weight ? `${container.total_weight} kg` : '-', icon: Package },
              { label: 'Customer', value: container.customer_name || container.customer_code || '-', icon: Container },
            ].map((item, i) => (
              <div key={i} className="glass-card rounded-xl p-4 animate-slide-up" style={{ animationDelay: `${(i + 2) * 80}ms` }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* HBLs Section */}
          {hbls.length > 0 && (
            <div className="glass-card rounded-xl p-6 animate-slide-up">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                House Bills ({hbls.length})
              </h3>
              <div className="space-y-2">
                {hbls.map((hbl, i) => (
                  <div key={hbl.id || i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div>
                      <p className="text-sm font-medium text-primary">{hbl.house_bill_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {hbl.consignee && `${hbl.consignee} - `}
                        {hbl.pieces && `${hbl.pieces} pcs`}
                        {hbl.weight && ` / ${hbl.weight} kg`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {hbl.available_for_pickup && <Badge variant="success" className="text-xs">Ready</Badge>}
                      {hbl.days_until_lfd != null && (
                        <Badge variant={hbl.days_until_lfd <= 3 ? 'destructive' : hbl.days_until_lfd <= 7 ? 'warning' : 'secondary'} className="text-xs">
                          {hbl.days_until_lfd}d LFD
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Alerts */}
          {alerts.length > 0 && (
            <div className="glass-card rounded-xl p-6 animate-slide-up">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Active Alerts ({alerts.length})
              </h3>
              <div className="space-y-2">
                {alerts.map((alert, i) => (
                  <div key={alert.id || i} className={`flex items-center justify-between p-3 rounded-lg ${
                    alert.severity === 'CRITICAL' ? 'bg-red-500/10 border border-red-500/20' :
                    alert.severity === 'WARNING' ? 'bg-amber-500/10 border border-amber-500/20' :
                    'bg-muted/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-4 w-4 ${
                        alert.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{alert.alert_type || alert.severity}</p>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                    <Badge variant={alert.severity === 'CRITICAL' ? 'destructive' : 'warning'} className="text-xs">
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {tasks.length > 0 && (
            <div className="glass-card rounded-xl p-6 animate-slide-up">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Tasks ({tasks.length})
              </h3>
              <div className="space-y-2">
                {tasks.map((task, i) => (
                  <div key={task.id || i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div>
                      <p className="text-sm font-medium">{task.title || task.task_type}</p>
                      <p className="text-xs text-muted-foreground">{task.description}</p>
                    </div>
                    <Badge variant={task.status === 'DONE' ? 'success' : task.status === 'IN_PROGRESS' ? 'info' : 'outline'} className="text-xs">
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline / Events */}
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '800ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Event Timeline
              </h3>
            </div>

            {/* Add Note */}
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Add a note to the timeline..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                className="bg-muted/50 border-border/50"
              />
              <Button variant="outline" size="sm" onClick={handleAddNote} disabled={sendingNote || !noteText.trim()}>
                {sendingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>

            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No events recorded yet.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border/50" />
                <div className="space-y-6">
                  {events.map((event, i) => {
                    const IconComponent = getStageIcon(event.event_type);
                    return (
                      <div key={event.id || i} className="relative flex gap-4 pl-10">
                        <div className={`absolute left-0 flex h-10 w-10 items-center justify-center rounded-full ${
                          i === 0 ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted/50'
                        }`}>
                          <IconComponent className={`h-4 w-4 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-sm font-medium ${i === 0 ? 'text-primary' : ''}`}>
                              {event.event_type?.replace(/_/g, ' ') || 'Event'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{event.description || event.notes}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatDateTime(event.created_at)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Raw STG Data (collapsible) */}
          {stgData && (
            <details className="glass-card rounded-xl p-6 animate-slide-up">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                Raw STG API Data (debug)
              </summary>
              <pre className="mt-4 text-xs overflow-auto max-h-96 bg-muted/30 rounded-lg p-4">
                {JSON.stringify(stgData, null, 2)}
              </pre>
            </details>
          )}
        </>
      )}
    </div>
  );
}
