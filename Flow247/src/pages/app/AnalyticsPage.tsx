import { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Package, Users, Clock, ArrowUpRight, ArrowDownRight, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  getDashboardStats,
  getRecentActivity,
  getCfsTopDestinations,
  type DashboardStats,
  type ActivityLog
} from '@/lib/xano';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [topRoutes, setTopRoutes] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, activityRes, routesRes] = await Promise.allSettled([
        getDashboardStats(),
        getRecentActivity(10),
        getCfsTopDestinations(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        setDashboardStats(statsRes.value.data);
      } else if (statsRes.status === 'fulfilled' && statsRes.value.error) {
        toast.error('Failed to load stats');
      }

      if (activityRes.status === 'fulfilled' && activityRes.value.data) {
        const d = activityRes.value.data;
        setRecentActivity(Array.isArray(d) ? d : []);
      }

      if (routesRes.status === 'fulfilled' && routesRes.value.data) {
        const d = routesRes.value.data;
        setTopRoutes(Array.isArray(d) ? d : (d as any).items || (d as any).destinations || []);
      }
    } catch {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const stats = [
    {
      label: 'Revenue MTD',
      value: loading ? '-' : dashboardStats?.revenue_mtd != null ? `$${Number(dashboardStats.revenue_mtd).toLocaleString()}` : '-',
      change: '',
      trend: 'up' as const,
      icon: DollarSign,
    },
    {
      label: 'Active Shipments',
      value: loading ? '-' : String(dashboardStats?.active_shipments ?? '-'),
      change: '',
      trend: 'up' as const,
      icon: Package,
    },
    {
      label: 'Total Customers',
      value: loading ? '-' : String(dashboardStats?.total_customers ?? '-'),
      change: '',
      trend: 'up' as const,
      icon: Users,
    },
    {
      label: 'Shipments MTD',
      value: loading ? '-' : String(dashboardStats?.shipments_mtd ?? '-'),
      change: '',
      trend: 'up' as const,
      icon: Clock,
    },
  ];

  const getActivityDotColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'shipment': return 'bg-blue-500';
      case 'quote': return 'bg-green-500';
      case 'customer': return 'bg-purple-500';
      case 'alert': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hours ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground">Track your business performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button variant="outline" size="sm">Last 7 days</Button>
          <Button variant="outline" size="sm">Last 30 days</Button>
          <Button variant="outline" size="sm">This Year</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-5 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              {stat.change && (
                <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {stat.change}
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart Placeholder */}
        <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Revenue Overview
          </h3>
          <div className="h-64 flex items-center justify-center border border-dashed border-border/50 rounded-lg bg-muted/20">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Chart visualization</p>
              <p className="text-xs text-muted-foreground">Coming soon with Recharts integration</p>
            </div>
          </div>
        </div>

        {/* Top Routes / Destinations */}
        <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <h3 className="mb-4 text-lg font-semibold">Top Destinations</h3>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : topRoutes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No destination data available.</p>
          ) : (
            <div className="space-y-4">
              {topRoutes.slice(0, 6).map((route: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {route.origin && route.destination
                          ? `${route.origin} → ${route.destination}`
                          : route.destination || route.name || route.location || JSON.stringify(route).slice(0, 40)
                        }
                      </p>
                      {route.shipments != null && (
                        <p className="text-xs text-muted-foreground">{route.shipments} shipments</p>
                      )}
                      {route.count != null && (
                        <p className="text-xs text-muted-foreground">{route.count} containers</p>
                      )}
                    </div>
                  </div>
                  {route.revenue != null && (
                    <p className="font-semibold text-primary">
                      ${Number(route.revenue).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
        <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : recentActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent activity found.</p>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={activity.id || i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className={`flex h-2 w-2 mt-2 rounded-full ${getActivityDotColor(activity.type)}`} />
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.created_at ? formatTimeAgo(activity.created_at) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
