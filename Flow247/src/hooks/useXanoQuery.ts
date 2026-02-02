// React Query hooks for Xano API calls
// Provides cached, deduped data fetching with automatic refetch
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDashboardStats,
  getRecentActivity,
  getShipments,
  getShipment,
  getQuotes,
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  sendAgentMessage,
  getConversations,
  getConversationMessages,
  getCfsContainers,
  getCfsContainerDetail,
  getCfsTasks,
  getCfsMonitorDashboard,
  getCfsDashboardStats,
  getActiveAlerts,
  getDispatchPending,
  type DashboardStats,
  type Shipment,
  type Customer,
  type CfsContainer,
  type CfsTask,
  type CfsAlert,
  type CfsDashboardStats,
  type CfsMonitorDashboard,
} from '@/lib/xano';

// ============ Keys ============
export const queryKeys = {
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    activity: (limit: number) => ['dashboard', 'activity', limit] as const,
  },
  shipments: {
    all: ['shipments'] as const,
    list: (params: any) => ['shipments', 'list', params] as const,
    detail: (id: number) => ['shipments', 'detail', id] as const,
  },
  quotes: {
    all: ['quotes'] as const,
    list: (params: any) => ['quotes', 'list', params] as const,
  },
  customers: {
    all: ['customers'] as const,
    list: (params: any) => ['customers', 'list', params] as const,
    detail: (id: number) => ['customers', 'detail', id] as const,
  },
  chat: {
    conversations: (params?: any) => ['chat', 'conversations', params] as const,
    messages: (id: number, limit?: number) => ['chat', 'messages', id, limit] as const,
  },
  cfs: {
    containers: (params?: any) => ['cfs', 'containers', params] as const,
    containerDetail: (num: string) => ['cfs', 'container', num] as const,
    tasks: (params?: any) => ['cfs', 'tasks', params] as const,
    monitor: (params?: any) => ['cfs', 'monitor', params] as const,
    stats: ['cfs', 'stats'] as const,
    alerts: (params?: any) => ['cfs', 'alerts', params] as const,
    dispatch: (params?: any) => ['cfs', 'dispatch', params] as const,
  },
};

// ============ Dashboard ============
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: async () => {
      const res = await getDashboardStats();
      if (res.error) throw new Error(res.error);
      return res.data as DashboardStats;
    },
    staleTime: 60_000,
  });
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: queryKeys.dashboard.activity(limit),
    queryFn: async () => {
      const res = await getRecentActivity(limit);
      if (res.error) throw new Error(res.error);
      return res.data || [];
    },
    staleTime: 30_000,
  });
}

// ============ Shipments ============
export function useShipments(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: queryKeys.shipments.list(params),
    queryFn: async () => {
      const res = await getShipments(params);
      if (res.error) throw new Error(res.error);
      const d = res.data as any;
      return {
        items: Array.isArray(d) ? d : d?.items || [],
        total: Array.isArray(d) ? d.length : d?.total || 0,
      };
    },
    staleTime: 30_000,
  });
}

export function useShipment(id: number) {
  return useQuery({
    queryKey: queryKeys.shipments.detail(id),
    queryFn: async () => {
      const res = await getShipment(id);
      if (res.error) throw new Error(res.error);
      return res.data as Shipment;
    },
    enabled: !!id,
  });
}

// ============ Quotes ============
export function useQuotes(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: queryKeys.quotes.list(params),
    queryFn: async () => {
      const res = await getQuotes(params);
      if (res.error) throw new Error(res.error);
      const d = res.data as any;
      return {
        items: Array.isArray(d) ? d : d?.items || [],
        total: Array.isArray(d) ? d.length : d?.total || 0,
      };
    },
    staleTime: 30_000,
  });
}

// ============ Customers ============
export function useCustomers(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: queryKeys.customers.list(params),
    queryFn: async () => {
      const res = await getCustomers(params);
      if (res.error) throw new Error(res.error);
      const d = res.data as any;
      return {
        items: Array.isArray(d) ? d : d?.items || [],
        total: Array.isArray(d) ? d.length : d?.total || 0,
      };
    },
    staleTime: 60_000,
  });
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: async () => {
      const res = await getCustomer(id);
      if (res.error) throw new Error(res.error);
      return res.data as Customer;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
      const res = await createCustomer(data);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.customers.all }),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Customer> }) => {
      const res = await updateCustomer(id, updates);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.customers.all }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await deleteCustomer(id);
      if (res.error) throw new Error(res.error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.customers.all }),
  });
}

