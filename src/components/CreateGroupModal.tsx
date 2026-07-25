import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, Check, Upload, Link as LinkIcon,
  Users, Shield, Globe, Lock, Search, Plus, Trash2, Crown,
  Camera, ImageIcon,
  MapPin, FileText, AlertCircle,
  Loader2,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

// ─── Token helper (same pattern as Profile.tsx) ─────────────────────────────
const getToken = () => localStorage.getItem('motohippi_token') || '';
const authFetch = (url: string, opts: RequestInit = {}) =>
  fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...(opts.headers || {}) },
  });

// ─── Types ───────────────────────────────────────────────────────────────────
interface FoundUser {
  id: number;
  name: string;
  username?: string | null;
  avatarUrl?: string | null;
  city?: string | null;
  vehicleType?: string | null;
}
interface AddedMember extends FoundUser {
  role: 'admin' | 'member';
  vehicleNickname: string;
  vehicleType: string;
}

interface FormState {
  // Step 1 — Identity
  name: string;
  description: string;
  city: string;
  type: 'public' | 'private';
  // Step 2 — Appearance
  coverUrl: string;
  logoUrl: string;
  coverPreview: string;
  logoPreview: string;
  // Step 3 — Members
  members: AddedMember[];
}

const STEPS = ['Identity', 'Appearance', 'Members', 'Review'];

