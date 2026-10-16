import { useEffect, useRef, useState, useCallback } from 'react';

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  messageType?: string;
  createdAt: string;
}

export interface GroupChatMessage {
  id: number;
  groupId: number;
  senderId: number;
  content: string;
  messageType?: string;
  createdAt: string;
  sender?: {
    id: number;
    name: string;
    username?: string;
    avatarUrl?: string;
    vehicleType?: string;
  };
}

export function useWebSocketChat(
  token: string | null,
  onNewMessage?: (msg: ChatMessage) => void,
  onNewGroupMessage?: (msg: GroupChatMessage) => void,
  onMatchRequest?: (data: any) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const onNewMessageRef = useRef(onNewMessage);
  const onNewGroupMessageRef = useRef(onNewGroupMessage);
  const onMatchRequestRef = useRef(onMatchRequest);

  // Keep callback refs updated without triggering reconnect loops
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    onNewGroupMessageRef.current = onNewGroupMessage;
  }, [onNewGroupMessage]);

  useEffect(() => {
    onMatchRequestRef.current = onMatchRequest;
  }, [onMatchRequest]);

  const getWsUrl = useCallback(() => {
    if (!token || typeof window === 'undefined') return null;

    // Use current host for Vite proxy or production reverse proxy
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;

    // Direct backend base if configured and not matching current host
    const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
    if (apiBase && apiBase.startsWith('http')) {
      const wsProtocol = apiBase.startsWith('https') ? 'wss:' : 'ws:';
      const cleanHost = apiBase.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '');
      // If we are running in Vite dev server (host contains :3000), Vite proxy handles /ws seamlessly
      if (host.includes(':3000')) {
        return `${protocol}//${host}/ws?token=${token}`;
      }
      return `${wsProtocol}//${cleanHost}/ws?token=${token}`;
    }

    return `${protocol}//${host}/ws?token=${token}`;
  }, [token]);

  useEffect(() => {
    const wsUrl = getWsUrl();
    if (!token || !wsUrl) return;

    let isSubscribed = true;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let pingInterval: ReturnType<typeof setInterval> | null = null;
    let attempts = 0;

    const connect = () => {
      if (!isSubscribed) return;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isSubscribed) {
            ws.close();
            return;
          }
          console.log('⚡ Connected to Chat WebSocket');
          setIsConnected(true);
          attempts = 0;

          // Ping keepalive every 25 seconds
          if (pingInterval) clearInterval(pingInterval);
          pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, 25000);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'new_message' && data.message) {
              onNewMessageRef.current?.(data.message);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('motohippi_new_message', { detail: data.message }));
              }
            } else if (data.type === 'new_group_message' && data.message) {
              onNewGroupMessageRef.current?.(data.message);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('motohippi_new_group_message', { detail: data.message }));
              }
            } else if (
              data.type === 'new_match_request' ||
              data.type === 'match_request' ||
              data.type === 'new_match'
            ) {
              onMatchRequestRef.current?.(data);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('motohippi_match_request', { detail: data }));
              }
            }
          } catch (err) {
            console.error('❌ Failed to parse WebSocket message', err);
          }
        };

        ws.onclose = () => {
          if (pingInterval) clearInterval(pingInterval);
          if (!isSubscribed) return;

          console.log('🔌 WebSocket disconnected. Retrying...');
          setIsConnected(false);

          // Exponential backoff reconnect: 1.5s, 3s, 6s, max 8s
          const delay = Math.min(1500 * Math.pow(1.5, attempts), 8000);
          attempts += 1;
          reconnectTimeout = setTimeout(connect, delay);
        };

        ws.onerror = (err) => {
          if (isSubscribed) {
            console.warn('⚠️ WebSocket error:', err);
          }
        };
      } catch (err) {
        console.warn('Failed to initialize WebSocket connection:', err);
        const delay = Math.min(2000 * Math.pow(1.5, attempts), 8000);
        attempts += 1;
        reconnectTimeout = setTimeout(connect, delay);
      }
    };

    connect();

    return () => {
      isSubscribed = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (pingInterval) clearInterval(pingInterval);
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
        }
        wsRef.current = null;
      }
    };
  }, [token, getWsUrl]);

  const sendMessage = useCallback((conversationId: number, content: string, messageType: string = 'text') => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'send_message',
          conversationId,
          content,
          messageType,
        })
      );
      return true;
    }
    return false;
  }, []);

  const sendGroupMessage = useCallback((groupId: number, content: string, messageType: string = 'text') => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'send_group_message',
          groupId,
          content,
          messageType,
        })
      );
      return true;
    }
    return false;
  }, []);

  return { isConnected, sendMessage, sendGroupMessage };
}

