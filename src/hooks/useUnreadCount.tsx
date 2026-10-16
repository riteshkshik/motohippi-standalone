import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocketChat, ChatMessage, GroupChatMessage } from './useWebSocketChat';
import { playNotificationSound } from '@/lib/sound';

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

const getUserIdFromToken = (tok: string | null): number | null => {
  if (!tok) return null;
  try {
    const decoded = atob(tok);
    const [userId] = decoded.split(':');
    const id = parseInt(userId, 10);
    return isNaN(id) ? null : id;
  } catch {
    return null;
  }
};

export function UnreadCountProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { isLoggedIn, user } = useAuth();
  const token = getToken();

  const lastCountRef = useRef<number>(-1);
  const isInitialMountRef = useRef<boolean>(true);

  const fetchUnread = useCallback(async () => {
    const activeToken = getToken();
    if (!activeToken) {
      setUnreadCount(0);
      lastCountRef.current = 0;
      return;
    }
    try {
      const res = await fetch(`${getApiBase()}/conversations/unread-count`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        const newCount = Number(data.unreadCount ?? 0);

        // If unread count increases in real-time, play notification sound
        if (!isInitialMountRef.current && lastCountRef.current !== -1 && newCount > lastCountRef.current) {
          playNotificationSound();
        }

        lastCountRef.current = newCount;
        isInitialMountRef.current = false;
        setUnreadCount(newCount);
      }
    } catch (err) {
      console.warn('Failed to fetch unread count:', err);
    }
  }, []);

  // Sync unread count and set up 5s polling + tab visibility/focus sync
  useEffect(() => {
    const activeToken = getToken();
    if (!activeToken && !isLoggedIn) {
      setUnreadCount(0);
      lastCountRef.current = 0;
      return;
    }

    // Initial fetch
    fetchUnread();

    // 5-second polling interval ensures real-time sync even without WebSocket
    const interval = setInterval(() => {
      fetchUnread();
    }, 5000);

    const handleSync = () => {
      if (document.visibilityState === 'visible') {
        fetchUnread();
      }
    };

    document.addEventListener('visibilitychange', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [isLoggedIn, fetchUnread]);

  // Listen to live incoming direct chat messages
  const handleNewMessage = useCallback(
    (msg: ChatMessage) => {
      const currentId = user?.id ?? getUserIdFromToken(getToken());
      // Ignore self-sent messages
      if (currentId && Number(msg.senderId) === Number(currentId)) {
        return;
      }
      playNotificationSound();
      fetchUnread();
    },
    [user?.id, fetchUnread]
  );

  // Listen to live incoming group chat messages
  const handleNewGroupMessage = useCallback(
    (msg: GroupChatMessage) => {
      const currentId = user?.id ?? getUserIdFromToken(getToken());
      if (currentId && Number(msg.senderId) === Number(currentId)) {
        return;
      }
      playNotificationSound();
      fetchUnread();
    },
    [user?.id, fetchUnread]
  );

  // Listen to incoming match / hippi requests
  const handleMatchRequest = useCallback(() => {
    playNotificationSound();
    fetchUnread();
  }, [fetchUnread]);

  useEffect(() => {
    const onMatchEvent = () => {
      playNotificationSound();
      fetchUnread();
    };
    window.addEventListener('motohippi_match_request', onMatchEvent);
    return () => window.removeEventListener('motohippi_match_request', onMatchEvent);
  }, [fetchUnread]);

  useWebSocketChat(token ? token : null, handleNewMessage, handleNewGroupMessage, handleMatchRequest);

  const decrementUnread = useCallback((by: number = 1) => {
    setUnreadCount((prev) => {
      const next = Math.max(0, prev - by);
      lastCountRef.current = next;
      return next;
    });
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

