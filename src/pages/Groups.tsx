import React, { useState } from 'react';
import { useGetGroups, useJoinGroup, useLeaveGroup } from '@workspace/api-client-react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Plus, Search, Shield, MapPin, AlertCircle, UserPlus, UserCheck, LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import CreateGroupModal from '@/components/CreateGroupModal';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// ─── Join / Leave button ───────────────────────────────────────────────────────
function JoinButton({ groupId, groupName, isMember, isPrivate }: {
  groupId: number;
  groupName: string;
  isMember: boolean;
  isPrivate: boolean;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [localMember, setLocalMember] = useState(isMember);
  const [requested, setRequested] = useState(false);

  const joinMutation = useJoinGroup({
    mutation: {
      onSuccess: () => {
        setLocalMember(true);
        setRequested(false);
        queryClient.invalidateQueries({ queryKey: ['getGroups'] });
        toast({
          title: isPrivate ? '📨 Request Sent!' : '🏍️ Joined!',
          description: isPrivate
            ? `Your request to join "${groupName}" has been sent to the admins.`
            : `Welcome to ${groupName}! Check Messages for group updates.`,
        });
      },
    },
  });

  const leaveMutation = useLeaveGroup({
    mutation: {
      onSuccess: () => {
        setLocalMember(false);
        queryClient.invalidateQueries({ queryKey: ['getGroups'] });
        toast({ title: 'Left group', description: `You have left ${groupName}.` });
      },
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (localMember) {
      leaveMutation.mutate({ groupId });
    } else {
      if (isPrivate) setRequested(true);
      joinMutation.mutate({ groupId });
    }
  };

  const pending = joinMutation.isPending || leaveMutation.isPending;

  if (localMember) {
    return (
      <motion.button
        onClick={handleClick}
        disabled={pending}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-primary/40 text-primary bg-primary/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all group disabled:opacity-60"
      >
        <span className="group-hover:hidden flex items-center gap-1.5"><UserCheck size={12} /> Joined</span>
        <span className="hidden group-hover:flex items-center gap-1.5"><LogOut size={12} /> Leave</span>
      </motion.button>
    );
  }

  if (requested || (isPrivate && joinMutation.isSuccess)) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-500/30 text-amber-400 bg-amber-500/10">
        📨 Requested
      </div>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={pending}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary text-black hover:bg-primary/90 transition-all disabled:opacity-60 shadow-[0_0_12px_rgba(214,255,47,0.2)]"
    >
      {pending ? (
        <span className="flex items-center gap-1.5">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full" />
          {isPrivate ? 'Sending…' : 'Joining…'}
        </span>
      ) : (
        <><UserPlus size={12} /> {isPrivate ? 'Request' : 'Join'}</>
      )}
    </motion.button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Groups() {
  const { data: groups, isLoading, isError } = useGetGroups();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [, navigate] = useLocation();

  const filtered = (groups ?? []).filter(g =>
    search === '' ||
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.city ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1">Communities</h1>
          <p className="text-muted-foreground text-sm">Find and join rider groups near you.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-black font-black text-sm hover:bg-primary/90 transition-colors shadow-[0_0_18px_rgba(214,255,47,0.2)]"
        >
          <Plus size={16} /> Create Group
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-7 max-w-xl w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search groups by name or city…"
          className="pl-10 h-12 bg-white/5 border-white/10 rounded-full focus:border-primary/40"
        />
      </div>

      {/* ── Groups Grid ── */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <p className="font-black text-white text-lg">Could not load communities</p>
          <p className="text-sm text-muted-foreground">Check your connection and try again.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Users size={28} className="text-muted-foreground" />
          </div>
          <p className="font-black text-white text-lg">
            {search ? 'No groups match your search' : 'No communities yet'}
          </p>
          {search ? (
            <button onClick={() => setSearch('')} className="px-5 py-2 rounded-full bg-primary text-black font-black text-sm">
              Clear Search
            </button>
          ) : (
            <button onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-black font-black text-sm">
              <Plus size={14} /> Start the first one
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/groups/${group.id}`}>
                <Card className="glass-card hover:bg-card/60 transition-all duration-300 cursor-pointer overflow-hidden border border-white/6 hover:border-primary/20 group">
                  <div className="h-32 relative">
                    <img
                      src={group.coverUrl || ''}
                      alt={group.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute -bottom-8 left-6">
                      <div className="w-16 h-16 rounded-2xl bg-card border-2 border-background overflow-hidden flex items-center justify-center shadow-xl">
                        {group.logoUrl ? (
                          <img src={group.logoUrl} alt="logo" className="w-full h-full object-cover" />
                        ) : (
                          <Shield className="text-primary" size={24} />
                        )}
                      </div>
                    </div>
                    {group.type === 'private' && (
                      <div className="absolute top-3 right-3 bg-black/80 px-2 py-1 rounded-full text-[10px] font-bold border border-white/10">
                        🔒 Private
                      </div>
                    )}
                  </div>
                  <CardContent className="pt-11 pb-5 px-6">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-lg font-black group-hover:text-primary transition-colors leading-tight">{group.name}</h3>
                      <div className="shrink-0 mt-0.5" onClick={e => e.preventDefault()}>
                        <JoinButton
                          groupId={group.id}
                          groupName={group.name}
                          isMember={group.isMember ?? false}
                          isPrivate={group.type === 'private'}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Users size={12} /> {group.membersCount} Members
                      {group.city && (
                        <>
                          <span className="text-white/20">·</span>
                          <MapPin size={12} className="text-primary/60" /> {group.city}
                        </>
                      )}
                    </div>
                    <p className="text-xs text-white/65 line-clamp-2 leading-relaxed">
                      {group.description || 'A community of passionate riders.'}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Create Group Modal ── */}
      <CreateGroupModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => navigate(`/groups/${id}`)}
      />
    </div>
  );
}
