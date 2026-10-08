import React, { useState, useEffect, useRef } from 'react';
import { useGetConversations, useListMessages, useSendMessage, useGetMatches } from '@workspace/api-client-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Send, Search, Info, ChevronLeft, MessageCircle, Users, Check, X, Heart, Sparkles,
  Image as ImageIcon, Loader2, Maximize2, Plus, Shield, Lock, Crown, MapPin, UserPlus
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useWebSocketChat, ChatMessage, GroupChatMessage } from '@/hooks/useWebSocketChat';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { RequesterProfileModal, RequesterUser } from '@/components/RequesterProfileModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import CreateGroupModal from '@/components/CreateGroupModal';

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_API_BASE_URL) {
    const base = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
    return base.endsWith('/api') ? base : `${base}/api`;
  }
  return '/api';
};
const API_BASE = getApiBase();

const getToken = () =>
  localStorage.getItem('motohippi_token') ||
  sessionStorage.getItem('motohippi_token') ||
  localStorage.getItem('token') ||
  sessionStorage.getItem('token') ||
  '';

const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Pending Ride Request Card Banner ──────────────────────────────────────────
function PendingRequestsBanner({ onAccept }: { onAccept: (convId: number) => void }) {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<{ requester: RequesterUser; requestId: number } | null>(null);

  const fetchPending = async () => {
    try {
      const res = await fetch(`${API_BASE}/matches/pending`, {
        headers: { ...getAuthHeaders() },
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAccept = async (reqId: number) => {
    try {
      const res = await fetch(`${API_BASE}/matches/${reqId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to accept');

      setRequests((prev) => prev.filter((r) => r.id !== reqId));
      toast({
        title: '🎉 Match Accepted!',
        description: `You matched with ${data.requester?.name || 'this rider'}! Start chatting now.`,
      });

      if (data.conversationId) {
        onAccept(data.conversationId);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Could not accept match request',
        variant: 'destructive',
      });
    }
  };

  const handleDecline = async (reqId: number) => {
    try {
      await fetch(`${API_BASE}/matches/${reqId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
      });
      setRequests((prev) => prev.filter((r) => r.id !== reqId));
      toast({ title: 'Request Declined', description: 'Match request was removed.' });
    } catch {
      // ignore
    }
  };

  if (loading || !requests.length) return null;

  return (
    <div className="p-3 border-b border-primary/20 bg-primary/5 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Sparkles size={12} /> Ride Requests ({requests.length})
        </p>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
        {requests.map((req) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-card/90 border border-white/10 rounded-2xl space-y-2.5 shadow-lg"
          >
            <div
              onClick={() => setSelectedProfile({ requester: req.requester, requestId: req.id })}
              className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Avatar className="h-10 w-10 border border-primary/40 shrink-0">
                <AvatarImage src={req.requester?.avatarUrl ?? ''} />
                <AvatarFallback>{req.requester?.name?.charAt(0) ?? 'R'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white leading-tight truncate">
                  <span className="text-primary hover:underline">{req.requester?.name}</span> liked your profile!
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  🏍️ {req.requester?.vehicleType || 'Motorcycle rider'} • {req.requester?.city || 'India'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccept(req.id);
                }}
                size="sm"
                className="flex-1 h-8 bg-primary text-black font-black text-xs hover:bg-primary/90 rounded-xl"
              >
                <Check size={13} className="mr-1" /> Accept Request
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDecline(req.id);
                }}
                size="sm"
                variant="outline"
                className="flex-1 h-8 border-white/10 text-muted-foreground text-xs hover:border-red-500/30 hover:text-red-400 rounded-xl"
              >
                <X size={13} className="mr-1" /> Decline
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Rider Profile Preview Modal */}
      <RequesterProfileModal
        requester={selectedProfile?.requester || null}
        requestId={selectedProfile?.requestId || null}
        onClose={() => setSelectedProfile(null)}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </div>
  );
}

// ─── Group Join Request Card ───────────────────────────────────────────────────
function GroupJoinRequestCard({ payload, conversationId }: { payload: string; conversationId: number }) {
  const { toast } = useToast();
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');

  let data: any = {};
  try { data = JSON.parse(payload); } catch { return null; }

  const { groupId, groupName, groupLogoUrl, requesterId, requesterName, requesterAvatar } = data;

  const accept = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`${API_BASE}/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({ userId: requesterId }),
      });
      setStatus('accepted');
      toast({ title: '✅ Accepted!', description: `${requesterName} has been added to ${groupName}.` });
    } catch {
      toast({ title: 'Error', description: 'Could not accept the request. Try again.' });
    }
  };

  const decline = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus('declined');
    toast({ title: 'Request declined', description: `${requesterName}'s request was declined.` });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="mx-3 my-2 rounded-2xl border border-primary/20 bg-primary/5 p-3.5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10 border border-white/15">
            <AvatarImage src={requesterAvatar ?? ''} />
            <AvatarFallback>{requesterName?.charAt(0) ?? '?'}</AvatarFallback>
          </Avatar>
          {groupLogoUrl ? (
            <img src={groupLogoUrl} alt={groupName}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md border border-background object-cover bg-card" />
          ) : (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md border border-background bg-card flex items-center justify-center">
              <Users size={10} className="text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-tight">
            <span className="text-primary">{requesterName}</span> wants to join
          </p>
          <p className="text-xs text-white/50 truncate">🏍️ {groupName}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === 'pending' ? (
          <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex gap-2">
            <motion.button whileTap={{ scale: 0.96 }} onClick={accept}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-black text-xs font-black">
              <Check size={13} /> Accept
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={decline}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-white/10 text-white/50 text-xs font-semibold hover:border-red-500/30 hover:text-red-400 transition-colors">
              <X size={13} /> Decline
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`text-center text-xs font-bold py-2 rounded-xl ${
              status === 'accepted' ? 'text-primary bg-primary/10' : 'text-white/35 bg-white/5'
            }`}>
            {status === 'accepted' ? '✅ Member added' : '✗ Declined'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Match Banner (top of conversations list) ─────────────────────────────────
function MatchesBanner({ onOpen, searchQuery = '' }: { onOpen: (convId: number) => void; searchQuery?: string }) {
  const { data: matches } = useGetMatches();
  const matchesList = Array.isArray(matches) ? matches : [];
  const query = searchQuery.trim().toLowerCase();

  const filtered = matchesList.filter(m => {
    if (!query) return true;
    const name = (m.user as any)?.name?.toLowerCase() || '';
    return name.includes(query);
  });

  const recent = filtered.slice(0, 5);
  if (!recent.length) return null;

  return (
    <div className="px-3 py-3 border-b border-white/5">
      <p className="text-[11px] font-black uppercase tracking-wider text-primary/70 mb-2 flex items-center gap-1">
        <Heart size={11} className="fill-primary" /> Active Matches
      </p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {recent.map(m => (
          <motion.button
            key={m.id}
            onClick={() => m.conversationId && onOpen(m.conversationId)}
            whileTap={{ scale: 0.92 }}
            className="flex flex-col items-center gap-1 shrink-0"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary shadow-[0_0_10px_rgba(214,255,47,0.25)]">
                {(m.user as any)?.avatarUrl
                  ? <img src={(m.user as any).avatarUrl} alt={(m.user as any).name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">{((m.user as any)?.name?.[0] ?? '?').toUpperCase()}</div>
                }
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center border border-background">
                <span className="text-[8px]">❤️</span>
              </div>
            </div>
            <p className="text-[10px] font-semibold text-white/70 truncate w-14 text-center">
              {(m.user as any)?.name?.split(' ')[0]}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Messages Page ─────────────────────────────────────────────────────────────
export default function Messages() {
  const { data: conversations, isLoading: convLoading, refetch: refetchConvs } = useGetConversations();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch groups where user is a member
  const { data: myGroups, isLoading: groupsLoading, refetch: refetchGroups } = useQuery({
    queryKey: ['myGroupChats'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/groups/my-chats`, {
        headers: { ...getAuthHeaders() },
        credentials: 'include',
      });
      if (!res.ok) return [];
      return (await res.json()) as any[];
    },
    refetchInterval: 15000,
  });

  const myGroupsList = Array.isArray(myGroups) ? myGroups : [];
  const conversationsList = Array.isArray(conversations) ? conversations : [];

  const totalDirectUnread = conversationsList.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const totalGroupUnread = myGroupsList.reduce((acc, g) => acc + (g.unreadCount || 0), 0);

  const filteredConversations = conversationsList.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const name = conv.participant?.name?.toLowerCase() || '';
    const lastMsg = conv.lastMessage?.toLowerCase() || '';
    return name.includes(query) || lastMsg.includes(query);
  });

  const filteredGroups = myGroupsList.filter((g) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const name = g.name?.toLowerCase() || '';
    const lastMsg = g.lastMessage?.toLowerCase() || '';
    const city = g.city?.toLowerCase() || '';
    return name.includes(query) || lastMsg.includes(query) || city.includes(query);
  });

  // Support deep-link: /messages?conv=123 or /messages?groupId=123
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const convId = params.get('conv');
    const grpId = params.get('groupId') || params.get('group');
    if (grpId) {
      setActiveGroupId(parseInt(grpId, 10));
      setActiveId(null);
      setActiveTab('groups');
    } else if (convId) {
      setActiveId(parseInt(convId, 10));
      setActiveGroupId(null);
      setActiveTab('direct');
    }
  }, []);

  // Listen to popstate (browser back/forward button or URL updates)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const convId = params.get('conv');
      const grpId = params.get('groupId') || params.get('group');
      if (grpId) {
        setActiveGroupId(parseInt(grpId, 10));
        setActiveId(null);
        setActiveTab('groups');
      } else if (convId) {
        setActiveId(parseInt(convId, 10));
        setActiveGroupId(null);
        setActiveTab('direct');
      } else {
        setActiveId(null);
        setActiveGroupId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Track iOS Visual Viewport height to keep chat input flush with keyboard
  const [visualViewportHeight, setVisualViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const handleResize = () => {
      if (window.visualViewport) {
        setVisualViewportHeight(window.visualViewport.height);
      }
    };

    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);
    handleResize();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  const openDirectChat = (id: number) => {
    setActiveId(id);
    setActiveGroupId(null);
    setActiveTab('direct');
    window.history.replaceState(null, '', `/messages?conv=${id}`);
    window.dispatchEvent(new Event('popstate'));
  };

  const openGroupChat = (id: number) => {
    setActiveGroupId(id);
    setActiveId(null);
    setActiveTab('groups');
    window.history.replaceState(null, '', `/messages?group=${id}`);
    window.dispatchEvent(new Event('popstate'));
  };

  const closeChat = () => {
    setActiveId(null);
    setActiveGroupId(null);
    window.history.replaceState(null, '', '/messages');
    window.dispatchEvent(new Event('popstate'));
  };

  const handleAcceptMatch = (convId: number) => {
    openDirectChat(convId);
    refetchConvs();
  };

  const handleStartDirectChat = async (targetUserId: number) => {
    if (targetUserId === user?.id) return;
    try {
      const res = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({ otherUserId: targetUserId }),
      });
      if (res.ok) {
        const conv = await res.json();
        openDirectChat(conv.id);
        refetchConvs();
      }
    } catch {
      // Ignore
    }
  };

  const isChatOpen = !!activeId || !!activeGroupId;

  // Prevent background scrolling on iOS when chat is open
  useEffect(() => {
    if (isChatOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isChatOpen]);

  return (
    <div className={`flex ${isChatOpen ? 'h-[100dvh]' : 'h-[calc(100dvh-3.5rem-5rem)]'} md:h-svh overflow-hidden`}>
      {/* Conversations / Groups Sidebar */}
      <div className={`w-full md:w-80 border-r border-white/5 bg-background flex flex-col ${isChatOpen ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/5 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white tracking-tight">Messages</h2>
            <Button
              onClick={() => setCreateGroupOpen(true)}
              size="sm"
              className="h-8 px-3 rounded-full bg-primary text-black font-black text-xs hover:bg-primary/90 flex items-center gap-1 shadow-[0_0_12px_rgba(214,255,47,0.2)]"
            >
              <Plus size={14} /> New Group
            </Button>
          </div>

          {/* Direct vs Groups Segmented Control */}
          <div className="flex rounded-xl bg-card/70 p-1 border border-white/8">
            <button
              type="button"
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'direct'
                  ? 'bg-primary text-black shadow-sm font-black'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              <MessageCircle size={13} />
              <span>Direct</span>
              {totalDirectUnread > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'direct' ? 'bg-black text-primary' : 'bg-primary text-black'}`}>
                  {totalDirectUnread}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('groups')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'groups'
                  ? 'bg-primary text-black shadow-sm font-black'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Users size={13} />
              <span>Groups</span>
              {totalGroupUnread > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'groups' ? 'bg-black text-primary' : 'bg-primary text-black'}`}>
                  {totalGroupUnread}
                </span>
              )}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'direct' ? "Search messages or riders..." : "Search group chats..."}
              className="pl-9 pr-9 bg-card/50 border-white/10 rounded-full h-10 text-xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
        </div>

        {/* ── Direct Chat Tab Content ────────────────────────────────────────── */}
        {activeTab === 'direct' && (
          <>
            {/* Pending Ride Request Card Banner */}
            <PendingRequestsBanner onAccept={handleAcceptMatch} />

            {/* Match bubbles */}
            <MatchesBanner onOpen={openDirectChat} searchQuery={searchQuery} />

            <div className="flex-1 overflow-y-auto no-scrollbar p-2">
              {convLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-3 p-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))
              ) : filteredConversations.map(conv => {
                let isJoinReq = false;
                try {
                  const parsed = JSON.parse(conv.lastMessage ?? '');
                  if (parsed?.type === 'group_join_request') isJoinReq = true;
                } catch { /* plain text */ }

                const isSelected = activeId === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => openDirectChat(conv.id)}
                    className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 hover:bg-white/5 transition-all mb-1 ${
                      isSelected ? 'bg-primary/15 border border-primary/25 shadow-sm' : 'border border-transparent'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12 border border-white/10">
                        <AvatarImage src={conv.participant?.avatarUrl || ''} />
                        <AvatarFallback>{conv.participant?.name?.charAt(0) ?? 'U'}</AvatarFallback>
                      </Avatar>
                      {conv.unreadCount ? (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background animate-pulse" />
                      ) : null}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-primary' : 'text-white'}`}>
                          {conv.participant?.name}
                        </h4>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {new Date(conv.lastMessageAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${conv.unreadCount ? 'text-white font-semibold' : 'text-muted-foreground'}`}>
                        {isJoinReq ? '🏍️ Join request' : (conv.lastMessage || 'Say hello!')}
                      </p>
                    </div>
                  </button>
                );
              })}
              {filteredConversations.length === 0 && !convLoading && (
                <div className="text-center p-8 text-muted-foreground text-sm">
                  {searchQuery ? 'No matching conversations found.' : 'No direct conversations yet.'}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Groups Tab Content ─────────────────────────────────────────────── */}
        {activeTab === 'groups' && (
          <div className="flex-1 overflow-y-auto no-scrollbar p-2">
            {groupsLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex gap-3 p-3">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))
            ) : filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">No Group Chats Yet</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    Create a group for your riding club or join an existing community.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full mt-2">
                  <Button
                    onClick={() => setCreateGroupOpen(true)}
                    size="sm"
                    className="w-full h-9 rounded-full bg-primary text-black font-black text-xs hover:bg-primary/90 shadow-[0_0_12px_rgba(214,255,47,0.2)]"
                  >
                    <Plus size={13} className="mr-1" /> Create a Group
                  </Button>
                </div>

              </div>
            ) : (
              filteredGroups.map((group) => {
                const isSelected = activeGroupId === group.id;

                return (
                  <button
                    key={group.id}
                    onClick={() => openGroupChat(group.id)}
                    className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 hover:bg-white/5 transition-all mb-1 ${
                      isSelected ? 'bg-primary/15 border border-primary/25 shadow-sm' : 'border border-transparent'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-card border border-white/10 overflow-hidden flex items-center justify-center">
                        {group.logoUrl ? (
                          <img src={group.logoUrl} alt={group.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary">
                            <Shield size={20} />
                          </div>
                        )}
                      </div>
                      {group.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black rounded-full text-[10px] font-black flex items-center justify-center border-2 border-background shadow-md">
                          {group.unreadCount > 9 ? '9+' : group.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-primary' : 'text-white'}`}>
                            {group.name}
                          </h4>
                          {group.type === 'private' && (
                            <Lock size={11} className="text-amber-400 shrink-0" />
                          )}
                        </div>
                        {group.lastMessageAt && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {new Date(group.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${group.unreadCount > 0 ? 'text-white font-medium' : 'text-muted-foreground'}`}>
                        {group.lastMessage || 'Start the ride conversation!'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-primary/70 flex items-center gap-1">
                          <Users size={10} /> {group.membersCount || 1} riders
                        </span>
                        {group.city && (
                          <span className="text-[10px] text-muted-foreground/60">
                            • {group.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Chat Area with MotoHippi Doodle Wallpaper */}
      <div
        className={`flex flex-col relative overflow-hidden bg-background ${
          isChatOpen
            ? 'fixed inset-0 z-[60] flex md:static md:flex-1 md:z-auto'
            : 'hidden md:flex md:flex-1'
        }`}
        style={
          isChatOpen && visualViewportHeight
            ? { height: `${visualViewportHeight}px`, maxHeight: `${visualViewportHeight}px` }
            : undefined
        }
      >
        {/* Doodle Wallpaper Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-20 select-none"
          style={{ backgroundImage: `url('/chat_bg.png')` }}
        />
        {/* Ambient Dark Overlay for High Contrast */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* Content Container (Layered above wallpaper) */}
        <div className="relative z-0 flex-1 flex flex-col h-full overflow-hidden">
          {activeGroupId ? (
            <GroupChatView
              groupId={activeGroupId}
              onBack={closeChat}
              onStartDirectChat={handleStartDirectChat}
            />
          ) : activeId ? (
            <ChatView conversationId={activeId} onBack={closeChat} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner backdrop-blur-sm">
                <MessageCircle size={32} className="opacity-40 text-primary" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-white font-bold text-base">Select a conversation or group</p>
                <p className="text-xs text-muted-foreground">Start chatting with fellow riders or community clubs</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        open={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        onCreated={(id) => {
          setCreateGroupOpen(false);
          openGroupChat(id);
          refetchGroups();
        }}
      />
    </div>
  );
}


// ─── Chat View with Real-Time WebSocket Support ─────────────────────────────────
function ChatView({ conversationId, onBack }: { conversationId: number; onBack: () => void }) {
  const { data: initialMessages, isLoading } = useListMessages(conversationId);
  const sendMutation = useSendMessage(conversationId);
  const { refetchUnread } = useUnreadCount();
  const { toast } = useToast();
  const [messagesList, setMessagesList] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: conversations } = useGetConversations();

  const conversationsList = Array.isArray(conversations) ? conversations : [];
  const conversation = conversationsList.find(c => c.id === conversationId);
  const token = getToken();

  // Handle incoming real-time WebSocket messages
  const handleNewMessage = (msg: ChatMessage) => {
    if (msg.conversationId === conversationId) {
      setMessagesList((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // Mark as read immediately when user is in active chat
      refetchUnread();
    }
  };

  const { isConnected, sendMessage } = useWebSocketChat(token, handleNewMessage);

  useEffect(() => {
    if (Array.isArray(initialMessages)) {
      setMessagesList([...initialMessages].reverse());
      // Refetch unread count when messages are fetched (backend auto-marks them read)
      refetchUnread();
    }
  }, [initialMessages, refetchUnread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesList]);

  const sendImageMessage = (s3Url: string) => {
    const sentViaWs = sendMessage(conversationId, s3Url, 'image');
    if (!sentViaWs) {
      sendMutation.mutate({ data: { content: s3Url, messageType: 'image' } }, {
        onSuccess: (data: any) => {
          if (data) {
            setMessagesList((prev) => [...prev, data]);
          }
        },
      });
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Image size is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Maximum allowed size is 3 MB.`,
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image: base64, folder: 'chat_images' }),
        });

        const data = await res.json();
        setIsUploadingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = '';

        if (!res.ok || !data.url) {
          toast({
            title: "Upload Failed",
            description: data.error || data.message || "Failed to upload image to S3",
            variant: "destructive",
          });
          return;
        }

        // Send message with AWS S3 URL
        sendImageMessage(data.url);
      };
      reader.onerror = () => {
        setIsUploadingImage(false);
        toast({ title: "Error", description: "Failed to read image file", variant: "destructive" });
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploadingImage(false);
      toast({ title: "Upload Failed", description: err.message || "Failed to upload image", variant: "destructive" });
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = text.trim();
    if (!cleanText) return;

    // Try WebSocket real-time send first
    const sentViaWs = sendMessage(conversationId, cleanText, 'text');
    if (!sentViaWs) {
      // Fallback to HTTP POST
      sendMutation.mutate({ data: { content: cleanText, messageType: 'text' } }, {
        onSuccess: (data: any) => {
          if (data) {
            setMessagesList((prev) => [...prev, data]);
          }
        },
      });
    }
    setText('');
  };

  return (
    <>
      {/* Header */}
      <div className="min-h-16 border-b border-white/5 bg-background/85 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-10 shrink-0 pt-[env(safe-area-inset-top)] box-content">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={onBack}>
            <ChevronLeft size={24} />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-white/10">
              <AvatarImage src={conversation?.participant?.avatarUrl ?? ''} />
              <AvatarFallback>{conversation?.participant?.name?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">{conversation?.participant?.name ?? 'Conversation'}</h3>
                {isConnected && (
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" title="Connected to WebSocket" />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">
                {isConnected ? '⚡ Live WebSocket' : 'Rider'}
              </p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full"><Info size={20} /></Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-3">
        {isLoading && <div className="text-center text-muted-foreground text-sm py-8">Loading messages...</div>}

        {messagesList.map((msg, index) => {
          let isJoinReq = false;
          try {
            const parsed = JSON.parse(msg.content);
            if (parsed?.type === 'group_join_request') isJoinReq = true;
          } catch { /* plain text */ }

          if (isJoinReq) {
            return (
              <GroupJoinRequestCard key={msg.id || index} payload={msg.content} conversationId={conversationId} />
            );
          }

          // Determine if message is an image
          const isImageMsg = msg.messageType === 'image' || (typeof msg.content === 'string' && msg.content.startsWith('http') && (msg.content.includes('chat_images') || msg.content.match(/\.(jpeg|jpg|gif|png|webp)/i)));

          // Determine if sender is current logged in user
          const isMe = msg.senderId !== conversation?.participant?.id;

          return (
            <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] md:max-w-[65%] rounded-2xl ${
                isImageMsg ? 'p-0 bg-transparent' : 'px-4 py-2.5 text-sm leading-relaxed'
              } ${
                isMe
                  ? isImageMsg ? 'rounded-tr-sm' : 'bg-primary text-black rounded-tr-sm font-medium shadow-[0_0_12px_rgba(214,255,47,0.15)]'
                  : isImageMsg ? 'rounded-tl-sm' : 'bg-[#18181b]/90 text-white rounded-tl-sm border border-white/10 backdrop-blur-sm shadow-md'
              }`}>
                {isImageMsg ? (
                  <div className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                    <img
                      src={msg.content}
                      alt="Shared Image"
                      onClick={() => setLightboxImageUrl(msg.content)}
                      className="max-h-[320px] w-full object-cover rounded-2xl cursor-pointer hover:opacity-95 transition-all block"
                    />
                    <button
                      type="button"
                      onClick={() => setLightboxImageUrl(msg.content)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                    >
                      <Maximize2 size={14} />
                    </button>
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-[10px] text-white/90 font-medium border border-white/10 shadow-md pointer-events-none">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ) : (
                  <>
                    {msg.content}
                    <div className={`text-[10px] mt-1 px-1 opacity-60 ${isMe ? 'text-right text-black/70' : 'text-left text-white/50'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-background/85 backdrop-blur-md border-t border-white/5 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={isUploadingImage}
            onClick={() => fileInputRef.current?.click()}
            className="h-12 w-12 rounded-full shrink-0 border-white/10 bg-white/5 hover:bg-white/10 text-white"
            title="Send Image (Max 3MB)"
          >
            {isUploadingImage ? <Loader2 size={18} className="animate-spin text-primary" /> : <ImageIcon size={18} />}
          </Button>

          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={isUploadingImage ? "Uploading image to S3..." : "Type a message..."}
            disabled={isUploadingImage}
            className="flex-1 bg-card/50 border-white/10 rounded-full h-12 px-4 text-base md:text-sm"
          />
          <Button
            type="submit"
            disabled={!text.trim() || isUploadingImage}
            size="icon"
            className="h-12 w-12 rounded-full shrink-0 shadow-lg shadow-primary/20 bg-primary text-black font-bold hover:bg-primary/90"
          >
            <Send size={18} className="ml-0.5" />
          </Button>
        </form>
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      <AnimatePresence>
        {lightboxImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImageUrl(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setLightboxImageUrl(null)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
              <img
                src={lightboxImageUrl}
                alt="Enlarged preview"
                className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Group Chat View with Real-Time WebSocket & Member Attribution ──────────────
function GroupChatView({
  groupId,
  onBack,
  onStartDirectChat,
}: {
  groupId: number;
  onBack: () => void;
  onStartDirectChat: (userId: number) => void;
}) {
  const { user } = useAuth();
  const token = getToken();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [messagesList, setMessagesList] = useState<GroupChatMessage[]>([]);
  const [text, setText] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [searchRiderQuery, setSearchRiderQuery] = useState('');
  const [searchingRiders, setSearchingRiders] = useState(false);
  const [riderSearchResults, setRiderSearchResults] = useState<any[]>([]);
  const [addingUserId, setAddingUserId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Debounced search for riders to add
  useEffect(() => {
    if (searchRiderQuery.trim().length < 2) {
      setRiderSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearchingRiders(true);
      try {
        const res = await fetch(`${API_BASE}/users/search?q=${encodeURIComponent(searchRiderQuery)}`, {
          headers: { ...getAuthHeaders() },
          credentials: 'include',
        });
        if (res.ok) {
          const d = await res.json();
          setRiderSearchResults(Array.isArray(d) ? d : []);
        }
      } catch {
        // ignore
      } finally {
        setSearchingRiders(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchRiderQuery]);

  const handleAddMember = async (targetUser: any) => {
    setAddingUserId(targetUser.id);
    try {
      const res = await fetch(`${API_BASE}/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({ userId: targetUser.id, role: 'member' }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add member');
      }
      toast({
        title: '🎉 Rider Added!',
        description: `${targetUser.name} has been added to ${groupDetails?.name || 'the group'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupDetails', groupId] });
      queryClient.invalidateQueries({ queryKey: ['myGroupChats'] });
    } catch (err: any) {
      toast({
        title: 'Could not add rider',
        description: err?.message || 'Failed to add rider to group',
        variant: 'destructive',
      });
    } finally {
      setAddingUserId(null);
    }
  };


  // 1. Fetch Group Details
  const { data: groupDetails } = useQuery({
    queryKey: ['groupDetails', groupId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/groups/${groupId}`, {
        headers: { ...getAuthHeaders() },
        credentials: 'include',
      });
      if (!res.ok) return null;
      return await res.json();
    },
  });

  // 2. Fetch Group Members
  const { data: groupMembers } = useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/groups/${groupId}/members`, {
        headers: { ...getAuthHeaders() },
        credentials: 'include',
      });
      if (!res.ok) return [];
      return (await res.json()) as any[];
    },
  });

  // 3. Handle incoming group WebSocket message
  const handleNewGroupMessage = (msg: GroupChatMessage) => {
    if (msg.groupId === groupId) {
      setMessagesList((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // Invalidate sidebar groups query to update lastMessage and reset unread
      queryClient.invalidateQueries({ queryKey: ['myGroupChats'] });
    }
  };

  const { isConnected, sendGroupMessage } = useWebSocketChat(token, undefined, handleNewGroupMessage);

  // 4. Fetch initial message history
  const fetchGroupMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const res = await fetch(`${API_BASE}/groups/${groupId}/messages`, {
        headers: { ...getAuthHeaders() },
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setMessagesList([...data].reverse());
          queryClient.invalidateQueries({ queryKey: ['myGroupChats'] });
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchGroupMessages();
  }, [groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesList]);

  // 5. Send Image
  const handleSendImage = (s3Url: string) => {
    const sentViaWs = sendGroupMessage(groupId, s3Url, 'image');
    if (!sentViaWs) {
      fetch(`${API_BASE}/groups/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({ content: s3Url, messageType: 'image' }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.id) {
            setMessagesList((prev) => [...prev, data]);
            queryClient.invalidateQueries({ queryKey: ['myGroupChats'] });
          }
        })
        .catch(() => {});
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Image size is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Maximum allowed size is 3 MB.`,
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image: base64, folder: 'chat_images' }),
        });

        const data = await res.json();
        setIsUploadingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = '';

        if (!res.ok || !data.url) {
          toast({
            title: "Upload Failed",
            description: data.error || data.message || "Failed to upload image to S3",
            variant: "destructive",
          });
          return;
        }

        handleSendImage(data.url);
      };
      reader.onerror = () => {
        setIsUploadingImage(false);
        toast({ title: "Error", description: "Failed to read image file", variant: "destructive" });
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploadingImage(false);
      toast({ title: "Upload Failed", description: err.message || "Failed to upload image", variant: "destructive" });
    }
  };

  // 6. Send Text
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = text.trim();
    if (!cleanText) return;

    const sentViaWs = sendGroupMessage(groupId, cleanText, 'text');
    if (!sentViaWs) {
      fetch(`${API_BASE}/groups/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({ content: cleanText, messageType: 'text' }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.id) {
            setMessagesList((prev) => [...prev, data]);
            queryClient.invalidateQueries({ queryKey: ['myGroupChats'] });
          }
        })
        .catch(() => {});
    }
    setText('');
  };

  const membersList = Array.isArray(groupMembers) ? groupMembers : [];

  return (
    <>
      {/* Group Chat Top Bar */}
      <div className="min-h-16 border-b border-white/5 bg-background/85 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-10 shrink-0 pt-[env(safe-area-inset-top)] box-content">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={onBack}>
            <ChevronLeft size={24} />
          </Button>

          <div
            onClick={() => setShowMembersDrawer(true)}
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 rounded-2xl bg-card border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
              {groupDetails?.logoUrl ? (
                <img src={groupDetails.logoUrl} alt={groupDetails.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary">
                  <Shield size={18} />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white truncate max-w-[200px] md:max-w-xs">
                  {groupDetails?.name ?? 'Group Chat'}
                </h3>
                {isConnected && (
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" title="Connected to WebSocket" />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                <span className="text-primary font-bold">{membersList.length || groupDetails?.membersCount || 1} riders</span>
                <span>•</span>
                <span>Click for details</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowAddMemberModal(true)}
            className="h-8 px-3 rounded-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(214,255,47,0.15)]"
          >
            <UserPlus size={14} /> Add Riders
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMembersDrawer(true)}
            className="rounded-full hover:bg-white/5 text-muted-foreground hover:text-white"
            title="Group Members & Info"
          >
            <Users size={19} />
          </Button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-3.5">
        {isLoadingMessages && (
          <div className="text-center text-muted-foreground text-sm py-8 flex flex-col items-center gap-2">
            <Loader2 size={20} className="animate-spin text-primary" />
            <span>Loading group messages...</span>
          </div>
        )}

        {messagesList.length === 0 && !isLoadingMessages && (
          <div className="flex-1 flex items-center justify-center flex-col gap-3 py-16 text-center">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Users size={28} />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Welcome to {groupDetails?.name || 'the group'}!</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Say hello, plan weekend rides, or share photos from your recent road trips.
              </p>
            </div>
          </div>
        )}

        {messagesList.map((msg, index) => {
          const isImageMsg =
            msg.messageType === 'image' ||
            (typeof msg.content === 'string' &&
              msg.content.startsWith('http') &&
              (msg.content.includes('chat_images') || msg.content.match(/\.(jpeg|jpg|gif|png|webp)/i)));

          const isMe = msg.senderId === user?.id;

          return (
            <div key={msg.id || index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {/* Sender Name Attribution (for incoming group messages) */}
              {!isMe && (
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <Avatar className="h-4 w-4 border border-white/10 shrink-0">
                    <AvatarImage src={msg.sender?.avatarUrl ?? ''} />
                    <AvatarFallback className="text-[8px] bg-primary/20 text-primary">
                      {msg.sender?.name?.charAt(0) ?? 'R'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-black text-primary leading-none">
                    {msg.sender?.name ?? 'Rider'}
                  </span>
                  {msg.sender?.vehicleType && (
                    <span className="text-[10px] text-muted-foreground/70 font-medium">
                      • {msg.sender.vehicleType}
                    </span>
                  )}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] md:max-w-[65%] rounded-2xl ${
                  isImageMsg ? 'p-0 bg-transparent' : 'px-4 py-2.5 text-sm leading-relaxed'
                } ${
                  isMe
                    ? isImageMsg
                      ? 'rounded-tr-sm'
                      : 'bg-primary text-black rounded-tr-sm font-medium shadow-[0_0_12px_rgba(214,255,47,0.15)]'
                    : isImageMsg
                    ? 'rounded-tl-sm'
                    : 'bg-[#18181b]/90 text-white rounded-tl-sm border border-white/10 backdrop-blur-sm shadow-md'
                }`}
              >
                {isImageMsg ? (
                  <div className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                    <img
                      src={msg.content}
                      alt="Shared Image"
                      onClick={() => setLightboxImageUrl(msg.content)}
                      className="max-h-[320px] w-full object-cover rounded-2xl cursor-pointer hover:opacity-95 transition-all block"
                    />
                    <button
                      type="button"
                      onClick={() => setLightboxImageUrl(msg.content)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                    >
                      <Maximize2 size={14} />
                    </button>
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-[10px] text-white/90 font-medium border border-white/10 shadow-md pointer-events-none">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <div
                      className={`text-[10px] mt-1 px-1 opacity-60 ${
                        isMe ? 'text-right text-black/70' : 'text-left text-white/50'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-background/85 backdrop-blur-md border-t border-white/5 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={isUploadingImage}
            onClick={() => fileInputRef.current?.click()}
            className="h-12 w-12 rounded-full shrink-0 border-white/10 bg-white/5 hover:bg-white/10 text-white"
            title="Share Ride Image (Max 3MB)"
          >
            {isUploadingImage ? <Loader2 size={18} className="animate-spin text-primary" /> : <ImageIcon size={18} />}
          </Button>

          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isUploadingImage ? "Uploading to S3..." : `Message ${groupDetails?.name || 'group'}...`}
            disabled={isUploadingImage}
            className="flex-1 bg-card/50 border-white/10 rounded-full h-12 px-4 text-base md:text-sm"
          />
          <Button
            type="submit"
            disabled={!text.trim() || isUploadingImage}
            size="icon"
            className="h-12 w-12 rounded-full shrink-0 shadow-lg shadow-primary/20 bg-primary text-black font-bold hover:bg-primary/90"
          >
            <Send size={18} className="ml-0.5" />
          </Button>
        </form>
      </div>

      {/* Members Drawer */}
      <AnimatePresence>
        {showMembersDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
            onClick={() => setShowMembersDrawer(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-sm bg-background border-l border-white/10 h-full flex flex-col p-6 overflow-y-auto no-scrollbar shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="font-black text-lg text-white">Group Info</h3>
                <button
                  onClick={() => setShowMembersDrawer(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Group Banner & Identity */}
              <div className="mt-4 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-card border-2 border-primary/30 overflow-hidden shadow-xl mb-3 flex items-center justify-center">
                  {groupDetails?.logoUrl ? (
                    <img src={groupDetails.logoUrl} alt={groupDetails.name} className="w-full h-full object-cover" />
                  ) : (
                    <Shield size={36} className="text-primary" />
                  )}
                </div>
                <h4 className="font-black text-lg text-white leading-tight">{groupDetails?.name}</h4>
                {groupDetails?.city && (
                  <p className="text-xs text-primary/80 flex items-center gap-1 mt-1 font-semibold">
                    <MapPin size={12} /> {groupDetails.city}
                  </p>
                )}
                {groupDetails?.description && (
                  <p className="text-xs text-muted-foreground mt-2 px-2 leading-relaxed">
                    {groupDetails.description}
                  </p>
                )}
              </div>

              {/* Members List */}
              <div className="mt-6 flex-1">
                <Button
                  onClick={() => setShowAddMemberModal(true)}
                  className="w-full h-9 rounded-xl bg-primary text-black font-black text-xs hover:bg-primary/90 flex items-center justify-center gap-2 mb-4 shadow-[0_0_12px_rgba(214,255,47,0.2)]"
                >
                  <UserPlus size={14} /> Add Riders to Group
                </Button>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Riders ({membersList.length})
                  </span>
                  <span className="text-[10px] text-primary font-bold">
                    {groupDetails?.type === 'private' ? '🔒 Private Club' : '🌐 Public Group'}
                  </span>
                </div>

                <div className="space-y-2">
                  {membersList.map((m: any) => {
                    const isCurrentUser = m.userId === user?.id;
                    const isAdmin = m.role === 'admin';

                    return (
                      <div
                        key={m.id || m.userId}
                        className="p-2.5 rounded-2xl bg-white/4 border border-white/5 flex items-center justify-between hover:bg-white/6 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-10 w-10 border border-white/10 shrink-0">
                            <AvatarImage src={m.user?.avatarUrl || ''} />
                            <AvatarFallback>{m.user?.name?.charAt(0) ?? 'R'}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-white truncate">{m.user?.name}</p>
                              {isAdmin && (
                                <span className="px-1.5 py-0.2 rounded-full bg-primary/20 text-primary text-[9px] font-black flex items-center gap-0.5">
                                  <Crown size={9} /> Admin
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">
                              🏍️ {m.user?.vehicleType || m.vehicleType || 'Rider'}
                            </p>
                          </div>
                        </div>

                        {!isCurrentUser && (
                          <Button
                            onClick={() => {
                              setShowMembersDrawer(false);
                              onStartDirectChat(m.userId);
                            }}
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2.5 rounded-full text-xs font-bold text-primary hover:bg-primary/10 hover:text-primary"
                          >
                            <MessageCircle size={14} className="mr-1" /> Chat
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Lightbox Modal */}
      <AnimatePresence>
        {lightboxImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImageUrl(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div
              className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setLightboxImageUrl(null)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
              <img
                src={lightboxImageUrl}
                alt="Enlarged preview"
                className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Riders Modal */}
      <AnimatePresence>

          {showAddMemberModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => {
                setShowAddMemberModal(false);
                setSearchRiderQuery('');
                setRiderSearchResults([]);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                      <UserPlus size={16} />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-white">Add Riders to Group</h3>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[240px]">
                        {groupDetails?.name || 'Group Chat'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddMemberModal(false);
                      setSearchRiderQuery('');
                      setRiderSearchResults([]);
                    }}
                    className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Search Input */}
                <div className="mt-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    value={searchRiderQuery}
                    onChange={(e) => setSearchRiderQuery(e.target.value)}
                    placeholder="Search by name, username, city or bike..."
                    className="pl-9 pr-9 bg-white/5 border-white/10 rounded-full h-11 text-xs"
                    autoFocus
                  />
                  {searchRiderQuery && (
                    <button
                      onClick={() => setSearchRiderQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Search Results List */}
                <div className="mt-4 flex-1 overflow-y-auto no-scrollbar space-y-2 min-h-[220px]">
                  {searchingRiders ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
                      <Loader2 size={20} className="animate-spin text-primary" />
                      <span>Searching riders...</span>
                    </div>
                  ) : searchRiderQuery.trim().length >= 2 && riderSearchResults.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground text-xs">
                      No riders found matching "{searchRiderQuery}".
                    </div>
                  ) : searchRiderQuery.trim().length < 2 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
                      <Users size={28} className="text-white/20" />
                      <p className="text-xs text-muted-foreground">Type 2 or more letters to search for riders</p>
                    </div>
                  ) : (
                    riderSearchResults.map((rider: any) => {
                      const isAlreadyMember = membersList.some((m: any) => m.userId === rider.id || m.user?.id === rider.id);
                      const isAddingThis = addingUserId === rider.id;

                      return (
                        <div
                          key={rider.id}
                          className="p-3 rounded-2xl bg-white/4 border border-white/5 flex items-center justify-between hover:bg-white/6 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-10 w-10 border border-white/10 shrink-0">
                              <AvatarImage src={rider.avatarUrl || ''} />
                              <AvatarFallback>{rider.name?.charAt(0) ?? 'R'}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{rider.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                🏍️ {rider.vehicleType || 'Rider'}{rider.city ? ` • ${rider.city}` : ''}
                              </p>
                            </div>
                          </div>

                          {isAlreadyMember ? (
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                              <Check size={11} className="text-primary" /> Joined
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              disabled={isAddingThis}
                              onClick={() => handleAddMember(rider)}
                              className="h-8 px-3 rounded-full bg-primary text-black font-black text-xs hover:bg-primary/90 flex items-center gap-1 shadow-sm"
                            >
                              {isAddingThis ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <>
                                  <Plus size={13} /> Add
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }


