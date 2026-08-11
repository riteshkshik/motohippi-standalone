import { useEffect, useRef, useState, useCallback } from 'react';

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  messageType?: string;
  createdAt: string;
}

export function useWebSocketChat(token: string | null, onNewMessage?: (msg: ChatMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const getWsUrl = useCallback(() => {
    let apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';
    if (!apiBase.startsWith('http')) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      return `${protocol}//${host}/ws?token=${token}`;
    }
    const wsProtocol = apiBase.startsWith('https') ? 'wss:' : 'ws:';
    const cleanHost = apiBase.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '');
    return `${wsProtocol}//${cleanHost}/ws?token=${token}`;
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const wsUrl = getWsUrl();
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('⚡ Connected to Chat WebSocket');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message' && data.message) {
          if (onNewMessage) {
            onNewMessage(data.message);
          }
        }
      } catch (err) {
        console.error('❌ Failed to parse WebSocket message', err);
      }
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.error('⚠️ WebSocket error:', err);
    };

    return () => {
      ws.close();
    };
  }, [token, getWsUrl, onNewMessage]);

  const sendMessage = useCallback((conversationId: number, content: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'send_message',
          conversationId,
          content,
        })
      );
      return true;
    }
    return false;
  }, []);

  return { isConnected, sendMessage };
}
