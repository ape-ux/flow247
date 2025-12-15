// Xano API Configuration
const XANO_API_BASE = 'https://xjlt-4ifj-k7qu.n7e.xano.io/api:QC35j52Y';
const XANO_MCP_BASE = 'https://xjlt-4ifj-k7qu.n7e.xano.io/x2/mcp/freight_flow_ai_v1/mcp';

interface XanoAuthResponse {
  authToken: string;
  user?: {
    id: number;
    email: string;
    name?: string;
    created_at?: string;
  };
}

interface XanoError {
  message: string;
  code?: string;
}

class XanoClient {
  private baseUrl: string;
  private mcpBaseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string, mcpBaseUrl: string) {
    this.baseUrl = baseUrl;
    this.mcpBaseUrl = mcpBaseUrl;
    this.authToken = localStorage.getItem('xano_token');
  }

  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('xano_token', token);
  }

  clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem('xano_token');
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  }

  async signup(email: string, password: string, name?: string): Promise<XanoAuthResponse> {
    const data = await this.request<XanoAuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    if (data.authToken) {
      this.setAuthToken(data.authToken);
    }
    
    return data;
  }

  async login(email: string, password: string): Promise<XanoAuthResponse> {
    const data = await this.request<XanoAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.authToken) {
      this.setAuthToken(data.authToken);
    }
    
    return data;
  }

  async logout(): Promise<void> {
    this.clearAuthToken();
  }

  async getMe(): Promise<XanoAuthResponse['user']> {
    return this.request<XanoAuthResponse['user']>('/auth/me');
  }

  // MCP Chat Stream - POST to send messages
  async sendChatMessage(message: string, llmApiKey?: string): Promise<Response> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream, application/json',
    };
    
    if (this.authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Include LLM API key if provided
    const body: Record<string, string> = { message };
    if (llmApiKey) {
      body.llm_api_key = llmApiKey;
    }

    return fetch(`${this.mcpBaseUrl}/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  }

  // MCP SSE endpoint for real-time streaming
  getMcpSseUrl(): string {
    return `${this.mcpBaseUrl}/sse`;
  }
}

export const xano = new XanoClient(XANO_API_BASE, XANO_MCP_BASE);
export type { XanoAuthResponse, XanoError };
