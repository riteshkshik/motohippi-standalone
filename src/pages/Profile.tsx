import React, { useState, useRef, useCallback } from 'react';
import { useGetMyProfile, useUpdateMyProfile, useGetFeed, useDeletePost } from '@workspace/api-client-react';

// authenticated fetch helper (mirrors how api-client-react works internally)
async function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('motohippi_token');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MapPin, Edit3, Settings, Heart, Share2, X, Check,
  Camera, Upload, Link2, MessageCircle, Twitter, Copy, Download,
  ChevronRight, Bell, Shield, LogOut, User, Bike, Mountain,
  Globe, Phone, Mail, Lock, Trash2, ExternalLink,
  CheckCircle2, MoreHorizontal, MessageSquare, Plus, PenLine,
  ImagePlus, Hash, Navigation2, Eye, AlertTriangle, Grid3x3, Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// ─── constants ──────────────────────────────────────────────────────────────
const VEHICLE_TYPES = ['Motorcycle', 'Royal Enfield', 'Adventure Bike', 'Cruiser', 'Scooter', 'Bicycle', 'Car', 'SUV', 'Jeep'];
const ADVENTURE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Pro'];
const TRAVEL_STYLES = ['Solo Rider', 'Group Rides', 'Couple Rides', 'Long Distance', 'Off-Road', 'Highway Cruiser', 'Overlander'];
const INTERESTS_LIST = ['Mountains', 'Deserts', 'Coastal Roads', 'Forest Trails', 'Camping', 'Cafes', 'Photography', 'Sunsets', 'Night Rides', 'Heritage Sites', 'Waterfalls', 'Border Rides'];

