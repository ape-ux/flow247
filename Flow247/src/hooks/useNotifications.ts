import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, DEV_MODE } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ─── Types ───────────────────────────────────────────────────────────────────

export type NotificationSeverity = 'info' | 'warning' | 'critical' | 'urgent';

export interface Notification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  type: string;
  read: boolean;
  related_id?: string;
  related_type?: string;
  created_at: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

// ─── Dev mode mock data ──────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    user_id: 'demo',
    title: 'Container Arrived',
    message: 'Container MSCU1234567 has arrived at Miami port and is ready for pickup.',
    severity: 'info',
    type: 'shipment',
    read: false,
    related_id: 'SHP-001',
    related_type: 'shipment',
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    user_id: 'demo',
    title: 'LFD Alert: 24h Remaining',
    message: 'Last Free Day for HBL APE-2025-0042 is tomorrow. Schedule pickup immediately.',
    severity: 'urgent',
    type: 'lfd',
    read: false,
    related_id: 'HBL-042',
    related_type: 'hbl',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    user_id: 'demo',
    title: 'Quote Approved',
    message: 'Your quote QT-2025-0188 for Shanghai → Miami has been approved by the customer.',
    severity: 'info',
    type: 'quote',
    read: false,
    related_id: 'QT-188',
    related_type: 'quote',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    user_id: 'demo',
    title: 'Customs Hold',
    message: 'Shipment SHP-2025-0067 has been placed on customs hold. Documentation required.',
    severity: 'critical',
    type: 'customs',
    read: true,
    related_id: 'SHP-067',
    related_type: 'shipment',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    user_id: 'demo',
    title: 'Rate Update',
    message: 'Ocean freight rates for Asia → USEC have been updated. Review new pricing.',
    severity: 'warning',
    type: 'rate',
    read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Severity → toast style mapping ─────────────────────────────────────────

const SEVERITY_TOAST_MAP: Record<NotificationSeverity, 'info' | 'warning' | 'error'> = {
  info: 'info',
  warning: 'warning',
  critical: 'error',
  urgent: 'error',
};

// ─── Hook ────────────────────────────────────────────────────────────────────

const MAX_NOTIFICATIONS = 50;

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const userId = user?.id;

  // ── Fetch notifications from Supabase ──────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    if (DEV_MODE || !userId) {
      setNotifications(DEV_MODE ? MOCK_NOTIFICATIONS : []);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notification')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(MAX_NOTIFICATIONS);

      if (error) {
        console.error('[Notifications] Fetch error:', error.message);
        return;
      }

      setNotifications((data as Notification[]) || []);
    } catch (err) {
      console.error('[Notifications] Unexpected fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // ── Mark single notification as read ───────────────────────────────────

  const markAsRead = useCallback(
    async (id: number) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      if (DEV_MODE || !userId) return;

      const { error } = await supabase
        .from('notification')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('[Notifications] Mark read error:', error.message);
        // Revert optimistic update
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: false } : n))
        );
      }
    },
    [userId]
  );

  // ── Mark all as read ───────────────────────────────────────────────────

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    if (DEV_MODE || !userId) return;

    const { error } = await supabase
      .from('notification')
      .update({ read: true })
      .eq('user_id', userId)
      .in('id', unreadIds);

    if (error) {
      console.error('[Notifications] Mark all read error:', error.message);
      // Refetch to get accurate state
      fetchNotifications();
    }
  }, [userId, notifications, fetchNotifications]);

  // ── Realtime subscription ──────────────────────────────────────────────

  useEffect(() => {
    fetchNotifications();

    if (DEV_MODE || !userId) return;

    // Subscribe to new inserts on the notification table for this user
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;

          // Prepend and cap at MAX_NOTIFICATIONS
          setNotifications((prev) =>
            [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS)
          );

          // Show toast for new notification
          const toastType = SEVERITY_TOAST_MAP[newNotification.severity] || 'info';
          toast[toastType](newNotification.title, {
            description: newNotification.message,
            duration: newNotification.severity === 'urgent' ? 10000 : 5000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notification',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, fetchNotifications]);

  // ── Computed ───────────────────────────────────────────────────────────

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
