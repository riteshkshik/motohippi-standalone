import React, { useState } from 'react';
import { useSignup } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SiGoogle, SiApple } from 'react-icons/si';
import { FloatingLoginIcons } from '@/components/FloatingLoginIcons';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const signupMutation = useSignup();
  const { login } = useAuth();
  const [_, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    signupMutation.mutate({ data: { name, email, password, phone: phone || undefined } }, {
      onSuccess: (data: any) => {
        login(data.token);
        // Always go to email verification after signup
        setLocation('/verify-email');
      },
      onError: (error: any) => {
        setErrorMsg(error?.message || 'Registration failed. Please try again.');
      },
    });
  };

  const handleGoogleSignup = () => {
    const apiBase = import.meta.env.VITE_API_URL || '/api';
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
              disabled={signupMutation.isPending}
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
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="bg-black/20 border-white/10 h-11 text-sm font-medium"
                onClick={handleGoogleSignup}
              >
                <SiGoogle className="mr-2 text-base" /> Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-black/20 border-white/10 h-11 text-sm font-medium"
                disabled
                title="Apple Sign-In coming soon"
              >
                <SiApple className="mr-2 text-base" /> Apple
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
