// Xano API Client for Flow247
// Used for AI agents, middleware, and user sync

const XANO_API_BASE = import.meta.env.VITE_XANO_API_BASE || 'https://xjlt-4ifj-k7qu.n7e.xano.io/api:QC35j52Y';
const XANO_MCP_BASE = import.meta.env.VITE_XANO_MCP_BASE || 'https://xjlt-4ifj-k7qu.n7e.xano.io/api:freight_flow_ai_v1/mcp';
const XANO_AGENT_BASE = import.meta.env.VITE_XANO_AGENT_BASE || 'https://xjlt-4ifj-k7qu.n7e.xano.io/api:AKAonta6';
const XANO_EXFREIGHT_BASE = import.meta.env.VITE_XANO_EXFREIGHT_BASE || 'https://xjlt-4ifj-k7qu.n7e.xano.io/api:exfreight';
const XANO_DASHBOARD_BASE = import.meta.env.VITE_XANO_DASHBOARD_BASE || 'https://xjlt-4ifj-k7qu.n7e.xano.io/api:I5SJFe7I';
const XANO_STG_OPS_BASE = import.meta.env.VITE_XANO_STG_OPS_BASE || 'https://xjlt-4ifj-k7qu.n7e.xano.io/api:M6Xz5_I1';
const XANO_STG_FINANCIALS_BASE = import.meta.env.VITE_XANO_STG_FINANCIALS_BASE || 'https://xjlt-4ifj-k7qu.n7e.xano.io/api:MDtcogTI';
const XANO_STG_ARRIVAL_BASE = import.meta.env.VITE_XANO_STG_ARRIVAL_BASE || 'https://xjlt-4ifj-k7qu.n7e.xano.io/api:lt8FkLwE';
const XANO_SHIPPING_BASE = import.meta.env.VITE_XANO_SHIPPING_BASE || 'https://xjlt-4ifj-k7qu.n7e.xano.io/api:E1Skvg8o';
const XANO_DB_BASE = import.meta.env.VITE_XANO_DB_BASE || 'https://xjlt-4ifj-k7qu.n7e.xano.io/api:MOZVC8ir';

// Types
export interface XanoUser {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  account_id?: number;
  supabase_id?: string;

  // Profile
  profile_photo?: { access?: string; path?: string; name?: string; type?: string; size?: number; mime?: string; meta?: Record<string, unknown>; url?: string };
  phone?: string;
  job_title?: string;
  department?: string;
  timezone?: string;

  // Roles & permissions
  tenant_id?: number;
  user_type?: string;       // enum
  employee_role?: string;   // enum
  user_role_v2?: string;    // enum
  role?: string;            // enum
  is_super_admin?: boolean;
  status?: string;          // enum
  permissions?: Record<string, unknown> | null;
  auth_provider?: string;   // enum

  // Sales
  is_sales_agent?: boolean;
  sales_agent_id?: number;
  commission_rate?: number;
  customer_id?: number;

  // Settings (JSON blobs)
  llm_api_key?: string;
  llm_settings?: Record<string, unknown>;
  email_settings?: Record<string, unknown>;
  workflow_settings?: Record<string, unknown>;
  storage_settings?: Record<string, unknown>;
  notification_settings?: Record<string, unknown>;

  // Google OAuth
  google_id?: string;
  google_oauth?: { id?: string; name?: string; email?: string };

  // Invitation
  invited_by?: number;
  invited_at?: number;

  // Timestamps
  created_at?: number;
  updated_at?: number;
  last_login?: number;
  last_ip?: string;

  // Legacy
  avatar_url?: string;
  settings?: Record<string, unknown>;
}

export interface XanoResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Token management
let xanoToken: string | null = null;

export const setXanoToken = (token: string | null) => {
  xanoToken = token;
  if (token) {
    localStorage.setItem('xano_token', token);
  } else {
    localStorage.removeItem('xano_token');
  }
};

export const getXanoToken = (): string | null => {
  if (xanoToken) return xanoToken;
  return localStorage.getItem('xano_token');
};

// API request helper
const xanoRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  baseUrl: string = XANO_API_BASE
): Promise<XanoResponse<T>> => {
  const token = getXanoToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Include status code in error message for better error handling
      const errorMsg = data.message || 'Request failed';
      if (response.status === 400) {
        console.warn(`[Xano] 400 Bad Request for ${endpoint}:`, { message: errorMsg, payload: data, hasToken: !!token });
      }
      return { error: `${response.status}: ${errorMsg}` };
    }

    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
};

// ============================================
// User Sync Middleware
// Syncs Supabase users with Xano database
// ============================================

export const syncUserToXano = async (supabaseUser: {
  id: string;
  email?: string;
  user_metadata?: { name?: string; avatar_url?: string };
}): Promise<XanoResponse<XanoUser>> => {
  return xanoRequest<XanoUser>('/user/sync', {
    method: 'POST',
    body: JSON.stringify({
      supabase_user_id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name,
      avatar_url: supabaseUser.user_metadata?.avatar_url,
    }),
  });
};

export const getUserBySupabaseId = async (supabaseId: string): Promise<XanoResponse<XanoUser>> => {
  return xanoRequest<XanoUser>('/get_user', {
    method: 'POST',
    body: JSON.stringify({ supabase_id: supabaseId }),
  });
};

