import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Container, Ship, MapPin, Calendar, Clock, Package, Truck,
  CheckCircle2, RefreshCw, Loader2, FileText, AlertTriangle, Anchor,
  ArrowRight, CircleDot, BoxSelect, LocateFixed, Hash, Tag, CalendarClock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  getCfsMonitorContainerDetail, stgGetAvailability,
  type CfsContainer,
} from '@/lib/xano';

// ─── Normalized container data ───────────────────────────────────────────────

interface NormalizedContainer {
  containerNumber: string;
  masterBillNumber: string;
  status: string;
  vesselName: string;
  vesselETA: string;
  ata: string;
  location: string;
  jobNumber: string;
  stgReference: string;
  customerReference: string;
  // Key dates
  availableAtPier: string;
  dateIn: string;
  stripDate: string;
  availableAtSTG: string;
  pierLFD: string;
  lclFreeTimeExpires: string;
  goDate: string;
  appointmentDate: string;
  dispatchedDate: string;
  outgatedDate: string;
  returnEmptyDate: string;
  dischargeDate: string;
  // source
  source: 'stg' | 'internal' | 'both';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse MM/DD/YY or MM/DD/YYYY or ISO strings into a Date. Returns null on failure. */
const parseFlexDate = (raw?: string | null): Date | null => {
  if (!raw || !raw.trim()) return null;
  const s = raw.trim();

  // MM/DD/YY or MM/DD/YYYY
  const slashMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const [, mm, dd, yy] = slashMatch;
    let year = parseInt(yy, 10);
    if (year < 100) year += 2000;
    const d = new Date(year, parseInt(mm, 10) - 1, parseInt(dd, 10));
    if (!isNaN(d.getTime())) return d;
  }

  // ISO or other parseable
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  return null;
};