// ─── tiny helpers ─────────────────────────────────────────────────────────
function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full sm:max-w-lg z-10"
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function SideSheet({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md bg-[#111] border-l border-white/10 h-full flex flex-col z-10 overflow-hidden"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <h2 className="text-lg font-black">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// ─── Image Editor Modal ───────────────────────────────────────────────────
function ImageEditModal({
  type, currentUrl, onSave, onClose
}: { type: 'avatar' | 'cover'; currentUrl?: string | null; onSave: (url: string) => Promise<void>; onClose: () => void }) {
  const [url, setUrl] = useState(currentUrl || '');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isAvatar = type === 'avatar';

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!url) return;
    setSaving(true);
    try {
      let finalUrl = url;
      if (url.startsWith('data:')) {
        const uploadRes = await authFetch('/api/upload', {
          method: 'POST',
          body: JSON.stringify({ image: url, folder: isAvatar ? 'avatars' : 'covers' }),
        });
        if (uploadRes?.url) {
          finalUrl = uploadRes.url;
        }
      }
      await onSave(finalUrl);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-[#111] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 space-y-5 mx-0 sm:mx-0">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-lg">{isAvatar ? 'Profile Photo' : 'Cover Photo'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"><X size={16} /></button>
        </div>

        {/* Preview */}
        <div className={`relative overflow-hidden bg-white/5 border border-white/8 ${isAvatar ? 'w-32 h-32 rounded-full mx-auto' : 'w-full h-36 rounded-2xl'}`}>
          {url ? (
            <img src={url} alt="preview" className="w-full h-full object-cover" onError={() => {}} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera size={28} className="text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Upload from device */}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/8 transition-all text-sm font-semibold"
        >
          <Upload size={18} className="text-primary" />
          Upload from device
        </button>

        {/* Or URL */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Or paste image URL</label>
          <Input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://..."
            className="bg-white/5 border-white/10 focus:border-primary/50"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl border-white/10">Cancel</Button>
          <button
            onClick={handleSave}
            disabled={!url || saving}
            className="flex-1 py-2.5 rounded-2xl bg-primary text-black font-black text-sm disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ─── Share Modal ──────────────────────────────────────────────────────────
function ShareModal({ profile, onClose }: { profile: any; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const username = profile.username || profile.name?.toLowerCase().replace(/\s/g, '') || 'rider';
  const shareUrl = `https://motohippi.com/rider/${username}`;

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareVia = (platform: string) => {
    const text = `Hey! Check out my MotoHippi profile — let's ride together! 🏍️ ${shareUrl}\n\nDownload MotoHippi: https://motohippi.com`;
    const encodedText = encodeURIComponent(text);
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out my MotoHippi profile! 🏍️\n\nDownload MotoHippi to find ride partners near you.`)}`,
    };
    window.open(urls[platform], '_blank', 'noopener,noreferrer');
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-[#111] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 space-y-6 mx-0">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-lg">Share Profile</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"><X size={16} /></button>
        </div>

        {/* Profile preview card */}
        <div className="flex items-center gap-4 p-4 bg-white/4 border border-white/8 rounded-2xl">
          <Avatar className="h-14 w-14 border-2 border-primary/30">
            <AvatarImage src={profile.avatarUrl || ''} className="object-cover" />
            <AvatarFallback className="text-xl font-black bg-primary/20 text-primary">{profile.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-black text-base">{profile.name}</p>
            <p className="text-xs text-muted-foreground">@{username} · {profile.city || 'MotoHippi Rider'}</p>
            <p className="text-[10px] text-primary mt-0.5">{profile.vehicleType || 'Rider'} · {profile.adventureLevel || 'Explorer'}</p>
          </div>
        </div>

        {/* Share link */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Your MotoHippi Link</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <Link2 size={14} className="text-primary shrink-0" />
              <span className="text-sm text-white/70 truncate font-mono">{shareUrl}</span>
            </div>
            <button
              onClick={copyLink}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all shrink-0 ${
                copied ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/10 hover:border-primary/40 text-white'
              }`}
            >
              {copied ? <><CheckCircle2 size={14} className="inline mr-1" />Copied!</> : <><Copy size={14} className="inline mr-1" />Copy</>}
            </button>
          </div>
        </div>

        {/* Social share buttons */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Share via</p>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => shareVia('whatsapp')} className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl hover:border-green-500/40 hover:bg-green-500/5 transition-all group">
              <div className="w-10 h-10 rounded-full bg-[#25D366]/15 flex items-center justify-center group-hover:bg-[#25D366]/25 transition-colors">
                <MessageCircle size={20} className="text-[#25D366]" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground group-hover:text-white transition-colors">WhatsApp</span>
            </button>
            <button onClick={() => shareVia('twitter')} className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl hover:border-sky-400/40 hover:bg-sky-400/5 transition-all group">
              <div className="w-10 h-10 rounded-full bg-sky-400/15 flex items-center justify-center group-hover:bg-sky-400/25 transition-colors">
                <Twitter size={20} className="text-sky-400" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground group-hover:text-white transition-colors">Twitter</span>
            </button>
            <button onClick={() => shareVia('telegram')} className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl hover:border-blue-400/40 hover:bg-blue-400/5 transition-all group">
              <div className="w-10 h-10 rounded-full bg-blue-400/15 flex items-center justify-center group-hover:bg-blue-400/25 transition-colors">
                <ExternalLink size={20} className="text-blue-400" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground group-hover:text-white transition-colors">Telegram</span>
            </button>
          </div>
        </div>

        {/* Download CTA */}
        <div className="p-4 bg-primary/8 border border-primary/20 rounded-2xl flex items-start gap-3">
          <Download size={18} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-white">Viewers need MotoHippi</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Anyone who opens your link will be directed to download MotoHippi to view your full profile, rides, and connect with you.
            </p>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ─── Edit Profile Sheet ───────────────────────────────────────────────────
function EditProfileSheet({ profile, onClose }: { profile: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { mutateAsync: updateProfile } = useUpdateMyProfile();

  const [tab, setTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // basic
  const [name, setName] = useState(profile.name || '');
  const [username, setUsername] = useState(profile.username || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [city, setCity] = useState(profile.city || '');
  const [country, setCountry] = useState(profile.country || '');
  const [age, setAge] = useState<string>(profile.age?.toString() || '');
  const [gender, setGender] = useState(profile.gender || '');

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const a = data.address || {};
          const detectedCity = a.city || a.town || a.village || a.county || a.state_district || a.state || '';
          const detectedCountry = a.country || '';
          if (detectedCity) setCity(detectedCity);
          if (detectedCountry) setCountry(detectedCountry);
        } catch { /* keep existing values */ }
        setDetectingLocation(false);
      },
      () => setDetectingLocation(false),
      { timeout: 8000 }
    );
  };
  const [phone, setPhone] = useState(profile.phone || '');

  // riding
  const [vehicleType, setVehicleType] = useState(profile.vehicleType || '');
  const [adventureLevel, setAdventureLevel] = useState(profile.adventureLevel || '');
  const [travelStyle, setTravelStyle] = useState(profile.travelStyle || '');

  // interests
  const [interests, setInterests] = useState<string[]>(profile.interests || []);

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        data: {
          name, username, bio, city, country,
          age: age ? parseInt(age) : undefined,
          gender, vehicleType, adventureLevel, travelStyle,
          interests,
        }
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SideSheet onClose={onClose} title="Edit Profile">
      <div className="flex flex-col h-full">
        {/* Tab nav */}
        <div className="flex border-b border-white/8 px-2">
          {[
            { id: 'basic', label: 'Info', icon: User },
            { id: 'riding', label: 'Riding', icon: Bike },
            { id: 'interests', label: 'Interests', icon: Mountain },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-bold border-b-2 transition-all ${
                tab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {tab === 'basic' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <Input value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl pl-7" placeholder="yourhandle" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">About / Bio</label>
                <Textarea value={bio} onChange={e => setBio(e.target.value)} className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl min-h-[90px] resize-none" placeholder="Tell riders about yourself…" maxLength={200} />
                <p className="text-right text-[10px] text-muted-foreground">{bio.length}/200</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">City</label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={detectingLocation}
                      className="flex items-center gap-1 text-[10px] font-bold text-primary/70 hover:text-primary transition-colors disabled:opacity-50"
                    >
                      {detectingLocation
                        ? <><Loader2 size={10} className="animate-spin" /> Detecting…</>
                        : <><Navigation2 size={10} /> Detect</>}
                    </button>
                  </div>
                  <Input value={city} onChange={e => setCity(e.target.value)} className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl" placeholder="Delhi" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Country</label>
                  <Input value={country} onChange={e => setCountry(e.target.value)} className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl" placeholder="India" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Age</label>
                  <Input type="number" value={age} onChange={e => setAge(e.target.value)} className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl" placeholder="28" min={16} max={80} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Gender</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Male', 'Female', 'Other'].map(g => (
                      <button key={g} onClick={() => setGender(g)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${gender === g ? 'bg-primary text-black border-primary' : 'bg-white/5 border-white/10 text-muted-foreground hover:border-primary/40'}`}>{g}</button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'riding' && (
            <>
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vehicle Type</label>
                <div className="flex flex-wrap gap-2">
                  {VEHICLE_TYPES.map(v => (
                    <button key={v} onClick={() => setVehicleType(v)} className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all ${vehicleType === v ? 'bg-primary text-black border-primary shadow-[0_0_12px_rgba(214,255,47,0.2)]' : 'bg-white/5 border-white/10 text-muted-foreground hover:border-primary/40 hover:text-white'}`}>{v}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Adventure Level</label>
                <div className="flex flex-wrap gap-2">
                  {ADVENTURE_LEVELS.map(l => (
                    <button key={l} onClick={() => setAdventureLevel(l)} className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all ${adventureLevel === l ? 'bg-primary text-black border-primary shadow-[0_0_12px_rgba(214,255,47,0.2)]' : 'bg-white/5 border-white/10 text-muted-foreground hover:border-primary/40 hover:text-white'}`}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Travel Style</label>
                <div className="flex flex-wrap gap-2">
                  {TRAVEL_STYLES.map(s => (
                    <button key={s} onClick={() => setTravelStyle(s)} className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all ${travelStyle === s ? 'bg-primary text-black border-primary shadow-[0_0_12px_rgba(214,255,47,0.2)]' : 'bg-white/5 border-white/10 text-muted-foreground hover:border-primary/40 hover:text-white'}`}>{s}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'interests' && (
            <>
              <p className="text-xs text-muted-foreground">Select all that apply — these help us match you with compatible riders.</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS_LIST.map(interest => {
                  const active = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all flex items-center gap-1.5 ${active ? 'bg-primary text-black border-primary' : 'bg-white/5 border-white/10 text-muted-foreground hover:border-primary/40 hover:text-white'}`}
                    >
                      {active && <Check size={12} />}
                      {interest}
                    </button>
                  );
                })}
              </div>
              {interests.length > 0 && (
                <p className="text-xs text-primary font-semibold">{interests.length} selected</p>
              )}
            </>
          )}
        </div>

        {/* Save button */}
        <div className="p-6 border-t border-white/8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-primary text-black font-black text-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(214,255,47,0.2)]"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />Saving…</>
            ) : saved ? (
              <><CheckCircle2 size={16} />Saved!</>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </SideSheet>
  );
}

// ─── Settings Sheet ────────────────────────────────────────────────────────
function SettingsSheet({ profile, onClose }: { profile: any; onClose: () => void }) {
  const { logout } = useAuth();

  const SettingRow = ({ icon: Icon, label, sublabel, onClick, danger = false, iconColor = '' }: {
    icon: any; label: string; sublabel?: string; onClick?: () => void; danger?: boolean; iconColor?: string;
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-white/4 transition-colors text-left ${danger ? 'hover:bg-red-500/5' : ''}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${danger ? 'bg-red-500/10' : 'bg-white/6'}`}>
        <Icon size={17} className={danger ? 'text-red-400' : iconColor || 'text-muted-foreground'} />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${danger ? 'text-red-400' : 'text-white'}`}>{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      {!danger && <ChevronRight size={16} className="text-muted-foreground" />}
    </button>
  );

  return (
    <SideSheet onClose={onClose} title="Settings">
      <div className="py-4">
        {/* Account info summary */}
        <div className="px-6 pb-4 mb-2">
          <div className="p-4 bg-white/4 border border-white/8 rounded-2xl flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={profile.avatarUrl || ''} className="object-cover" />
              <AvatarFallback className="bg-primary/20 text-primary font-black">{profile.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-black text-sm">{profile.name}</p>
              <p className="text-xs text-muted-foreground">{profile.email}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Account</p>
        </div>
        <SettingRow icon={User} label="Personal Information" sublabel="Name, email, phone" iconColor="text-blue-400" />
        <SettingRow icon={Lock} label="Change Password" sublabel="Update your login password" iconColor="text-amber-400" />
        <SettingRow icon={Phone} label="Phone Number" sublabel={profile.phone || 'Not added'} iconColor="text-green-400" />
        <SettingRow icon={Mail} label="Email Address" sublabel={profile.email} iconColor="text-purple-400" />

        <div className="px-6 pt-4 pb-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Privacy & Safety</p>
        </div>
        <SettingRow icon={Shield} label="Privacy Settings" sublabel="Who can see your profile" iconColor="text-emerald-400" />
        <SettingRow icon={Bell} label="Notifications" sublabel="Rides, matches, messages" iconColor="text-primary" />
        <SettingRow icon={Globe} label="Location Access" sublabel="Used for ride matching" iconColor="text-sky-400" />

        <div className="px-6 pt-4 pb-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Support</p>
        </div>
        <SettingRow icon={ExternalLink} label="Help & FAQ" sublabel="MotoHippi@yahoo.com" iconColor="text-muted-foreground" onClick={() => window.open('mailto:MotoHippi@yahoo.com')} />
        <SettingRow icon={MessageCircle} label="WhatsApp Support" sublabel="+91-9999207570" iconColor="text-[#25D366]" onClick={() => window.open('https://wa.me/919999207570')} />

        <div className="px-6 pt-4 pb-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Danger Zone</p>
        </div>
        <SettingRow icon={LogOut} label="Log Out" onClick={logout} danger />
        <SettingRow icon={Trash2} label="Delete Account" sublabel="Permanently remove your account" danger />

        <p className="text-center text-[10px] text-muted-foreground mt-8 pb-4">MotoHippi v1.0 · Built for riders, by riders 🏍️</p>
      </div>
    </SideSheet>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────
export default function Profile() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetMyProfile();
  const { mutateAsync: updateProfile } = useUpdateMyProfile();

  const [showEdit, setShowEdit] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAvatarEdit, setShowAvatarEdit] = useState(false);
  const [showCoverEdit, setShowCoverEdit] = useState(false);

  const saveImage = useCallback(async (field: 'avatarUrl' | 'coverUrl', url: string) => {
    await updateProfile({ data: { [field]: url } });
    queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
  }, [updateProfile, queryClient]);

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="flex gap-4">
          <Skeleton className="h-36 w-36 rounded-full" />
          <div className="flex-1 space-y-3 pt-4">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-4 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const username = profile.username || profile.name?.toLowerCase().replace(/\s/g, '') || 'rider';

  return (
    <>
      <div className="min-h-screen bg-background pb-20">
        {/* ── Cover Photo ── */}
        <div className="h-[30vh] md:h-[40vh] relative w-full bg-card group">
          <img
            src={profile.coverUrl || ''}
            alt="Cover"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          {/* Cover edit overlay */}
          <button
            onClick={() => setShowCoverEdit(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <div className="flex items-center gap-2 bg-black/70 border border-white/20 backdrop-blur-sm rounded-full px-5 py-2.5">
              <Camera size={16} className="text-white" />
              <span className="text-white text-sm font-bold">Change Cover Photo</span>
            </div>
          </button>

          {/* Top-right action buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="h-10 w-10 rounded-full bg-black/40 border border-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <Settings size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* ── Profile content ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 z-10">
          <div className="flex flex-col md:flex-row gap-6 md:items-end mb-8">
            {/* Avatar with edit button */}
            <div className="relative group w-fit">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background rounded-full bg-card shadow-2xl">
                <AvatarImage src={profile.avatarUrl || ''} className="object-cover" />
                <AvatarFallback className="text-4xl font-black">{profile.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              {profile.isVerified && (
                <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center border-4 border-background text-white text-sm font-bold shadow-lg">✓</div>
              )}
              {/* Avatar edit overlay */}
              <button
                onClick={() => setShowAvatarEdit(true)}
                className="absolute inset-0 rounded-full bg-black/0 hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              >
                <div className="flex flex-col items-center gap-1">
                  <Camera size={20} className="text-white" />
                  <span className="text-[10px] text-white font-bold">Edit</span>
                </div>
              </button>
            </div>

            <div className="flex-1 pb-2">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                {profile.name}
                {profile.isVerified && <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px]">✓ Verified</Badge>}
              </h1>
              <p className="text-muted-foreground font-medium mt-1 flex items-center gap-2 flex-wrap">
                <span className="text-primary/80">@{username}</span>
                {profile.city && (
                  <><span className="text-white/20">·</span><span className="flex items-center gap-1"><MapPin size={14} className="text-primary" />{profile.city}</span></>
                )}
                {profile.country && <><span className="text-white/20">·</span><Globe size={14} className="text-primary/60" /><span>{profile.country}</span></>}
              </p>
              {profile.bio && (
                <p className="text-sm text-white/70 mt-2 max-w-lg leading-relaxed">{profile.bio}</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pb-2 flex-wrap">
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-2 h-10 px-5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-primary/40 text-sm font-bold transition-all"
              >
                <Edit3 size={15} /> Edit Profile
              </button>
              <button
                onClick={() => setShowShare(true)}
                className="h-10 w-10 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-primary/40 flex items-center justify-center transition-all"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* ── Grid layout ── */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left: Info card */}
            <div className="space-y-6">
              <div className="glass-card p-6 space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-3 divide-x divide-white/8">
                  {[
                    { value: profile.followersCount ?? 0, label: 'Followers' },
                    { value: profile.followingCount ?? 0, label: 'Following' },
                    { value: profile.tripsCount ?? 0,     label: 'Trips'     },
                  ].map(({ value, label }) => (
                    <div key={label} className="flex flex-col items-center justify-center py-2 px-1 gap-0.5">
                      <span className="text-2xl font-black text-white leading-none tabular-nums">
                        {typeof value === 'number' && value >= 1000
                          ? `${(value / 1000).toFixed(1)}k`
                          : value}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-6 space-y-5">
                  {/* Details */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-widest">Rider Details</h3>
                    {[
                      { label: 'Vehicle', value: profile.vehicleType || 'Motorcycle' },
                      { label: 'Level', value: profile.adventureLevel || 'Advanced' },
                      { label: 'Style', value: profile.travelStyle || 'Explorer' },
                      { label: 'Member since', value: new Date(profile.createdAt || Date.now()).getFullYear().toString() },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <Badge variant="outline" className="border-white/10 uppercase text-[10px] font-bold">{value}</Badge>
                      </div>
                    ))}
                  </div>

                  {/* Interests */}
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-widest">Interests</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.interests.map((interest: string) => (
                          <span key={interest} className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold rounded-full">{interest}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Edit nudge */}
                  <button
                    onClick={() => setShowEdit(true)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/4 border border-white/8 hover:border-primary/30 hover:bg-white/6 transition-all group"
                  >
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-white transition-colors">Complete your profile</span>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Posts grid */}
            <div className="md:col-span-2">
              <PostsGrid profile={profile} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Overlays / Modals ── */}
      <AnimatePresence>
        {showEdit && <EditProfileSheet profile={profile} onClose={() => setShowEdit(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showShare && <ShareModal profile={profile} onClose={() => setShowShare(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showSettings && <SettingsSheet profile={profile} onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showAvatarEdit && (
          <ImageEditModal
            type="avatar"
            currentUrl={profile.avatarUrl}
            onSave={url => saveImage('avatarUrl', url)}
            onClose={() => setShowAvatarEdit(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCoverEdit && (
          <ImageEditModal
            type="cover"
            currentUrl={profile.coverUrl}
            onSave={url => saveImage('coverUrl', url)}
            onClose={() => setShowCoverEdit(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Posts Grid (placed after Profile so it can use hooks freely) ──────────
function PostsGrid({ profile }: { profile: any }) {
  const queryClient = useQueryClient();
  const { data: feed, isLoading: feedLoading } = useGetFeed({ limit: 50 });
  const { mutate: deletePost } = useDeletePost();

  // filter to current user's posts
  const myPosts = (feed?.posts ?? []).filter(p => p.author?.id === profile.id);

  const [lightboxPost, setLightboxPost] = useState<any>(null);
  const [menuPostId, setMenuPostId] = useState<number | null>(null);
  const [editPost, setEditPost] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const fallbackImages: string[] = [];

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDeleting(true);
    deletePost({ postId: deleteTarget.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
        setDeleteTarget(null);
        setLightboxPost(null);
      },
      onSettled: () => setDeleting(false),
    });
  };

  // close menu on outside click
  const closeMenu = () => setMenuPostId(null);

  return (
    <div className="w-full" onClick={closeMenu}>
      {/* Header row */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <Grid3x3 size={17} className="text-primary" />
          <span className="font-black text-base">Posts</span>
          {myPosts.length > 0 && (
            <span className="text-xs text-muted-foreground font-medium ml-1">({myPosts.length})</span>
          )}
        </div>
        <button
          onClick={e => { e.stopPropagation(); setCreateOpen(true); }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-black text-xs font-black hover:bg-primary/90 transition-colors"
        >
          <Plus size={14} /> New Post
        </button>
      </div>

      {/* Grid */}
      {feedLoading ? (
        <div className="grid grid-cols-3 gap-1.5">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-square rounded-xl" />)}
        </div>
      ) : myPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-white/4 border border-white/10 flex items-center justify-center">
            <ImagePlus size={26} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-black text-white mb-1">Share your first ride</p>
            <p className="text-sm text-muted-foreground max-w-xs">Your posts will appear here. Share your rides, routes, and adventures.</p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="px-5 py-2.5 rounded-full bg-primary text-black font-black text-sm hover:bg-primary/90 transition-colors"
          >
            Create Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {myPosts.map((post, i) => (
            <div
              key={post.id}
              className="aspect-square relative group rounded-xl overflow-hidden bg-card border border-white/5 cursor-pointer"
              onClick={e => { e.stopPropagation(); setLightboxPost(post); setMenuPostId(null); }}
            >
              <img
                src={post.imageUrl || fallbackImages[i % 2]}
                alt="post"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Hover overlay — stats */}
              <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5">
                <span className="text-white font-bold flex items-center gap-1.5 text-sm drop-shadow">
                  <Heart size={16} className="fill-white" /> {post.likesCount ?? 0}
                </span>
                <span className="text-white font-bold flex items-center gap-1.5 text-sm drop-shadow">
                  <MessageSquare size={16} className="fill-white/80" /> {post.commentsCount ?? 0}
                </span>
              </div>

              {/* 3-dot menu button — top right */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  setMenuPostId(menuPostId === post.id ? null : post.id);
                }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
              >
                <MoreHorizontal size={14} className="text-white" />
              </button>

              {/* Dropdown menu */}
              <AnimatePresence>
                {menuPostId === post.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-10 right-2 z-20 w-44 bg-[#1a1a1a] border border-white/12 rounded-2xl shadow-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => { setEditPost(post); setMenuPostId(null); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-white hover:bg-white/8 transition-colors text-left border-b border-white/6"
                    >
                      <PenLine size={15} className="text-primary" /> Edit Post
                    </button>
                    <button
                      onClick={() => { setLightboxPost(post); setMenuPostId(null); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-white hover:bg-white/8 transition-colors text-left border-b border-white/6"
                    >
                      <Eye size={15} className="text-blue-400" /> View Post
                    </button>
                    <button
                      onClick={() => { setDeleteTarget(post); setMenuPostId(null); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/8 transition-colors text-left"
                    >
                      <Trash2 size={15} /> Delete Post
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxPost && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setLightboxPost(null)} />
            <motion.div
              className="relative w-full max-w-3xl bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row z-10 max-h-[90vh]"
              initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              {/* Image side */}
              <div className="md:w-1/2 aspect-square md:aspect-auto bg-black flex-shrink-0">
                <img
                  src={lightboxPost.imageUrl || fallbackImages[0]}
                  alt="post"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info side */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-primary/20">
                      <AvatarImage src={profile.avatarUrl || ''} className="object-cover" />
                      <AvatarFallback className="bg-primary/20 text-primary text-sm font-black">{profile.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm leading-tight">{profile.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {lightboxPost.location && <><Navigation2 size={9} className="inline mr-0.5" />{lightboxPost.location} · </>}
                        {new Date(lightboxPost.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditPost(lightboxPost); setLightboxPost(null); }}
                      className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/10 flex items-center justify-center transition-all"
                      title="Edit Post"
                    >
                      <PenLine size={14} className="text-primary" />
                    </button>
                    <button
                      onClick={() => { setDeleteTarget(lightboxPost); setLightboxPost(null); }}
                      className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/40 hover:bg-red-500/10 flex items-center justify-center transition-all"
                      title="Delete Post"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                    <button
                      onClick={() => setLightboxPost(null)}
                      className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  <p className="text-sm leading-relaxed text-white/90">{lightboxPost.content}</p>
                  {lightboxPost.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {lightboxPost.hashtags.map((tag: string) => (
                        <span key={tag} className="text-xs text-primary/80 font-semibold">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats bar */}
                <div className="px-5 py-3.5 border-t border-white/8 flex items-center gap-5 shrink-0">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Heart size={16} className={lightboxPost.isLiked ? 'fill-red-400 text-red-400' : 'text-muted-foreground'} />
                    <span className="font-bold text-white">{lightboxPost.likesCount ?? 0}</span>
                    <span className="text-muted-foreground text-xs">likes</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <MessageSquare size={16} className="text-muted-foreground" />
                    <span className="font-bold text-white">{lightboxPost.commentsCount ?? 0}</span>
                    <span className="text-muted-foreground text-xs">comments</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Post Modal ── */}
      <AnimatePresence>
        {editPost && (
          <EditPostModal
            post={editPost}
            onClose={() => setEditPost(null)}
            onSaved={(updated) => {
              queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
              setEditPost(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Create Post Modal ── */}
      <AnimatePresence>
        {createOpen && (
          <CreatePostModal
            profile={profile}
            onClose={() => setCreateOpen(false)}
            onCreated={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
              setCreateOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Delete Confirm ── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <motion.div
              className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl p-6 z-10 space-y-5"
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-400" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white mb-1">Delete Post?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This will permanently delete your post and all its likes and comments. This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Preview of post being deleted */}
              {deleteTarget.imageUrl && (
                <div className="h-24 rounded-2xl overflow-hidden border border-white/8">
                  <img src={deleteTarget.imageUrl} alt="post" className="w-full h-full object-cover opacity-60" />
                </div>
              )}
              {deleteTarget.content && (
                <p className="text-xs text-muted-foreground bg-white/4 rounded-xl p-3 line-clamp-2 border border-white/6">
                  "{deleteTarget.content}"
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting…</> : <><Trash2 size={15} />Delete</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Edit Post Modal ──────────────────────────────────────────────────────
function EditPostModal({ post, onClose, onSaved }: { post: any; onClose: () => void; onSaved: (p: any) => void }) {
  const [content, setContent] = useState(post.content || '');
  const [imageUrl, setImageUrl] = useState(post.imageUrl || '');
  const [location, setLocation] = useState(post.location || '');
  const [hashtags, setHashtags] = useState<string[]>(post.hashtags || []);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag)) setHashtags(prev => [...prev, tag]);
    setTagInput('');
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImageUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authFetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content, imageUrl: imageUrl || null, location: location || null, hashtags }),
      });
      setSaved(true);
      onSaved(res);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full sm:max-w-lg bg-[#111] border border-white/10 rounded-t-3xl sm:rounded-3xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8 shrink-0">
          <h3 className="font-black text-lg flex items-center gap-2"><PenLine size={18} className="text-primary" /> Edit Post</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Caption */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Caption</label>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl min-h-[100px] resize-none text-sm"
              placeholder="What's on your mind? Share your ride story…"
              maxLength={500}
            />
            <p className="text-right text-[10px] text-muted-foreground">{content.length}/500</p>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Photo</label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {imageUrl && (
              <div className="relative h-40 rounded-2xl overflow-hidden border border-white/8 mb-2">
                <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                <button onClick={() => setImageUrl('')} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-black/80 transition-colors">
                  <X size={13} className="text-white" />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 text-sm font-semibold transition-all"
              >
                <Upload size={15} className="text-primary" /> Upload Photo
              </button>
            </div>
            <Input
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="Or paste image URL…"
              className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl text-xs"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Location</label>
            <div className="relative">
              <Navigation2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
              <Input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Spiti Valley, Himachal Pradesh"
                className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl pl-8 text-sm"
              />
            </div>
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hashtags</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="add tag, press Enter"
                  className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl pl-7 text-sm"
                />
              </div>
              <button onClick={addTag} className="px-3 rounded-xl bg-primary/15 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/25 transition-colors">Add</button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {hashtags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-full">
                    #{tag}
                    <button onClick={() => setHashtags(prev => prev.filter(t => t !== tag))} className="hover:text-white transition-colors"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-white/8 shrink-0">
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors">Cancel</button>
            <button
              onClick={handleSave}
              disabled={!content.trim() || saving}
              className="flex-1 py-3 rounded-2xl bg-primary text-black font-black text-sm hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {saving ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Saving…</> : saved ? <><CheckCircle2 size={15} />Saved!</> : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Create Post Modal ────────────────────────────────────────────────────
function CreatePostModal({ profile, onClose, onCreated }: { profile: any; onClose: () => void; onCreated: () => void }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [creating, setCreating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag)) setHashtags(prev => [...prev, tag]);
    setTagInput('');
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImageUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!content.trim()) return;
    setCreating(true);
    try {
      await authFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ content, imageUrl: imageUrl || null, location: location || null, hashtags }),
      });
      onCreated();
    } finally {
      setCreating(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full sm:max-w-lg bg-[#111] border border-white/10 rounded-t-3xl sm:rounded-3xl z-10 overflow-hidden flex flex-col max-h-[92vh]"
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-primary/20">
              <AvatarImage src={profile.avatarUrl || ''} className="object-cover" />
              <AvatarFallback className="bg-primary/20 text-primary font-black text-sm">{profile.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-black text-sm">{profile.name}</p>
              <p className="text-[10px] text-primary/70">New Post</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            autoFocus
            className="bg-transparent border-none focus:ring-0 focus-visible:ring-0 text-base resize-none min-h-[100px] p-0 placeholder:text-muted-foreground/50"
            placeholder="Share your ride story, route, or moment…"
            maxLength={500}
          />

          {imageUrl && (
            <div className="relative h-48 rounded-2xl overflow-hidden border border-white/8">
              <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
              <button onClick={() => setImageUrl('')} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-black/80 transition-colors">
                <X size={13} className="text-white" />
              </button>
            </div>
          )}

          {location && (
            <div className="flex items-center gap-2 text-xs text-primary/80 font-semibold">
              <Navigation2 size={12} /> {location}
              <button onClick={() => setLocation('')} className="ml-1 hover:text-white"><X size={10} /></button>
            </div>
          )}

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {hashtags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-full">
                  #{tag}
                  <button onClick={() => setHashtags(prev => prev.filter(t => t !== tag))}><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="px-6 py-4 border-t border-white/8 shrink-0">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <button onClick={() => fileRef.current?.click()} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/8 flex items-center justify-center transition-all" title="Add Photo">
                <ImagePlus size={16} className="text-primary" />
              </button>
              <button
                onClick={() => { const loc = prompt('Enter location:'); if (loc) setLocation(loc); }}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/8 flex items-center justify-center transition-all"
                title="Add Location"
              >
                <Navigation2 size={15} className="text-blue-400" />
              </button>
              <button
                onClick={() => {
                  const tag = prompt('Add hashtag (without #):');
                  if (tag?.trim()) setHashtags(prev => [...new Set([...prev, tag.trim().replace(/^#/, '')])]);
                }}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/8 flex items-center justify-center transition-all"
                title="Add Hashtag"
              >
                <Hash size={15} className="text-amber-400" />
              </button>
            </div>
            <button
              onClick={handleCreate}
              disabled={!content.trim() || creating}
              className="px-6 py-2.5 rounded-full bg-primary text-black font-black text-sm hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              {creating ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Posting…</> : 'Post'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