// Update user profile via Xano PATCH /user/profile (requires auth token)
export const updateXanoUserProfile = async (
  updates: Partial<XanoUser>
): Promise<XanoResponse<XanoUser>> => {
  return xanoRequest<XanoUser>('/user/profile', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

// Legacy alias
export const updateXanoUser = updateXanoUserProfile;

// Upload profile photo via Xano POST /user/profile/photo (requires auth token)
export const uploadProfilePhoto = async (
  file: File
): Promise<XanoResponse<XanoUser>> => {
  const token = getXanoToken();

  const formData = new FormData();
  formData.append('profile_photo', file);

  try {
    const response = await fetch(`${XANO_API_BASE}/user/profile/photo`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      return { error: data.message || 'Upload failed' };
    }
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Upload error' };
  }
};

// ============================================
// AI Agent APIs
// ============================================

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentRequest {
  message: string;
  conversation_id?: string;
  context?: Record<string, unknown>;
}

export interface AgentResponse {
  response: string;
  conversation_id: string;
  tokens_used?: number;
}

export const sendAgentMessage = async (
  request: AgentRequest
): Promise<XanoResponse<AgentResponse>> => {
  return xanoRequest<AgentResponse>('/agent/invoke', {
    method: 'POST',
    body: JSON.stringify({
      agent_name: request.context?.agent_name || 'Manager Agent',
      message: request.message,
      conversation_id: request.conversation_id ? Number(request.conversation_id) : undefined,
    }),
  }, XANO_AGENT_BASE);
};

export const streamAgentMessage = async (
  request: AgentRequest,
  onChunk: (chunk: string) => void,
  onComplete: (response: AgentResponse) => void,
  onError: (error: string) => void
): Promise<void> => {
  const token = getXanoToken();

  try {
    const response = await fetch(`${XANO_AGENT_BASE}/agent/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        agent_name: request.context?.agent_name || 'Manager Agent',
        message: request.message,
        conversation_id: request.conversation_id ? Number(request.conversation_id) : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      onError(error.message || 'Agent request failed');
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      // Non-streaming response - read as JSON
      const data = await response.json();
      const text = typeof data === 'string' ? data : (data.response || JSON.stringify(data));
      onChunk(text);
      onComplete({
        response: text,
        conversation_id: request.conversation_id || '',
      });
      return;
    }

    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
      onChunk(chunk);
    }

    onComplete({
      response: fullResponse,
      conversation_id: request.conversation_id || '',
    });
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Stream error');
  }
};

export const getOrCreateConversation = async (
  agentId?: number,
  initialMessage?: string
): Promise<XanoResponse<{ id: number }>> => {
  return xanoRequest<{ id: number }>('/chat/conversations/new', {
    method: 'POST',
    body: JSON.stringify({
      agent_id: agentId,
      initial_message: initialMessage,
    }),
  }, XANO_AGENT_BASE);
};

export const getConversations = async (params?: {
  limit?: number;
  offset?: number;
  agent_id?: number;
}): Promise<XanoResponse<any[]>> => {
  const query = new URLSearchParams();
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.offset) query.set('offset', params.offset.toString());
  if (params?.agent_id) query.set('agent_id', params.agent_id.toString());

  return xanoRequest<any[]>(`/chat/conversations?${query.toString()}`, {
    method: 'GET',
  }, XANO_AGENT_BASE);
};

export const getConversationMessages = async (conversationId: number, limit?: number): Promise<XanoResponse<any[]>> => {
  const query = limit ? `?limit=${limit}` : '';
  return xanoRequest<any[]>(`/chat/conversations/${conversationId}/messages${query}`, {
    method: 'GET',
  }, XANO_AGENT_BASE);
};

export const getConversation = async (conversationId: number): Promise<XanoResponse<any>> => {
  return xanoRequest<any>(`/chat/conversations/${conversationId}`, {
    method: 'GET',
  }, XANO_AGENT_BASE);
};

export const deleteConversation = async (conversationId: number): Promise<XanoResponse<void>> => {
  return xanoRequest<void>(`/chat/conversations/${conversationId}`, {
    method: 'DELETE',
  }, XANO_AGENT_BASE);
};

export const listAgents = async (includeSuperadmin?: boolean): Promise<XanoResponse<any[]>> => {
  const query = includeSuperadmin ? '?include_superadmin=true' : '';
  return xanoRequest<any[]>(`/list_agents${query}`, {
    method: 'GET',
  }, XANO_AGENT_BASE);
};

// MCP SSE connection for real-time agent communication
export const getMcpSseUrl = (conversationId: string): string => {
  const token = getXanoToken();
  return `${XANO_MCP_BASE}/sse?conversation_id=${conversationId}${token ? `&token=${token}` : ''}`;
};

// ============================================
// Quote Request APIs (XANO_DASHBOARD_BASE)
// ============================================

export interface QuoteRequest {
  id: number;
  created_at: number;
  quote_request_id: string;
  user_id: number;
  customer_id: number;
  tenant_id: number;
  origin_zip: string;
  origin_city: string;
  origin_state: string;
  origin_country: string;
  destination_zip: string;
  destination_city: string;
  destination_state: string;
  destination_country: string;
  pickup_date: string;
  weight_units: string;
  dimension_units: string;
  total_weight: number;
  total_pieces: number;
  total_handling_units: number;
  quotes_received: number;
  cheapest_price: number;
  cheapest_carrier: string;
  fastest_transit: number;
  fastest_carrier: string;
  status: string;
  distance_miles: number;
  origin_latitude?: number;
  origin_longitude?: number;
  destination_latitude?: number;
  destination_longitude?: number;
  raw_response?: Record<string, unknown>;
  raw_request?: Record<string, unknown> | null;
  updated_at?: number;
  expires_at?: number;
}

// Legacy alias for backward compat
export interface QuoteResult {
  carrier_name: string;
  carrier_id: string;
  service_type: string;
  total_rate: number;
  currency: string;
  transit_days: number;
  valid_until?: string;
  details?: Record<string, unknown>;
}

export const getQuotes = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<XanoResponse<QuoteRequest[]>> => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('per_page', params.limit.toString());
  if (params?.status) query.set('status', params.status);

  // Quotes are stored in the Database CRUD API (api:MOZVC8ir) at /quote
  const result = await xanoRequest<any>(`/quote?${query.toString()}`, {}, XANO_DB_BASE);

  if (result.error) {
    return { error: result.error };
  }

  // DB API may return { quotes: [...], total: N } or a raw array
  const d = result.data;
  const items = d?.quotes || d?.items || (Array.isArray(d) ? d : []);
  return { data: items };
};

// ============================================
// Shipping API Group (XANO_SHIPPING_BASE)
// Rate Quoting, Booking, and Tracking
// ============================================

// --- LTL Rate Quote Types ---

export interface LtlCommodity {
  HandlingQuantity: number;
  PackagingType?: string;   // default "120" = Pallet
  Length: number;
  Width: number;
  Height: number;
  WeightTotal: number;
  HazardousMaterial: boolean;
  PiecesTotal: number;
  FreightClass?: number;
  NMFC?: string;
  Description?: string;
  AdditionalMarkings?: string;
  UNNumber?: string;
  PackingGroup?: number;
}

export interface LtlRateQuoteRequest {
  AuthenticationKey?: string;
  OriginZipCode: string;
  OriginCountry?: number;         // 1 = US
  DestinationZipCode: string;
  DestinationCountry?: number;    // 1 = US
  WeightUnits?: string;           // "lb"
  DimensionUnits?: string;        // "in"
  AccessorialCodes?: string[] | null;
  LegacySupport?: boolean;
  CustomerReferenceNumber?: string;
  Commodities: LtlCommodity[];
}

export interface ShipmentRateAccessorial {
  accessorialCode: string;
  accessorialPrice: number;
}

export interface ShipmentRate {
  db_id?: number;
  quote_result_id?: number;
  api_quote_number?: string;
  apiQuoteNumber?: string;
  carrierName: string;
  carrierSCAC: string;
  serviceLevel: string;
  priceTotal: number;
  priceLineHaul: number;
  priceFuelSurcharge?: number;
  priceAccessorials?: ShipmentRateAccessorial[];
  transitTime?: number;
  tariffDescription?: string;
  tsaCompliance?: string;
  pricingInstructions?: string;
  newLiabilityCoverage?: number;
  usedLiabilityCoverage?: number;
}

export interface LtlRateQuoteResponse {
  success: boolean;
  quote_id: number;
  quote_request_id?: string;
  origin: {
    zip: string;
    city: string;
    state: string;
    latitude?: number;
    longitude?: number;
  };
  destination: {
    zip: string;
    city: string;
    state: string;
    latitude?: number;
    longitude?: number;
  };
  distance_miles?: number;
  total_rates_returned: number;
  top_rates_stored: number;
  ShipmentRates: ShipmentRate[];
  cheapest_rate?: ShipmentRate;
  fastest_rate?: ShipmentRate;
}

// --- Shipment Booking Types ---

export interface BookShipmentRequest {
  quote_result_id: number;
  origin_company?: string;
  origin_contact?: string;
  origin_address?: string;
  origin_phone?: string;
  destination_company?: string;
  destination_contact?: string;
  destination_address?: string;
  destination_phone?: string;
  CustomerReferenceNumber?: string;
}

export interface BookShipmentResponse {
  success: boolean;
  shipment: {
    id: number;
    tai_shipment_id: number;
    status: string;
    origin: { zip: string; city: string; state: string };
    destination: { zip: string; city: string; state: string };
    carrier: { name: string; scac: string };
    charges: { total: number; linehaul: number; fuel?: number };
    service_level: string;
    transit_days?: number;
    estimated_delivery?: number;
    customer_reference?: string;
    bol_number?: string;
    pro_number?: string;
  };
  tai_response: {
    result: {
      shipmentID: number;
      shipmentStatus: string;
      billOfLadingURL?: string;
      apiQuoteNumber?: string;
      priceDetail: {
        priceTotal: number;
        carrierName: string;
        carrierSCAC: string;
        transitTime?: number;
        priceLineHaul: number;
        priceFuelSurcharge?: number;
        apiQuoteNumber?: string;
        tariffDescription?: string;
        priceAccessorials?: string[];
      };
      billToAddress?: {
        companyName: string;
        streetAddress: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
    };
    status: number;
  };
}

// --- Quote Result Lookup Type ---

export interface QuoteResultDetail {
  id?: number;
  quote_id?: number;
  carrierName?: string;
  carrierSCAC?: string;
  serviceLevel?: string;
  priceTotal?: number;
  priceLineHaul?: number;
  priceFuelSurcharge?: number;
  transitTime?: number;
  apiQuoteNumber?: string;
  tariffDescription?: string;
  [key: string]: unknown;
}

// --- Shipping API Functions ---

/**
 * Get LTL rate quotes from TAI Cloud via Xano Shipping API
 * PUT /shipping/getRateQuote
 */
export const getLtlRateQuote = async (
  request: LtlRateQuoteRequest
): Promise<XanoResponse<LtlRateQuoteResponse>> => {
  return xanoRequest<LtlRateQuoteResponse>('/shipping/getRateQuote', {
    method: 'PUT',
    body: JSON.stringify({ data: request }),
  }, XANO_SHIPPING_BASE);
};

/**
 * Book a shipment from a quote result
 * POST /shipment/book
 */
export const bookShipment = async (
  request: BookShipmentRequest
): Promise<XanoResponse<BookShipmentResponse>> => {
  return xanoRequest<BookShipmentResponse>('/shipment/book', {
    method: 'POST',
    body: JSON.stringify({ data: request }),
  }, XANO_SHIPPING_BASE);
};

/**
 * Get quote results by quote_id
 * GET /quuote_id_result_?quote_id=XXX
 */
export const getQuoteResultById = async (
  quoteId: number | string
): Promise<XanoResponse<QuoteResultDetail>> => {
  return xanoRequest<QuoteResultDetail>(
    `/quuote_id_result_?quote_id=${encodeURIComponent(quoteId)}`,
    {},
    XANO_SHIPPING_BASE
  );
};

// ============================================
// Shipments APIs
// ============================================

export interface Shipment {
  id: number;
  tai_shipment_id?: string;
  pro_number?: string;
  bol_number?: string;
  quote_id?: number;
  quote_result_id?: number;
  user_id?: number;
  customer_id?: number;
  status: 'Committed' | 'Booked' | 'Ready' | 'InTransit' | 'Delivered' | 'Canceled';
  status_description?: string;
  carrier_name: string;
  carrier_scac?: string;
  tracking_number?: string;
  carrier_code?: string;
  service_code?: string;
  label_url?: string;
  origin_company?: string;
  origin_contact?: string;
  origin_street?: string;
  origin_street_2?: string;
  origin_city?: string;
  origin_state?: string;
  origin_zip?: string;
  origin_country?: string;
  origin_phone?: string;
  origin_email?: string;
  origin_ready_time?: string;
  origin_close_time?: string;
  origin_instructions?: string;
  origin_latitude?: number;
  origin_longitude?: number;
  destination_company?: string;
  destination_contact?: string;
  destination_street?: string;
  destination_street_2?: string;
  destination_city?: string;
  destination_state?: string;
  destination_zip?: string;
  destination_country?: string;
  destination_phone?: string;
  destination_email?: string;
  destination_delivery_start?: string;
  destination_delivery_end?: string;
  destination_instructions?: string;
  destination_latitude?: number;
  destination_longitude?: number;
  pickup_date?: string;
  pickup_actual_date?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  dispatched_at?: string;
  do_not_dispatch?: boolean;
  linehaul_charge?: number;
  fuel_surcharge?: number;
  accessorial_charge?: number;
  discount_amount?: number;
  total_charge: number;
  total_weight?: number;
  total_pieces?: number;
  total_handling_units?: number;
  weight_units?: string;
  dimension_units?: string;
  service_level?: string;
  equipment_type?: string;
  temp_min?: number;
  temp_max?: number;
  temp_unit?: string;
  customer_reference?: string;
  shipper_reference?: string;
  po_reference?: string;
  file_number?: string;
  provider?: string;
  provider_load_id?: string;
  provider_shipment_id?: string;
  pickup_number?: string;
  current_city?: string;
  current_state?: string;
  current_country?: string;
  last_location_city?: string;
  last_location_state?: string;
  last_location_update?: string;
  internal_notes?: string;
  carrier_notes?: string;
  shipment_type?: string;
  tenant_id?: number;
  raw_response?: Record<string, unknown> | null;
  shipengine_rate_quote_id?: number;
  shipengine_label_id?: number;
  created_at: string;
  updated_at: string;
}

export const getShipments = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}): Promise<XanoResponse<{ items: Shipment[]; total: number }>> => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  // Always send sort params to avoid Xano's broken unquoted default for sort_order
  query.set('sort_by', params?.sort_by || 'created_at');
  query.set('sort_order', params?.sort_order || 'desc');

  const result = await xanoRequest<any>(`/shipments?${query.toString()}`, {}, XANO_DASHBOARD_BASE);

  if (result.error) {
    // Fallback to empty data on auth, bad-request, or not-found errors
    if (result.error.includes('400') || result.error.includes('401') || result.error.includes('404')) {
      return { data: { items: [], total: 0 } };
    }
    return { error: result.error };
  }

  // Xano paginated response: { items: [...], curPage, nextPage, itemsReceived, itemsTotal }
  const d = result.data;
  return {
    data: {
      items: d?.items || (Array.isArray(d) ? d : []),
      total: d?.itemsTotal ?? d?.items?.length ?? 0,
    }
  };
};

export const getShipment = async (id: number): Promise<XanoResponse<Shipment>> => {
  return xanoRequest<Shipment>(`/shipments/${id}`, {}, XANO_DASHBOARD_BASE);
};

export const getShipmentByTaiId = async (taiShipmentId: string): Promise<XanoResponse<Shipment>> => {
  const result = await xanoRequest<any>(`/shipments?search=${encodeURIComponent(taiShipmentId)}&limit=1&sort_by=created_at&sort_order=desc`, {}, XANO_DASHBOARD_BASE);

  if (result.error) {
    return { error: result.error };
  }

  const d = result.data;
  const items = d?.items || (Array.isArray(d) ? d : []);
  const match = items.find((s: Shipment) => s.tai_shipment_id === taiShipmentId);

  if (match) {
    return { data: match };
  }

  // If search didn't find exact match, return first item if it exists
  if (items.length > 0) {
    return { data: items[0] };
  }

  return { error: 'Shipment not found' };
};

export const createShipment = async (
  shipment: Omit<Shipment, 'id' | 'created_at' | 'updated_at'>
): Promise<XanoResponse<Shipment>> => {
  return xanoRequest<Shipment>('/shipments', {
    method: 'POST',
    body: JSON.stringify(shipment),
  }, XANO_DASHBOARD_BASE);
};

export const updateShipment = async (
  id: number,
  updates: Partial<Shipment>
): Promise<XanoResponse<Shipment>> => {
  return xanoRequest<Shipment>(`/shipments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }, XANO_DASHBOARD_BASE);
};

// ============================================
// ExFreight External API
// ============================================

export const exfreightGetRates = async (
  request: RateQuoteRequest
): Promise<XanoResponse<QuoteResult[]>> => {
  return xanoRequest<QuoteResult[]>('/rating', {
    method: 'POST',
    body: JSON.stringify(request),
  }, XANO_EXFREIGHT_BASE);
};

export const exfreightTrackShipment = async (
  trackingNumber: string
): Promise<XanoResponse<{ events: Array<{ date: string; status: string; location: string }> }>> => {
  return xanoRequest(`/track/${trackingNumber}`, {}, XANO_EXFREIGHT_BASE);
};

// ============================================
// Dashboard & Analytics APIs
// ============================================

export interface DashboardStats {
  total_shipments: number;
  active_shipments: number;
  pending_quotes: number;
  total_customers: number;
  revenue_mtd: number;
  shipments_mtd: number;
}

export const getDashboardStats = async (): Promise<XanoResponse<DashboardStats>> => {
  const result = await xanoRequest<DashboardStats>('/dashboard/stats', {}, XANO_DASHBOARD_BASE);

  // Fallback to mock data if unauthorized (401) or not found (404)
  if (result.error && (result.error.includes('401') || result.error.includes('404'))) {
    console.warn('[Xano] /dashboard/stats endpoint error, using mock data');
    return {
      data: {
        total_shipments: 0,
        active_shipments: 0,
        pending_quotes: 0,
        total_customers: 0,
        revenue_mtd: 0,
        shipments_mtd: 0
      }
    };
  }

  return result;
};

export interface ActivityLog {
  id: number;
  type: string;
  message: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export const getRecentActivity = async (
  limit: number = 10
): Promise<XanoResponse<ActivityLog[]>> => {
  return xanoRequest<ActivityLog[]>(`/dashboard/activity?limit=${limit}`, {}, XANO_DASHBOARD_BASE);
};

// ============================================
// Admin APIs
// ============================================

export interface AdminUser extends XanoUser {
  subscription_plan?: string;
  subscription_status?: string;
  last_login?: string;
}

export const getAdminUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<XanoResponse<{ items: AdminUser[]; total: number }>> => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.search) query.set('search', params.search);

  return xanoRequest<{ items: AdminUser[]; total: number }>(`/admin/users?${query.toString()}`);
};

export const updateUserRole = async (
  userId: number,
  role: string
): Promise<XanoResponse<AdminUser>> => {
  return xanoRequest<AdminUser>(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
};

// ============================================
// Subscription & Billing APIs
// ============================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    shipments?: number;
    quotes?: number;
    users?: number;
  };
}

