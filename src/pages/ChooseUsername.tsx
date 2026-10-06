import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, CheckCircle2, XCircle, Sparkles, ArrowRight, Bike } from 'lucide-react';
import { FloatingLoginIcons } from '@/components/FloatingLoginIcons';

export default function ChooseUsername() {
  const { user, isLoggedIn, isLoading, refreshUser, updateUser } = useAuth();
  const [_, setLocation] = useLocation();

  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If user already has a valid username, go to home; if logged out, go to login
  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        setLocation('/login');
      } else if (user?.username) {
        setLocation('/home');
      }
    }
  }, [user, isLoggedIn, isLoading, setLocation]);

  // Pre-fill a suggestion from user email or name
  useEffect(() => {
    if (user && !username) {
      const candidate = (user.email ? user.email.split('@')[0] : user.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .slice(0, 18);
      if (candidate && candidate.length >= 3) {
        setUsername(candidate);
      }
    }
  }, [user]);

  // Live debounced availability check
  useEffect(() => {
    const clean = username.trim().toLowerCase();
    if (!clean) {
      setStatus('idle');
      setErrorMsg('');
      return;
    }

    if (clean.length < 3) {
      setStatus('invalid');
      setErrorMsg('Must be at least 3 characters');
      return;
    }

    if (clean.length > 20) {
      setStatus('invalid');
      setErrorMsg('Must be at most 20 characters');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(clean)) {
      setStatus('invalid');
      setErrorMsg('Only letters, numbers, and underscores');
      return;
    }

    setStatus('checking');
    setErrorMsg('');

    const timer = setTimeout(async () => {
      try {
        const rawBase =
          import.meta.env.VITE_API_URL ||
          import.meta.env.VITE_API_BASE_URL ||
          'http://localhost:3001';
        const cleanBase = rawBase.replace(/\/api\/?$/, '').replace(/\/+$/, '');
        const res = await fetch(`${cleanBase}/api/auth/check-username?username=${encodeURIComponent(clean)}`);
        const data = await res.json();
        if (data.available) {
          setStatus('available');
          setErrorMsg('');
        } else {
          setStatus('taken');
          setErrorMsg(data.error || 'Username is already taken');
        }
      } catch {
        setStatus('idle');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim().toLowerCase();
    if (!clean || status === 'taken' || status === 'invalid') return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const rawBase =
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        'http://localhost:3001';
      const cleanBase = rawBase.replace(/\/api\/?$/, '').replace(/\/+$/, '');
      const token = localStorage.getItem('motohippi_token');

      const res = await fetch(`${cleanBase}/api/auth/set-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ username: clean }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to set username');
        return;
      }

      if (data.user) {
        updateUser(data.user);
      }
      refreshUser();
      setLocation('/home');
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img src="/hero_bg.png" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="
        relative z-10 w-full flex justify-center items-center
        md:max-w-[640px]  lg:max-w-[700px]
        md:py-12          lg:py-16
        md:px-[88px]      lg:px-[110px]
      ">
        <FloatingLoginIcons />

        <div className="w-full max-w-md glass-card p-6 sm:p-8 relative z-10 mx-auto">
          {/* User profile preview */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-3">
              <Avatar className="w-20 h-20 border-2 border-primary/40 shadow-xl shadow-primary/10">
                <AvatarImage src={user?.avatarUrl || ''} className="object-cover" />
                <AvatarFallback className="text-2xl font-black bg-primary/20 text-primary">
                  {user?.name ? user.name.charAt(0) : <Bike size={28} />}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-black flex items-center justify-center shadow">
                <Sparkles size={12} />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Welcome, {user?.name || 'Rider'}!
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1 max-w-xs">
              Every rider needs a callsign. Choose your unique MotoHippi handle to complete your profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="username" className="text-sm font-bold">Rider Handle</Label>
                {status === 'checking' && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Loader2 size={11} className="animate-spin text-primary" /> checking…
                  </span>
                )}
                {status === 'available' && (
                  <span className="text-[11px] text-primary font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-primary" /> Available
                  </span>
                )}
                {(status === 'taken' || status === 'invalid') && (
                  <span className="text-[11px] text-destructive font-medium flex items-center gap-1">
                    <XCircle size={12} /> {errorMsg}
                  </span>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-base pointer-events-none">
                  @
                </span>
                <Input
                  id="username"
                  autoFocus
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="your_handle"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  required
                  className={`bg-black/50 h-12 text-base pl-9 pr-10 font-bold ${
                    status === 'available'
                      ? 'border-primary/50 focus-visible:ring-primary/40 text-primary'
                      : status === 'taken' || status === 'invalid'
                      ? 'border-destructive/60 focus-visible:ring-destructive/40 text-destructive'
                      : 'text-white'
                  }`}
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {status === 'checking' && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
                  {status === 'available' && <CheckCircle2 size={18} className="text-primary" />}
                  {(status === 'taken' || status === 'invalid') && <XCircle size={18} className="text-destructive" />}
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                3–20 characters, lowercase letters, numbers, and underscores
              </p>
            </div>

            {errorMsg && status !== 'invalid' && status !== 'taken' && (
              <p className="text-xs text-destructive text-center bg-destructive/10 border border-destructive/20 p-2.5 rounded-xl font-medium">
                {errorMsg}
              </p>
            )}

            <Button
              type="submit"
              disabled={submitting || status === 'checking' || status === 'taken' || status === 'invalid' || !username.trim()}
              className="w-full font-black h-12 text-sm sm:text-base flex items-center justify-center gap-2 mt-2 shadow-lg shadow-primary/20"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving Handle…
                </>
              ) : (
                <>
                  Claim Handle & Ride
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
