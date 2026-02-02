import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle2, Container, Calendar, MapPin, Ship, RefreshCw, Filter, Download, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getCfsContainers, getCfsMonitorDashboard, exportCfsData,
  type CfsContainer, type CfsMonitorDashboard
} from '@/lib/xano';

const getStatusConfig = (container: CfsContainer) => {
  const days = container.effective_days_until_lfd;
  const status = container.lfd_status?.toUpperCase() || '';

  if (status === 'OVERDUE' || (days != null && days < 0)) {
    return { variant: 'destructive' as const, label: 'EXPIRED', color: 'text-red-500', bg: 'bg-red-500/10' };
  }
  if (status === 'CRITICAL' || (days != null && days <= 3)) {
    return { variant: 'destructive' as const, label: 'CRITICAL', color: 'text-red-500', bg: 'bg-red-500/10' };
  }
  if (status === 'WARNING' || (days != null && days <= 7)) {
    return { variant: 'warning' as const, label: 'WARNING', color: 'text-amber-500', bg: 'bg-amber-500/10' };
  }
  return { variant: 'success' as const, label: 'OK', color: 'text-green-500', bg: 'bg-green-500/10' };
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
};

export default function LFDMonitorPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [containers, setContainers] = useState<CfsContainer[]>([]);
  const [monitor, setMonitor] = useState<CfsMonitorDashboard | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [containersRes, monitorRes] = await Promise.allSettled([
        getCfsContainers({
          q: searchQuery || undefined,
          status: statusFilter || undefined,
          limit: 50,
          page,
          sort_by: 'effective_days_until_lfd',
          sort_order: 'asc',
        }),
        getCfsMonitorDashboard({ page: 1, per_page: 50, status_filter: statusFilter || undefined }),
      ]);

      if (containersRes.status === 'fulfilled' && containersRes.value.data) {
        setContainers(Array.isArray(containersRes.value.data) ? containersRes.value.data : []);
      }
      if (monitorRes.status === 'fulfilled' && monitorRes.value.data) {
        setMonitor(monitorRes.value.data);
        // If containers endpoint returned empty, fall back to monitor items
        if (containersRes.status === 'fulfilled' && (!containersRes.value.data || (Array.isArray(containersRes.value.data) && containersRes.value.data.length === 0))) {
          if (monitorRes.value.data.items?.length) {
            setContainers(monitorRes.value.data.items);
          }
        }
      }
    } catch {
      toast.error('Failed to load LFD data');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, page]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    try {
      const res = await exportCfsData({ format, status_filter: statusFilter || undefined });
      if (res.data) {
        if (format === 'csv' && typeof res.data === 'string') {
          const blob = new Blob([res.data], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `lfd-monitor-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `lfd-monitor-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
        toast.success(`Exported as ${format.toUpperCase()}`);
      } else {
        toast.error(res.error || 'Export failed');
      }
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const totalContainers = monitor?.stats?.total_containers ?? monitor?.total ?? containers.length;
  const expired = monitor?.stats?.overdue_count ?? containers.filter(c => (c.effective_days_until_lfd ?? 99) < 0).length;
  const critical = monitor?.stats?.critical_count ?? containers.filter(c => {
    const d = c.effective_days_until_lfd;
    return d != null && d >= 0 && d <= 3;
  }).length;
  const ok = monitor?.stats?.ok_count ?? containers.filter(c => (c.effective_days_until_lfd ?? 0) > 7).length;

  const stats = [
    { label: 'Total Containers', value: totalContainers, icon: Container, color: 'text-primary' },
    { label: 'Expired LFD', value: expired, icon: AlertTriangle, color: 'text-red-500' },
    { label: 'Critical (\u22643 days)', value: critical, icon: Clock, color: 'text-amber-500' },
    { label: 'On Track', value: ok, icon: CheckCircle2, color: 'text-green-500' },
  ];

  const urgentCount = expired + critical;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">LFD Monitor</h1>
            <p className="text-sm text-muted-foreground">Track Last Free Day for all containers</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Banner */}
      {urgentCount > 0 && (
        <div className="glass-card rounded-xl p-4 border-l-4 border-red-500 bg-red-500/5 animate-slide-up">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-500">{urgentCount} container(s) require immediate attention</p>
              <p className="text-sm text-muted-foreground">LFD expired or expiring within 3 days. Demurrage charges may apply.</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by container, HBL, or vessel..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>
        <div className="flex gap-2">
          {['', 'CRITICAL', 'WARNING', 'OK'].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={statusFilter === s ? 'gradient-primary' : ''}
            >
              {s || 'All'}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden rounded-xl animate-slide-up">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : containers.length === 0 ? (
          <div className="text-center py-16">
            <Container className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No containers found</p>
            <p className="text-sm text-muted-foreground">Try adjusting filters or run a sync pipeline.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Container / HBL</TableHead>
                <TableHead>Vessel</TableHead>
                <TableHead>CFS</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>LFD</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {containers.map((item, i) => {
                const statusConfig = getStatusConfig(item);
                return (
                  <TableRow
                    key={item.id || i}
                    className="animate-slide-up cursor-pointer"
                    style={{ animationDelay: `${(i + 4) * 30}ms` }}
                    onClick={() => navigate(`/app/cfs/container-tracking?q=${item.container_number}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-primary">{item.container_number}</p>
                        {item.mbl_number && <p className="text-xs text-muted-foreground">MBL: {item.mbl_number}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Ship className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.vessel_name || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm">{item.cfs_code || item.pod || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(item.ata || item.eta)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{formatDate(item.effective_lfd || item.pier_lfd || item.warehouse_lfd)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-lg font-bold ${statusConfig.color}`}>
                        {item.effective_days_until_lfd != null ? item.effective_days_until_lfd : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.lifecycle_stage && (
                        <Badge variant="outline" className="text-xs">
                          {item.lifecycle_stage.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig.variant}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {containers.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {containers.length} container(s) {monitor?.total ? `of ${monitor.total}` : ''}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="flex items-center text-sm px-2">Page {page}</span>
            <Button variant="outline" size="sm" disabled={containers.length < 50} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
