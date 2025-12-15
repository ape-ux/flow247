import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, CreditCard, FileText, Ship, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo-ape-global.jpg';

const navItems = [
  { title: 'Chats', url: '/app/chat', icon: MessageSquare },
  { title: 'Quotes', url: '/app/quotes', icon: FileText },
  { title: 'Shipments', url: '/app/shipments', icon: Ship },
  { title: 'Billing', url: '/app/billing', icon: CreditCard },
  { title: 'Settings', url: '/app/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { logout, user } = useAuth();
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar
      className={collapsed ? 'w-14' : 'w-60'}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link to="/app/chat" className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="APE Global" 
            className="h-10 w-auto rounded-lg ring-2 ring-primary/50 shadow-[0_0_15px_hsl(175_84%_50%/0.4)] hover:shadow-[0_0_25px_hsl(175_84%_50%/0.6)] transition-shadow duration-300"
          />
          {!collapsed && (
            <span className="font-display text-lg font-bold text-sidebar-foreground">
              APE<span className="text-primary">Global</span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            {!collapsed && 'Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link
                      to={item.url}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                        isActive(item.url)
                          ? 'bg-primary/10 text-primary'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed && user && (
          <div className="mb-3 text-sm text-muted-foreground">
            {user.email}
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
