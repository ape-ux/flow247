import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import '@/lib/i18n';

// Layouts
import { AppLayout } from '@/components/layout/AppLayout';

// Landing Pages
import Flow247Landing from '@/pages/landing/Flow247Landing';
import AmassLanding from '@/pages/landing/AmassLanding';
import ApeGlobalLanding from '@/pages/landing/ApeGlobalLanding';

// Auth Pages
import AuthPage from '@/pages/Auth';
import AuthCallback from '@/pages/AuthCallback';

// App Pages
import Dashboard from '@/pages/app/Dashboard';
import ChatPage from '@/pages/app/ChatPage';
import QuotesPage from '@/pages/app/QuotesPage';
import ShipmentsPage from '@/pages/app/ShipmentsPage';
import BillingPage from '@/pages/app/BillingPage';
import SettingsPage from '@/pages/app/SettingsPage';
import ProfilePage from '@/pages/app/ProfilePage';
import AnalyticsPage from '@/pages/app/AnalyticsPage';
import CustomersPage from '@/pages/app/CustomersPage';
import TrackingPage from '@/pages/app/TrackingPage';
import NewShipmentPage from '@/pages/app/NewShipmentPage';
import ShipmentDetailPage from '@/pages/app/ShipmentDetailPage';
import NewQuotePage from '@/pages/app/NewQuotePage';

// CFS Tracking Pages
import ControlTowerPage from '@/pages/app/cfs/ControlTowerPage';
import LFDMonitorPage from '@/pages/app/cfs/LFDMonitorPage';
import LFDAlertsPage from '@/pages/app/cfs/LFDAlertsPage';
import ContainerTrackingPage from '@/pages/app/cfs/ContainerTrackingPage';
import TaskQueuePage from '@/pages/app/cfs/TaskQueuePage';
import DispatchCenterPage from '@/pages/app/cfs/DispatchCenterPage';

// Ocean Booking Pages
import BookingsPage from '@/pages/app/ocean/BookingsPage';
import SailingSchedulesPage from '@/pages/app/ocean/SailingSchedulesPage';
import WarehouseReceiptsPage from '@/pages/app/ocean/WarehouseReceiptsPage';
import ConsolidationPage from '@/pages/app/ocean/ConsolidationPage';
import DocumentsPage from '@/pages/app/ocean/DocumentsPage';

// Admin Pages
import AdminDashboard from '@/pages/app/admin/AdminDashboard';

// Static Pages
import PricingPage from '@/pages/PricingPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// DEV MODE: Set to true to bypass authentication for UI preview
const DEV_SKIP_AUTH = false;

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Skip auth check in dev mode
  if (DEV_SKIP_AUTH) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

// Placeholder components for routes not yet implemented
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground">This page is coming soon.</p>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Landing Pages */}
      <Route path="/" element={<Flow247Landing />} />
      <Route path="/flow247" element={<Flow247Landing />} />
      <Route path="/amass" element={<AmassLanding />} />
      <Route path="/ape-global" element={<ApeGlobalLanding />} />

      {/* Auth Routes */}
      <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
      <Route path="/auth/login" element={<AuthPage />} />
      <Route path="/auth/signup" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected App Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="shipments" element={<ShipmentsPage />} />
        <Route path="shipments/new" element={<NewShipmentPage />} />
        <Route path="shipments/:id" element={<ShipmentDetailPage />} />
        <Route path="quotes" element={<QuotesPage />} />
        <Route path="quotes/new" element={<NewQuotePage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="tracking" element={<TrackingPage />} />

        {/* CFS Tracking Routes */}
        <Route path="cfs/control-tower" element={<ControlTowerPage />} />
        <Route path="cfs/lfd-monitor" element={<LFDMonitorPage />} />
        <Route path="cfs/lfd-alerts" element={<LFDAlertsPage />} />
        <Route path="cfs/container-tracking" element={<ContainerTrackingPage />} />
        <Route path="cfs/tasks" element={<TaskQueuePage />} />
        <Route path="cfs/dispatch" element={<DispatchCenterPage />} />

        {/* Ocean Booking Routes */}
        <Route path="ocean/bookings" element={<BookingsPage />} />
        <Route path="ocean/schedules" element={<SailingSchedulesPage />} />
        <Route path="ocean/warehouse" element={<WarehouseReceiptsPage />} />
        <Route path="ocean/consolidation" element={<ConsolidationPage />} />
        <Route path="ocean/documents" element={<DocumentsPage />} />

        {/* Admin Routes (nested under /app so sidebar stays) */}
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/users" element={<PlaceholderPage title="User Management" />} />
        <Route path="admin/subscriptions" element={<PlaceholderPage title="Subscription Management" />} />
        <Route path="admin/quotes" element={<PlaceholderPage title="Quotes Management" />} />
        <Route path="admin/shipments" element={<PlaceholderPage title="Shipments Management" />} />
        <Route path="admin/api-logs" element={<PlaceholderPage title="API Logs" />} />
        <Route path="admin/activity" element={<PlaceholderPage title="Recent Activity" />} />
        <Route path="admin/settings" element={<PlaceholderPage title="Admin Settings" />} />
      </Route>

      {/* Legacy admin redirects */}
      <Route path="/admin" element={<Navigate to="/app/admin" replace />} />
      <Route path="/admin/*" element={<Navigate to="/app/admin" replace />} />

      {/* Static Pages */}
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/features" element={<PlaceholderPage title="Features" />} />
      <Route path="/about" element={<PlaceholderPage title="About" />} />
      <Route path="/contact" element={<PlaceholderPage title="Contact" />} />
      <Route path="/privacy" element={<PlaceholderPage title="Privacy Policy" />} />
      <Route path="/terms" element={<PlaceholderPage title="Terms of Service" />} />
      <Route path="/demo" element={<PlaceholderPage title="Demo" />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
