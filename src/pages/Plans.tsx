import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { customFetch } from '@workspace/api-client-react/custom-fetch';
import { checkoutWithCashfree } from '@/lib/cashfree';
import {
  Shield, Check, Zap, Star, Sparkles, ArrowRight,
  ShieldCheck, Award, Heart, HelpCircle, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface PlanItem {
  id: string;
  name: string;
  price: string;
  amount: number;
  period: string;
  popular?: boolean;
  desc: string;
  badgeText?: string;
  perks: string[];
}

const PLAN_LIST: PlanItem[] = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    amount: 0,
    period: 'Forever Free',
    desc: 'Essential features for casual riders & travelers',
    perks: [
      '25 swipes/day',
      'Basic Matching',
      'Chat after Match',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '₹299',
    amount: 299,
    period: '/ month',
    desc: 'Unlimited swipes & ad-free rider matching',
    perks: [
      'Unlimited Swipes',
      'Undo Swipe',
      'No Ads',
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    price: '₹599',
    amount: 599,
    period: '/ month',
    popular: true,
    badgeText: 'MOST POPULAR',
    desc: 'See who likes you & get verified gold badge',
    perks: [
      'Everything in Plus',
      'See Who Likes You',
      'Verified Badge',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: '₹999',
    amount: 999,
    period: '/ month',
    badgeText: 'VIP ACCESS',
    desc: 'VIP experience with priority support & maximum visibility',
    perks: [
      'Everything in Gold',
      'VIP Priority Support',
    ],
  },
];

export default function Plans() {
  const { isLoggedIn, user, refreshUser } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const [dynamicPlans, setDynamicPlans] = useState(PLAN_LIST);

  useEffect(() => {
    customFetch<{ plans: { id: string; name: string; amount: number }[] }>('/api/payments/plans')
      .then((res) => {
        if (res && Array.isArray(res.plans)) {
          setDynamicPlans((prev) =>
            prev.map((p) => {
              const sp = res.plans.find((x) => x.id === p.id);
              return sp ? { ...p, price: `₹${sp.amount}`, amount: sp.amount } : p;
            })
          );
        }
      })
      .catch((err) => console.warn('Could not fetch plan prices from server:', err));
  }, []);

  const handleSelectPlan = async (plan: PlanItem) => {
    if (plan.id === 'free') return;

    if (!isLoggedIn) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in or create an account to upgrade your plan.',
      });
      setLocation('/login');
      return;
    }

      let createdOrderId = '';
      try {
        setLoadingPlanId(plan.id);

        // 1. Create order on backend
        const res = await customFetch<{
          success: boolean;
          orderId: string;
          paymentSessionId: string;
          cfMode?: 'sandbox' | 'production';
          amount: number;
          planName: string;
        }>('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: plan.id }),
        });

        if (!res.paymentSessionId) {
          throw new Error('Failed to retrieve payment session from server');
        }
        createdOrderId = res.orderId;

        // 2. Launch Cashfree PG Modal
        toast({
          title: 'Opening Secure Checkout…',
          description: 'Launching Cashfree Payment Gateway',
        });

        await checkoutWithCashfree(res.paymentSessionId, res.cfMode || 'sandbox', '_modal');

        // 3. Verify payment after popup closes
        toast({
          title: 'Verifying Payment…',
          description: 'Checking order status with Cashfree',
        });

        const verifyRes = await customFetch<{ status: string; userPlan: string }>(
          `/api/payments/verify/${res.orderId}`,
          { method: 'GET' }
        );

        if (verifyRes.status === 'PAID' || verifyRes.userPlan === plan.id) {
          if (refreshUser) await refreshUser();
          toast({
            title: '🎉 Plan Upgraded Successfully!',
            description: `Welcome to ${plan.name}! Your perks are now unlocked.`,
          });
          setLocation('/payment-status?order_id=' + res.orderId);
        } else {
          await customFetch('/api/payments/mark-failed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: res.orderId, reason: 'USER_CANCELLED' }),
          }).catch(() => {});
          setLocation('/payment-status?order_id=' + res.orderId);
        }
      } catch (err: any) {
        console.error('Payment checkout error:', err);
        if (createdOrderId) {
          await customFetch('/api/payments/mark-failed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: createdOrderId, reason: 'PAYMENT_FAILED' }),
          }).catch(() => {});
        }
        toast({
          variant: 'destructive',
          title: 'Payment Error',
          description: err?.message || 'Could not complete payment process. Please try again.',
        });
      } finally {
        setLoadingPlanId(null);
      }
  };

  const currentPlan = user?.plan || 'free';

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">

        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <Badge variant="outline" className="px-4 py-1 border-primary/40 text-primary bg-primary/10 rounded-full font-bold uppercase text-[11px] tracking-widest">
            <Sparkles size={13} className="mr-1.5" /> MotoHippi Memberships
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase">
            Choose Your <span className="text-primary">Ride Pass.</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Unlock unlimited rider matching, gold verification badges, gear cashback, and VIP event access.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch pt-4">
          {dynamicPlans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isLoading = loadingPlanId === plan.id;

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition-all ${
                  plan.popular
                    ? 'bg-card/70 border-2 border-primary/60 shadow-[0_0_40px_rgba(214,255,47,0.15)]'
                    : 'glass-card border-white/10'
                }`}
              >
                {plan.badgeText && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-black font-black text-[10px] tracking-widest uppercase shadow-lg">
                    {plan.badgeText}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                    {isCurrent && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        ACTIVE PLAN
                      </Badge>
                    )}
                  </div>

                  <p className="text-muted-foreground text-xs leading-relaxed mb-6">
                    {plan.desc}
                  </p>

                  <div className="mb-6">
                    <span className="text-4xl sm:text-5xl font-black text-white">{plan.price}</span>
                    <span className="text-muted-foreground text-xs ml-2 font-medium">{plan.period}</span>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/10 mb-8">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">What's Included:</p>
                    {plan.perks.map((perk, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
                        <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrent || isLoading}
                  className={`w-full h-12 rounded-2xl font-bold text-sm transition-all ${
                    isCurrent
                      ? 'bg-white/10 text-muted-foreground cursor-default'
                      : plan.popular
                      ? 'bg-primary hover:bg-primary/90 text-black shadow-[0_0_20px_rgba(214,255,47,0.3)]'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {isLoading ? (
                    'Processing…'
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : plan.id === 'free' ? (
                    'Free Forever'
                  ) : (
                    <span className="flex items-center gap-1.5">
                      Upgrade to {plan.name} <ArrowRight size={16} />
                    </span>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Security & Guarantee Footer */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <Lock size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">100% Encrypted & Secure Payments via Cashfree</h4>
              <p className="text-muted-foreground text-xs">Supports UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking & Wallets.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-primary" /> Instant Activation</div>
            <div className="flex items-center gap-1.5"><HelpCircle size={16} className="text-primary" /> 24/7 Rider Support</div>
          </div>
        </div>

      </div>
    </div>
  );
}
