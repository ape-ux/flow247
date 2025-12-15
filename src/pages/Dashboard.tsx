import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Package, 
  Truck, 
  Globe, 
  TrendingUp, 
  Clock, 
  MessageCircle,
  ArrowRight,
  BarChart3,
  CreditCard
} from 'lucide-react';

const stats = [
  { label: 'Active Shipments', value: '12', icon: Truck, trend: '+3 this week' },
  { label: 'Countries Reached', value: '8', icon: Globe, trend: '+2 this month' },
  { label: 'Total Packages', value: '156', icon: Package, trend: '+24 this month' },
  { label: 'On-Time Delivery', value: '98%', icon: Clock, trend: '+2% improvement' },
];

const recentShipments = [
  { id: 'SHP-001', destination: 'New York, USA', status: 'In Transit', date: '2024-01-15' },
  { id: 'SHP-002', destination: 'London, UK', status: 'Delivered', date: '2024-01-14' },
  { id: 'SHP-003', destination: 'Tokyo, Japan', status: 'Processing', date: '2024-01-13' },
  { id: 'SHP-004', destination: 'Sydney, Australia', status: 'In Transit', date: '2024-01-12' },
];

export default function Dashboard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl">
            Welcome back, <span className="gradient-text">{user?.name || 'User'}</span>
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your shipping operations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card p-6 transition-all hover:border-primary/50">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="mb-1 font-display text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="mt-2 text-xs text-primary">{stat.trend}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <Link to="/chat" className="block">
            <div className="glass-card group flex items-center gap-4 p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <MessageCircle className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold">AI Assistant</h3>
                <p className="text-sm text-muted-foreground">Get instant shipping help</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </Link>

          <Link to="/pricing" className="block">
            <div className="glass-card group flex items-center gap-4 p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <CreditCard className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold">Manage Plan</h3>
                <p className="text-sm text-muted-foreground">View subscription details</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </Link>

          <div className="glass-card group flex items-center gap-4 p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <BarChart3 className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold">Analytics</h3>
              <p className="text-sm text-muted-foreground">View detailed reports</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
        </div>

        {/* Recent Shipments */}
        <div className="glass-card">
          <div className="border-b border-border/50 p-6">
            <h2 className="font-display text-xl font-semibold">Recent Shipments</h2>
          </div>
          <div className="divide-y divide-border/50">
            {recentShipments.map((shipment) => (
              <div key={shipment.id} className="flex items-center justify-between p-6 transition-colors hover:bg-secondary/30">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{shipment.id}</div>
                    <div className="text-sm text-muted-foreground">{shipment.destination}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    shipment.status === 'Delivered' 
                      ? 'bg-green-500/10 text-green-500'
                      : shipment.status === 'In Transit'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {shipment.status}
                  </span>
                  <div className="mt-1 text-xs text-muted-foreground">{shipment.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
