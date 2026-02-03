import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  FileText,
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getDashboardStats,
  getShipments,
  type DashboardStats,
  type Shipment
} from '@/lib/xano';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, xanoUser, xanoReady, profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);

  const displayName = profile?.full_name || xanoUser?.name || user?.user_metadata?.name || user?.email || 'User';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, shipmentsRes] = await Promise.allSettled([
        getDashboardStats(),
        getShipments({ limit: 15 }),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        setDashboardStats(statsRes.value.data);
      }

      if (shipmentsRes.status === 'fulfilled' && shipmentsRes.value.data) {
        const d = shipmentsRes.value.data;
        setRecentShipments(Array.isArray(d) ? d : (d as any).items || []);
      }
    } catch {
      // Silently handle - data will show as empty/loading
    } finally {
      setLoading(false);
    }
  }, []);

  // Only fetch dashboard data once Xano sync is complete (xanoUser set = fresh token available).
  // This prevents wasted 400s with stale localStorage tokens.
  useEffect(() => {
    if (xanoReady && xanoUser) {
      loadData();
    } else if (!xanoReady) {
      setLoading(false);
    }
  }, [xanoReady, xanoUser, loadData]);

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
      value: loading ? '-' : dashboardStats?.revenue_mtd != null ? `$${Number(dashboardStats.revenue_mtd).toLocaleString()}` : '-',
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
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-flow-green-500 bg-flow-green-500/10';
      case 'InTransit': return 'text-flow-blue-500 bg-flow-blue-500/10';
      case 'Booked': case 'Ready': return 'text-amber-500 bg-amber-500/10';
      case 'Committed': return 'text-primary bg-primary/10';
      case 'Canceled': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const formatStatus = (status: string) => {
    if (status === 'InTransit') return 'In Transit';
    return status;
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
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <span className="text-flow-green-500">{stat.change}</span>
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks at your fingertips</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

      {/* Recent Shipments - Full Width Table */}
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
            <p className="text-sm text-muted-foreground text-center py-8">No recent shipments found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">TAI Shipment ID</th>
                    <th className="pb-3 pr-4 font-medium">Origin</th>
                    <th className="pb-3 pr-4 font-medium">Destination</th>
                    <th className="pb-3 pr-4 font-medium">Carrier</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Tenant ID</th>
                  </tr>
                </thead>
                <tbody>
                  {recentShipments.map((shipment) => {
                    const originParts = [shipment.origin_city, shipment.origin_state, shipment.origin_zip].filter(Boolean);
                    const destParts = [shipment.destination_city, shipment.destination_state, shipment.destination_zip].filter(Boolean);
                    return (
                      <tr key={shipment.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 pr-4 font-mono text-xs">
                          {shipment.tai_shipment_id || <span className="text-muted-foreground">-</span>}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="whitespace-nowrap">
                            {originParts.length > 0 ? (
                              <>
                                <span className="font-medium">{shipment.origin_city || '-'}</span>
                                {shipment.origin_state && <span className="text-muted-foreground">, {shipment.origin_state}</span>}
                                {shipment.origin_zip && <span className="text-muted-foreground"> {shipment.origin_zip}</span>}
                              </>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="whitespace-nowrap">
                            {destParts.length > 0 ? (
                              <>
                                <span className="font-medium">{shipment.destination_city || '-'}</span>
                                {shipment.destination_state && <span className="text-muted-foreground">, {shipment.destination_state}</span>}
                                {shipment.destination_zip && <span className="text-muted-foreground"> {shipment.destination_zip}</span>}
                              </>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </span>
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap">
                          {shipment.carrier_name || <span className="text-muted-foreground">Pending</span>}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(shipment.status)}`}>
                            {formatStatus(shipment.status) || '-'}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-xs">
                          {shipment.tenant_id || <span className="text-muted-foreground">-</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
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
