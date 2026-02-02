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
  Ship,
  Plane,
  Truck,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  getDashboardStats,
  getRecentActivity,
  getShipments,
  type DashboardStats,
  type ActivityLog,
  type Shipment
} from '@/lib/xano';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, xanoUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);

  // Demo user for UI preview
  const displayName = user?.user_metadata?.name || xanoUser?.name || 'Demo User';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, shipmentsRes] = await Promise.allSettled([
        getDashboardStats(),
        getShipments({ limit: 4 }),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        setDashboardStats(statsRes.value.data);
      } else if (statsRes.status === 'fulfilled' && statsRes.value.error) {
        toast.error('Failed to load dashboard stats');
      }

      if (shipmentsRes.status === 'fulfilled' && shipmentsRes.value.data) {
        const d = shipmentsRes.value.data;
        setRecentShipments(Array.isArray(d) ? d : (d as any).items || []);
      } else if (shipmentsRes.status === 'fulfilled' && shipmentsRes.value.error) {
        toast.error('Failed to load recent shipments');
      }
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

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

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'air': return Plane;
      case 'ocean': return Ship;
      case 'truck': return Truck;
      default: return Package;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'text-flow-green-500 bg-flow-green-500/10';
      case 'in_transit': case 'in transit': return 'text-flow-blue-500 bg-flow-blue-500/10';
      case 'at port': case 'booked': return 'text-amber-500 bg-amber-500/10';
      default: return 'text-muted-foreground bg-muted';
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
              <p className="text-sm text-muted-foreground text-center py-8">No recent shipments found.</p>
            ) : (
              <div className="space-y-3">
                {recentShipments.map((shipment) => {
                  const ModeIcon = Package;
                  return (
                    <div
                      key={shipment.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background">
                          <ModeIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{shipment.tracking_number || `SHP-${shipment.id}`}</p>
                          <p className="text-xs text-muted-foreground">{shipment.carrier_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(shipment.status)}`}>
                          {shipment.status?.replace(/_/g, ' ')}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatOriginDestination(shipment.origin)} → {formatOriginDestination(shipment.destination)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
