import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Info,
  AlertTriangle,
  AlertOctagon,
  Siren,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  useNotifications,
  type Notification,
  type NotificationSeverity,
} from '@/hooks/useNotifications';

// ─── Severity config ─────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<
  NotificationSeverity,
  {
    icon: typeof Info;
    badgeClass: string;
    dotClass: string;
    label: string;
  }
> = {
  info: {
    icon: Info,
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    dotClass: 'bg-blue-400',
    label: 'Info',
  },
  warning: {
    icon: AlertTriangle,
    badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    dotClass: 'bg-amber-400',
    label: 'Warning',
  },
  critical: {
    icon: AlertOctagon,
    badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',
    dotClass: 'bg-red-400',
    label: 'Critical',
  },
  urgent: {
    icon: Siren,
    badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse',
    dotClass: 'bg-red-500 animate-pulse',
    label: 'Urgent',
  },
};

// ─── Single notification row ─────────────────────────────────────────────────

function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: number) => void;
}) {
  const config = SEVERITY_CONFIG[notification.severity] || SEVERITY_CONFIG.info;
  const Icon = config.icon;

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(notification.created_at), {
        addSuffix: true,
      });
    } catch {
      return '';
    }
  })();

  return (
    <button
      onClick={() => {
        if (!notification.read) onMarkRead(notification.id);
      }}
      className={cn(
        'w-full flex items-start gap-3 px-3 py-3 text-left rounded-lg transition-all duration-200',
        'hover:bg-white/5 focus:outline-none focus:bg-white/5',
        !notification.read && 'bg-primary/5'
      )}
    >
      {/* Severity icon */}
      <div
        className={cn(
          'flex-shrink-0 mt-0.5 h-8 w-8 rounded-full flex items-center justify-center',
          notification.severity === 'info' && 'bg-blue-500/10',
          notification.severity === 'warning' && 'bg-amber-500/10',
          notification.severity === 'critical' && 'bg-red-500/10',
          notification.severity === 'urgent' && 'bg-red-500/10'
        )}
      >
        <Icon
          className={cn(
            'h-4 w-4',
            notification.severity === 'info' && 'text-blue-400',
            notification.severity === 'warning' && 'text-amber-400',
            notification.severity === 'critical' && 'text-red-400',
            notification.severity === 'urgent' && 'text-red-500'
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              'text-sm font-medium truncate',
              notification.read ? 'text-muted-foreground' : 'text-foreground'
            )}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <span className={cn('h-2 w-2 rounded-full flex-shrink-0', config.dotClass)} />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              'text-[10px] px-1.5 py-0 h-4 border font-medium',
              config.badgeClass
            )}
          >
            {config.label}
          </Badge>
          <span className="text-[10px] text-muted-foreground/60">{timeAgo}</span>
        </div>
      </div>

      {/* Read indicator */}
      {notification.read && (
        <Check className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0 mt-1" />
      )}
    </button>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
        <Bell className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
      <p className="text-xs text-muted-foreground/60 mt-1">
        No notifications at the moment.
      </p>
    </div>
  );
}

// ─── NotificationBell component ──────────────────────────────────────────────

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />

          {/* Unread badge */}
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -top-0.5 -right-0.5 flex items-center justify-center',
                'h-[18px] min-w-[18px] rounded-full px-1',
                'bg-red-500 text-white text-[10px] font-bold leading-none',
                'ring-2 ring-background',
                unreadCount > 0 && 'animate-bounce-once'
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={cn(
          'w-[380px] max-w-[calc(100vw-2rem)] p-0',
          'glass-card border-border/50',
          'animate-slide-up'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <DropdownMenuLabel className="p-0 text-sm font-semibold text-foreground">
            Notifications
            {unreadCount > 0 && (
              <Badge
                variant="info"
                className="ml-2 text-[10px] px-1.5 py-0 h-4"
              >
                {unreadCount} new
              </Badge>
            )}
          </DropdownMenuLabel>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                markAllAsRead();
              }}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notification list */}
        <div className="max-h-[400px] overflow-y-auto overscroll-contain">
          {notifications.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="p-1.5 space-y-0.5">
              {notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markAsRead}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="m-0" />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-primary"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link to="/app/notifications">View all notifications</Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
