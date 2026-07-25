import React, {
  useState, useEffect, useMemo, useRef, useCallback,
} from 'react';
import { useLocation } from 'wouter';
import { useGetDiscoverCandidates, useSwipe } from '@workspace/api-client-react';
import {
  motion, AnimatePresence, useMotionValue, useTransform,
  animate as fmAnimate, useSpring,
} from 'framer-motion';
import {
  MapPin, Navigation, Compass, SlidersHorizontal,
  X, Heart, Star, Shield, Zap, Crown,
  ChevronDown, RefreshCw, CheckCircle2,
  Users, Globe, Route, Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger,
} from '@/components/ui/drawer';

// ─── Constants ────────────────────────────────────────────────────────────────
const RADIUS_STEPS = [10, 25, 50, 75, 100, 150, 250, 500];

const VEHICLE_TYPES = [
  { value: 'adventure', label: 'Adventure', icon: '⛰️' },
  { value: 'cruiser',   label: 'Cruiser',   icon: '🛣️' },
  { value: 'sports',    label: 'Sports',    icon: '🏁' },
  { value: 'scooter',   label: 'Scooter',   icon: '🛵' },
  { value: 'suv',       label: 'SUV',       icon: '🚙' },
  { value: '4x4',       label: '4×4',       icon: '🏔️' },
  { value: 'camper',    label: 'Camper',    icon: '🏕️' },
  { value: 'any',       label: 'Any',       icon: '✨' },
];

const LOOKING_FOR = [
  { value: 'solo',   label: 'Solo',         icon: '🏍️' },
  { value: 'couple', label: 'Couple',       icon: '👫' },
  { value: 'group',  label: 'Group Ride',   icon: '👥' },
  { value: 'women',  label: 'Women Only',   icon: '💪' },
  { value: 'any',    label: 'Any',          icon: '✨' },
];

const GENDER_OPTIONS = [
  { value: 'no_preference',  label: 'Any' },
  { value: 'male',           label: 'Male' },
  { value: 'female',         label: 'Female' },
  { value: 'verified_women', label: 'Verified Women' },
];

const RIDING_STYLES = [
  'Weekend Ride', 'Long Tour', 'Camping', 'Overlanding',
  'Photography', 'Off-Road', 'Mountains', 'Beach',
];

const LANGUAGES = [
  'English', 'Hindi', 'Kannada', 'Tamil', 'Telugu',
  'Marathi', 'Punjabi', 'Gujarati', 'Bengali',
];

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Chandigarh', 'Goa', 'Kochi',
  'Visakhapatnam', 'Srinagar', 'Shimla', 'Manali', 'Rishikesh',
  'Leh', 'Spiti', 'Munnar', 'Ooty', 'Coorg',
];

