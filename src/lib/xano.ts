// Xano API Configuration
const XANO_API_BASE = import.meta.env.VITE_XANO_API_BASE || '';

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
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
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

  async chatWithAI(message: string, conversationId?: string): Promise<{ response: string; conversationId: string }> {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    });
  }
}

export const xano = new XanoClient(XANO_API_BASE);
export type { XanoAuthResponse, XanoError };
