import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import { AppLayout } from "./components/layout/AppLayout";
import ChatPage from "./pages/app/ChatPage";
import BillingPage from "./pages/app/BillingPage";
import QuotesPage from "./pages/app/QuotesPage";
import ShipmentsPage from "./pages/app/ShipmentsPage";
import SettingsPage from "./pages/app/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={<Pricing />} />
            
            {/* Protected App Routes */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/chat" replace />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="quotes" element={<QuotesPage />} />
              <Route path="shipments" element={<ShipmentsPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            
            {/* Legacy redirects */}
            <Route path="/dashboard" element={<Navigate to="/app/chat" replace />} />
            <Route path="/chat" element={<Navigate to="/app/chat" replace />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;