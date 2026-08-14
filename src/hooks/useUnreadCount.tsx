import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocketChat, ChatMessage } from './useWebSocketChat';

interface UnreadCountContextType {
  unreadCount: number;
  refetchUnread: () => Promise<void>;
  decrementUnread: (by?: number) => void;
}

const UnreadCountContext = createContext<UnreadCountContextType>({
  unreadCount: 0,
  refetchUnread: async () => {},
  decrementUnread: () => {},
});

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_API_BASE_URL) {
    const base = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
    return base.endsWith('/api') ? base : `${base}/api`;
  }
  return '/api';
};

const getToken = () =>
  localStorage.getItem('motohippi_token') ||
  sessionStorage.getItem('motohippi_token') ||
  localStorage.getItem('token') ||
  sessionStorage.getItem('token') ||
  '';

export function UnreadCountProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { isLoggedIn, user } = useAuth();
  const token = isLoggedIn ? getToken() : null;

  const fetchUnread = useCallback(async () => {
    const activeToken = getToken();
    if (!activeToken) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await fetch(`${getApiBase()}/conversations/unread-count`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch (err) {
      console.warn('Failed to fetch unread count:', err);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUnread();
    } else {
      setUnreadCount(0);
    }
  }, [isLoggedIn, fetchUnread]);

  // Listen to live incoming WebSocket messages when logged in
  const handleNewMessage = useCallback((msg: ChatMessage) => {
    // Ignore self-sent messages (text or image)
    if (user?.id && msg.senderId === user.id) {
      return;
    }
    // Fetch fresh unread count for incoming messages from other users
    fetchUnread();
  }, [user?.id, fetchUnread]);

  useWebSocketChat(token ? token : null, handleNewMessage);

  const decrementUnread = useCallback((by: number = 1) => {
    setUnreadCount((prev) => Math.max(0, prev - by));
  }, []);

  return (
    <UnreadCountContext.Provider value={{ unreadCount, refetchUnread: fetchUnread, decrementUnread }}>
      {children}
    </UnreadCountContext.Provider>
  );
}

export function useUnreadCount() {
  return useContext(UnreadCountContext);
}
