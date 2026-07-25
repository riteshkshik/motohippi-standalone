import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sliders, ChevronDown, ChevronUp,
  Star, Shield, Users, Heart, X, Bookmark,
  Compass, Bike, Car, Loader2, MapPin, Navigation,
  LayoutGrid, Map, SlidersHorizontal, Check,
  Zap, Clock, BadgeCheck, Route, LocateFixed,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { customFetch } from '@workspace/api-client-react/custom-fetch';

// ─── Types ────────────────────────────────────────────────────────────────────
interface RiderResult {
  id: number;
  name: string;
  avatarUrl?: string;
  coverUrl?: string;
  city?: string;
  vehicleType?: string;
  adventureLevel?: string;
  travelStyle?: string;
  bio?: string;
  isVerified?: boolean;
  tripsCount?: number;
  compatibilityScore: number;
  distanceKm: number;
  rating: number;
  mutualGroups: number;
  lookingFor: string[];
  interests: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const RADIUS_OPTIONS = [10, 25, 50, 75, 100, 250, 500];

const VEHICLE_TYPES = [
  { value: 'any', label: 'Any', icon: '🚗' },
  { value: 'motorcycle', label: 'Motorcycle', icon: '🏍️' },
  { value: 'adventure', label: 'Adventure Moto', icon: '⛰️' },
  { value: 'cruiser', label: 'Cruiser', icon: '🛣️' },
  { value: 'sports', label: 'Sports Bike', icon: '🏁' },
  { value: 'scooter', label: 'Scooter', icon: '🛵' },
  { value: 'suv', label: 'SUV', icon: '🚙' },
  { value: '4x4', label: '4×4', icon: '🏔️' },
  { value: 'pickup', label: 'Pickup Truck', icon: '🛻' },
  { value: 'camper', label: 'Camper', icon: '🏕️' },
];

const TRAVEL_STYLES = [
  'Weekend Ride', 'Long Tour', 'Off-Road', 'Camping',
  'Overlanding', 'Leisure', 'Photography', 'Food Trail',
  'Mountains', 'Beach Ride', 'City Ride', 'No Preference',
];

const LOOKING_FOR = [
  'Solo Rider', 'Group Ride', 'Couple Ride', 'Women Riders',
];

const DATE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'weekend', label: 'This Weekend' },
  { value: 'custom', label: 'Custom Date' },
];

const GENDER_OPTIONS = [
  { value: 'no_preference', label: 'No Preference' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'verified_women', label: 'Verified Women Riders' },
];

const LANGUAGES = [
  'English', 'Hindi', 'Kannada', 'Tamil', 'Telugu',
  'Marathi', 'Punjabi', 'Gujarati', 'Bengali', 'Any',
];

const EXPERIENCE_LEVELS = [
  { value: 'any', label: 'Any' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'experienced', label: 'Experienced' },
  { value: 'expert', label: 'Expert' },
];

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 85 ? '#D6FF2F' : score >= 70 ? '#1A6B2E' : '#6b7280';
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="absolute text-xs font-black" style={{ color }}>{score}%</span>
    </div>
  );
}