export const getSubscriptionPlans = async (): Promise<XanoResponse<SubscriptionPlan[]>> => {
  return xanoRequest<SubscriptionPlan[]>('/subscriptions/plans');
};

export const getCurrentSubscription = async (): Promise<XanoResponse<{
  plan: SubscriptionPlan;
  status: string;
  current_period_end: string;
}>> => {
  return xanoRequest('/subscriptions/current');
};

export const createCheckoutSession = async (
  planId: string
): Promise<XanoResponse<{ url: string }>> => {
  return xanoRequest<{ url: string }>('/subscriptions/checkout', {
    method: 'POST',
    body: JSON.stringify({ plan_id: planId }),
  });
};

export const createBillingPortalSession = async (): Promise<XanoResponse<{ url: string }>> => {
  return xanoRequest<{ url: string }>('/subscriptions/portal', {
    method: 'POST',
  });
};

// ============================================
// Customers/CRM APIs
// ============================================

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const getCustomers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<XanoResponse<{ items: Customer[]; total: number }>> => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.search) query.set('search', params.search);

  return xanoRequest<{ items: Customer[]; total: number }>(`/customers?${query.toString()}`);
};

export const getCustomer = async (id: number): Promise<XanoResponse<Customer>> => {
  return xanoRequest<Customer>(`/customers/${id}`);
};

