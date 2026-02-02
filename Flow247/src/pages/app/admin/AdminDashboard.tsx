import { Link } from 'react-router-dom';
import {
  Shield, Users, CreditCard, FileText, Package, ScrollText,
  Activity, Settings, ArrowRight, LayoutDashboard,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface AdminCard {
  title: string;
  description: string;
  href: string;
  icon: typeof Users;
  color: string;
  badge?: string;
}

const managementCards: AdminCard[] = [
  {
    title: 'Users',
    description: 'Manage user accounts, roles, and permissions across all tenants.',
    href: '/app/admin/users',
    icon: Users,
    color: 'from-blue-500/20 to-blue-600/10 text-blue-500',
  },
  {
    title: 'Subscriptions',
    description: 'View and manage subscription plans, billing, and payment status.',
    href: '/app/admin/subscriptions',
    icon: CreditCard,
    color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-500',
  },
  {
    title: 'Quotes',
    description: 'Review all rate quotes, approve pending requests, and manage pricing.',
    href: '/app/admin/quotes',
    icon: FileText,
    color: 'from-amber-500/20 to-amber-600/10 text-amber-500',
  },
  {
    title: 'Shipments',
    description: 'Monitor all shipments, track statuses, and resolve delivery issues.',
    href: '/app/admin/shipments',
    icon: Package,
    color: 'from-purple-500/20 to-purple-600/10 text-purple-500',
  },
];

const monitoringCards: AdminCard[] = [
  {
    title: 'API Logs',
    description: 'View API request/response logs, error rates, and endpoint performance.',
    href: '/app/admin/api-logs',
    icon: ScrollText,
    color: 'from-rose-500/20 to-rose-600/10 text-rose-500',
  },
  {
    title: 'Recent Activity',
    description: 'Audit trail of user actions, system events, and data changes.',
    href: '/app/admin/activity',
    icon: Activity,
    color: 'from-cyan-500/20 to-cyan-600/10 text-cyan-500',
  },
];

function AdminCardItem({ card }: { card: AdminCard }) {
  const IconComponent = card.icon;
  return (
    <Link
      to={card.href}
      className="group glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-200 hover:shadow-lg"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
          <IconComponent className="h-6 w-6" />
        </div>
        {card.badge && (
          <Badge variant="secondary" className="text-xs">{card.badge}</Badge>
        )}
      </div>
      <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">{card.title}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{card.description}</p>
      <div className="flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Open <ArrowRight className="h-4 w-4 ml-1" />
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const { profile } = useAuth();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 glow-cyan">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              System administration and monitoring
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Shield className="h-3 w-3" />
          Super Admin
        </Badge>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <Users className="h-5 w-5 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">-</p>
          <p className="text-xs text-muted-foreground">Total Users</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <FileText className="h-5 w-5 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">-</p>
          <p className="text-xs text-muted-foreground">Active Quotes</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Package className="h-5 w-5 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">-</p>
          <p className="text-xs text-muted-foreground">Shipments</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Activity className="h-5 w-5 text-cyan-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">-</p>
          <p className="text-xs text-muted-foreground">API Calls (24h)</p>
        </div>
      </div>

      {/* Management */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          Management
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {managementCards.map((card) => (
            <AdminCardItem key={card.title} card={card} />
          ))}
        </div>
      </div>

      {/* Monitoring */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Monitoring
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {monitoringCards.map((card) => (
            <AdminCardItem key={card.title} card={card} />
          ))}
        </div>
      </div>

      {/* Admin Settings link */}
      <Link
        to="/app/admin/settings"
        className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all group"
      >
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-500/20 to-gray-600/10 flex items-center justify-center">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium group-hover:text-primary transition-colors">Admin Settings</h3>
          <p className="text-sm text-muted-foreground">System configuration, feature flags, and environment settings.</p>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </Link>
    </div>
  );
}
