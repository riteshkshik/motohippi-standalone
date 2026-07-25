import React, { useState, useEffect } from 'react';
import { useLogin } from '@workspace/api-client-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SiGoogle, SiApple } from 'react-icons/si';
import { FloatingLoginIcons } from '@/components/FloatingLoginIcons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const loginMutation = useLogin();
  const { login } = useAuth();
  const [location, setLocation] = useLocation();

  // Handle Google OAuth callback: ?token=...&verified=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get('token');
    const oauthError = params.get('error');
    if (oauthToken) {
      login(oauthToken);
      setLocation('/home');
    } else if (oauthError === 'google_not_configured') {
      setErrorMsg('Google login is not configured yet. Please use email/password.');
    } else if (oauthError === 'google_failed') {
      setErrorMsg('Google login failed. Please try again or use email/password.');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    loginMutation.mutate({ data: { email, password } }, {
      onSuccess: (data: any) => {
        login(data.token);
        // If the backend flags that verification is pending, take the user there
        if (data.requiresVerification) {
          setLocation('/verify-email');
        } else {
          setLocation('/home');
        }
      },
      onError: (error: any) => {
        setErrorMsg(error?.message || 'Login failed. Please check your credentials.');
      },
    });
  };

  const handleGoogleLogin = () => {
    const apiBase = import.meta.env.VITE_API_URL || '/api';
    window.location.href = `${apiBase}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8 relative overflow-hidden">

      {/* Background hero image */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img src="/hero_bg.png" alt="" className="w-full h-full object-cover" />
      </div>

      {/* Ambient lime glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="
        relative z-10 w-full flex justify-center items-center
        md:max-w-[640px]  lg:max-w-[700px]
        md:py-14          lg:py-20
        md:px-[88px]      lg:px-[110px]
      ">
        <FloatingLoginIcons />

        <div className="w-full max-w-md glass-card p-5 sm:p-6 md:p-8 relative z-10 mx-auto">

          <div className="text-center mb-6 md:mb-8">
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
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Sign in to your account to continue riding
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-black/50 h-11 text-sm"
              />
            </div>

            {errorMsg && (
              <p className="text-sm font-medium text-destructive text-center">{errorMsg}</p>
            )}

            <Button
              type="submit"
              className="w-full font-bold h-12 mt-1 text-sm sm:text-base"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          {/* Social auth */}
          <div className="mt-5 md:mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className="mt-3 md:mt-4 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="bg-black/20 border-white/10 h-11 text-sm font-medium"
                onClick={handleGoogleLogin}
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

          <p className="mt-5 md:mt-6 text-center text-xs sm:text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Join Free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