export const createCustomer = async (
  customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>
): Promise<XanoResponse<Customer>> => {
  return xanoRequest<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(customer),
  });
};

export const updateCustomer = async (
  id: number,
  updates: Partial<Customer>
): Promise<XanoResponse<Customer>> => {
  return xanoRequest<Customer>(`/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

export const deleteCustomer = async (id: number): Promise<XanoResponse<void>> => {
  return xanoRequest<void>(`/customers/${id}`, {
    method: 'DELETE',
  });
};

// ============================================
// STG / CFS Operations APIs
// ============================================

// --- Types ---

export interface CfsContainer {
  id: number;
  container_number: string;
  mbl_number?: string;
  vessel_name?: string;
  voyage_number?: string;
  carrier?: string;
  pol?: string;
  pod?: string;
  cfs_code?: string;
  cfs_location?: string;
  lifecycle_stage?: string;
  status?: string;
  lfd_status?: string;
  pier_lfd?: string;
  warehouse_lfd?: string;
  effective_lfd?: string;
  effective_days_until_lfd?: number;
  ata?: string;
  eta?: string;
  vessel_eta?: string;
  discharge_date?: string;
  available_at_pier?: string;
  available_at_stg?: string;
  stripped_date?: string;
  pickup_date?: string;
  delivery_date?: string;
  customer_code?: string;
  customer_name?: string;
  consignee?: string;
  total_hbls?: number;
  total_pieces?: number;
  total_weight?: number;
  created_at?: string;
  updated_at?: string;
  _hbls?: CfsHbl[];
  _alerts?: CfsAlert[];
  _tasks?: CfsTask[];
  _events?: CfsContainerEvent[];
}

export interface CfsHbl {
  id: number;
  house_bill_number: string;
  container_id?: number;
  container_number?: string;
  consignee?: string;
  pieces?: number;
  weight?: number;
  description?: string;
  lfd?: string;
  days_until_lfd?: number;
  status?: string;
  available_for_pickup?: boolean;
  pickup_date?: string;
  delivery_company?: string;
  created_at?: string;
}

export interface CfsAlert {
  id: number;
  container_number?: string;
  house_bill_number?: string;
  alert_type?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'URGENT';
  message?: string;
  status?: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  acknowledged_at?: string;
  acknowledged_by?: number;
  resolved_at?: string;
  resolved_by?: number;
  resolution_notes?: string;
  days_until_lfd?: number;
  lfd_date?: string;
  created_at?: string;
  updated_at?: string;
  _container?: CfsContainer;
}

export interface CfsTask {
  id: number;
  container_number?: string;
  house_bill_number?: string;
  task_type?: string;
  title?: string;
  description?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  priority?: number;
  assigned_to?: number;
  assigned_name?: string;
  due_date?: string;
  resolution_note?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CfsContainerEvent {
  id: number;
  container_number?: string;
  event_type?: string;
  description?: string;
  notes?: string;
  user_id?: number;
  created_at?: string;
}

export interface CfsMonitorDashboard {
  items: CfsContainer[];
  total: number;
  page: number;
  per_page: number;
  stats?: {
    total_containers?: number;
    critical_count?: number;
    warning_count?: number;
    overdue_count?: number;
    ok_count?: number;
  };
}

export interface CfsDashboardStats {
  total_containers?: number;
  active_containers?: number;
  critical_alerts?: number;
  open_tasks?: number;
  pending_dispatch?: number;
  containers_at_risk?: number;
  containers_delivered?: number;
  avg_dwell_days?: number;
}

export interface CfsNotification {
  id: number;
  container_number?: string;
  notification_type?: string;
  channel?: string;
  recipient?: string;
  subject?: string;
  status?: string;
  sent_at?: string;
  created_at?: string;
}

export interface DispatchRequest {
  house_bill_number: string;
  delivery_company?: string;
  delivery_contact?: string;
  delivery_street?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_zip?: string;
  delivery_phone?: string;
  preferred_pickup_date?: string;
  customer_reference?: string;
}

// --- Dashboard APIs (Group 75: XANO_DASHBOARD_BASE) ---

export const getCfsContainers = async (params?: {
  status?: string;
  cfs_code?: string;
  lifecycle_stage?: string;
  q?: string;
  limit?: number;
  page?: number;
  sort_by?: string;
  sort_order?: string;
}): Promise<XanoResponse<CfsContainer[]>> => {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.cfs_code) query.set('cfs_code', params.cfs_code);
  if (params?.lifecycle_stage) query.set('lifecycle_stage', params.lifecycle_stage);
  if (params?.q) query.set('q', params.q);
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.page) query.set('page', params.page.toString());
  if (params?.sort_by) query.set('sort_by', params.sort_by);
  if (params?.sort_order) query.set('sort_order', params.sort_order);
  return xanoRequest<CfsContainer[]>(`/cfs/containers?${query.toString()}`, {}, XANO_DASHBOARD_BASE);
};

export const getCfsContainerDetail = async (containerNumber: string): Promise<XanoResponse<CfsContainer>> => {
  return xanoRequest<CfsContainer>(`/cfs/containers/container_number?container_number=${encodeURIComponent(containerNumber)}`, {}, XANO_DASHBOARD_BASE);
};

export const refreshCfsContainer = async (containerNumber: string): Promise<XanoResponse<CfsContainer>> => {
  return xanoRequest<CfsContainer>('/cfs/containers/container_number/refresh', {
    method: 'POST',
    body: JSON.stringify({ container_number: containerNumber }),
  }, XANO_DASHBOARD_BASE);
};

export const addContainerNote = async (containerNumber: string, notes: string, userId?: number): Promise<XanoResponse<CfsContainerEvent>> => {
  return xanoRequest<CfsContainerEvent>('/cfs/containers/container_number/add-note', {
    method: 'POST',
    body: JSON.stringify({ container_number: containerNumber, notes, user_id: userId || 1 }),
  }, XANO_DASHBOARD_BASE);
};

export const getCfsTasks = async (params?: {
  status?: string;
  container_number?: string;
  task_type?: string;
  limit?: number;
  page?: number;
}): Promise<XanoResponse<CfsTask[]>> => {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.container_number) query.set('container_number', params.container_number);
  if (params?.task_type) query.set('task_type', params.task_type);
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.page) query.set('page', params.page.toString());
  return xanoRequest<CfsTask[]>(`/cfs/tasks?${query.toString()}`, {}, XANO_DASHBOARD_BASE);
};

export const createCfsTask = async (task: {
  container_number?: string;
  task_type: string;
  title: string;
  description?: string;
  priority?: number;
}): Promise<XanoResponse<CfsTask>> => {
  return xanoRequest<CfsTask>('/cfs/tasks/create', {
    method: 'POST',
    body: JSON.stringify(task),
  }, XANO_DASHBOARD_BASE);
};

export const updateCfsTask = async (taskId: number, updates: {
  status?: string;
  notes?: string;
  resolution_note?: string;
  assigned_to?: number;
}): Promise<XanoResponse<CfsTask>> => {
  return xanoRequest<CfsTask>('/cfs/tasks/task_id', {
    method: 'PATCH',
    body: JSON.stringify({ task_id: taskId, ...updates }),
  }, XANO_DASHBOARD_BASE);
};

export const getCfsMonitorDashboard = async (params?: {
  page?: number;
  per_page?: number;
  status_filter?: string;
  location_filter?: string;
}): Promise<XanoResponse<CfsMonitorDashboard>> => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.per_page) query.set('per_page', params.per_page.toString());
  if (params?.status_filter) query.set('status_filter', params.status_filter);
  if (params?.location_filter) query.set('location_filter', params.location_filter);
  return xanoRequest<CfsMonitorDashboard>(`/cfs_monitor?${query.toString()}`, {}, XANO_DASHBOARD_BASE);
};

export const getCfsMonitorContainerDetail = async (containerNumber: string): Promise<XanoResponse<CfsContainer>> => {
  return xanoRequest<CfsContainer>(`/cfs_monitor/container/${encodeURIComponent(containerNumber)}`, {}, XANO_DASHBOARD_BASE);
};

export const acknowledgeCfsAlert = async (alertId: number): Promise<XanoResponse<void>> => {
  return xanoRequest<void>('/cfs_monitor/acknowledge', {
    method: 'PUT',
    body: JSON.stringify({ alert_id: alertId }),
  }, XANO_DASHBOARD_BASE);
};

export const schedulePickup = async (data: {
  container_number: string;
  pickup_date: string;
  pickup_time?: string;
  trucker_name?: string;
}): Promise<XanoResponse<void>> => {
  return xanoRequest<void>('/cfs_monitor/schedule_pickup', {
    method: 'POST',
    body: JSON.stringify(data),
  }, XANO_DASHBOARD_BASE);
};

export const exportCfsData = async (params?: {
  format?: 'json' | 'csv';
  status_filter?: string;
  location_filter?: string;
}): Promise<XanoResponse<any>> => {
  const query = new URLSearchParams();
  if (params?.format) query.set('format', params.format);
  if (params?.status_filter) query.set('status_filter', params.status_filter);
  if (params?.location_filter) query.set('location_filter', params.location_filter);
  return xanoRequest<any>(`/cfs_monitor/export?${query.toString()}`, {}, XANO_DASHBOARD_BASE);
};

export const getCfsNotifications = async (params?: {
  container_number?: string;
  limit?: number;
}): Promise<XanoResponse<CfsNotification[]>> => {
  const query = new URLSearchParams();
  if (params?.container_number) query.set('container_number', params.container_number);
  if (params?.limit) query.set('limit', params.limit.toString());
  return xanoRequest<CfsNotification[]>(`/cfs/notifications?${query.toString()}`, {}, XANO_DASHBOARD_BASE);
};

export const resolveCfsAlert = async (alertId: number, notes?: string): Promise<XanoResponse<void>> => {
  return xanoRequest<void>(`/cfs/alerts/${alertId}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ resolution_notes: notes }),
  }, XANO_DASHBOARD_BASE);
};

