import React, { useState } from 'react';
import { useSignup } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SiGoogle } from 'react-icons/si';
import { Loader2, CheckCircle2, XCircle, AtSign } from 'lucide-react';
import { FloatingLoginIcons } from '@/components/FloatingLoginIcons';

export default function Signup() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const signupMutation = useSignup();
  const { login, isLoggedIn } = useAuth();
  const [_, setLocation] = useLocation();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isLoggedIn) {
      setLocation('/home');
    }
  }, [isLoggedIn, setLocation]);

  // Live debounced username validation & availability check
  React.useEffect(() => {
    const clean = username.trim().toLowerCase();
    if (!clean) {
      setUsernameStatus('idle');
      setUsernameError('');
      return;
    }

    if (clean.length < 3) {
      setUsernameStatus('invalid');
      setUsernameError('Must be at least 3 characters');
      return;
    }

    if (clean.length > 20) {
      setUsernameStatus('invalid');
      setUsernameError('Must be at most 20 characters');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(clean)) {
      setUsernameStatus('invalid');
      setUsernameError('Letters, numbers, and underscores only');
      return;
    }

    setUsernameStatus('checking');
    setUsernameError('');

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
          setUsernameStatus('available');
          setUsernameError('');
        } else {
          setUsernameStatus('taken');
          setUsernameError(data.error || 'Username is already taken');
        }
      } catch {
        setUsernameStatus('idle');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  if (isLoggedIn) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser) {
      setErrorMsg('Please choose a username.');
      return;
    }
    if (usernameStatus === 'taken') {
      setErrorMsg('Username is already taken. Please pick another.');
      return;
    }
    if (usernameStatus === 'invalid') {
      setErrorMsg(usernameError || 'Invalid username.');
      return;
    }

    signupMutation.mutate({
      data: {
        name,
        username: cleanUser,
        email,
        password,
        phone: phone || undefined,
      } as any,
    }, {
      onSuccess: (data: any) => {
        if (data.email) {
          sessionStorage.setItem('pendingEmail', data.email);
        } else {
          sessionStorage.setItem('pendingEmail', email);
        }
        setLocation('/verify-email');
      },
      onError: (error: any) => {
        setErrorMsg(error?.message || 'Registration failed. Please try again.');
      },
    });
  };

  const handleGoogleSignup = () => {
    const rawBase =
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      'https://api.motohippi.com/api';
    const apiBase = rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/$/, '')}/api`;
    window.location.href = `${apiBase}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8 relative overflow-hidden">

      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img src="/hero_bg.png" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="
        relative z-10 w-full flex justify-center items-center
        md:max-w-[640px]  lg:max-w-[700px]
        md:py-12          lg:py-16
        md:px-[88px]      lg:px-[110px]
      ">
        <FloatingLoginIcons />

        <div className="w-full max-w-md glass-card p-5 sm:p-6 md:p-8 relative z-10 mx-auto">

          <div className="text-center mb-5 md:mb-7">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <img
                src="/logo.png"
                alt="MotoHippi"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-cover"
              />
              <span className="text-xl sm:text-2xl font-black tracking-tighter text-white">
                MotoHippi
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-1 text-white">
              Join the Ride
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Create your account to connect with riders worldwide
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm">Full Name</Label>
              <Input
                id="name"
                autoComplete="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-black/50 h-11 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="username" className="text-sm">Username</Label>
                {usernameStatus === 'checking' && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Loader2 size={11} className="animate-spin text-primary" /> checking…
                  </span>
                )}
                {usernameStatus === 'available' && (
                  <span className="text-[11px] text-primary font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-primary" /> Available
                  </span>
                )}
                {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                  <span className="text-[11px] text-destructive font-medium flex items-center gap-1">
                    <XCircle size={12} /> {usernameError}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm pointer-events-none">
                  @
                </span>
                <Input
                  id="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="alex_rider"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  required
                  className={`bg-black/50 h-11 text-sm pl-8 pr-10 font-medium ${
                    usernameStatus === 'available'
                      ? 'border-primary/50 focus-visible:ring-primary/40'
                      : usernameStatus === 'taken' || usernameStatus === 'invalid'
                      ? 'border-destructive/60 focus-visible:ring-destructive/40'
                      : ''
                  }`}
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {usernameStatus === 'checking' && <Loader2 size={15} className="animate-spin text-muted-foreground" />}
                  {usernameStatus === 'available' && <CheckCircle2 size={16} className="text-primary" />}
                  {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <XCircle size={16} className="text-destructive" />}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                3–20 characters, lowercase letters, numbers, and underscores
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="rider@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black/50 h-11 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="bg-black/50 h-11 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm">
                Phone <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-black/50 h-11 text-sm"
              />
            </div>

            {errorMsg && (
              <p className="text-sm font-medium text-destructive text-center">{errorMsg}</p>
            )}

            <Button
              type="submit"
              className="w-full font-bold h-12 mt-1 text-sm sm:text-base"
              disabled={
                signupMutation.isPending ||
                usernameStatus === 'checking' ||
                usernameStatus === 'taken' ||
                usernameStatus === 'invalid' ||
                !username.trim()
              }
            >
              {signupMutation.isPending ? 'Creating Account…' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 md:mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
              </div>
            </div>
            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-black/20 hover:bg-white/5 border-white/10 h-11 text-sm font-medium flex items-center justify-center transition-all"
                onClick={handleGoogleSignup}
              >
                <SiGoogle className="mr-2 text-base text-[#4285F4]" /> Continue with Google
              </Button>
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] text-muted-foreground leading-relaxed">
            By creating an account you agree to our{' '}
            <a href="/terms" className="text-primary hover:underline">Terms</a>
            {' & '}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p>

          <p className="mt-3 md:mt-4 text-center text-xs sm:text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
