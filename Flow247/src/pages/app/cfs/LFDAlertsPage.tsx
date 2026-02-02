import { useState } from 'react';
import { AlertTriangle, Bell, BellOff, CheckCircle2, Clock, Container, Mail, MessageSquare, Phone, Settings, Trash2, Plus, Loader2, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCfsAlerts } from '@/hooks/useXanoQuery';
import { alertAction, type CfsAlert } from '@/lib/xano';

const getSeverityConfig = (severity?: string) => {
  switch (severity?.toUpperCase()) {
    case 'URGENT':
      return { color: 'text-red-600', bg: 'bg-red-600/10', border: 'border-red-600/30', icon: AlertTriangle, variant: 'destructive' as const };
    case 'CRITICAL':
      return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: AlertTriangle, variant: 'destructive' as const };
    case 'WARNING':
      return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: Clock, variant: 'warning' as const };
    case 'INFO':
      return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: Bell, variant: 'info' as const };
    default:
      return { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: CheckCircle2, variant: 'success' as const };
  }
};

const formatTimestamp = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return dateStr; }
};

export default function LFDAlertsPage() {
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const { data: alertsData, isLoading: loading, refetch } = useCfsAlerts({
    page,
    per_page: 20,
    severity: severityFilter || undefined,
  });

  const alerts: CfsAlert[] = alertsData?.items || [];
  const total = alertsData?.total || 0;

  const alertRules = [
    { id: 1, name: '7-Day Warning', days: 7, channels: ['email'], active: true },
    { id: 2, name: '3-Day Critical', days: 3, channels: ['email', 'sms'], active: true },
    { id: 3, name: '1-Day Urgent', days: 1, channels: ['email', 'sms', 'call'], active: true },
    { id: 4, name: 'LFD Expired', days: 0, channels: ['email', 'sms', 'call'], active: true },
  ];

  const handleAcknowledge = async (alertId: number) => {
    try {
      const res = await alertAction(alertId, 'acknowledge', 'Acknowledged from dashboard');
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Alert acknowledged');
        refetch();
      }
    } catch {
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleResolve = async (alertId: number) => {
    try {
      const res = await alertAction(alertId, 'resolve', 'Resolved from dashboard');
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Alert resolved');
        refetch();
      }
    } catch {
      toast.error('Failed to resolve alert');
    }
  };

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'URGENT').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;
  const acknowledgedCount = alerts.filter(a => a.status === 'ACKNOWLEDGED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">LFD Alerts</h1>
            <p className="text-sm text-muted-foreground">Manage Last Free Day notifications</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="mr-2 h-4 w-4" />
            Alert Settings
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Active Alerts', value: total || alerts.length, color: 'text-primary', icon: Bell },
          { label: 'Critical', value: criticalCount, color: 'text-red-500', icon: AlertTriangle },
          { label: 'Warnings', value: warningCount, color: 'text-amber-500', icon: Clock },
          { label: 'Acknowledged', value: acknowledgedCount, color: 'text-green-500', icon: CheckCircle2 },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
                </p>
              </div>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Severity Filter */}
      <div className="flex gap-2">
        {['', 'CRITICAL', 'WARNING', 'INFO'].map((s) => (
          <Button
            key={s}
            variant={severityFilter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setSeverityFilter(s); setPage(1); }}
            className={severityFilter === s ? 'gradient-primary' : ''}
          >
            {s || 'All'}
          </Button>
        ))}
      </div>

      {/* Alert Settings Panel */}
      {showSettings && (
        <div className="glass-card rounded-xl p-6 animate-slide-up">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Alert Rules Configuration
          </h2>
          <div className="space-y-4">
            {alertRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${rule.active ? 'bg-primary/10' : 'bg-muted'}`}>
                    {rule.active ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="font-medium">{rule.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Trigger {rule.days === 0 ? 'when LFD expires' : `${rule.days} days before LFD`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {rule.channels.includes('email') && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                        <Mail className="h-4 w-4 text-blue-500" />
                      </div>
                    )}
                    {rule.channels.includes('sms') && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                    {rule.channels.includes('call') && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                        <Phone className="h-4 w-4 text-purple-500" />
                      </div>
                    )}
                  </div>
                  <Badge variant={rule.active ? 'success' : 'secondary'}>
                    {rule.active ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          {loading ? 'Loading alerts...' : `${alerts.length} Active Alert${alerts.length !== 1 ? 's' : ''}`}
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium">No active alerts</p>
            <p className="text-sm text-muted-foreground">All containers are within safe LFD thresholds.</p>
          </div>
        ) : (
          alerts.map((alert, i) => {
            const config = getSeverityConfig(alert.severity);
            const IconComponent = config.icon;
            const isAcknowledged = alert.status === 'ACKNOWLEDGED';
            return (
              <div
                key={alert.id || i}
                className={`glass-card rounded-xl p-4 border-l-4 ${config.border} animate-slide-up ${isAcknowledged ? 'opacity-60' : ''}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bg}`}>
                    <IconComponent className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`font-semibold ${config.color}`}>{alert.alert_type || alert.severity}</span>
                      <Badge variant="outline" className="text-xs">
                        <Container className="mr-1 h-3 w-3" />
                        {alert.container_number || alert.house_bill_number}
                      </Badge>
                      <Badge variant={config.variant} className="text-xs">{alert.severity}</Badge>
                      {isAcknowledged && (
                        <Badge variant="secondary" className="text-xs">Acknowledged</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {alert.days_until_lfd != null && (
                        <span className={alert.days_until_lfd <= 0 ? 'text-red-500 font-medium' : ''}>
                          {alert.days_until_lfd <= 0 ? `${Math.abs(alert.days_until_lfd)}d overdue` : `${alert.days_until_lfd}d until LFD`}
                        </span>
                      )}
                      {alert.lfd_date && <span>LFD: {new Date(alert.lfd_date).toLocaleDateString()}</span>}
                      <span>{formatTimestamp(alert.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!isAcknowledged && (
                      <Button variant="outline" size="sm" onClick={() => handleAcknowledge(alert.id)}>
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        Acknowledge
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleResolve(alert.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
