import React, { useState } from 'react';
import { useGetConversations, useListMessages, useSendMessage, useGetMatches } from '@workspace/api-client-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Search, Info, ChevronLeft, MessageCircle, Users, Check, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

// ─── Group Join Request Card ───────────────────────────────────────────────────
function GroupJoinRequestCard({ payload, conversationId }: { payload: string; conversationId: number }) {
  const { toast } = useToast();
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? '';

  let data: any = {};
  try { data = JSON.parse(payload); } catch { return null; }

  const { groupId, groupName, groupLogoUrl, requesterId, requesterName, requesterAvatar } = data;

  const accept = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`${BASE_URL}/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
  const recent = (matches ?? []).slice(0, 5);
  if (!recent.length) return null;

  return (
    <div className="px-3 py-3 border-b border-white/5">
      <p className="text-[11px] font-black uppercase tracking-wider text-primary/70 mb-2">🔥 Ride Matches</p>
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
                {(m.user as any).avatarUrl
                  ? <img src={(m.user as any).avatarUrl} alt={(m.user as any).name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">{((m.user as any).name?.[0] ?? '?').toUpperCase()}</div>
                }
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center border border-background">
                <span className="text-[8px]">❤️</span>
              </div>
            </div>
            <p className="text-[10px] font-semibold text-white/70 truncate w-14 text-center">
              {(m.user as any).name?.split(' ')[0]}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Messages Page ─────────────────────────────────────────────────────────────
export default function Messages() {
  const { data: conversations, isLoading: convLoading } = useGetConversations();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [, navigate] = useLocation();

  // Support deep-link: /messages?conv=123
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const convId = params.get('conv');
    if (convId) setActiveId(parseInt(convId, 10));
  }, []);

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
          ) : conversations?.map(conv => {
            // Detect if last message is a group join request
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
                    <AvatarImage src={conv.participant.avatarUrl || ''} />
                    <AvatarFallback>{conv.participant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {conv.unreadCount ? (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                  ) : null}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-sm truncate">{conv.participant.name}</h4>
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
          {conversations?.length === 0 && (
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

// ─── Chat View ─────────────────────────────────────────────────────────────────
function ChatView({ conversationId, onBack }: { conversationId: number; onBack: () => void }) {
  const { data: messages, isLoading } = useListMessages(conversationId);
  const sendMutation = useSendMessage(conversationId);
  const [text, setText] = useState('');
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const { data: conversations } = useGetConversations();

  const conversation = conversations?.find(c => c.id === conversationId);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMutation.mutate({ data: { content: text } }, { onSuccess: () => setText('') });
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
              <AvatarImage src={conversation?.participant.avatarUrl ?? ''} />
              <AvatarFallback>{conversation?.participant.name?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-sm">{conversation?.participant.name ?? 'Conversation'}</h3>
              <p className="text-[10px] text-muted-foreground">Rider</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full"><Info size={20} /></Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-3">
        {isLoading && <div className="text-center text-muted-foreground text-sm py-8">Loading messages...</div>}

        {[...(messages ?? [])].reverse().map(msg => {
          // Check if this is a group join request system message
          let isJoinReq = false;
          try {
            const parsed = JSON.parse(msg.content);
            if (parsed?.type === 'group_join_request') isJoinReq = true;
          } catch { /* plain text */ }

          if (isJoinReq) {
            return (
              <GroupJoinRequestCard key={msg.id} payload={msg.content} conversationId={conversationId} />
            );
          }

          const isMe = msg.senderId === (messages?.[0]?.senderId ?? msg.senderId);
          // Better heuristic: if two different senders, the first message's sender is the other person
          // We'll rely on conversation context — fall back to position alternation is unreliable.
          // Keep the simplified logic for now:
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                isMe
                  ? 'bg-primary text-black rounded-tr-sm font-medium'
                  : 'bg-white/8 text-white rounded-tl-sm'
              }`}>
                {msg.content}
                <div className={`text-[10px] mt-1 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-background border-t border-white/5 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-card/50 border-white/10 rounded-full h-12 px-4"
          />
          <Button
            type="submit"
            disabled={!text.trim() || sendMutation.isPending}
            size="icon"
            className="h-12 w-12 rounded-full shrink-0 shadow-lg shadow-primary/20"
          >
            <Send size={18} className="ml-0.5" />
          </Button>
        </form>
      </div>
    </>
  );
}