const formatDate = (raw?: string | null): string => {
  const d = parseFlexDate(raw);
  if (!d) return '-';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const daysFromNow = (raw?: string | null): number | null => {
  const d = parseFlexDate(raw);
  if (!d) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
};

/** Normalize STG API response (camelCase) into our unified shape */
const normalizeStgData = (stg: Record<string, any>): NormalizedContainer => ({
  containerNumber: stg.containerNumber || '',
  masterBillNumber: stg.masterBillNumber || '',
  status: stg.status || '',
  vesselName: stg.vesselName || '',
  vesselETA: stg.vesselETA || '',
  ata: stg.ata || '',
  location: stg.location || '',
  jobNumber: stg.jobNumber || '',
  stgReference: stg.stgReferenceNumber || stg.jobNumber || '',
  customerReference: stg.customerReference || '',
  availableAtPier: stg.availableAtPier || '',
  dateIn: stg.dateIn || '',
  stripDate: stg.stripDate || '',
  availableAtSTG: stg.availableAtSTG || '',
  pierLFD: stg.pierLFD || '',
  lclFreeTimeExpires: stg.lclfreeTimeExpires || '',
  goDate: stg.goDate || '',
  appointmentDate: stg.appointmentDate || '',
  dispatchedDate: stg.dispatchedDate || '',
  outgatedDate: stg.outgatedDate || '',
  returnEmptyDate: stg.returnEmptyDate || '',
  dischargeDate: stg.dischargDate || '',
  source: 'stg',
});

/** Normalize internal DB container (snake_case) */
const normalizeInternalData = (c: CfsContainer & Record<string, any>): NormalizedContainer => ({
  containerNumber: c.container_number || '',
  masterBillNumber: c.mbl_number || (c as any).master_bl || '',
  status: c.status || c.lifecycle_stage || '',
  vesselName: c.vessel_name || '',
  vesselETA: c.vessel_eta || c.eta || '',
  ata: c.ata || '',
  location: c.cfs_location || (c as any).location || '',
  jobNumber: (c as any).job_number || '',
  stgReference: (c as any).stg_reference || '',
  customerReference: (c as any).customer_reference || c.customer_code || '',
  availableAtPier: c.available_at_pier || '',
  dateIn: (c as any).date_in || '',
  stripDate: c.stripped_date || (c as any).strip_date || '',
  availableAtSTG: c.available_at_stg || (c as any).available_at_stg || '',
  pierLFD: c.pier_lfd || '',
  lclFreeTimeExpires: (c as any).lcl_free_time_expires || c.warehouse_lfd || '',
  goDate: (c as any).go_date || '',
  appointmentDate: (c as any).appointment_date || '',
  dispatchedDate: (c as any).dispatched_date || '',
  outgatedDate: (c as any).outgated_date || '',
  returnEmptyDate: (c as any).return_empty_date || '',
  dischargeDate: c.discharge_date || '',
  source: 'internal',
});

// ─── Lifecycle stages ────────────────────────────────────────────────────────

interface LifecycleStage {
  key: string;
  label: string;
  icon: typeof Ship;
  dateField: keyof NormalizedContainer;
}

const LIFECYCLE_STAGES: LifecycleStage[] = [
  { key: 'en_route', label: 'En Route', icon: Ship, dateField: 'vesselETA' },
  { key: 'at_pier', label: 'At Pier', icon: Anchor, dateField: 'availableAtPier' },
  { key: 'at_cfs', label: 'At CFS', icon: Container, dateField: 'dateIn' },
  { key: 'stripped', label: 'Stripped', icon: BoxSelect, dateField: 'stripDate' },
  { key: 'available', label: 'Available', icon: Package, dateField: 'availableAtSTG' },
  { key: 'dispatched', label: 'Dispatched', icon: Truck, dateField: 'dispatchedDate' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2, dateField: 'outgatedDate' },
];

const computeCurrentStage = (data: NormalizedContainer): number => {
  // Walk backwards; last stage with a valid date wins
  let lastCompleted = -1;
  for (let i = 0; i < LIFECYCLE_STAGES.length; i++) {
    const val = data[LIFECYCLE_STAGES[i].dateField] as string;
    if (val && val.trim()) {
      lastCompleted = i;
    }
  }
  return lastCompleted;
};

// ─── Status helpers ──────────────────────────────────────────────────────────

const statusColor = (status: string): string => {
  const s = status.toLowerCase();
  if (s.includes('available')) return 'bg-green-500/20 text-green-400 border-green-500/30';
  if (s.includes('dispatch') || s.includes('outgated')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  if (s.includes('strip')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  if (s.includes('route') || s.includes('transit')) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  if (s.includes('delivered')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
};

const lfdColorClass = (days: number | null): string => {
  if (days === null) return 'text-muted-foreground';
  if (days < 0) return 'text-red-500 animate-pulse font-bold';
  if (days <= 3) return 'text-red-400 font-semibold';
  if (days <= 7) return 'text-amber-400 font-semibold';
  return 'text-green-400';
};

const lfdBadgeVariant = (days: number | null): 'destructive' | 'warning' | 'success' | 'secondary' => {
  if (days === null) return 'secondary';
  if (days <= 3) return 'destructive';
  if (days <= 7) return 'warning';
  return 'success';
};

// ─── Timeline builder ────────────────────────────────────────────────────────

interface TimelineEvent {
  date: Date;
  label: string;
  icon: typeof Ship;
  isPast: boolean;
}

const buildTimeline = (data: NormalizedContainer): TimelineEvent[] => {
  const now = new Date();
  const entries: { raw: string; label: string; icon: typeof Ship }[] = [
    { raw: data.vesselETA, label: 'Vessel ETA', icon: Ship },
    { raw: data.ata, label: 'Actual Arrival', icon: Anchor },
    { raw: data.availableAtPier, label: 'Available at Pier', icon: MapPin },
    { raw: data.appointmentDate, label: 'Appointment', icon: CalendarClock },
    { raw: data.dispatchedDate, label: 'Dispatched', icon: Truck },
    { raw: data.dateIn, label: 'Date In (CFS)', icon: Container },
    { raw: data.stripDate, label: 'Stripped', icon: BoxSelect },
    { raw: data.availableAtSTG, label: 'Available at STG', icon: Package },
    { raw: data.outgatedDate, label: 'Outgated', icon: Truck },
    { raw: data.returnEmptyDate, label: 'Empty Returned', icon: Container },
    { raw: data.pierLFD, label: 'Pier LFD', icon: AlertTriangle },
    { raw: data.lclFreeTimeExpires, label: 'LCL Free Time Expires', icon: Clock },
    { raw: data.goDate, label: 'Go Date', icon: CalendarClock },
  ];

  const events: TimelineEvent[] = [];
  for (const e of entries) {
    const d = parseFlexDate(e.raw);
    if (d) {
      events.push({ date: d, label: e.label, icon: e.icon, isPast: d <= now });
    }
  }
  events.sort((a, b) => a.date.getTime() - b.date.getTime());
  return events;
};

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function ContainerTrackingPage() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState<'container' | 'hbl'>('container');
  const [loading, setLoading] = useState(false);
  const [containerData, setContainerData] = useState<NormalizedContainer | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Search logic ────────────────────────────────────────────────────────────

  const handleSearch = async (query?: string) => {
    const q = (query || searchQuery).trim().toUpperCase();
    if (!q) return;

    setSearchQuery(q);
    setLoading(true);
    setContainerData(null);
    setNotFound(false);
    setErrorMsg('');

    try {
      // 1. Try STG live availability API
      let stgParsed: Record<string, any> | null = null;
      try {
        const stgRes = await stgGetAvailability({
          endpoint_path: searchType === 'hbl' ? 'hbl' : 'container',
          containerNumber: searchType === 'container' ? q : undefined,
          houseBillNumber: searchType === 'hbl' ? q : undefined,
        });

        if (stgRes.data) {
          // stgRes.data shape: { request, response: { headers, result, status } }
          const responseObj = stgRes.data.response || stgRes.data;
          const resultStr = responseObj?.result;
          const status = responseObj?.status;

          if (resultStr && typeof resultStr === 'string' && resultStr.trim()) {
            try {
              const parsed = JSON.parse(resultStr);
              // Could be an array (HBL search) or object (container search)
              if (Array.isArray(parsed) && parsed.length > 0) {
                stgParsed = parsed[0];
              } else if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                stgParsed = parsed;
              }
            } catch {
              // result wasn't JSON
            }
          } else if (status !== 204 && typeof resultStr === 'object' && resultStr) {
            // result is already an object
            stgParsed = resultStr;
          }
        }
      } catch {
        // STG call failed, continue to fallback
      }

      if (stgParsed && stgParsed.containerNumber) {
        setContainerData(normalizeStgData(stgParsed));
        toast.success(`Found container ${stgParsed.containerNumber}`);
        setLoading(false);
        return;
      }

      // 2. Try internal CFS monitor
      try {
        const cfsRes = await getCfsMonitorContainerDetail(q);
        if (cfsRes.data && (cfsRes.data.container_number || (cfsRes.data as any).containerNumber)) {
          setContainerData(normalizeInternalData(cfsRes.data));
          toast.success(`Found container in internal database`);
          setLoading(false);
          return;
        }
      } catch {
        // Internal call failed
      }

      // 3. Nothing found
      setNotFound(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred');
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-search from URL param
  useEffect(() => {
    const q = searchParams.get('q');
    const t = searchParams.get('type');
    if (t === 'hbl') setSearchType('hbl');
    if (q) {
      setSearchQuery(q.toUpperCase());
      handleSearch(q);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived data ────────────────────────────────────────────────────────────

  const currentStage = useMemo(() => (containerData ? computeCurrentStage(containerData) : -1), [containerData]);
  const timeline = useMemo(() => (containerData ? buildTimeline(containerData) : []), [containerData]);
  const daysUntilPierLFD = useMemo(() => (containerData ? daysFromNow(containerData.pierLFD) : null), [containerData]);
  const daysUntilLCLExpiry = useMemo(() => (containerData ? daysFromNow(containerData.lclFreeTimeExpires) : null), [containerData]);

  // The most critical LFD (whichever is sooner)
  const criticalLFD = useMemo(() => {
    if (daysUntilPierLFD === null && daysUntilLCLExpiry === null) return null;
    if (daysUntilPierLFD === null) return { days: daysUntilLCLExpiry!, label: 'LCL Free Time', date: containerData!.lclFreeTimeExpires };
    if (daysUntilLCLExpiry === null) return { days: daysUntilPierLFD, label: 'Pier LFD', date: containerData!.pierLFD };
    return daysUntilPierLFD <= daysUntilLCLExpiry
      ? { days: daysUntilPierLFD, label: 'Pier LFD', date: containerData!.pierLFD }
      : { days: daysUntilLCLExpiry, label: 'LCL Free Time', date: containerData!.lclFreeTimeExpires };
  }, [daysUntilPierLFD, daysUntilLCLExpiry, containerData]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─── */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
          <Search className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">HBL / Container Tracking</h1>
          <p className="text-sm text-muted-foreground">Real-time container tracking via STG Operations</p>
        </div>
      </div>

      {/* ─── Search Box ─── */}
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
            <FileText className="mr-2 h-4 w-4" />
            HBL #
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchType === 'container' ? 'Enter container number (e.g., ZCSU6116960)' : 'Enter House Bill number'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-muted/50 border-border/50 font-mono tracking-wider"
            />
          </div>
          <Button onClick={() => handleSearch()} className="gradient-primary glow-cyan" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Track
          </Button>
        </div>
      </div>

      {/* ─── Loading ─── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Querying STG systems…</p>
        </div>
      )}

      {/* ─── Not Found ─── */}
      {!loading && notFound && (
        <div className="glass-card rounded-xl p-8 animate-slide-up text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">Container Not Found</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            No results found for <span className="font-mono text-primary">{searchQuery}</span>.
          </p>
          <div className="text-left max-w-sm mx-auto space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Troubleshooting tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Verify the container number format (e.g., ABCD1234567)</li>
              <li>Try searching by HBL number instead</li>
              <li>Container may not yet be in the STG system</li>
              <li>Check for typos or extra spaces</li>
            </ul>
          </div>
        </div>
      )}

      {/* ─── Error ─── */}
      {!loading && errorMsg && (
        <div className="glass-card rounded-xl p-6 animate-slide-up border border-red-500/20">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-400">Search Error</p>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Container Details ═══ */}
      {!loading && containerData && (
        <>
          {/* ─── Header Card ─── */}
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '80ms' }}>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Left: Container info */}
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                  <Container className="h-7 w-7 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold font-mono tracking-wider">{containerData.containerNumber}</h2>
                    {containerData.status && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusColor(containerData.status)}`}>
                        <CircleDot className="h-3 w-3" />
                        {containerData.status}
                      </span>
                    )}
                  </div>
                  {containerData.masterBillNumber && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground/70">MBL:</span>{' '}
                      <span className="font-mono">{containerData.masterBillNumber}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Vessel + LFD alert */}
              <div className="flex flex-wrap items-start gap-4">
                {containerData.vesselName && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Vessel</p>
                    <p className="font-semibold flex items-center gap-2 justify-end">
                      <Ship className="h-4 w-4 text-primary" />
                      {containerData.vesselName}
                    </p>
                    {containerData.vesselETA && (
                      <p className="text-xs text-muted-foreground">ETA: {formatDate(containerData.vesselETA)}</p>
                    )}
                  </div>
                )}
                {criticalLFD && (
                  <div className={`rounded-lg border px-4 py-2 text-center ${
                    criticalLFD.days <= 0 ? 'border-red-500/50 bg-red-500/10' :
                    criticalLFD.days <= 3 ? 'border-red-500/30 bg-red-500/5' :
                    criticalLFD.days <= 7 ? 'border-amber-500/30 bg-amber-500/5' :
                    'border-green-500/30 bg-green-500/5'
                  }`}>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{criticalLFD.label}</p>
                    <p className={`text-2xl font-bold tabular-nums ${lfdColorClass(criticalLFD.days)}`}>
                      {criticalLFD.days < 0 ? `${Math.abs(criticalLFD.days)}d overdue` : `${criticalLFD.days}d`}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(criticalLFD.date)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Progress Tracker ─── */}
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '160ms' }}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">Container Lifecycle</h3>
            <div className="relative">
              {/* Desktop: horizontal */}
              <div className="hidden md:flex items-start justify-between relative">
                {/* Connecting line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-border/50" />
                <div
                  className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-700 ease-out"
                  style={{ width: currentStage >= 0 ? `${(currentStage / (LIFECYCLE_STAGES.length - 1)) * 100}%` : '0%' }}
                />

                {LIFECYCLE_STAGES.map((stage, i) => {
                  const isCompleted = i <= currentStage;
                  const isCurrent = i === currentStage;
                  const dateVal = containerData[stage.dateField] as string;
                  const Icon = stage.icon;

                  return (
                    <div key={stage.key} className="flex flex-col items-center relative z-10" style={{ flex: '1' }}>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        isCurrent ? 'border-primary bg-primary/20 ring-4 ring-primary/20 scale-110' :
                        isCompleted ? 'border-primary bg-primary/10' :
                        'border-border/50 bg-muted/30'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className={`h-5 w-5 ${isCurrent ? 'text-primary' : 'text-primary/70'}`} />
                        ) : (
                          <Icon className="h-4 w-4 text-muted-foreground/50" />
                        )}
                      </div>
                      <p className={`mt-2 text-xs font-medium text-center ${
                        isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground/50'
                      }`}>
                        {stage.label}
                      </p>
                      {dateVal && dateVal.trim() && (
                        <p className="text-[10px] text-muted-foreground/70 text-center mt-0.5">{formatDate(dateVal)}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mobile: vertical */}
              <div className="md:hidden space-y-3">
                {LIFECYCLE_STAGES.map((stage, i) => {
                  const isCompleted = i <= currentStage;
                  const isCurrent = i === currentStage;
                  const dateVal = containerData[stage.dateField] as string;
                  const Icon = stage.icon;

                  return (
                    <div key={stage.key} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                        isCurrent ? 'border-primary bg-primary/20' :
                        isCompleted ? 'border-primary bg-primary/10' :
                        'border-border/50 bg-muted/30'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className={`h-4 w-4 ${isCurrent ? 'text-primary' : 'text-primary/70'}`} />
                        ) : (
                          <Icon className="h-3.5 w-3.5 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <p className={`text-sm ${isCurrent ? 'text-primary font-semibold' : isCompleted ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                          {stage.label}
                        </p>
                        {dateVal && dateVal.trim() && (
                          <p className="text-xs text-muted-foreground">{formatDate(dateVal)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── Key Dates Grid ─── */}
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '240ms' }}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Key Dates</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Vessel ETA', value: containerData.vesselETA, icon: Ship },
                { label: 'Available at Pier', value: containerData.availableAtPier, icon: Anchor },
                { label: 'Date In (CFS)', value: containerData.dateIn, icon: Container },
                { label: 'Strip Date', value: containerData.stripDate, icon: BoxSelect },
                { label: 'Available at STG', value: containerData.availableAtSTG, icon: Package },
                { label: 'Pier LFD', value: containerData.pierLFD, icon: AlertTriangle, isLFD: true, days: daysUntilPierLFD },
                { label: 'LCL Free Time', value: containerData.lclFreeTimeExpires, icon: Clock, isLFD: true, days: daysUntilLCLExpiry },
                { label: 'Go Date', value: containerData.goDate, icon: CalendarClock },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className={`rounded-lg border p-3 transition-colors ${
                    item.isLFD && item.days !== undefined && item.days !== null
                      ? item.days <= 0 ? 'border-red-500/30 bg-red-500/5' :
                        item.days <= 3 ? 'border-red-500/20 bg-red-500/5' :
                        item.days <= 7 ? 'border-amber-500/20 bg-amber-500/5' :
                        'border-border/30 bg-muted/20'
                      : 'border-border/30 bg-muted/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-3.5 w-3.5 ${
                        item.isLFD && item.days !== undefined && item.days !== null
                          ? item.days <= 3 ? 'text-red-400' : item.days <= 7 ? 'text-amber-400' : 'text-muted-foreground'
                          : 'text-muted-foreground'
                      }`} />
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                    <p className={`text-sm font-semibold ${
                      item.isLFD && item.days !== undefined && item.days !== null ? lfdColorClass(item.days) : ''
                    }`}>
                      {formatDate(item.value)}
                    </p>
                    {item.isLFD && item.days !== null && item.days !== undefined && (
                      <p className={`text-xs mt-0.5 ${lfdColorClass(item.days)}`}>
                        {item.days < 0 ? `${Math.abs(item.days)} days overdue` : item.days === 0 ? 'Due today' : `${item.days} days remaining`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Details Section ─── */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 animate-slide-up" style={{ animationDelay: '320ms' }}>
            {[
              { label: 'Location', value: containerData.location, icon: LocateFixed },
              { label: 'Job Number', value: containerData.jobNumber, icon: Hash },
              { label: 'STG Reference', value: containerData.stgReference, icon: Tag },
              { label: 'Customer Ref', value: containerData.customerReference, icon: FileText },
              { label: 'Appointment', value: formatDate(containerData.appointmentDate), icon: CalendarClock },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  </div>
                  <p className="font-medium text-sm font-mono">{item.value || '-'}</p>
                </div>
              );
            })}
          </div>

          {/* ─── Additional Dates ─── */}
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Additional Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
              {[
                { label: 'Dispatched', value: containerData.dispatchedDate },
                { label: 'Outgated', value: containerData.outgatedDate },
                { label: 'Empty Returned', value: containerData.returnEmptyDate },
                { label: 'ATA', value: containerData.ata },
              ].filter(item => item.value && item.value.trim()).map((item, i) => (
                <div key={i}>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{formatDate(item.value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Timeline ─── */}
          {timeline.length > 0 && (
            <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '480ms' }}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Event Timeline
              </h3>
              <div className="relative">
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border/30" />
                <div className="space-y-4">
                  {timeline.map((event, i) => {
                    const Icon = event.icon;
                    const isLatest = i === timeline.length - 1 && event.isPast;
                    return (
                      <div key={i} className="relative flex gap-4 pl-10">
                        <div className={`absolute left-0 flex h-10 w-10 items-center justify-center rounded-full ${
                          isLatest ? 'bg-primary/20 ring-2 ring-primary' :
                          event.isPast ? 'bg-muted/50' :
                          'bg-muted/20 border border-dashed border-border/50'
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            isLatest ? 'text-primary' :
                            event.isPast ? 'text-muted-foreground' :
                            'text-muted-foreground/40'
                          }`} />
                        </div>
                        <div className="flex-1 pt-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${
                              isLatest ? 'text-primary' :
                              event.isPast ? 'text-foreground' :
                              'text-muted-foreground/60'
                            }`}>
                              {event.label}
                            </span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          {!event.isPast && (
                            <p className="text-xs text-muted-foreground/60 mt-0.5">Upcoming</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── Refresh Button ─── */}
          <div className="flex justify-center animate-slide-up" style={{ animationDelay: '560ms' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSearch(containerData.containerNumber)}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
