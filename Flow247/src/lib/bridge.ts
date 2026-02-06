/**
 * Bridge API Client for Flow247
 * 
 * Talks to the FreightFlow Bridge server (proxied via /api by nginx).
 * The bridge handles: OpenAI GPT-4o + function calling → Xano APIs + Supabase persistence.
 * Frontend NEVER calls Xano directly for chat — always goes through the bridge.
 * 
 * Auth: Supabase JWT token sent as Bearer token.
 */

import { supabase } from './supabase';

const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || '/api';

// ─── Auth Helper ───

async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
}

// ─── Generic Request Helper ───

async function bridgeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Merge any custom headers
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  try {
    const response = await fetch(`${BRIDGE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { error: data.error || data.message || `Request failed: ${response.status}` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
}

// ─── Chat (Streaming via /v1/chat/completions) ───

/**
 * Send a chat message to the bridge with SSE streaming.
 * Uses /v1/chat/completions with stream=true for real-time token-by-token response.
 * The bridge handles conversation persistence automatically when conversation_id is provided.
 * 
 * @param messages - Array of {role, content} messages (conversation history + new user message)
 * @param conversationId - UUID conversation ID (bridge auto-creates if doesn't exist)
 * @param onChunk - Called for each text chunk received
 * @param onComplete - Called when streaming is done
 * @param onError - Called on error
 */
export async function bridgeChat(
  messages: Array<{ role: string; content: string }>,
  conversationId: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  const token = await getAuthToken();

  try {
    const response = await fetch(`${BRIDGE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        messages,
        stream: true,
        conversation_id: conversationId,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const errMsg = errBody.error?.message || errBody.error || `Bridge error: ${response.status}`;
      onError(errMsg);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      // Fallback: non-streaming response
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || data.result || '';
      if (text) onChunk(text);
      onComplete();
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const payload = trimmed.slice(6); // Remove 'data: ' prefix
        if (payload === '[DONE]') {
          onComplete();
          return;
        }

        try {
          const parsed = JSON.parse(payload);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onChunk(content);
        } catch {
          // Skip unparseable SSE chunks
        }
      }
    }

    // Stream ended without [DONE]
    onComplete();
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Stream error');
  }
}

// ─── Simple Chat (Non-streaming via /chat) ───

/**
 * Send a chat message using the simple /chat endpoint (non-streaming).
 * The bridge handles conversation creation, message persistence, and history management.
 */
export async function bridgeChatSimple(
  message: string,
  conversationId?: string
): Promise<{ data?: { result: string; conversation_id: string }; error?: string }> {
  return bridgeRequest('/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
    }),
  });
}

// ─── Conversations ───

/**
 * List user conversations (ordered by most recent).
 */
export async function bridgeGetConversations(
  limit: number = 30
): Promise<{ data?: Array<{ id: string; title?: string; status?: string; message_count?: number; updated_at?: string }>; error?: string }> {
  return bridgeRequest(`/conversations?limit=${limit}`);
}

/**
 * Get a specific conversation with its messages.
 * Returns the conversation object merged with a `messages` array.
 */
export async function bridgeGetConversation(
  id: string
): Promise<{ data?: { id: string; messages: Array<{ role: string; content: string }>; title?: string; [key: string]: unknown }; error?: string }> {
  return bridgeRequest(`/conversations/${encodeURIComponent(id)}`);
}

/**
 * Delete a conversation.
 * NOTE: The bridge currently does not support DELETE. This is a client-side stub.
 */
export async function bridgeDeleteConversation(
  _id: string
): Promise<{ error?: string }> {
  console.warn('[bridge] deleteConversation: not yet supported by bridge');
  return {};
}

// ─── Helpers ───

/**
 * Generate a new conversation UUID (client-side).
 * The bridge will auto-create the conversation record on first message.
 */
export function generateConversationId(): string {
  // crypto.randomUUID() requires secure context (HTTPS). Fallback for HTTP:
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Polyfill: generate UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Check bridge health.
 */
export async function bridgeHealthCheck(): Promise<{ data?: { status: string; [key: string]: unknown }; error?: string }> {
  return bridgeRequest('/health');
}
