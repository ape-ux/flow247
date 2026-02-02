// Real-time shipment tracking via Supabase Realtime
// Subscribes to postgres_changes on shipment_tracking table
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase, DEV_MODE } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface TrackingUpdate {
  id: string;
  shipment_id: string;
  user_id: string;
  status: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  carrier_status?: string;
  event_type?: string;
  event_description?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  updated_at: string;
  created_at: string;
}

interface UseRealtimeTrackingOptions {
  /** Show toast notifications for updates (default: true) */
  showToasts?: boolean;
  /** Only track specific shipment IDs */
  shipmentIds?: string[];
  /** Callback on each update */
  onUpdate?: (update: TrackingUpdate) => void;
}

/**
 * Subscribe to real-time shipment tracking updates for the current user.
 * Uses Supabase Realtime postgres_changes on the shipment_tracking table.
 *
 * @example
 * ```tsx
 * const { updates, latestUpdate, isConnected } = useRealtimeTracking();
 * ```
 */
export function useRealtimeTracking(options: UseRealtimeTrackingOptions = {}) {
  const { showToasts = true, shipmentIds, onUpdate } = options;
  const { user } = useAuth();
  const [updates, setUpdates] = useState<TrackingUpdate[]>([]);
  const [latestUpdate, setLatestUpdate] = useState<TrackingUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const handlePayload = useCallback(
    (payload: any) => {
      const update = payload.new as TrackingUpdate;

      // Filter by shipment IDs if specified
      if (shipmentIds && shipmentIds.length > 0 && !shipmentIds.includes(update.shipment_id)) {
        return;
      }

      setUpdates((prev) => [update, ...prev].slice(0, 100)); // Keep last 100
      setLatestUpdate(update);

      if (showToasts) {
        const statusLabel = update.status?.replace(/_/g, ' ') || 'Updated';
        toast.info(`Tracking: ${statusLabel}`, {
          description: update.event_description || `Shipment ${update.shipment_id}`,
        });
      }

      onUpdate?.(update);
    },
    [shipmentIds, showToasts, onUpdate]
  );

  useEffect(() => {
    if (DEV_MODE || !user) return;

    const channel = supabase
      .channel(`tracking:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shipment_tracking',
          filter: `user_id=eq.${user.id}`,
        },
        handlePayload
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'CHANNEL_ERROR') {
          console.warn('[Flow247] Realtime tracking channel error');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        setIsConnected(false);
      }
    };
  }, [user, handlePayload]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
    setLatestUpdate(null);
  }, []);

  return {
    updates,
    latestUpdate,
    isConnected,
    clearUpdates,
  };
}

/**
 * Subscribe to real-time updates for a single shipment.
 *
 * @example
 * ```tsx
 * const { events, isConnected } = useShipmentRealtime('SHP-2025-042');
 * ```
 */
export function useShipmentRealtime(shipmentId: string | undefined) {
  const { user } = useAuth();
  const [events, setEvents] = useState<TrackingUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (DEV_MODE || !user || !shipmentId) return;

    const channel = supabase
      .channel(`shipment:${shipmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'shipment_tracking',
          filter: `shipment_id=eq.${shipmentId}`,
        },
        (payload) => {
          const update = payload.new as TrackingUpdate;
          setEvents((prev) => [update, ...prev]);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        setIsConnected(false);
      }
    };
  }, [user, shipmentId]);

  return { events, isConnected };
}
