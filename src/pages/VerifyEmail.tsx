import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, CheckCircle2, RefreshCw, ArrowLeft } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function VerifyEmail() {
  const { user, token, login } = useAuth();
  const [_, setLocation] = useLocation();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  // Auto-send OTP on mount
  useEffect(() => {
    if (token) sendOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendOtp = async () => {
    if (!token) return;
    setResending(true);
    try {
      await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setResendCooldown(60);
    } catch {
      // silently ignore — code may already be sent
    } finally {
      setResending(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (next.every((d) => d)) submitCode(next.join(''));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...code];
    pasted.split('').forEach((d, i) => { next[i] = d; });
    setCode(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
    if (pasted.length === 6) submitCode(pasted);
  };

  const submitCode = async (fullCode: string) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Invalid code'); setLoading(false); return; }
      setVerified(true);
      // Re-login with refreshed token that includes verified status
      if (data.token) login(data.token);
      setTimeout(() => setLocation('/home'), 1800);
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto animate-bounce" />
          <h1 className="text-3xl font-black text-white">Verified!</h1>
          <p className="text-muted-foreground">Welcome to MotoHippi. Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Check your email</h1>
              <p className="text-muted-foreground text-sm mt-1">
                We sent a 6-digit code to{' '}
                <span className="text-white font-medium">{user?.email || 'your email'}</span>
              </p>
            </div>
          </div>

          {/* OTP inputs */}
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <Input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-black/50 border-white/20 focus:border-primary focus:ring-primary"
                disabled={loading}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-destructive text-center font-medium">{error}</p>
          )}

          {/* Verify button (manual) */}
          <Button
            className="w-full h-12 font-bold"
            disabled={loading || code.some((d) => !d)}
            onClick={() => submitCode(code.join(''))}
          >
            {loading ? 'Verifying…' : 'Verify Email'}
          </Button>

          {/* Resend */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80 gap-1.5"
              disabled={resending || resendCooldown > 0}
              onClick={sendOtp}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </Button>
          </div>

          {/* Skip for now */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-white gap-1.5"
              onClick={() => setLocation('/home')}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Skip for now
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Check your spam folder if you don't see the email.
        </p>
      </div>
    </div>
  );
}