export const getCfsDashboardStats = async (): Promise<XanoResponse<CfsDashboardStats>> => {
  return xanoRequest<CfsDashboardStats>('/dashboard/stats', {}, XANO_DASHBOARD_BASE);
};

export const getCfsDashboardActivity = async (limit?: number): Promise<XanoResponse<ActivityLog[]>> => {
  const query = limit ? `?limit=${limit}` : '';
  return xanoRequest<ActivityLog[]>(`/dashboard/activity${query}`, {}, XANO_DASHBOARD_BASE);
};

export const getCfsTopDestinations = async (): Promise<XanoResponse<any>> => {
  return xanoRequest<any>('/dashboard/top_destinations', {}, XANO_DASHBOARD_BASE);
};

// --- STG Operations APIs (Group 23: XANO_STG_OPS_BASE) ---

export const getActiveAlerts = async (params?: {
  page?: number;
  per_page?: number;
  severity?: string;
}): Promise<XanoResponse<{ items: CfsAlert[]; total: number }>> => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.per_page) query.set('per_page', params.per_page.toString());
  if (params?.severity) query.set('severity', params.severity);
  return xanoRequest<{ items: CfsAlert[]; total: number }>(`/alerts/active?${query.toString()}`, {}, XANO_STG_OPS_BASE);
};

