import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Container, AlertTriangle, Clock, CheckCircle2, Truck,
  RefreshCw, Ship, MapPin, Calendar, ArrowRight, Activity, TrendingUp,
  Package, Loader2, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useCfsStats, useCfsMonitor, useCfsTasks, useCfsAlerts, useCfsContainers
} from '@/hooks/useXanoQuery';
import type { CfsDashboardStats, CfsContainer, CfsAlert, CfsTask, CfsMonitorDashboard } from '@/lib/xano';

const getLifecycleColor = (stage?: string) => {
  switch (stage?.toUpperCase()) {
    case 'DELIVERED': return 'text-green-500 bg-green-500/10';
    case 'DISPATCHED': return 'text-blue-500 bg-blue-500/10';
    case 'AVAILABLE_PICKUP': return 'text-emerald-500 bg-emerald-500/10';
    case 'STRIPPED': return 'text-cyan-500 bg-cyan-500/10';
    case 'AT_CFS': return 'text-purple-500 bg-purple-500/10';
    case 'AT_PIER': return 'text-amber-500 bg-amber-500/10';
    case 'DISCHARGED': return 'text-orange-500 bg-orange-500/10';
    case 'ARRIVED_PORT': return 'text-yellow-500 bg-yellow-500/10';
    case 'EN_ROUTE': return 'text-blue-400 bg-blue-400/10';
    default: return 'text-muted-foreground bg-muted/50';
  }
};

const getLfdStatusBadge = (status?: string) => {
  switch (status?.toUpperCase()) {
    case 'CRITICAL': case 'OVERDUE': return 'destructive' as const;
    case 'WARNING': return 'warning' as const;
    case 'OK': return 'success' as const;
    default: return 'secondary' as const;
  }
};

const getSeverityBadge = (severity?: string) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': case 'URGENT': return 'destructive' as const;
    case 'WARNING': return 'warning' as const;
    case 'INFO': return 'info' as const;
    default: return 'secondary' as const;
  }
};

export default function ControlTowerPage() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useCfsStats();
  const { data: monitor, isLoading: monitorLoading } = useCfsMonitor({ page: 1, per_page: 50 });
  const { data: tasksData, isLoading: tasksLoading } = useCfsTasks({ status: 'OPEN' });
  const { data: alertsData, isLoading: alertsLoading } = useCfsAlerts({ page: 1, per_page: 10 });
  const { data: containersData, isLoading: containersLoading } = useCfsContainers({ limit: 20 });

  const loading = statsLoading || monitorLoading || tasksLoading || alertsLoading || containersLoading;

  const tasks: CfsTask[] = Array.isArray(tasksData) ? tasksData : [];
  const alerts: CfsAlert[] = alertsData?.items || [];
  const containers: CfsContainer[] = Array.isArray(containersData) ? containersData : [];

  const handleRefresh = () => {
    refetchStats();
  };

  const statCards = [
    { label: 'Total Containers', value: stats?.total_containers ?? monitor?.stats?.total_containers ?? containers.length, icon: Container, color: 'text-primary' },
    { label: 'Critical Alerts', value: stats?.critical_alerts ?? monitor?.stats?.critical_count ?? alerts.filter(a => a.severity === 'CRITICAL').length, icon: AlertTriangle, color: 'text-red-500' },
    { label: 'Open Tasks', value: stats?.open_tasks ?? tasks.length, icon: CheckCircle2, color: 'text-amber-500' },
    { label: 'Pending Dispatch', value: stats?.pending_dispatch ?? 0, icon: Truck, color: 'text-blue-500' },
    { label: 'At Risk', value: stats?.containers_at_risk ?? monitor?.stats?.warning_count ?? 0, icon: Clock, color: 'text-orange-500' },
    { label: 'Delivered', value: stats?.containers_delivered ?? 0, icon: Package, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">STG Control Tower</h1>
            <p className="text-sm text-muted-foreground">Real-time CFS operations dashboard</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Critical Alerts Banner */}
      {alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'URGENT').length > 0 && (
        <div className="glass-card rounded-xl p-4 border-l-4 border-red-500 bg-red-500/5 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-red-500">
                  {alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'URGENT').length} critical alert(s) require attention
                </p>
                <p className="text-sm text-muted-foreground">Containers with expiring or overdue LFDs</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/app/cfs/lfd-alerts')}>
              View Alerts <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Container List - 2 cols */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Container className="h-5 w-5 text-primary" />
              Active Containers
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/cfs/lfd-monitor')}>
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          {containersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : containers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No containers found. Run a sync to populate data.</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {containers.slice(0, 15).map((c, i) => (
                <div
                  key={c.id || i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                  onClick={() => navigate(`/app/cfs/container-tracking?q=${c.container_number}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getLifecycleColor(c.lifecycle_stage)}`}>
                      <Container className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.container_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.vessel_name && `${c.vessel_name} `}
                        {c.cfs_code && `- ${c.cfs_code}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.lifecycle_stage && (
                      <Badge variant="outline" className="text-xs">
                        {c.lifecycle_stage.replace(/_/g, ' ')}
                      </Badge>
                    )}
                    {c.lfd_status && (
                      <Badge variant={getLfdStatusBadge(c.lfd_status)} className="text-xs">
                        {c.effective_days_until_lfd != null ? `${c.effective_days_until_lfd}d` : c.lfd_status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Alerts + Tasks */}
        <div className="space-y-6">
          {/* Recent Alerts */}
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Recent Alerts
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/cfs/lfd-alerts')}>
                All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            {alertsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No active alerts</p>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert, i) => (
                  <div key={alert.id || i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/20">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                      alert.severity === 'CRITICAL' || alert.severity === 'URGENT' ? 'text-red-500' :
                      alert.severity === 'WARNING' ? 'text-amber-500' : 'text-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{alert.container_number || alert.house_bill_number}</p>
                      <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                    </div>
                    <Badge variant={getSeverityBadge(alert.severity)} className="text-xs shrink-0">
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Open Tasks */}
          <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Open Tasks
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/cfs/tasks')}>
                All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            {tasksLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No open tasks</p>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 5).map((task, i) => (
                  <div key={task.id || i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/20">
                    <div className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${
                      (task.priority || 0) >= 4 ? 'bg-red-500/20 text-red-500' :
                      (task.priority || 0) >= 3 ? 'bg-amber-500/20 text-amber-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {task.priority || '-'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title || task.task_type}</p>
                      <p className="text-xs text-muted-foreground truncate">{task.container_number}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