const PLANS = [
  {
    id: 'free', name: 'Free', price: '₹0', color: 'text-white/50', border: 'border-white/10',
    features: ['25 swipes/day', 'Basic Matching', 'Chat after Match'],
  },
  {
    id: 'plus', name: 'Plus', price: '₹299', color: 'text-blue-400', border: 'border-blue-500/40',
    bg: 'from-blue-900/20 to-transparent', icon: <Zap size={13} className="text-blue-400" />,
    features: ['Unlimited Swipes', 'Undo Swipe', 'Passport Mode', 'No Ads'],
  },
  {
    id: 'gold', name: 'Gold', price: '₹599', color: 'text-amber-400', border: 'border-amber-500/40',
    bg: 'from-amber-900/20 to-transparent', icon: <Star size={13} className="text-amber-400" fill="currentColor" />,
    badge: 'Popular',
    features: ['Everything in Plus', 'See Who Likes You', 'Top Picks', 'AI Compatibility', 'Verified Badge'],
  },
  {
    id: 'platinum', name: 'Platinum', price: '₹999', color: 'text-purple-400', border: 'border-purple-500/40',
    bg: 'from-purple-900/20 to-transparent', icon: <Crown size={13} className="text-purple-400" />,
    features: ['Everything in Gold', 'Message Before Match', 'Unlimited Boosts', 'VIP Support'],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Filters {
  radius: number;
  location: string;
  vehicles: string[];
  lookingFor: string[];
  gender: string;
  ageMin: number;
  ageMax: number;
  ridingStyles: string[];
  languages: string[];
  verifiedOnly: boolean;
  insuranceVerified: boolean;
  onlineNow: boolean;
}

interface LocationState {
  city: string;
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
}

const DEFAULT_FILTERS: Filters = {
  radius: 100,
  location: '',
  vehicles: [],
  lookingFor: [],
  gender: 'no_preference',
  ageMin: 18,
  ageMax: 60,
  ridingStyles: [],
  languages: [],
  verifiedOnly: false,
  insuranceVerified: false,
  onlineNow: false,
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_TRIPS   = [3, 7, 12, 2, 18, 5, 9, 24, 6, 14];
const MOCK_RATING  = [4.6, 4.9, 4.2, 5.0, 4.7, 4.4, 4.8, 4.5, 4.3, 4.9];
const MOCK_GROUPS  = [0, 1, 2, 3, 0, 1, 2, 0, 1, 3];
const MOCK_LANGS: Record<string, string[]> = {
  Mumbai: ['English', 'Hindi', 'Marathi'],
  Delhi: ['Hindi', 'English'],
  Bangalore: ['English', 'Kannada'],
  default: ['English', 'Hindi'],
};
const MOCK_RIDES = [
  'Spiti Valley · Aug 3', 'Leh–Manali · Sep 1', 'Coorg Weekend · Jul 28',
  'Rajasthan Tour · Oct 5', 'Goa Highway · Aug 18', 'Shimla Loop · Sep 14',
];
const MOCK_BIO = [
  'Adventure seeker who lives for the open road. Looking for a companion for Himalayan rides.',
  'Weekend warrior and mountain lover. Safety first, thrills always.',
  'Overlander with 50k km under my belt. Happy to ride with beginners too!',
  'Photography rider — I stop everywhere. Need a patient co-rider!',
  'Group ride organizer. Always planning the next big trip across India.',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcCompatibility(rider: any, filters: Filters): number {
  let score = 45;
  const dist = rider.distanceKm ?? 100;
  if (dist < 25) score += 20;
  else if (dist < 75) score += 14;
  else if (dist < 150) score += 8;
  else if (dist < 300) score += 4;
  if (filters.vehicles.length && rider.vehicleType) {
    if (filters.vehicles.some((v: string) => rider.vehicleType.toLowerCase().includes(v))) score += 15;
  } else score += 8;
  if (filters.ridingStyles.length && rider.travelStyle) {
    if (filters.ridingStyles.some((s: string) => rider.travelStyle.toLowerCase().includes(s.toLowerCase()))) score += 12;
  } else score += 6;
  if (rider.interests?.length) score += Math.min(rider.interests.length * 2, 8);
  return Math.min(score, 99);
}

function applyFilters(candidates: any[], filters: Filters): any[] {
  return candidates.filter(c => {
    if (c.distanceKm > filters.radius) return false;
    if (filters.verifiedOnly && !c.isVerified) return false;
    if (filters.vehicles.length && !filters.vehicles.includes('any')) {
      if (!filters.vehicles.some((v: string) => (c.vehicleType ?? '').toLowerCase().includes(v))) return false;
    }
    return true;
  });
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? '#D6FF2F' : score >= 65 ? '#22c55e' : '#f59e0b';
  const springScore = useSpring(0, { stiffness: 60, damping: 20 });
  useEffect(() => { springScore.set(score); }, [score]);
  const dash = useTransform(springScore, v => (v / 100) * circ);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={`${circ}`}
          strokeDashoffset={useTransform(dash, v => circ - v)}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[11px] font-black leading-none" style={{ color }}>{score}%</span>
        <span className="text-[7px] text-white/40 font-medium leading-none mt-0.5">match</span>
      </div>
    </div>
  );
}

// ─── Chip Group ───────────────────────────────────────────────────────────────
function ChipGroup({ options, value, onChange, multi = false }: {
  options: { value: string; label: string; icon?: string }[] | string[];
  value: string | string[];
  onChange: (v: any) => void;
  multi?: boolean;
}) {
  const normalised = (options as any[]).map(o =>
    typeof o === 'string' ? { value: o, label: o } : o);
  const isActive = (v: string) =>
    multi ? (value as string[]).includes(v) : value === v;
  const toggle = (v: string) => {
    if (!multi) { onChange(v); return; }
    const arr = value as string[];
    onChange(arr.includes(v) ? arr.filter((x: string) => x !== v) : [...arr, v]);
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {normalised.map(opt => (
        <motion.button
          key={opt.value} type="button"
          onClick={() => toggle(opt.value)}
          whileTap={{ scale: 0.93 }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
            isActive(opt.value)
              ? 'bg-primary text-black border-primary shadow-[0_0_10px_rgba(214,255,47,0.3)]'
              : 'bg-white/5 text-white/60 border-white/10 hover:border-primary/40 hover:text-white'
          }`}
        >
          {opt.icon && <span>{opt.icon}</span>}
          {opt.label}
        </motion.button>
      ))}
    </div>
  );
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────
function ToggleRow({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-sm text-white/70">{label}</p>
      <Switch checked={checked} onCheckedChange={onChange} className="data-[state=checked]:bg-primary shrink-0" />
    </div>
  );
}

// ─── Filter Section ───────────────────────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5 pb-3">
      <button
        type="button"
        className="w-full flex items-center justify-between mb-2.5 group"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/35 group-hover:text-white/60 transition-colors">{title}</span>
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={13} className="text-white/25" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Age Range Slider ─────────────────────────────────────────────────────────
function AgeRangeSlider({ min, max, onChange }: {
  min: number; max: number; onChange: (min: number, max: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);
  const pct = (v: number) => ((v - 18) / (60 - 18)) * 100;
  const fromPct = useCallback((clientX: number) => {
    if (!trackRef.current) return 18;
    const rect = trackRef.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(18 + p * (60 - 18));
  }, []);
  useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const val = fromPct(clientX);
      if (dragging === 'min') onChange(Math.min(val, max - 1), max);
      else onChange(min, Math.max(val, min + 1));
    };
    const up = () => setDragging(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
    };
  }, [dragging, min, max, fromPct, onChange]);
  return (
    <div className="pt-1 pb-1">
      <div className="flex justify-between text-xs mb-2">
        <span className="font-bold text-primary">{min} yrs</span>
        <span className="font-bold text-primary">{max} yrs</span>
      </div>
      <div ref={trackRef} className="relative h-1.5 rounded-full bg-white/10 mx-2">
        <div className="absolute h-full rounded-full bg-primary" style={{ left: `${pct(min)}%`, right: `${100 - pct(max)}%` }} />
        <div onMouseDown={() => setDragging('min')} onTouchStart={() => setDragging('min')}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-2 border-black shadow-lg cursor-grab active:cursor-grabbing touch-none"
          style={{ left: `${pct(min)}%` }} />
        <div onMouseDown={() => setDragging('max')} onTouchStart={() => setDragging('max')}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-2 border-black shadow-lg cursor-grab active:cursor-grabbing touch-none"
          style={{ left: `${pct(max)}%` }} />
      </div>
    </div>
  );
}

// ─── Location Section ─────────────────────────────────────────────────────────
function LocationSection({ filters, onChange }: { filters: Filters; onChange: (f: Partial<Filters>) => void }) {
  const [loc, setLoc] = useState<LocationState>({ city: '', lat: null, lng: null, loading: false, error: null });

  const detect = () => {
    if (!navigator.geolocation) { setLoc(l => ({ ...l, error: 'Not supported' })); return; }
    setLoc(l => ({ ...l, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let city = `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'en' } });
          const d = await r.json();
          city = d.address?.city || d.address?.town || d.address?.state_district || city;
        } catch { /* fallback */ }
        setLoc({ city, lat, lng, loading: false, error: null });
        onChange({ location: city });
      },
      () => setLoc(l => ({ ...l, loading: false, error: 'Location denied' })),
      { timeout: 10000 },
    );
  };

  return (
    <FilterSection title="Current Location">
      {loc.city ? (
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 mb-2">
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          <span className="text-sm text-white font-semibold flex-1 truncate">{loc.city}</span>
          <button onClick={() => setLoc(l => ({ ...l, city: '' }))} className="text-xs text-white/40 hover:text-white">✕</button>
        </div>
      ) : null}
      <motion.button type="button" onClick={detect} disabled={loc.loading} whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/30 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 transition-all disabled:opacity-60"
      >
        {loc.loading ? <RefreshCw size={13} className="animate-spin" /> : <Navigation size={13} />}
        {loc.loading ? 'Detecting…' : '📍 Use GPS Location'}
      </motion.button>
      {loc.error && <p className="text-xs text-red-400 mt-1.5 text-center">{loc.error}</p>}
    </FilterSection>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────
function FilterPanel({ filters, onChange, onSearch, searching }: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onSearch: () => void;
  searching: boolean;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="space-y-3 overflow-y-auto flex-1 pr-0.5">
      <LocationSection filters={filters} onChange={onChange} />

      <FilterSection title="Search Radius">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">Distance</span>
            <span className="bg-primary text-black text-xs font-black px-2.5 py-0.5 rounded-full">{filters.radius} KM</span>
          </div>
          <input type="range" min={0} max={RADIUS_STEPS.length - 1} step={1}
            value={RADIUS_STEPS.indexOf(filters.radius) === -1 ? 4 : RADIUS_STEPS.indexOf(filters.radius)}
            onChange={e => onChange({ radius: RADIUS_STEPS[parseInt(e.target.value)] })}
            className="w-full accent-primary cursor-pointer"
            style={{ filter: 'drop-shadow(0 0 6px rgba(214,255,47,0.35))' }}
          />
        </div>
      </FilterSection>

      <FilterSection title="Vehicle Type">
        <ChipGroup options={VEHICLE_TYPES} value={filters.vehicles} onChange={v => onChange({ vehicles: v })} multi />
      </FilterSection>

      <FilterSection title="Gender Preference" defaultOpen={false}>
        <ChipGroup options={GENDER_OPTIONS} value={filters.gender} onChange={v => onChange({ gender: v })} />
      </FilterSection>

      <FilterSection title="Looking For">
        <ChipGroup options={LOOKING_FOR} value={filters.lookingFor} onChange={v => onChange({ lookingFor: v })} multi />
      </FilterSection>

      {/* Advanced Filters Collapse */}
      <div className="border-t border-white/5 pt-3">
        <button
          type="button"
          onClick={() => setAdvancedOpen(o => !o)}
          className="w-full flex items-center justify-between text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <span className="font-bold uppercase tracking-wider">Advanced Filters</span>
          <motion.div animate={{ rotate: advancedOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={13} />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {advancedOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mt-3 space-y-3"
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/35 mb-2">Age Range</p>
                <AgeRangeSlider min={filters.ageMin} max={filters.ageMax}
                  onChange={(min, max) => onChange({ ageMin: min, ageMax: max })} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/35 mb-2">Riding Style</p>
                <ChipGroup options={RIDING_STYLES} value={filters.ridingStyles} onChange={v => onChange({ ridingStyles: v })} multi />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/35 mb-2">Language</p>
                <ChipGroup options={LANGUAGES} value={filters.languages} onChange={v => onChange({ languages: v })} multi />
              </div>
              <div className="divide-y divide-white/5 border-t border-white/5 pt-2">
                <ToggleRow label="Verified Riders Only" checked={filters.verifiedOnly} onChange={v => onChange({ verifiedOnly: v })} />
                <ToggleRow label="Insurance Verified" checked={filters.insuranceVerified} onChange={v => onChange({ insuranceVerified: v })} />
                <ToggleRow label="Online Now" checked={filters.onlineNow} onChange={v => onChange({ onlineNow: v })} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Find Ride Partners CTA */}
      <div className="pt-1 pb-1">
        <motion.button
          type="button"
          onClick={onSearch}
          disabled={searching}
          whileHover={{ scale: 1.02, boxShadow: '0 0 28px rgba(214,255,47,0.35)' }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-2xl bg-primary text-black font-black text-sm flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
          style={{ boxShadow: '0 0 16px rgba(214,255,47,0.18)' }}
        >
          {searching ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
          {searching ? 'Searching…' : 'Find Ride Partners'}
        </motion.button>
      </div>
    </div>
  );
}

// ─── Premium Card ─────────────────────────────────────────────────────────────
function PremiumCard() {
  const [selected, setSelected] = useState('gold');
  const { toast } = useToast();

  const handleUpgrade = () => {
    const plan = PLANS.find(p => p.id === selected);
    if (!plan || plan.id === 'free') return;
    toast({
      title: `Upgrade to ${plan.name}`,
      description: `${plan.price}/month — Payment integration coming soon. We'll notify you when it's live!`,
    });
  };

  return (
    <div className="rounded-2xl border border-white/8 bg-card/50 p-4 mt-4 shrink-0">
      <div className="flex items-center gap-2 mb-3">
        <Crown size={15} className="text-primary" />
        <h3 className="text-xs font-black text-white">Unlock Better Matches</h3>
      </div>
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {PLANS.map(plan => (
          <button key={plan.id} type="button" onClick={() => setSelected(plan.id)}
            className={`rounded-xl border p-2.5 text-left transition-all ${
              selected === plan.id
                ? `${plan.border} bg-gradient-to-br ${plan.bg || 'from-white/5 to-transparent'}`
                : 'border-white/5 bg-white/2'
            }`}
          >
            <div className="flex items-center gap-1 mb-1">
              {plan.icon}
              <span className={`text-[10px] font-black ${selected === plan.id ? plan.color : 'text-white/40'}`}>{plan.name}</span>
              {plan.badge && <span className="text-[8px] text-amber-400 font-bold ml-auto">★</span>}
            </div>
            <div className={`text-sm font-black ${selected === plan.id ? plan.color : 'text-white/30'}`}>{plan.price}</div>
            {plan.id !== 'free' && <div className="text-[9px] text-white/25">/month</div>}
          </button>
        ))}
      </div>
      <div className="space-y-1 mb-3">
        {PLANS.find(p => p.id === selected)?.features.map(f => (
          <div key={f} className="flex items-center gap-2 text-xs text-white/55">
            <CheckCircle2 size={10} className="text-primary shrink-0" />
            {f}
          </div>
        ))}
      </div>
      {selected !== 'free' ? (
        <Button onClick={handleUpgrade} className="w-full bg-primary text-black font-black text-xs py-2 rounded-xl h-8">
          Upgrade to {PLANS.find(p => p.id === selected)?.name}
        </Button>
      ) : (
        <div className="text-center text-xs text-white/30 py-1">Current Plan — Free</div>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onIncreaseRadius, onRefresh, onExploreGroups, onCreateRide }: {
  onIncreaseRadius: () => void;
  onRefresh: () => void;
  onExploreGroups: () => void;
  onCreateRide: () => void;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 text-center bg-[#0d1117]/80 backdrop-blur-sm rounded-[32px]">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <svg width="140" height="120" viewBox="0 0 140 120" fill="none">
          <path d="M10 105 Q70 65 130 105" stroke="rgba(214,255,47,0.12)" strokeWidth="3" strokeDasharray="8 4" fill="none" />
          <g opacity="0.65">
            <circle cx="58" cy="65" r="13" stroke="#D6FF2F" strokeWidth="2" fill="none" />
            <circle cx="86" cy="65" r="13" stroke="#D6FF2F" strokeWidth="2" fill="none" />
            <path d="M58 65 L72 47 L86 65" stroke="#D6FF2F" strokeWidth="2" fill="none" />
            <path d="M72 47 L82 42 L90 56" stroke="#D6FF2F" strokeWidth="1.5" fill="none" />
          </g>
          {[[25, 25], [115, 20], [15, 60], [125, 50], [70, 15]].map(([cx, cy], i) => (
            <motion.circle key={i} cx={cx} cy={cy} r="2" fill="#D6FF2F"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, delay: i * 0.4 }} />
          ))}
          <motion.g style={{ transformOrigin: '115px 30px' }} animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
            <circle cx="115" cy="30" r="11" stroke="rgba(214,255,47,0.3)" strokeWidth="1.5" fill="none" />
            <path d="M115 21 L118 30 L115 33 L112 30 Z" fill="#D6FF2F" fillOpacity="0.8" />
            <path d="M115 39 L112 30 L115 27 L118 30 Z" fill="white" fillOpacity="0.3" />
          </motion.g>
        </svg>
      </motion.div>
      <div>
        <h3 className="text-lg font-black text-white mb-1.5">No compatible riders found today</h3>
        <p className="text-sm text-white/40">Try increasing your search radius.</p>
      </div>
      <div className="flex flex-col gap-2.5 w-full max-w-[260px]">
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button onClick={onIncreaseRadius} className="bg-primary text-black font-bold w-full gap-2">
            <MapPin size={14} /> Increase Radius
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button onClick={onRefresh} variant="outline" className="border-white/15 text-white/60 hover:text-white hover:border-white/30 w-full gap-2">
            <RefreshCw size={14} /> Refresh
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button onClick={onExploreGroups} variant="outline" className="border-white/15 text-white/60 hover:text-white hover:border-white/30 w-full gap-2">
            <Users size={14} /> Explore Groups
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button onClick={onCreateRide} variant="outline" className="border-white/15 text-white/60 hover:text-white hover:border-white/30 w-full gap-2">
            <Route size={14} /> Create Ride
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Map Placeholder ──────────────────────────────────────────────────────────
function MapPlaceholder({ riders }: { riders: any[] }) {
  return (
    <div className="relative rounded-[32px] overflow-hidden bg-[#0a0f0a] border border-white/8 w-full" style={{ height: 'min(720px, 75svh)' }}>
      <svg className="absolute inset-0 w-full h-full opacity-8" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D6FF2F" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#map-grid)" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="absolute rounded-full border border-primary/15"
            animate={{ scale: [1, 5 + i * 1.5], opacity: [0.4, 0] }}
            transition={{ duration: 3.5, delay: i * 1.1, repeat: Infinity }}
            style={{ width: 56, height: 56 }} />
        ))}
        <div className="relative w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center z-10">
          <MapPin size={18} className="text-primary" fill="currentColor" />
        </div>
      </div>
      {riders.slice(0, 8).map((rider, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 80 + (rider.distanceKm / 500) * 120;
        const x = 50 + Math.cos(angle) * (dist / 4.5);
        const y = 50 + Math.sin(angle) * (dist / 6);
        return (
          <motion.div key={rider.id} initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: `${Math.max(10, Math.min(90, x))}%`, top: `${Math.max(10, Math.min(90, y))}%` }}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden shadow-lg shadow-primary/25 group-hover:scale-110 group-hover:border-[3px] transition-all">
                <img src={rider.avatarUrl} alt={rider.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div className="bg-card border border-white/15 rounded-xl px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                  <p className="font-bold text-white">{rider.name}, {rider.age}</p>
                  <p className="text-white/40">{rider.distanceKm} km away</p>
                </div>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45" />
            </div>
          </motion.div>
        );
      })}
      <div className="absolute bottom-5 left-0 right-0 text-center">
        <p className="text-xs text-white/20">Tap a pin to view rider · Google Maps coming soon</p>
      </div>
    </div>
  );
}

// ─── Swipe Card ───────────────────────────────────────────────────────────────
interface SwipeCardRef {
  flyLeft: () => void;
  flyRight: () => void;
  flyUp: () => void;
}

const COVER_GRADIENTS = [
  'from-emerald-950 via-green-900 to-teal-950',
  'from-slate-900 via-blue-950 to-indigo-950',
  'from-amber-950 via-orange-900 to-rose-950',
  'from-zinc-900 via-slate-800 to-gray-900',
  'from-green-950 via-emerald-900 to-lime-950',
  'from-purple-950 via-violet-900 to-indigo-950',
];

function SwipeCard({
  rider, isTop, stackIndex, onSwipe, onMount, filters, index,
}: {
  rider: any;
  isTop: boolean;
  stackIndex: number;
  onSwipe: (direction: string, riderId: number) => void;
  onMount?: (ref: SwipeCardRef) => void;
  filters: Filters;
  index: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-260, 0, 260], [-22, 0, 22]);

  // Stamp overlays
  const likeOpacity    = useTransform(x, [20, 110], [0, 1]);
  const dislikeOpacity = useTransform(x, [-110, -20], [1, 0]);
  const superOpacity   = useTransform(y, [-110, -20], [1, 0]);
  const likeScale      = useTransform(x, [20, 110], [0.7, 1]);
  const dislikeScale   = useTransform(x, [-110, -20], [1, 0.7]);

  const score = useMemo(() => calcCompatibility(rider, filters), [rider, filters]);
  const trips = MOCK_TRIPS[index % MOCK_TRIPS.length];
  const rating = MOCK_RATING[index % MOCK_RATING.length];
  const groups = MOCK_GROUPS[index % MOCK_GROUPS.length];
  const langs = MOCK_LANGS[rider.city] ?? MOCK_LANGS.default;
  const upcomingRide = MOCK_RIDES[index % MOCK_RIDES.length];
  const bio = MOCK_BIO[index % MOCK_BIO.length];
  const coverGradient = COVER_GRADIENTS[index % COVER_GRADIENTS.length];
  const isPremium = index % 4 === 0;
  const isInsured = index % 5 === 0;
  const isOnline = index % 3 === 0;

  const flyOut = useCallback((direction: 'left' | 'right' | 'up') => {
    const targets: Record<string, [number, number]> = {
      left:  [-900, 150],
      right: [900, 150],
      up:    [0, -900],
    };
    const [tx, ty] = targets[direction];
    fmAnimate(x, tx, { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] });
    fmAnimate(y, ty, { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] });
    setTimeout(() => onSwipe(direction, rider.id), 380);
  }, [x, y, rider.id, onSwipe]);

  // Register flyOut functions with parent
  useEffect(() => {
    if (isTop && onMount) {
      onMount({ flyLeft: () => flyOut('left'), flyRight: () => flyOut('right'), flyUp: () => flyOut('up') });
    }
  }, [isTop, flyOut, onMount]);

  const handleDragEnd = (_: any, info: any) => {
    const { offset, velocity } = info;
    if (offset.x > 110 || velocity.x > 550)       flyOut('right');
    else if (offset.x < -110 || velocity.x < -550) flyOut('left');
    else if (offset.y < -110 || velocity.y < -550) flyOut('up');
    else {
      fmAnimate(x, 0, { type: 'spring', stiffness: 350, damping: 30 });
      fmAnimate(y, 0, { type: 'spring', stiffness: 350, damping: 30 });
    }
  };

  const cardScale = isTop ? 1 : 1 - stackIndex * 0.045;
  const cardY     = isTop ? 0 : stackIndex * 22;

  return (
    <motion.div
      animate={{ scale: cardScale, y: isTop ? 0 : cardY }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      drag={isTop ? true : false}
      dragElastic={0.65}
      onDragEnd={isTop ? handleDragEnd : undefined}
      className="absolute inset-0 rounded-[32px] overflow-hidden select-none"
      style={isTop ? {
        x, y, rotate, zIndex: 20,
        cursor: 'grab',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
      } : {
        zIndex: 20 - stackIndex,
        boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
      }}
    >
      {/* Background photo / gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${coverGradient}`}>
        {rider.coverUrl && (
          <img src={rider.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        )}
        {!rider.coverUrl && rider.avatarUrl && (
          <img src={rider.avatarUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm scale-110" />
        )}
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" style={{ top: '40%' }} />

      {/* TOP: Badges */}
      <div className="absolute top-4 left-4 flex flex-col gap-1.5">
        {rider.isVerified && (
          <span className="flex items-center gap-1 bg-blue-500/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg">
            <Shield size={10} /> Verified
          </span>
        )}
        {isPremium && (
          <span className="flex items-center gap-1 bg-amber-500/90 backdrop-blur-md text-black text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg">
            <Crown size={10} /> Premium
          </span>
        )}
        {isInsured && (
          <span className="flex items-center gap-1 bg-emerald-500/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg">
            🛡 Insured
          </span>
        )}
      </div>

      {/* TOP RIGHT: Online + Score */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        {isOnline && (
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-green-400"
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="text-[11px] text-white/90 font-medium">Online</span>
          </div>
        )}
        <div className="bg-black/50 backdrop-blur-md rounded-full p-1.5">
          <ScoreRing score={score} size={60} />
        </div>
      </div>

      {/* Upcoming Ride chip — mid card */}
      <div className="absolute left-4 right-4" style={{ bottom: 290 }}>
        <div className="inline-flex items-center gap-1.5 bg-primary/15 backdrop-blur-sm border border-primary/30 rounded-full px-3 py-1.5">
          <Route size={11} className="text-primary" />
          <span className="text-[11px] text-primary font-bold truncate">{upcomingRide}</span>
        </div>
      </div>

      {/* BOTTOM CONTENT */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
        {/* Name & Age */}
        <div className="flex items-baseline gap-2 mb-1">
          <h2 className="text-3xl font-black text-white tracking-tight">{rider.name}</h2>
          <span className="text-2xl font-light text-white/70">{rider.age}</span>
        </div>

        {/* City · Distance */}
        <div className="flex items-center gap-3 text-sm text-white/55 mb-3">
          <span className="flex items-center gap-1"><MapPin size={12} />{rider.city}</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="flex items-center gap-1"><Navigation size={12} />{rider.distanceKm} km away</span>
        </div>

        {/* Vehicle + Style */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-xs font-semibold px-3 py-1 rounded-full">
            🏍️ {rider.vehicleType ?? 'Motorcycle'}
          </span>
          <span className="bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-xs font-semibold px-3 py-1 rounded-full capitalize">
            {rider.travelStyle ?? 'Adventure'}
          </span>
        </div>

        {/* Bio */}
        <p className="text-sm text-white/60 leading-relaxed mb-3 line-clamp-2">{rider.bio || bio}</p>

        {/* Interests */}
        {rider.interests?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {rider.interests.slice(0, 4).map((tag: string) => (
              <span key={tag} className="bg-primary/15 border border-primary/25 text-primary text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { value: trips, label: 'Trips' },
            { value: `⭐ ${rating}`, label: 'Rating' },
            { value: groups, label: 'Groups' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center bg-white/8 backdrop-blur-sm rounded-2xl py-2.5 border border-white/8">
              <p className="text-sm font-black text-white">{value}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Languages */}
        <div className="flex items-center gap-2 flex-wrap">
          <Globe size={11} className="text-white/25" />
          {langs.map(l => (
            <span key={l} className="text-xs text-white/40">{l}</span>
          ))}
          {groups > 0 && (
            <span className="ml-auto text-xs text-white/40 flex items-center gap-1">
              <Users size={11} /> {groups} mutual group{groups !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ── LIKE stamp (drag right) ── */}
      <motion.div
        style={{ opacity: likeOpacity, scale: likeScale }}
        className="absolute top-14 left-5 border-4 border-[#D6FF2F] rounded-2xl px-4 py-2 -rotate-[18deg] pointer-events-none"
      >
        <span className="text-[#D6FF2F] text-3xl font-black tracking-widest">RIDE!</span>
      </motion.div>

      {/* ── PASS stamp (drag left) ── */}
      <motion.div
        style={{ opacity: dislikeOpacity, scale: dislikeScale }}
        className="absolute top-14 right-5 border-4 border-red-500 rounded-2xl px-4 py-2 rotate-[18deg] pointer-events-none"
      >
        <span className="text-red-500 text-3xl font-black tracking-widest">PASS</span>
      </motion.div>

      {/* ── SUPER stamp (drag up) ── */}
      <motion.div
        style={{ opacity: superOpacity }}
        className="absolute bottom-40 left-1/2 -translate-x-1/2 border-4 border-amber-400 rounded-2xl px-4 py-2 pointer-events-none"
      >
        <span className="text-amber-400 text-3xl font-black tracking-widest">SUPER</span>
      </motion.div>
    </motion.div>
  );
}

// ─── Action Buttons ───────────────────────────────────────────────────────────
function ActionButtons({
  onPass, onSuperRide, onRideTogether, disabled,
}: {
  onPass: () => void;
  onSuperRide: () => void;
  onRideTogether: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-5 pt-5">
      {/* Pass */}
      <motion.button
        type="button" onClick={onPass} disabled={disabled}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.08, boxShadow: '0 0 30px rgba(239,68,68,0.4)' }}
        className="w-16 h-16 rounded-full bg-card border-2 border-red-500/40 flex items-center justify-center text-red-400 shadow-lg disabled:opacity-40 transition-all"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
      >
        <X size={26} strokeWidth={2.5} />
      </motion.button>

      {/* Super Ride */}
      <motion.button
        type="button" onClick={onSuperRide} disabled={disabled}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.08, boxShadow: '0 0 30px rgba(251,191,36,0.5)' }}
        className="w-14 h-14 rounded-full bg-card border-2 border-amber-400/50 flex items-center justify-center text-amber-400 shadow-lg disabled:opacity-40 transition-all"
        style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
      >
        <Star size={22} strokeWidth={2.5} fill="currentColor" />
      </motion.button>

      {/* Ride Together */}
      <motion.button
        type="button" onClick={onRideTogether} disabled={disabled}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.08, boxShadow: '0 0 40px rgba(214,255,47,0.5)' }}
        className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-black shadow-lg disabled:opacity-40 transition-all"
        style={{ boxShadow: '0 8px 32px rgba(214,255,47,0.25)' }}
      >
        <Heart size={26} strokeWidth={2.5} fill="currentColor" />
      </motion.button>
    </div>
  );
}

// ─── Swipe Deck ───────────────────────────────────────────────────────────────
function SwipeDeck({
  riders, onSwipe, filters,
  onIncreaseRadius, onRefresh, onExploreGroups, onCreateRide,
}: {
  riders: any[];
  onSwipe: (direction: string, riderId: number) => void;
  filters: Filters;
  onIncreaseRadius: () => void;
  onRefresh: () => void;
  onExploreGroups: () => void;
  onCreateRide: () => void;
}) {
  const [deck, setDeck] = useState<any[]>(riders);
  const cardControlsRef = useRef<SwipeCardRef | null>(null);

  useEffect(() => { setDeck(riders); }, [riders]);

  const handleSwipe = useCallback((direction: string, riderId: number) => {
    onSwipe(direction, riderId);
    setDeck(prev => prev.filter(r => r.id !== riderId));
  }, [onSwipe]);

  const handleMount = useCallback((ref: SwipeCardRef) => {
    cardControlsRef.current = ref;
  }, []);

  // Top 3 cards to render
  const visibleCards = deck.slice(0, 3);
  const isEmpty = deck.length === 0;

  return (
    <div className="flex flex-col items-center">
      {/* Card Stack */}
      <div className="relative" style={{ width: 420, height: 720 }}>
        <AnimatePresence>
          {isEmpty ? (
            <EmptyState
              onIncreaseRadius={onIncreaseRadius}
              onRefresh={onRefresh}
              onExploreGroups={onExploreGroups}
              onCreateRide={onCreateRide}
            />
          ) : (
            visibleCards.slice().reverse().map((rider, reversedIdx) => {
              const stackIndex = visibleCards.length - 1 - reversedIdx; // 0 = top
              const isTop = stackIndex === 0;
              const globalIdx = riders.findIndex(r => r.id === rider.id);
              return (
                <SwipeCard
                  key={rider.id}
                  rider={rider}
                  isTop={isTop}
                  stackIndex={stackIndex}
                  onSwipe={handleSwipe}
                  onMount={isTop ? handleMount : undefined}
                  filters={filters}
                  index={globalIdx >= 0 ? globalIdx : stackIndex}
                />
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <ActionButtons
        disabled={isEmpty}
        onPass={() => cardControlsRef.current?.flyLeft()}
        onSuperRide={() => cardControlsRef.current?.flyUp()}
        onRideTogether={() => cardControlsRef.current?.flyRight()}
      />
    </div>
  );
}

// ─── Main Discover Page ───────────────────────────────────────────────────────
export default function Discover() {
  const { data: rawCandidates, isLoading, refetch } = useGetDiscoverCandidates({ maxDistance: 500 });
  const swipeMutation = useSwipe();

  const [filters, setFilters]           = useState<Filters>(DEFAULT_FILTERS);
  const [riders, setRiders]             = useState<any[]>([]);
  const [searching, setSearching]       = useState(false);
  const viewMode = 'stack';
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (rawCandidates && rawCandidates.length > 0) {
      setRiders(rawCandidates);
    }
  }, [rawCandidates]);

  const [, navigate] = useLocation();
  const { toast } = useToast();

  const patchFilters = (patch: Partial<Filters>) => setFilters(f => ({ ...f, ...patch }));

  const handleRefresh = async () => {
    setSearching(true);
    await new Promise(r => setTimeout(r, 1200));
    const result = await refetch();
    const fresh = result.data ?? rawCandidates ?? [];
    setRiders(applyFilters(fresh, filters));
    setSearching(false);
    setMobileFilterOpen(false);
  };

  const [matchData, setMatchData] = useState<{ user: any; conversationId: number } | null>(null);

  const handleSwipe = (direction: string, riderId: number) => {
    const action = direction === 'right' ? 'like' : direction === 'up' ? 'superlike' : 'dislike';
    // Find the rider before it's removed from deck so we have their data for the overlay
    const riderInfo = riders.find(r => r.id === riderId);
    swipeMutation.mutate({ data: { targetUserId: riderId, action: action as any } }, {
      onSuccess: (result) => {
        if (result?.isMatch && result.match) {
          setMatchData({ user: result.match.user ?? riderInfo, conversationId: result.match.conversationId! });
        } else if (direction === 'right') {
          toast({ title: '❤️ Ride Request Sent!', description: "You'll be notified when they accept." });
        } else if (direction === 'up') {
          toast({ title: '⭐ Super Ride Sent!', description: "They'll see you at the top of their list." });
        }
      },
    });
  };

  const handleIncreaseRadius = () => {
    const next = Math.min(filters.radius * 2, 500);
    setFilters(f => ({ ...f, radius: next }));
    handleRefresh();
  };

  const handleExploreGroups = () => navigate('/groups');
  const handleCreateRide    = () => navigate('/feed');

  const nearbyCount = riders.length;

  // Shared filter panel (desktop + mobile)
  const filterPanelContent = (
    <div className="flex flex-col h-full overflow-hidden">
      <FilterPanel filters={filters} onChange={patchFilters} onSearch={handleRefresh} searching={searching} />
      <PremiumCard />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex relative">

      {/* ─── Match Overlay ─── */}
      <AnimatePresence>
        {matchData && (
          <motion.div
            key="match-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md"
          >
            {/* Burst rings */}
            {[0, 1, 2].map(i => (
              <motion.div key={i}
                className="absolute rounded-full border border-primary/20"
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 4 + i * 1.5, opacity: 0 }}
                transition={{ duration: 1.2, delay: i * 0.18, ease: 'easeOut' }}
                style={{ width: 120, height: 120 }}
              />
            ))}

            {/* Avatars */}
            <div className="flex items-center gap-0 mb-8 relative">
              <motion.div
                initial={{ x: 60, opacity: 0, scale: 0.7 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                className="w-28 h-28 rounded-full border-4 border-primary overflow-hidden shadow-[0_0_40px_rgba(214,255,47,0.4)] z-10"
              >
                {matchData.user?.avatarUrl
                  ? <img src={matchData.user.avatarUrl} alt={matchData.user?.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-black text-3xl">{matchData.user?.name?.[0] ?? '?'}</div>
                }
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.35 }}
                className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center z-20 shadow-[0_0_20px_rgba(214,255,47,0.6)]"
              >
                <Heart size={18} className="text-black" fill="black" />
              </motion.div>
            </div>

            {/* Text */}
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-8 px-6"
            >
              <p className="text-primary font-black text-4xl tracking-tight mb-2">It's a Match!</p>
              <p className="text-white/60 text-sm">
                You and <span className="text-white font-bold">{matchData.user?.name}</span> both want to ride together 🏍️
              </p>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="flex flex-col gap-3 w-full max-w-[260px]"
            >
              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ boxShadow: '0 0 30px rgba(214,255,47,0.4)' }}
                onClick={() => { setMatchData(null); navigate(`/messages?conv=${matchData.conversationId}`); }}
                className="w-full py-3.5 rounded-2xl bg-primary text-black font-black text-sm flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Send Message
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setMatchData(null)}
                className="w-full py-3 rounded-2xl border border-white/10 text-white/50 text-sm font-semibold hover:text-white hover:border-white/20 transition-colors"
              >
                Keep Swiping
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── LEFT SIDEBAR (320px, desktop) ─── */}
      <aside className="hidden lg:flex flex-col shrink-0 border-r border-white/5 p-4"
        style={{ width: 320 }}>
        <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-white/8 p-4 flex flex-col h-full overflow-hidden">
          {/* Sidebar header */}
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
              <Compass size={18} className="text-primary" />
            </motion.div>
            <h2 className="text-sm font-black text-white">Find Your Ride Partner</h2>
          </div>

          {filterPanelContent}
        </div>
      </aside>

      {/* ─── MAIN AREA ─── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* ─── TOP BAR ─── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile filter button */}
            <Drawer open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <DrawerTrigger asChild>
                <button className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white transition-colors">
                  <SlidersHorizontal size={14} />
                  <span className="text-xs font-semibold">Filters</span>
                </button>
              </DrawerTrigger>
              <DrawerContent className="bg-card border-white/10 max-h-[92vh]">
                <DrawerHeader>
                  <DrawerTitle className="flex items-center gap-2 text-sm">
                    <Compass size={15} className="text-primary" />
                    Find Your Ride Partner
                  </DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-4 overflow-y-auto" style={{ maxHeight: 'calc(92vh - 80px)' }}>
                  <FilterPanel filters={filters} onChange={patchFilters} />
                  <PremiumCard />
                </div>
              </DrawerContent>
            </Drawer>

            {/* Rider count */}
            {!isLoading && (
              <div className="flex items-center gap-1.5">
                <motion.div className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                <span className="text-white font-black text-sm">{nearbyCount}</span>
                <span className="text-white/40 text-sm">Riders Nearby</span>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <RefreshCw size={13} className="animate-spin text-primary" />
                Scanning area…
              </div>
            )}
          </div>

        </div>

        {/* ─── CONTENT ─── */}
        <div className="flex-1 overflow-y-auto flex items-start justify-center py-6 px-4">
          <AnimatePresence mode="wait">
            {searching ? (
              <motion.div key="searching"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-6 mt-20"
              >
                <div className="relative">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i}
                      className="absolute inset-0 rounded-full border border-primary/30"
                      animate={{ scale: [1, 2.5 + i * 0.5], opacity: [0.6, 0] }}
                      transition={{ duration: 1.8, delay: i * 0.4, repeat: Infinity, ease: 'easeOut' }}
                      style={{ margin: '-8px' }}
                    />
                  ))}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="relative w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center"
                  >
                    <Compass size={30} className="text-primary" />
                  </motion.div>
                </div>
                <p className="text-white/60 text-sm font-medium animate-pulse">Finding your ride partner…</p>
              </motion.div>
            ) : isLoading ? (
              <motion.div key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 mt-20"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center"
                >
                  <Compass size={26} className="text-primary" />
                </motion.div>
                <p className="text-white/40 text-sm">Scanning nearby riders…</p>
              </motion.div>
            ) : (
              <motion.div key="stack"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              >
                <SwipeDeck
                  riders={riders}
                  onSwipe={handleSwipe}
                  filters={filters}
                  onIncreaseRadius={handleIncreaseRadius}
                  onRefresh={handleRefresh}
                  onExploreGroups={handleExploreGroups}
                  onCreateRide={handleCreateRide}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