export const alertAction = async (alertId: number, action: 'acknowledge' | 'resolve', notes?: string, userId?: number): Promise<XanoResponse<CfsAlert>> => {
  return xanoRequest<CfsAlert>(`/alerts/${alertId}/action`, {
    method: 'PUT',
    body: JSON.stringify({ action, notes, user_id: userId || 1 }),
  }, XANO_STG_OPS_BASE);
};

export const getDispatchPending = async (params?: {
  page?: number;
  per_page?: number;
  cfs_code?: string;
}): Promise<XanoResponse<any>> => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.per_page) query.set('per_page', params.per_page.toString());
  if (params?.cfs_code) query.set('cfs_code', params.cfs_code);
  return xanoRequest<any>(`/dispatch/pending?${query.toString()}`, {}, XANO_STG_OPS_BASE);
};

export const requestDispatch = async (data: DispatchRequest): Promise<XanoResponse<any>> => {
  return xanoRequest<any>('/dispatch/request', {
    method: 'POST',
    body: JSON.stringify(data),
  }, XANO_STG_OPS_BASE);
};

export const stgGetAvailability = async (params: {
  endpoint_path: string;
  containerNumber?: string;
  houseBillNumber?: string;
}): Promise<XanoResponse<any>> => {
  const query = new URLSearchParams();
  query.set('endpoint_path', params.endpoint_path);
  if (params.containerNumber) query.set('containerNumber', params.containerNumber);
  if (params.houseBillNumber) query.set('houseBillNumber', params.houseBillNumber);
  return xanoRequest<any>(`/STG?${query.toString()}`, {}, XANO_STG_OPS_BASE);
};

