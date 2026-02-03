import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  FileText,
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Ship,
  Plane,
  Truck,
  Loader2,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Container,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardStats, useShipments, useCfsAlerts } from '@/hooks/useXanoQuery';
import { useState } from 'react';
import type { Shipment, CfsAlert } from '@/lib/xano';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, xanoUser } = useAuth();
  const [alertsExpanded, setAlertsExpanded] = useState(true);

  const { data: dashboardStats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: shipmentsData, isLoading: shipmentsLoading } = useShipments({ limit: 4 });
  const { data: alertsData, isLoading: alertsLoading } = useCfsAlerts({ per_page: 5 });

  const loading = statsLoading || shipmentsLoading;
  const recentShipments: Shipment[] = shipmentsData?.items || [];
  const alerts: CfsAlert[] = alertsData?.items || [];
  const criticalAlerts = alerts.filter(
    (a) => a.severity === 'CRITICAL' || a.severity === 'URGENT'
  );

  const displayName = user?.user_metadata?.name || xanoUser?.name || 'Demo User';

  const stats = [
    {
      title: 'Active Shipments',
      value: loading ? '-' : String(dashboardStats?.active_shipments ?? '-'),
      change: '+12%',
      icon: Package,
      color: 'text-flow-blue-500',
      bgColor: 'bg-flow-blue-500/10',
    },
    {
      title: 'Pending Quotes',
      value: loading ? '-' : String(dashboardStats?.pending_quotes ?? '-'),
      change: '+3',
      icon: FileText,
      color: 'text-flow-green-500',
      bgColor: 'bg-flow-green-500/10',
    },
    {
      title: 'Revenue MTD',
      value: loading
        ? '-'
        : dashboardStats?.revenue_mtd != null
          ? `$${Number(dashboardStats.revenue_mtd).toLocaleString()}`
          : '-',
      change: '+18%',
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Customers',
      value: loading ? '-' : String(dashboardStats?.total_customers ?? '-'),
      change: '+5',
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'LFD Alerts',
      value: alertsLoading ? '-' : String(criticalAlerts.length),
      change: criticalAlerts.length > 0 ? 'Action needed' : 'All clear',
      icon: AlertTriangle,
      color: criticalAlerts.length > 0 ? 'text-red-500' : 'text-green-500',
      bgColor: criticalAlerts.length > 0 ? 'bg-red-500/10' : 'bg-green-500/10',
    },
  ];

  const getSeverityStyle = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'URGENT':
        return 'text-red-400 bg-red-500/10 border-red-500/20 animate-pulse';
      case 'WARNING':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'text-flow-green-500 bg-flow-green-500/10';
      case 'in_transit':
      case 'in transit':
        return 'text-flow-blue-500 bg-flow-blue-500/10';
      case 'at port':
      case 'booked':
        return 'text-amber-500 bg-amber-500/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const formatOriginDestination = (loc: any): string => {
    if (!loc) return '-';
    if (typeof loc === 'string') return loc;
    const parts = [loc.city, loc.state, loc.country].filter(Boolean);
    return parts.join(', ') || loc.zip || '-';
  };

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t('dashboard.welcome')}, {displayName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your shipments today.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchStats()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats grid — now 5 columns */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(index < 4 ? loading : alertsLoading) ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  stat.value
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <span className={stat.color}>{stat.change}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions and recent shipments */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks at your fingertips</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/app/quotes/new">
                <FileText className="h-5 w-5" />
                <span>New Quote</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/app/shipments/new">
                <Package className="h-5 w-5" />
                <span>Book Shipment</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/app/tracking">
                <Clock className="h-5 w-5" />
                <span>Track Shipment</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
              <Link to="/app/analytics">
                <BarChart3 className="h-5 w-5" />
                <span>View Analytics</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Shipments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Shipments</CardTitle>
              <CardDescription>Your latest shipment activity</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/shipments">
                View all
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : recentShipments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent shipments found.
              </p>
            ) : (
              <div className="space-y-3">
                {recentShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {shipment.tracking_number || `SHP-${shipment.id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">{shipment.carrier_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(shipment.status)}`}
                      >
                        {shipment.status?.replace(/_/g, ' ')}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatOriginDestination(shipment.origin)} →{' '}
                        {formatOriginDestination(shipment.destination)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ============ LFD Alerts Widget ============ */}
      <Card
        className={
          criticalAlerts.length > 0
            ? 'border-red-500/30 bg-red-500/5'
            : 'border-green-500/20'
        }
      >
        <CardHeader
          className="flex flex-row items-center justify-between cursor-pointer"
          onClick={() => setAlertsExpanded(!alertsExpanded)}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${criticalAlerts.length > 0 ? 'bg-red-500/10' : 'bg-green-500/10'}`}
            >
              <AlertTriangle
                className={`h-5 w-5 ${criticalAlerts.length > 0 ? 'text-red-500' : 'text-green-500'}`}
              />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                LFD Alerts
                {alerts.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {alerts.length} active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {criticalAlerts.length > 0
                  ? `${criticalAlerts.length} critical alert${criticalAlerts.length !== 1 ? 's' : ''} require attention`
                  : 'No active LFD alerts ✅'}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
              <Link to="/app/cfs/lfd-alerts">
                View all
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            {alertsExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        {alertsExpanded && (
          <CardContent>
            {alertsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Container className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">All containers are on schedule</p>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 ${getSeverityStyle(alert.severity)}`}
                      >
                        {alert.severity}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">
                          {alert.container_number || alert.house_bill_number || `Alert #${alert.id}`}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      {alert.days_until_lfd != null && (
                        <p
                          className={`text-sm font-bold ${
                            alert.days_until_lfd <= 1
                              ? 'text-red-500'
                              : alert.days_until_lfd <= 3
                                ? 'text-amber-500'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {alert.days_until_lfd <= 0
                            ? 'OVERDUE'
                            : `${alert.days_until_lfd}d until LFD`}
                        </p>
                      )}
                      {alert.lfd_date && (
                        <p className="text-[10px] text-muted-foreground">
                          LFD: {new Date(alert.lfd_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* AI Chat prompt */}
      <Card className="gradient-primary-soft border-primary/20">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h3 className="text-lg font-semibold">Need help with your shipments?</h3>
            <p className="text-muted-foreground">
              Our AI assistant is available 24/7 to help you with quotes, tracking, and more.
            </p>
          </div>
          <Button variant="gradient" asChild>
            <Link to="/app/chat">
              Start Chat
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