// ============ AI Chat ============
export function useConversations(params?: { limit?: number; offset?: number; agent_id?: number }) {
  return useQuery({
    queryKey: queryKeys.chat.conversations(params),
    queryFn: async () => {
      const res = await getConversations(params);
      if (res.error) throw new Error(res.error);
      return res.data || [];
    },
    staleTime: 10_000,
  });
}

export function useConversationMessages(conversationId: number, limit?: number) {
  return useQuery({
    queryKey: queryKeys.chat.messages(conversationId, limit),
    queryFn: async () => {
      const res = await getConversationMessages(conversationId, limit);
      if (res.error) throw new Error(res.error);
      return res.data || [];
    },
    enabled: !!conversationId,
    staleTime: 5_000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (request: { message: string; conversation_id?: string; context?: any }) => {
      const res = await sendAgentMessage(request);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat'] });
    },
  });
}

// ============ CFS Operations ============
export function useCfsContainers(params?: {
  status?: string;
  cfs_code?: string;
  lifecycle_stage?: string;
  q?: string;
  limit?: number;
  page?: number;
}) {
  return useQuery({
    queryKey: queryKeys.cfs.containers(params),
    queryFn: async () => {
      const res = await getCfsContainers(params);
      if (res.error) throw new Error(res.error);
      return res.data || [];
    },
    staleTime: 30_000,
  });
}

export function useCfsContainerDetail(containerNumber: string) {
  return useQuery({
    queryKey: queryKeys.cfs.containerDetail(containerNumber),
    queryFn: async () => {
      const res = await getCfsContainerDetail(containerNumber);
      if (res.error) throw new Error(res.error);
      return res.data as CfsContainer;
    },
    enabled: !!containerNumber,
  });
}

export function useCfsTasks(params?: { status?: string; container_number?: string; task_type?: string }) {
  return useQuery({
    queryKey: queryKeys.cfs.tasks(params),
    queryFn: async () => {
      const res = await getCfsTasks(params);
      if (res.error) throw new Error(res.error);
      return res.data || [];
    },
    staleTime: 30_000,
  });
}

export function useCfsMonitor(params?: { page?: number; per_page?: number; status_filter?: string }) {
  return useQuery({
    queryKey: queryKeys.cfs.monitor(params),
    queryFn: async () => {
      const res = await getCfsMonitorDashboard(params);
      if (res.error) throw new Error(res.error);
      return res.data as CfsMonitorDashboard;
    },
    staleTime: 30_000,
  });
}

export function useCfsStats() {
  return useQuery({
    queryKey: queryKeys.cfs.stats,
    queryFn: async () => {
      const res = await getCfsDashboardStats();
      if (res.error) throw new Error(res.error);
      return res.data as CfsDashboardStats;
    },
    staleTime: 60_000,
  });
}

export function useCfsAlerts(params?: { page?: number; per_page?: number; severity?: string }) {
  return useQuery({
    queryKey: queryKeys.cfs.alerts(params),
    queryFn: async () => {
      const res = await getActiveAlerts(params);
      if (res.error) throw new Error(res.error);
      const d = res.data as any;
      return {
        items: Array.isArray(d) ? d : d?.items || [],
        total: Array.isArray(d) ? d.length : d?.total || 0,
      };
    },
    staleTime: 15_000,
  });
}

export function useCfsDispatchPending(params?: { page?: number; per_page?: number; cfs_code?: string }) {
  return useQuery({
    queryKey: queryKeys.cfs.dispatch(params),
    queryFn: async () => {
      const res = await getDispatchPending(params);
      if (res.error) throw new Error(res.error);
      const d = res.data as any;
      return {
        items: Array.isArray(d) ? d : d?.items || [],
        total: Array.isArray(d) ? d.length : d?.total || 0,
      };
    },
    staleTime: 30_000,
  });
}