export const triggerSyncPipeline = async (options?: {
  run_full_sync?: boolean;
  run_alert_monitor?: boolean;
  run_hbl_monitor?: boolean;
  run_task_creation?: boolean;
}): Promise<XanoResponse<any>> => {
  return xanoRequest<any>('/stg/test-sync-pipeline', {
    method: 'POST',
    body: JSON.stringify(options || { run_full_sync: true, run_alert_monitor: true, run_hbl_monitor: true, run_task_creation: true }),
  }, XANO_STG_OPS_BASE);
};

export const getStgContainers = async (params?: {
  year?: number;
}): Promise<XanoResponse<any>> => {
  const query = new URLSearchParams();
  if (params?.year) query.set('year', params.year.toString());
  return xanoRequest<any>(`/get_stg_containers?${query.toString()}`, {}, XANO_STG_OPS_BASE);
};

export const trackStgContainer = async (containerNumber: string): Promise<XanoResponse<any>> => {
  return xanoRequest<any>(`/stg_track_container?container_number=${encodeURIComponent(containerNumber)}`, {}, XANO_STG_OPS_BASE);
};

// --- STG Financials APIs (Group 71: XANO_STG_FINANCIALS_BASE) ---

export const getArrivalTracking = async (params: {
  containerNumber?: string;
  houseBillNumber?: string;
}): Promise<XanoResponse<any>> => {
  const query = new URLSearchParams();
  if (params.containerNumber) query.set('containerNumber', params.containerNumber);
  if (params.houseBillNumber) query.set('houseBillNumber', params.houseBillNumber);
  return xanoRequest<any>(`/arrival/tracking?${query.toString()}`, {}, XANO_STG_FINANCIALS_BASE);
};

export const getContainerDashboard = async (): Promise<XanoResponse<any>> => {
  return xanoRequest<any>('/dashboard/containers', {}, XANO_STG_FINANCIALS_BASE);
};

export const calculatePalletCharges = async (data: {
  jobLotNo: string;
  customerCode: string;
  cfsCode: string;
  numberOfPalletsToBeCalculated: number;
}): Promise<XanoResponse<any>> => {
  return xanoRequest<any>('/pallet/calculate', {
    method: 'POST',
    body: JSON.stringify(data),
  }, XANO_STG_FINANCIALS_BASE);
};

// --- STG Arrival APIs (Group 93: XANO_STG_ARRIVAL_BASE) ---

export const getAlertsByCfs = async (params?: {
  cfs_code?: string;
  severity?: string;
}): Promise<XanoResponse<CfsAlert[]>> => {
  const query = new URLSearchParams();
  if (params?.cfs_code) query.set('cfs_code', params.cfs_code);
  if (params?.severity) query.set('severity', params.severity);
  return xanoRequest<CfsAlert[]>(`/get_alerts?${query.toString()}`, {}, XANO_STG_ARRIVAL_BASE);
};