// ─── Chip selector ────────────────────────────────────────────────────────────
function ChipGroup({
  options, value, onChange, multi = false,
}: {
  options: string[];
  value: string | string[];
  onChange: (v: any) => void;
  multi?: boolean;
}) {
  const isActive = (opt: string) =>
    multi ? (value as string[]).includes(opt) : value === opt;

  const toggle = (opt: string) => {
    if (!multi) { onChange(opt); return; }
    const arr = value as string[];
    onChange(arr.includes(opt) ? arr.filter(x => x !== opt) : [...arr, opt]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => toggle(opt)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            isActive(opt)
              ? 'bg-primary text-black border-primary'
              : 'bg-white/5 text-muted-foreground border-white/10 hover:border-primary/40 hover:text-white'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Loading animation ────────────────────────────────────────────────────────
function SearchingLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center py-24 gap-6"
    >
      <div className="relative w-24 h-24">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-primary"
            animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, delay: i * 0.6, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <Compass size={28} className="text-primary animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-white">Finding compatible riders near you...</p>
        <p className="text-sm text-muted-foreground mt-1">Analysing routes, styles & preferences</p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 gap-6 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
        <Navigation size={36} className="text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">No Partner Found</h3>
        <p className="text-muted-foreground max-w-sm">
          No partners found within your selected radius. Try adjusting your filters.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg w-full">
        {['Increase Radius', 'Change Destination', 'Try Another Date', 'Explore Groups', 'Reset Filters'].map(action => (
          <button
            key={action}
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-muted-foreground hover:text-white hover:border-primary/40 transition-all"
          >
            {action}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Rider card ───────────────────────────────────────────────────────────────
function RiderCard({ rider, index }: { rider: RiderResult; index: number }) {
  const [saved, setSaved] = useState(false);
  const [passed, setPassed] = useState(false);
  const [requested, setRequested] = useState(false);

  if (passed) return null;

  const coverImages = [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1541484162-5e6e5f0b1c30?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&h=500&fit=crop',
  ];
  const cover = rider.coverUrl || coverImages[index % coverImages.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group relative rounded-2xl overflow-hidden border border-white/8 bg-card/40 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_40px_rgba(26,107,46,0.15)]"
    >
      {/* Cover photo */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={cover}
          alt={rider.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Compatibility score */}
        <div className="absolute top-3 right-3">
          <ScoreRing score={rider.compatibilityScore} />
        </div>

        {/* Verified badge */}
        {rider.isVerified && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-blue-500/90 backdrop-blur rounded-full px-2.5 py-1">
            <BadgeCheck size={13} className="text-white" />
            <span className="text-white text-[10px] font-bold">VERIFIED</span>
          </div>
        )}

        {/* Avatar + name overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end gap-3">
          <Avatar className="h-14 w-14 border-2 border-primary/60 shadow-xl shrink-0">
            <AvatarImage src={rider.avatarUrl || ''} className="object-cover" />
            <AvatarFallback className="text-xl font-black bg-primary/20 text-primary">{rider.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-lg leading-tight truncate">{rider.name}</h3>
              {rider.isVerified && <BadgeCheck size={16} className="text-blue-400 shrink-0" />}
            </div>
            <p className="text-white/70 text-xs flex items-center gap-1">
              <MapPin size={11} />
              {rider.city || 'India'} • {rider.distanceKm} km away
            </p>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        {/* Bio */}
        {rider.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{rider.bio}</p>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 rounded-xl p-2.5 text-center">
            <p className="text-base font-black text-white">{rider.tripsCount ?? 0}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Trips</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 text-center">
            <p className="text-base font-black text-white flex items-center justify-center gap-0.5">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              {rider.rating}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Rating</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 text-center">
            <p className="text-base font-black text-white">{rider.mutualGroups}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Mutual</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {rider.vehicleType && (
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold border border-primary/20 capitalize">
              🏍️ {rider.vehicleType}
            </span>
          )}
          {rider.adventureLevel && (
            <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/70 text-[11px] font-semibold border border-white/10 capitalize">
              ⚡ {rider.adventureLevel}
            </span>
          )}
          {rider.travelStyle && (
            <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/70 text-[11px] font-semibold border border-white/10 capitalize">
              🧭 {rider.travelStyle}
            </span>
          )}
        </div>

        {/* Interests */}
        {rider.interests.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {rider.interests.slice(0, 3).map(i => (
              <span key={i} className="text-[10px] text-muted-foreground border border-white/8 rounded px-2 py-0.5 capitalize">{i.replace(/_/g, ' ')}</span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setPassed(true)}
            className="flex-1 h-10 rounded-xl bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/40 text-muted-foreground hover:text-red-400 transition-all flex items-center justify-center gap-1.5 text-sm font-semibold"
          >
            <X size={15} /> Pass
          </button>
          <button
            onClick={() => setSaved(!saved)}
            className={`h-10 w-10 rounded-xl border transition-all flex items-center justify-center ${
              saved
                ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                : 'bg-white/5 border-white/10 text-muted-foreground hover:text-yellow-400 hover:border-yellow-500/40'
            }`}
          >
            <Bookmark size={15} className={saved ? 'fill-yellow-400' : ''} />
          </button>
          <button
            onClick={() => setRequested(true)}
            className={`flex-1 h-10 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${
              requested
                ? 'bg-primary/20 border border-primary/40 text-primary'
                : 'bg-primary hover:bg-primary/90 text-black'
            }`}
          >
            {requested ? (
              <><Check size={15} /> Requested</>
            ) : (
              <><Heart size={15} /> Ride Together</>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Map placeholder ──────────────────────────────────────────────────────────
function MapView({ riders }: { riders: RiderResult[] }) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-card/40 h-[520px] flex flex-col items-center justify-center gap-4">
      {/* Stylised grid background */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(26,107,46,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(26,107,46,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Pulsing pins */}
      {riders.slice(0, 8).map((r, i) => {
        const top = 15 + (i * 47 + 13) % 68;
        const left = 8 + (i * 67 + 19) % 82;
        return (
          <motion.div
            key={r.id}
            className="absolute"
            style={{ top: `${top}%`, left: `${left}%` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-primary"
                animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              />
              <div className="relative w-10 h-10 rounded-full border-2 border-primary bg-background shadow-lg overflow-hidden">
                {r.avatarUrl && <img src={r.avatarUrl} alt={r.name} className="w-full h-full object-cover" />}
                <div className="absolute inset-0 flex items-center justify-center text-primary font-black text-sm">
                  {r.name.charAt(0)}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      <div className="relative z-10 flex flex-col items-center gap-3 text-center px-6">
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Map size={26} className="text-primary" />
        </div>
        <p className="text-white font-bold text-lg">{riders.length} Riders Near You</p>
        <p className="text-muted-foreground text-sm max-w-xs">
          Full interactive map with Google Maps integration — enable location to see precise rider positions.
        </p>
        <button className="mt-1 px-5 py-2 rounded-full bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-colors">
          Enable Location
        </button>
      </div>
    </div>
  );
}

// ─── Reverse-geocode using Nominatim (no API key required) ───────────────────
async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; country: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const a = data.address || {};
    const city =
      a.city || a.town || a.village || a.county || a.state_district || a.state || '';
    const country = a.country || '';
    return { city, country };
  } catch {
    return { city: '', country: '' };
  }
}

type LocationStatus = 'idle' | 'detecting' | 'detected' | 'denied';

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SearchPage() {
  // Location
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [locationLabel, setLocationLabel] = useState('');

  // Filters
  const [radius, setRadius] = useState(50);
  const [travelDate, setTravelDate] = useState('weekend');
  const [vehicleType, setVehicleType] = useState('any');
  const [travelStyle, setTravelStyle] = useState('No Preference');
  const [lookingFor, setLookingFor] = useState('Any');
  const [ageRange, setAgeRange] = useState([18, 60]);
  const [gender, setGender] = useState('no_preference');
  const [language, setLanguage] = useState('Any');
  const [experienceLevel, setExperienceLevel] = useState('any');
  const [verifiedRiderOnly, setVerifiedRiderOnly] = useState(false);
  const [verifiedProfileOnly, setVerifiedProfileOnly] = useState(false);
  const [onlineNow, setOnlineNow] = useState(false);
  const [availableWeekend, setAvailableWeekend] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Results
  const [riders, setRiders] = useState<RiderResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // ── Auto-detect location on mount ─────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { city, country } = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        const label = [city, country].filter(Boolean).join(', ') || 'Your Location';
        setLocationLabel(label);
        setLocationStatus('detected');
        // Auto-trigger search immediately after location is resolved
        setLoading(true);
        setSearched(true);
        setFiltersOpen(false);
        try {
          const params = new URLSearchParams({ vehicleType: 'any', travelStyle: '', lookingFor: '', gender: 'no_preference', experienceLevel: 'any', verifiedOnly: 'false', ageMin: '18', ageMax: '60' });
          const res = await customFetch(`/api/search/riders?${params}`);
          const data = await res.json();
          setRiders(Array.isArray(data) ? data : []);
        } catch {
          setRiders([]);
        } finally {
          setLoading(false);
        }
      },
      () => setLocationStatus('denied'),
      { timeout: 8000, maximumAge: 60000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    setFiltersOpen(false);

    const params = new URLSearchParams({
      vehicleType,
      travelStyle: travelStyle === 'No Preference' ? '' : travelStyle,
      lookingFor: lookingFor === 'Any' ? '' : lookingFor,
      gender,
      experienceLevel,
      verifiedOnly: verifiedRiderOnly || verifiedProfileOnly ? 'true' : 'false',
      ageMin: ageRange[0].toString(),
      ageMax: ageRange[1].toString(),
    });

    try {
      const res = await customFetch(`/api/search/riders?${params}`);
      const data = await res.json();
      setRiders(Array.isArray(data) ? data : []);
    } catch {
      setRiders([]);
    } finally {
      setLoading(false);
    }
  }, [vehicleType, travelStyle, lookingFor, gender, experienceLevel, verifiedRiderOnly, verifiedProfileOnly, ageRange]);

  const handleReset = () => {
    setVehicleType('any');
    setTravelStyle('No Preference');
    setLookingFor('Any');
    setGender('no_preference');
    setExperienceLevel('any');
    setVerifiedRiderOnly(false);
    setVerifiedProfileOnly(false);
    setAgeRange([18, 60]);
    setSearched(false);
    setRiders([]);
    setFiltersOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-10 pb-8 px-4 md:px-8 text-center border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/6 blur-[120px] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-4">
            <Zap size={14} className="text-primary" />
            <span className="text-primary text-xs font-bold uppercase tracking-widest">AI-Powered Matching</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
            Find Your Next<br />
            <span className="text-primary">Ride Partner</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Discover riders and overlanders travelling in the same direction, from nearby locations, or planning similar adventures.
          </p>

          {/* Location status pill */}
          <div className="mt-5 flex justify-center">
            <AnimatePresence mode="wait">
              {locationStatus === 'detecting' && (
                <motion.div key="detecting"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="inline-flex items-center gap-2 bg-white/6 border border-white/12 rounded-full px-4 py-2 text-sm text-muted-foreground"
                >
                  <Loader2 size={13} className="animate-spin text-primary" />
                  Detecting your location…
                </motion.div>
              )}
              {locationStatus === 'detected' && (
                <motion.div key="detected"
                  initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 text-sm font-semibold text-primary"
                >
                  <LocateFixed size={13} />
                  {locationLabel}
                  <span className="text-white/40 font-normal">· {radius} km radius</span>
                </motion.div>
              )}
              {locationStatus === 'denied' && (
                <motion.div key="denied"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-muted-foreground"
                >
                  <MapPin size={13} />
                  Location access denied — adjust filters manually
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8 space-y-6">
        {/* ── Filter Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl overflow-hidden"
        >
          {/* Header */}
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal size={18} className="text-primary" />
              <span className="font-bold text-white text-base">Search Filters</span>
            </div>
            {filtersOpen ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
          </button>

          <AnimatePresence initial={false}>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 space-y-6 border-t border-white/5 pt-5">
                  {/* Radius slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Route size={13} className="text-primary" /> Search Radius
                      </label>
                      <span className="text-sm font-bold text-primary">{radius} KM</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">10</span>
                      <input
                        type="range"
                        min={0}
                        max={RADIUS_OPTIONS.length - 1}
                        step={1}
                        value={RADIUS_OPTIONS.indexOf(radius) === -1 ? 2 : RADIUS_OPTIONS.indexOf(radius)}
                        onChange={e => setRadius(RADIUS_OPTIONS[parseInt(e.target.value)])}
                        className="flex-1 accent-primary h-1.5 cursor-pointer"
                      />
                      <span className="text-xs text-muted-foreground">500</span>
                    </div>
                    <div className="flex justify-between">
                      {RADIUS_OPTIONS.map(r => (
                        <button
                          key={r}
                          onClick={() => setRadius(r)}
                          className={`text-[10px] font-semibold transition-colors ${radius === r ? 'text-primary' : 'text-muted-foreground/50 hover:text-muted-foreground'}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Travel date */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={13} className="text-primary" /> Travel Date
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DATE_OPTIONS.map(d => (
                        <button
                          key={d.value}
                          onClick={() => setTravelDate(d.value)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                            travelDate === d.value
                              ? 'bg-primary text-black border-primary'
                              : 'bg-white/5 text-muted-foreground border-white/10 hover:border-primary/40 hover:text-white'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle type */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Bike size={13} className="text-primary" /> Vehicle Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {VEHICLE_TYPES.map(v => (
                        <button
                          key={v.value}
                          onClick={() => setVehicleType(v.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                            vehicleType === v.value
                              ? 'bg-primary text-black border-primary'
                              : 'bg-white/5 text-muted-foreground border-white/10 hover:border-primary/40 hover:text-white'
                          }`}
                        >
                          <span>{v.icon}</span> {v.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Travel style */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Compass size={13} className="text-primary" /> Travel Style
                    </label>
                    <ChipGroup options={TRAVEL_STYLES} value={travelStyle} onChange={setTravelStyle} />
                  </div>

                  {/* Looking for */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={13} className="text-primary" /> Looking For
                    </label>
                    <ChipGroup options={LOOKING_FOR} value={lookingFor} onChange={setLookingFor} />
                  </div>

                  {/* Age + gender */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">🎂 Age Range</label>
                        <span className="text-sm font-bold text-primary">{ageRange[0]}–{ageRange[1]}+</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">18</span>
                        <input
                          type="range" min={18} max={60} value={ageRange[0]}
                          onChange={e => setAgeRange([parseInt(e.target.value), ageRange[1]])}
                          className="flex-1 accent-primary h-1.5 cursor-pointer"
                        />
                        <input
                          type="range" min={18} max={60} value={ageRange[1]}
                          onChange={e => setAgeRange([ageRange[0], parseInt(e.target.value)])}
                          className="flex-1 accent-primary h-1.5 cursor-pointer"
                        />
                        <span className="text-xs text-muted-foreground">60+</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gender Preference</label>
                      <div className="flex flex-wrap gap-2">
                        {GENDER_OPTIONS.map(g => (
                          <button
                            key={g.value}
                            onClick={() => setGender(g.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                              gender === g.value
                                ? 'bg-primary text-black border-primary'
                                : 'bg-white/5 text-muted-foreground border-white/10 hover:border-primary/40 hover:text-white'
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Language + Experience */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Language</label>
                      <ChipGroup options={LANGUAGES} value={language} onChange={setLanguage} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Experience Level</label>
                      <div className="flex flex-wrap gap-2">
                        {EXPERIENCE_LEVELS.map(e => (
                          <button
                            key={e.value}
                            onClick={() => setExperienceLevel(e.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                              experienceLevel === e.value
                                ? 'bg-primary text-black border-primary'
                                : 'bg-white/5 text-muted-foreground border-white/10 hover:border-primary/40 hover:text-white'
                            }`}
                          >
                            {e.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Verified Rider Only', val: verifiedRiderOnly, set: setVerifiedRiderOnly },
                      { label: 'Verified Profile Only', val: verifiedProfileOnly, set: setVerifiedProfileOnly },
                      { label: 'Online Now', val: onlineNow, set: setOnlineNow },
                      { label: 'Available This Weekend', val: availableWeekend, set: setAvailableWeekend },
                    ].map(t => (
                      <div key={t.label} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/8">
                        <span className="text-xs font-semibold text-white/80">{t.label}</span>
                        <Switch
                          checked={t.val}
                          onCheckedChange={t.set}
                          className="data-[state=checked]:bg-primary scale-90"
                        />
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleSearch}
                    className="w-full h-14 rounded-2xl bg-[#D6FF2F] hover:bg-[#c8f020] text-black font-black text-base tracking-wide flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_30px_rgba(214,255,47,0.25)]"
                  >
                    <Search size={20} />
                    Find Ride Partners
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Results ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <SearchingLoader key="loader" />
          ) : searched && riders.length === 0 ? (
            <EmptyState key="empty" onReset={handleReset} />
          ) : riders.length > 0 ? (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Results toolbar */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-white font-bold text-lg">{riders.length} Riders Found</p>
                  <p className="text-muted-foreground text-xs mt-0.5">Sorted by compatibility score</p>
                </div>
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === 'grid' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    <LayoutGrid size={14} /> Grid
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === 'map' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    <Map size={14} /> Map
                  </button>
                </div>
              </div>

              {viewMode === 'map' ? (
                <MapView riders={riders} />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {riders.map((rider, i) => (
                    <RiderCard key={rider.id} rider={rider} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
