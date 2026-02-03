import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  CreditCard,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Shield,
  Container,
  AlertTriangle,
  Clock,
  Search,
  Ship,
  Calendar,
  Warehouse,
  Layers,
  FolderOpen,
  Anchor,
  Truck,
  CheckCircle2,
  UserCircle,
  Activity,
  ScrollText,
} from 'lucide-react';

export function AppLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, xanoUser, profile, signOut, isAuthenticated } = useAuth();
  const { resolvedTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Super admin check: only profile.is_super_admin or xanoUser fallback
  const isSuperAdmin = profile?.is_super_admin === true || xanoUser?.is_super_admin === true;

  const navigation = [
    { name: t('dashboard.overview'), href: '/app', icon: LayoutDashboard },
    { name: t('dashboard.shipments'), href: '/app/shipments', icon: Package },
    { name: t('dashboard.quotes'), href: '/app/quotes', icon: FileText },
    { name: 'AI Chat', href: '/app/chat', icon: MessageSquare },
    { name: t('dashboard.analytics'), href: '/app/analytics', icon: BarChart3 },
    { name: t('dashboard.customers'), href: '/app/customers', icon: Users },
    { name: t('dashboard.billing'), href: '/app/billing', icon: CreditCard },
    { name: 'Profile', href: '/app/profile', icon: UserCircle },
    { name: t('dashboard.settings'), href: '/app/settings', icon: Settings },
  ];

  const cfsTrackingNavigation = [
    { name: 'Control Tower', href: '/app/cfs/control-tower', icon: LayoutDashboard },
    { name: 'LFD Monitor', href: '/app/cfs/lfd-monitor', icon: Clock },
    { name: 'LFD Alerts', href: '/app/cfs/lfd-alerts', icon: AlertTriangle },
    { name: 'HBL/Container', href: '/app/cfs/container-tracking', icon: Search },
    { name: 'Task Queue', href: '/app/cfs/tasks', icon: CheckCircle2 },
    { name: 'Dispatch', href: '/app/cfs/dispatch', icon: Truck },
  ];

  const oceanBookingNavigation = [
    { name: 'Bookings', href: '/app/ocean/bookings', icon: Anchor },
    { name: 'Sailing Schedules', href: '/app/ocean/schedules', icon: Calendar },
    { name: 'Warehouse Receipts', href: '/app/ocean/warehouse', icon: Warehouse },
    { name: 'Consolidation', href: '/app/ocean/consolidation', icon: Layers },
    { name: 'Documentation', href: '/app/ocean/documents', icon: FolderOpen },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isAdminRoute = location.pathname.startsWith('/app/admin');

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link to="/" className="flex items-center">
              <img
                src={resolvedTheme === 'dark' ? '/images/flowi247.dark.png' : '/images/flow247.light.png'}
                alt="Flow247"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== '/app' && location.pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}

            {/* CFS Tracking section */}
            <div className="pt-4 pb-2">
              <div className="flex items-center gap-2 px-3 text-xs font-semibold text-muted-foreground uppercase">
                <Container className="h-3 w-3" />
                CFS Operations
              </div>
            </div>
            {cfsTrackingNavigation.map((item) => {
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}

            {/* Ocean Booking section */}
            <div className="pt-4 pb-2">
              <div className="flex items-center gap-2 px-3 text-xs font-semibold text-muted-foreground uppercase">
                <Ship className="h-3 w-3" />
                Ocean Booking
              </div>
            </div>
            {oceanBookingNavigation.map((item) => {
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <Link
              to="/app/profile"
              className="flex items-center gap-3 mb-3 rounded-lg px-1 py-1 -mx-1 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-medium">
                  {(profile?.full_name || xanoUser?.name || user?.user_metadata?.name || user?.email || 'D').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile?.full_name || xanoUser?.name || user?.user_metadata?.name || user?.email || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'demo@flow247.com'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('common.logout')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-background/95 backdrop-blur border-b">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {/* Admin dropdown - only visible to super admins */}
            {isSuperAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={isAdminRoute ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      'gap-1.5',
                      isAdminRoute && 'gradient-primary glow-cyan'
                    )}
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Admin Panel
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate('/app/admin')}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                    Management
                  </DropdownMenuLabel>

                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => navigate('/app/admin/users')}
                    >
                      <Users className="h-4 w-4" />
                      Users
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => navigate('/app/admin/subscriptions')}
                    >
                      <CreditCard className="h-4 w-4" />
                      Subscriptions
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => navigate('/app/admin/quotes')}
                    >
                      <FileText className="h-4 w-4" />
                      Quotes
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => navigate('/app/admin/shipments')}
                    >
                      <Package className="h-4 w-4" />
                      Shipments
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                    Monitoring
                  </DropdownMenuLabel>

                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => navigate('/app/admin/api-logs')}
                    >
                      <ScrollText className="h-4 w-4" />
                      API Logs
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => navigate('/app/admin/activity')}
                    >
                      <Activity className="h-4 w-4" />
                      Recent Activity
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate('/app/admin/settings')}
                  >
                    <Settings className="h-4 w-4" />
                    Admin Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <LanguageSelector />
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
