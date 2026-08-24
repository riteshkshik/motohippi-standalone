import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { customFetch } from '@workspace/api-client-react/custom-fetch';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentStatus() {
  const [location] = useLocation();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      setErrorMsg('No order ID provided in payment return URL.');
      return;
    }

    const verify = async () => {
      try {
        const res = await customFetch<any>(`/api/payments/verify/${encodeURIComponent(orderId)}`);
        setOrderDetails(res);

        if (res.status === 'PAID' || res.userPlan) {
          setStatus('success');
          if (refreshUser) await refreshUser();
        } else {
          setStatus('failed');
          setErrorMsg('Payment could not be verified or was cancelled.');
        }
      } catch (err: any) {
        console.error('Payment verification error:', err);
        setStatus('failed');
        setErrorMsg(err?.message || 'Failed to verify transaction with payment server.');
      }
    };

    verify();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card max-w-md w-full p-8 text-center relative z-10 space-y-6 rounded-3xl"
      >
        {status === 'loading' && (
          <div className="py-12 space-y-4">
            <Loader2 size={48} className="animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-bold text-white">Verifying Payment…</h2>
            <p className="text-muted-foreground text-xs">Please hold on while we confirm your order with Cashfree.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(52,211,153,0.3)]">
              <CheckCircle2 size={44} />
            </div>

            <div>
              <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/30 rounded-full font-bold text-[10px] uppercase tracking-widest">
                Payment Successful
              </span>
              <h2 className="text-3xl font-black text-white mt-3 uppercase tracking-tight">
                Plan Activated!
              </h2>
              <p className="text-muted-foreground text-sm mt-2">
                Thank you! Your account has been upgraded to <strong className="text-white uppercase">{orderDetails?.userPlan || 'Rider Pro'}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono text-white font-semibold">{orderDetails?.orderId || orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="text-primary font-black">₹{orderDetails?.amount || '499'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-emerald-400 font-bold uppercase">PAID (Verified)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/profile" className="flex-1">
                <Button className="w-full h-11 bg-primary text-black font-bold text-xs rounded-xl hover:bg-primary/90">
                  <User size={16} className="mr-1.5" /> View Profile
                </Button>
              </Link>
              <Link href="/discover" className="flex-1">
                <Button variant="outline" className="w-full h-11 border-white/10 font-bold text-xs rounded-xl">
                  Start Riding <ArrowRight size={16} className="ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-destructive/20 text-destructive border border-destructive/30 rounded-full flex items-center justify-center mx-auto">
              <XCircle size={44} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">Payment Could Not Be Completed</h2>
              <p className="text-destructive text-xs mt-2">{errorMsg}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/plans" className="w-full">
                <Button className="w-full h-11 bg-primary text-black font-bold text-xs rounded-xl">
                  Try Again
                </Button>
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
