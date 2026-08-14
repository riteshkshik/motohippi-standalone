import React, { useState, useEffect, useRef } from 'react';
import { useGetConversations, useListMessages, useSendMessage, useGetMatches } from '@workspace/api-client-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Search, Info, ChevronLeft, MessageCircle, Users, Check, X, Heart, Sparkles, Image as ImageIcon, Loader2, Maximize2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useWebSocketChat, ChatMessage } from '@/hooks/useWebSocketChat';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { RequesterProfileModal, RequesterUser } from '@/components/RequesterProfileModal';

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
function MatchesBanner({ onOpen }: { onOpen: (convId: number) => void }) {
  const { data: matches } = useGetMatches();
  const matchesList = Array.isArray(matches) ? matches : [];
  const recent = matchesList.slice(0, 5);
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
  const [, navigate] = useLocation();

  const conversationsList = Array.isArray(conversations) ? conversations : [];

  // Support deep-link: /messages?conv=123
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const convId = params.get('conv');
    if (convId) setActiveId(parseInt(convId, 10));
  }, []);

  const handleAcceptMatch = (convId: number) => {
    setActiveId(convId);
    refetchConvs();
  };

  return (
    <div className="flex h-[calc(100svh-3.5rem-5rem)] md:h-svh overflow-hidden">
      {/* Conversations List */}
      <div className={`w-full md:w-80 border-r border-white/5 bg-background flex flex-col ${activeId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/5 shrink-0">
          <h2 className="text-2xl font-black mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input placeholder="Search messages..." className="pl-9 bg-card/50 border-white/10 rounded-full h-10" />
          </div>
        </div>

        {/* Pending Ride Request Card Banner */}
        <PendingRequestsBanner onAccept={handleAcceptMatch} />

        {/* Match bubbles */}
        <MatchesBanner onOpen={id => setActiveId(id)} />

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
          ) : conversationsList.map(conv => {
            let isJoinReq = false;
            try {
              const parsed = JSON.parse(conv.lastMessage ?? '');
              if (parsed?.type === 'group_join_request') isJoinReq = true;
            } catch { /* plain text */ }

            return (
              <button
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-colors ${activeId === conv.id ? 'bg-white/10' : ''}`}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12 border border-white/10">
                    <AvatarImage src={conv.participant?.avatarUrl || ''} />
                    <AvatarFallback>{conv.participant?.name?.charAt(0) ?? 'U'}</AvatarFallback>
                  </Avatar>
                  {conv.unreadCount ? (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                  ) : null}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-sm truncate">{conv.participant?.name}</h4>
                    {conv.lastMessageAt && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(conv.lastMessageAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate ${conv.unreadCount ? 'text-white font-medium' : 'text-muted-foreground'}`}>
                    {isJoinReq ? '🏍️ Join request' : (conv.lastMessage || 'Say hello!')}
                  </p>
                </div>
              </button>
            );
          })}
          {conversationsList.length === 0 && !convLoading && (
            <div className="text-center p-8 text-muted-foreground text-sm">No conversations yet.</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 bg-card/30 flex flex-col relative ${!activeId ? 'hidden md:flex' : 'flex'}`}>
        {activeId ? (
          <ChatView conversationId={activeId} onBack={() => setActiveId(null)} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <MessageCircle size={32} className="opacity-20" />
            </div>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
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
      <div className="h-16 border-b border-white/5 bg-background flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
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
                  : isImageMsg ? 'rounded-tl-sm' : 'bg-white/8 text-white rounded-tl-sm border border-white/5'
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
      <div className="p-4 bg-background border-t border-white/5 shrink-0">
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
            className="flex-1 bg-card/50 border-white/10 rounded-full h-12 px-4 text-sm"
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
