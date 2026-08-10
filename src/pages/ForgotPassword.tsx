import React, { useState, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, CheckCircle2, ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { FloatingLoginIcons } from '@/components/FloatingLoginIcons';

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_API_BASE_URL) {
    const base = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
    return base.endsWith('/api') ? base : `${base}/api`;
  }
  return '/api';
};
const API_BASE = getApiBase();

export default function ForgotPassword() {
  const [_, setLocation] = useLocation();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility states
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 1: Send Password Reset OTP
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to request reset code');
        return;
      }
      setSuccessMsg(data.message || 'Reset code sent! Check your inbox.');
      // Reset step 2 fields so they start completely blank
      setCode(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setStep(2);
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP inputs handling
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...code];
    pasted.split('').forEach((d, i) => { next[i] = d; });
    setCode(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to reset password');
        return;
      }
      setStep(3);
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 opacity-40 mix-blend-luminosity"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-0" />

      {/* Floating Animated Icons */}
      <FloatingLoginIcons />

      {/* Main Container */}
      <div className="w-full max-w-md bg-card/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 space-y-6">
        
        {/* Back Link */}
        <Link href="/login" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back to Login
        </Link>

        {/* Step 1: Request Code */}
        {step === 1 && (
          <>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                <KeyRound size={28} />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">Forgot Password?</h1>
              <p className="text-xs text-muted-foreground">
                Enter your registered email address and we'll send you a 6-digit verification code to reset your password.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="rider@motohippi.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="bg-black/50 pl-10 h-11 text-sm rounded-xl border-white/10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-black font-black text-sm hover:bg-primary/90 rounded-xl shadow-[0_0_20px_rgba(214,255,47,0.2)] transition-all"
              >
                {loading ? 'Sending Code…' : 'Send Reset Code'}
              </Button>
            </form>
          </>
        )}

        {/* Step 2: Enter Code & New Password */}
        {step === 2 && (
          <>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                <Lock size={28} />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">Reset Password</h1>
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code sent to <span className="text-primary font-semibold">{email}</span> and your new password.
              </p>
            </div>

            {successMsg && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs text-center font-medium">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5" autoComplete="off">
              {/* 6-Digit OTP Box */}
              <div className="space-y-1.5 text-center">
                <Label className="text-xs font-semibold text-muted-foreground">Verification Code</Label>
                <div className="flex justify-center gap-2 pt-1" onPaste={handleOtpPaste}>
                  {code.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      autoComplete="one-time-code"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 h-12 text-center text-lg font-black bg-black/60 border border-white/15 rounded-xl text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-xs font-semibold text-muted-foreground">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="bg-black/50 pr-10 h-11 text-sm rounded-xl border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-muted-foreground">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="bg-black/50 pr-10 h-11 text-sm rounded-xl border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-black font-black text-sm hover:bg-primary/90 rounded-xl shadow-[0_0_20px_rgba(214,255,47,0.2)] transition-all"
              >
                {loading ? 'Resetting Password…' : 'Reset Password'}
              </Button>
            </form>
          </>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 3 && (
          <div className="text-center space-y-5 py-4">
            <CheckCircle2 className="w-20 h-20 text-primary mx-auto animate-bounce" />
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white">Password Reset Successful!</h1>
              <p className="text-xs text-muted-foreground">
                Your password has been updated. You can now log in with your new password.
              </p>
            </div>

            <Button
              onClick={() => setLocation('/login')}
              className="w-full h-12 bg-primary text-black font-black text-sm hover:bg-primary/90 rounded-xl shadow-[0_0_20px_rgba(214,255,47,0.2)] transition-all"
            >
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
