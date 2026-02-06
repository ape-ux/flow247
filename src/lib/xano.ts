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

  // Call Xano AI Agent (supports tools and structured outputs)
  async callAgent(
    agentId: string | number,
    prompt: string,
    conversationHistory?: Array<{role: string; content: string}>,
    userContext?: {name?: string; email?: string; company?: string}
  ): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Build messages array with conversation history
    const messages = conversationHistory || [];
    messages.push({
      role: 'user',
      content: prompt
    });

    const response = await fetch(`https://xjlt-4ifj-k7qu.n7e.xano.io/api:E1Skvg8o/agent/${agentId}/run`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages: messages,
        user_context: userContext || {}
      }),
    });

    if (!response.ok) {
      throw new Error(`Agent call failed: ${response.status}`);
    }

    return response.json();
  }

  // Stream agent response for real-time chat experience
  async streamAgent(
    agentId: string | number,
    prompt: string,
    conversationHistory?: Array<{role: string; content: string}>,
    onChunk?: (chunk: string) => void,
    userContext?: {name?: string; email?: string; company?: string}
  ): Promise<string> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    };
    
    if (this.authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
    }

    const messages = conversationHistory || [];
    messages.push({
      role: 'user',
      content: prompt
    });

    const response = await fetch(`https://xjlt-4ifj-k7qu.n7e.xano.io/api:E1Skvg8o/agent/${agentId}/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages: messages,
        user_context: userContext || {}
      }),
    });

    if (!response.ok) {
      throw new Error(`Agent stream failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = line.slice(6); // Remove 'data: ' prefix
              if (data.trim() === '[DONE]') {
                continue;
              }
              
              // Try to parse as JSON first
              let parsed: any;
              try {
                parsed = JSON.parse(data);
              } catch {
                // If not JSON, treat as plain text
                parsed = data;
              }
              
              // Extract text content from various possible formats
              let textChunk = '';
              if (typeof parsed === 'string') {
                textChunk = parsed;
              } else if (parsed?.content) {
                textChunk = parsed.content;
              } else if (parsed?.text) {
                textChunk = parsed.text;
              } else if (parsed?.delta?.content) {
                textChunk = parsed.delta.content;
              } else if (parsed?.message?.content) {
                textChunk = parsed.message.content;
              } else if (parsed?.result) {
                textChunk = typeof parsed.result === 'string' ? parsed.result : JSON.stringify(parsed.result);
              }
              
              // Decode unicode escape sequences
              if (textChunk) {
                // Replace unicode escape sequences like \u0027 with actual characters
                textChunk = textChunk.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
                  return String.fromCharCode(parseInt(code, 16));
                });
                
                // Replace other common escape sequences
                textChunk = textChunk
                  .replace(/\\n/g, '\n')
                  .replace(/\\t/g, '\t')
                  .replace(/\\r/g, '\r')
                  .replace(/\\'/g, "'")
                  .replace(/\\"/g, '"')
                  .replace(/\\\\/g, '\\');
                
                fullResponse += textChunk;
                
                if (onChunk) {
                  onChunk(textChunk);
                }
              }
            } catch (error) {
              // If parsing fails, treat the entire line as text
              const text = line.slice(6);
              fullResponse += text;
              if (onChunk) {
                onChunk(text);
              }
            }
          } else if (line.trim() && !line.startsWith('event:') && !line.startsWith('id:')) {
            // Handle non-SSE formatted responses (plain text streaming)
            fullResponse += line + '\n';
            if (onChunk) {
              onChunk(line + '\n');
            }
          }
        }
      }
      
      // Process any remaining buffer
      if (buffer.trim()) {
        fullResponse += buffer;
        if (onChunk) {
          onChunk(buffer);
        }
      }
    }

    // Final cleanup: decode any remaining unicode sequences
    fullResponse = fullResponse.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
      return String.fromCharCode(parseInt(code, 16));
    });

    return fullResponse;
  }

  // MCP Chat Stream - POST to send messages using JSON-RPC 2.0 format
  async sendChatMessage(message: string, llmApiKey?: string): Promise<Response> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream, application/json',
    };
    
    if (this.authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
    }

    // JSON-RPC 2.0 format required by Xano MCP
    const jsonRpcBody = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'sampling/createMessage',
      params: {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: message
            }
          }
        ],
        ...(llmApiKey && { llm_api_key: llmApiKey })
      }
    };

    return fetch(`${this.mcpBaseUrl}/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify(jsonRpcBody),
    });
  }

  // MCP SSE endpoint for real-time streaming
  getMcpSseUrl(): string {
    return `${this.mcpBaseUrl}/sse`;
  }

  // List available agents
  async listAgents(): Promise<any[]> {
    return this.request<any[]>('https://xjlt-4ifj-k7qu.n7e.xano.io/api:E1Skvg8o/agents');
  }

  // Get agent details
  async getAgent(agentId: string | number): Promise<any> {
    return this.request<any>(`https://xjlt-4ifj-k7qu.n7e.xano.io/api:E1Skvg8o/agent/${agentId}`);
  }

  // =====================
  // DATABASE INTEGRATIONS
  // =====================

  // Get customer profile from Xano database
  async getCustomerProfile(): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(`https://xjlt-4ifj-k7qu.n7e.xano.io/api:E1Skvg8o/customer/profile`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        console.warn('Failed to get customer profile:', response.status);
        return null;
      }

      const data = await response.json();
      // Sync with localStorage
      if (data) {
        localStorage.setItem('customer_profile', JSON.stringify(data));
      }
      return data;
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      return null;
    }
  }

  // Update customer profile in Xano database
  async updateCustomerProfile(profileData: any): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`https://xjlt-4ifj-k7qu.n7e.xano.io/api:E1Skvg8o/customer/profile`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update customer profile: ${response.status}`);
    }

    const data = await response.json();
    // Sync with localStorage
    localStorage.setItem('customer_profile', JSON.stringify(data));
    return data;
  }

  // Log agent message to database
  async logAgentMessage(conversationId: number, role: string, content: string, toolCalls?: string[]): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(`https://xjlt-4ifj-k7qu.n7e.xano.io/api:E1Skvg8o/agent/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          conversation_id: conversationId,
          role: role,
          content: content,
          tool_calls: toolCalls || []
        }),
      });

      if (!response.ok) {
        console.warn('Failed to log agent message:', response.status);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Error logging agent message:', error);
      return null;
    }
  }

  // Create or get agent conversation
  async getOrCreateConversation(): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(`https://xjlt-4ifj-k7qu.n7e.xano.io/api:E1Skvg8o/agent/conversation`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        console.warn('Failed to create conversation:', response.status);
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }

  // Get account details
  async getAccountDetails(): Promise<any> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (this.authToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`https://xjlt-4ifj-k7qu.n7e.xano.io/api:dqA59R7v/account/details`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching account details:', error);
      return null;
    }
  }

  // Get team members
  async getTeamMembers(): Promise<any[]> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (this.authToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`https://xjlt-4ifj-k7qu.n7e.xano.io/api:dqA59R7v/account/my_team_members`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        return [];
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  }

  // Get user event logs
  async getUserEventLogs(): Promise<any[]> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (this.authToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`https://xjlt-4ifj-k7qu.n7e.xano.io/api:Dg-LSQY9/logs/user/my_events`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        return [];
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching event logs:', error);
      return [];
    }
  }

  // Sync user data with Xano - loads customer profile from database
  async syncUserData(): Promise<any> {
    try {
      // First, get the customer profile from the database
      const profile = await this.getCustomerProfile();
      
      if (profile) {
        // If profile exists in DB, sync to localStorage
        localStorage.setItem('customer_profile', JSON.stringify(profile));
        return profile;
      }
      
      return null;
    } catch (error) {
      console.error('Error syncing user data:', error);
      return null;
    }
  }

  // Create a new shipment in Xano
  async createShipment(shipmentData: {
    sender_name: string;
    sender_email: string;
    sender_phone: string;
    sender_company?: string;
    sender_address: string;
    recipient_name: string;
    recipient_email: string;
    recipient_phone: string;
    recipient_company?: string;
    recipient_address: string;
    weight: number;
    length: number;
    width: number;
    height: number;
    service: string;
    insurance?: number;
    contents: string;
    special_instructions?: string;
  }): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(`https://xjlt-4ifj-k7qu.n7e.xano.io/api:E1Skvg8o/shipments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          // Sender information
          sender_name: shipmentData.sender_name,
          sender_email: shipmentData.sender_email,
          sender_phone: shipmentData.sender_phone,
          sender_company: shipmentData.sender_company || '',
          sender_address: shipmentData.sender_address,
          
          // Recipient information
          recipient_name: shipmentData.recipient_name,
          recipient_email: shipmentData.recipient_email,
          recipient_phone: shipmentData.recipient_phone,
          recipient_company: shipmentData.recipient_company || '',
          recipient_address: shipmentData.recipient_address,
          
          // Package details
          weight: shipmentData.weight,
          length: shipmentData.length,
          width: shipmentData.width,
          height: shipmentData.height,
          service_level: shipmentData.service,
          insurance_value: shipmentData.insurance || 0,
          package_contents: shipmentData.contents,
          special_instructions: shipmentData.special_instructions || '',
          
          // Auto-calculated fields
          created_at: new Date().toISOString(),
          status: 'pending',
          tracking_number: '', // Will be assigned by carrier
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create shipment: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating shipment:', error);
      throw error;
    }
  }

  // Create a new customer in Xano
  async createCustomer(customerData: {
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    customer_type?: string;
  }): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(`https://xjlt-4ifj-k7qu.n7e.xano.io/api:E1Skvg8o/customers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          company_name: customerData.company_name,
          contact_name: customerData.contact_name,
          email: customerData.email,
          phone: customerData.phone,
          street_address: customerData.address,
          city: customerData.city,
          state: customerData.state,
          zip_code: customerData.zip_code,
          customer_type: customerData.customer_type || 'shipper',
          is_active: true,
          created_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create customer: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }
}

export const xano = new XanoClient(XANO_API_BASE, XANO_MCP_BASE);
export type { XanoAuthResponse, XanoError };