// ─── ImagePicker sub-component ────────────────────────────────────────────────
function ImagePicker({
  label, preview, onUrl, onFile, placeholder,
}: { label: string; preview: string; onUrl: (u: string) => void; onFile: (b64: string) => void; placeholder?: string }) {
  const [mode, setMode] = useState<'url' | 'upload'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = e => onFile(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-white/80">{label}</label>
      {/* Preview */}
      <div className="relative w-full h-36 rounded-2xl bg-white/4 border border-white/10 overflow-hidden flex items-center justify-center group">
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon size={28} />
            <span className="text-xs">{placeholder || 'No image selected'}</span>
          </div>
        )}
        {preview && (
          <button
            onClick={() => { onUrl(''); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-red-500/60 transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>
      {/* Mode toggle */}
      <div className="flex gap-2">
        {(['upload', 'url'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              mode === m ? 'bg-primary text-black border-primary' : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
            }`}
          >
            {m === 'upload' ? <><Upload size={11} /> Upload</> : <><LinkIcon size={11} /> Paste URL</>}
          </button>
        ))}
      </div>
      {mode === 'upload' ? (
        <>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2"
          >
            <Camera size={14} /> Choose from device
          </button>
        </>
      ) : (
        <div className="flex gap-2">
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-primary/40"
          />
          <button
            onClick={() => { onUrl(urlInput); setUrlInput(''); }}
            className="px-4 py-2 rounded-xl bg-primary text-black text-xs font-bold"
          >Apply</button>
        </div>
      )}
    </div>
  );
}

// ─── Member search row ────────────────────────────────────────────────────────
function MemberRow({
  member, onRemove, onToggleAdmin, onNickname, onVehicleType,
}: {
  member: AddedMember;
  onRemove: () => void;
  onToggleAdmin: () => void;
  onNickname: (v: string) => void;
  onVehicleType: (v: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-3 rounded-2xl bg-white/4 border border-white/8 space-y-3"
    >
      {/* User header */}
      <div className="flex items-center gap-3">
        {member.avatarUrl ? (
          <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-sm">
            {member.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-white truncate">{member.name}</p>
          <p className="text-xs text-muted-foreground">
            {member.username ? `@${member.username}` : ''}
            {member.city ? ` · ${member.city}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Admin toggle */}
          <button
            onClick={onToggleAdmin}
            title={member.role === 'admin' ? 'Remove admin' : 'Make admin'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border transition-all ${
              member.role === 'admin'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-white/5 border-white/10 text-muted-foreground hover:border-amber-500/30'
            }`}
          >
            <Crown size={10} />
            {member.role === 'admin' ? 'Admin' : 'Member'}
          </button>
          <button onClick={onRemove} className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-all">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      {/* Vehicle details */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Vehicle Nickname</label>
          <input
            value={member.vehicleNickname}
            onChange={e => onNickname(e.target.value)}
            placeholder='e.g. "Thunder", "Beast"'
            className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-primary/40"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Vehicle Type</label>
          <select
            value={member.vehicleType}
            onChange={e => onVehicleType(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-card border border-white/10 text-xs text-white focus:outline-none focus:border-primary/40 appearance-none cursor-pointer"
          >
            <option value="">Select…</option>
            {['Motorcycle', 'Car / SUV', 'Bicycle', 'ADV / Off-road', 'Overlanding', 'Electric', 'Other'].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (groupId: number) => void;
}

export default function CreateGroupModal({ open, onClose, onCreated }: Props) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Search state
  const [searchQ, setSearchQ] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FoundUser[]>([]);

  const [form, setForm] = useState<FormState>({
    name: '', description: '', city: '', type: 'public',
    coverUrl: '', logoUrl: '', coverPreview: '', logoPreview: '',
    members: [],
  });

  const set = useCallback(<K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm(f => ({ ...f, [k]: v }));
  }, []);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setStep(0); setError(''); setSearchQ(''); setSearchResults([]);
      setForm({
        name: '', description: '', city: '', type: 'public',
        coverUrl: '', logoUrl: '', coverPreview: '', logoPreview: '',
        members: [],
      });
    }
  }, [open]);

  // Debounced user search
  useEffect(() => {
    if (searchQ.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await authFetch(`/api/users/search?q=${encodeURIComponent(searchQ)}`);
        if (res.ok) {
          const d = await res.json();
          setSearchResults(Array.isArray(d) ? d : []);
        }
      } finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [searchQ]);

  const addMember = (u: FoundUser) => {
    if (form.members.find(m => m.id === u.id)) return;
    set('members', [...form.members, {
      ...u,
      role: 'member',
      vehicleNickname: '',
      vehicleType: u.vehicleType || '',
    }]);
    setSearchQ('');
    setSearchResults([]);
  };

  const removeMember = (id: number) => set('members', form.members.filter(m => m.id !== id));

  const updateMember = (id: number, patch: Partial<AddedMember>) => {
    set('members', form.members.map(m => m.id === id ? { ...m, ...patch } : m));
  };

  // Validation per step
  const canAdvance = () => {
    if (step === 0) return form.name.trim().length >= 2;
    return true;
  };

  const handleCreate = async () => {
    setError('');
    setCreating(true);
    try {
      // 1. Create the group
      const res = await authFetch('/api/groups', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          type: form.type,
          city: form.city.trim() || undefined,
          logoUrl: form.logoUrl || form.logoPreview || undefined,
          coverUrl: form.coverUrl || form.coverPreview || undefined,
        }),
      });
      if (!res.ok) { setError('Failed to create group. Please try again.'); setCreating(false); return; }
      const group = await res.json();
      const groupId: number = group.id;

      // 2. Add invited members — use allSettled so one failure doesn't abort the rest
      await Promise.allSettled(form.members.map(m =>
        authFetch(`/api/groups/${groupId}/members`, {
          method: 'POST',
          body: JSON.stringify({
            userId: m.id,
            role: m.role,
            vehicleNickname: m.vehicleNickname || undefined,
            vehicleType: m.vehicleType || undefined,
          }),
        })
      ));

      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      onCreated?.(groupId);
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Sheet — slides in from right */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          className="relative ml-auto w-full max-w-lg h-full bg-[#0e1012] border-l border-white/8 flex flex-col shadow-2xl overflow-hidden"
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/6 shrink-0">
            <div>
              <h2 className="text-xl font-black text-white">Create Group</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Step {step + 1} of {STEPS.length} — {STEPS[step]}
              </p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* ── Progress bar ── */}
          <div className="h-0.5 bg-white/6 shrink-0">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ type: 'spring', damping: 25 }}
            />
          </div>

          {/* ── Step dots ── */}
          <div className="flex items-center justify-center gap-3 py-4 border-b border-white/6 shrink-0">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => i < step && setStep(i)}
                className="flex items-center gap-2 group"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                  i < step ? 'bg-primary border-primary text-black' :
                  i === step ? 'bg-primary/20 border-primary text-primary' :
                  'bg-white/5 border-white/10 text-muted-foreground'
                }`}>
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                <span className={`text-[10px] font-bold hidden sm:block transition-colors ${
                  i === step ? 'text-white' : i < step ? 'text-primary' : 'text-muted-foreground'
                }`}>{s}</span>
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <AnimatePresence mode="wait">

              {/* STEP 0 — Identity */}
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <SectionLabel icon={FileText} text="Group Name" required />
                  <input
                    autoFocus
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Royal Enfield Himalayan Riders"
                    maxLength={60}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 text-sm font-bold"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min. 2 characters</span>
                    <span>{form.name.length}/60</span>
                  </div>

                  <SectionLabel icon={FileText} text="Description" />
                  <textarea
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="What's this group about? What kind of rides do you plan?"
                    rows={3}
                    maxLength={300}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 text-sm resize-none"
                  />
                  <div className="text-right text-xs text-muted-foreground">{form.description.length}/300</div>

                  <SectionLabel icon={MapPin} text="City / Base Location" />
                  <input
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    placeholder="e.g. Mumbai, Delhi, Bangalore…"
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 text-sm"
                  />

                  <SectionLabel icon={Shield} text="Group Privacy" />
                  <div className="grid grid-cols-2 gap-3">
                    {([['public', Globe, 'Public', 'Anyone can join & see posts'], ['private', Lock, 'Private', 'Invite-only, hidden from search']] as const).map(([val, Icon, label, desc]) => (
                      <button
                        key={val}
                        onClick={() => set('type', val)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          form.type === val
                            ? 'bg-primary/10 border-primary text-white'
                            : 'bg-white/4 border-white/10 text-muted-foreground hover:border-white/20'
                        }`}
                      >
                        <Icon size={20} className={form.type === val ? 'text-primary mb-2' : 'mb-2'} />
                        <p className="text-sm font-black">{label}</p>
                        <p className="text-[10px] mt-0.5 leading-tight opacity-70">{desc}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 1 — Appearance */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <ImagePicker
                    label="Cover Photo"
                    preview={form.coverPreview || form.coverUrl}
                    onUrl={u => { set('coverUrl', u); set('coverPreview', u); }}
                    onFile={b => { set('coverPreview', b); set('coverUrl', b); }}
                    placeholder="Group cover image (landscape)"
                  />
                  <div className="h-px bg-white/6" />
                  <ImagePicker
                    label="Group Logo / Avatar"
                    preview={form.logoPreview || form.logoUrl}
                    onUrl={u => { set('logoUrl', u); set('logoPreview', u); }}
                    onFile={b => { set('logoPreview', b); set('logoUrl', b); }}
                    placeholder="Square logo or emblem"
                  />
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Both fields are optional — you can add these later from Group Settings.
                  </p>
                </motion.div>
              )}

              {/* STEP 2 — Members */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="p-3 bg-primary/8 border border-primary/20 rounded-2xl flex items-start gap-3">
                    <Crown size={16} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-white/80 leading-relaxed">
                      You are automatically the <strong className="text-primary">Group Admin</strong>. Search below to invite riders and optionally assign them as co-admins.
                    </p>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                      value={searchQ}
                      onChange={e => setSearchQ(e.target.value)}
                      placeholder="Search riders by name, username, or city…"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-primary/40"
                    />
                    {searching && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />}
                  </div>

                  {/* Search results */}
                  <AnimatePresence>
                    {searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden divide-y divide-white/6"
                      >
                        {searchResults.map(u => {
                          const already = form.members.some(m => m.id === u.id);
                          return (
                            <button
                              key={u.id}
                              onClick={() => !already && addMember(u)}
                              disabled={already}
                              className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors ${
                                already ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'
                              }`}
                            >
                              {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm shrink-0">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{u.name}</p>
                                <p className="text-xs text-muted-foreground">{u.username ? `@${u.username}` : ''} {u.city ? `· ${u.city}` : ''}</p>
                              </div>
                              {already ? (
                                <Check size={14} className="text-primary shrink-0" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                                  <Plus size={12} className="text-primary" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Added members list */}
                  {form.members.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">
                        Added Members ({form.members.length})
                      </p>
                      <div className="space-y-2">
                        <AnimatePresence>
                          {form.members.map(m => (
                            <MemberRow
                              key={m.id}
                              member={m}
                              onRemove={() => removeMember(m.id)}
                              onToggleAdmin={() => updateMember(m.id, { role: m.role === 'admin' ? 'member' : 'admin' })}
                              onNickname={v => updateMember(m.id, { vehicleNickname: v })}
                              onVehicleType={v => updateMember(m.id, { vehicleType: v })}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {form.members.length === 0 && !searchQ && (
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                      <div className="w-14 h-14 rounded-full bg-white/4 border border-white/10 flex items-center justify-center">
                        <Users size={24} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No members added yet.</p>
                      <p className="text-xs text-muted-foreground/60">You can invite riders after creating the group too.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 3 — Review */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  {/* Cover preview */}
                  {(form.coverPreview || form.coverUrl) && (
                    <div className="relative h-36 rounded-2xl overflow-hidden">
                      <img src={form.coverPreview || form.coverUrl} alt="cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {(form.logoPreview || form.logoUrl) && (
                        <div className="absolute bottom-3 left-4 w-14 h-14 rounded-xl border-2 border-white/30 overflow-hidden">
                          <img src={form.logoPreview || form.logoUrl} alt="logo" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary card */}
                  <div className="p-4 rounded-2xl bg-white/4 border border-white/8 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black text-white">{form.name || '—'}</h3>
                        {form.city && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin size={10} /> {form.city}</p>}
                      </div>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                        form.type === 'public' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-white/8 border-white/15 text-muted-foreground'
                      }`}>
                        {form.type === 'public' ? <><Globe size={9} /> Public</> : <><Lock size={9} /> Private</>}
                      </div>
                    </div>
                    {form.description && <p className="text-xs text-white/65 leading-relaxed">{form.description}</p>}

                    <div className="h-px bg-white/6" />

                    {form.members.length > 0 && (
                      <>
                        <div className="h-px bg-white/6" />
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Members being added ({form.members.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {form.members.map(m => (
                              <div key={m.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/6 border border-white/10 text-xs">
                                {m.role === 'admin' && <Crown size={9} className="text-amber-400" />}
                                <span className="font-semibold text-white/80">{m.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                      <AlertCircle size={14} /> {error}
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/6 shrink-0 gap-3">
            <button
              onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/6 border border-white/10 text-sm font-bold text-white/80 hover:bg-white/10 transition-all"
            >
              <ChevronLeft size={16} /> {step === 0 ? 'Cancel' : 'Back'}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canAdvance()}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-primary text-black text-sm font-black hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={creating || !form.name.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-black text-sm font-black hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {creating ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : <><Check size={16} /> Create Group</>}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Helper
function SectionLabel({ icon: Icon, text, required }: { icon: React.ElementType; text: string; required?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
        <Icon size={12} className="text-primary" />
      </div>
      <span className="text-sm font-black text-white">{text}{required && <span className="text-primary ml-1">*</span>}</span>
    </div>
  );
}
