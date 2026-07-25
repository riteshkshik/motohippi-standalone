import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ShieldCheck, Car, Bike, RefreshCw, HeartHandshake,
  MessageCircle, CheckCircle2, ChevronDown, Star, Zap, FileText,
  Phone, User, Hash, Calendar, StickyNote, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// ─── Config ──────────────────────────────────────────────────────────────────
const WA_NUMBER = '918150025108';
const WA_MAIN_MSG = encodeURIComponent(
  'Hello MotoHippi Team, I would like to get Bike/Car Insurance through your Policybazaar Certified Partner service. Please help me compare the available insurance plans.'
);
const WA_MAIN_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MAIN_MSG}`;

function openWhatsApp(text: string) {
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
}

// ─── Animation helpers ────────────────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={stagger}
      className={`max-w-6xl mx-auto px-4 md:px-8 ${className}`}
    >
      {children}
    </motion.section>
  );
}

// ─── Trust Badge ──────────────────────────────────────────────────────────────
function TrustBadge() {
  return (
    <motion.div variants={fadeUp} className="inline-flex items-center justify-center relative">
      {/* Outer pulse ring 1 */}
      <motion.span
        className="absolute inset-0 rounded-2xl border-2 border-blue-400/60"
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Outer pulse ring 2 — offset */}
      <motion.span
        className="absolute inset-0 rounded-2xl border border-blue-300/40"
        animate={{ scale: [1, 1.22, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      />
      {/* Glow shimmer */}
      <motion.span
        className="absolute inset-0 rounded-2xl bg-blue-500/10"
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Badge image */}
      <img
        src="/pb-partner-new.png"
        alt="PB Partner – Powered by Policybazaar"
        className="relative z-10 rounded-xl"
        style={{ height: '64px', width: 'auto', display: 'block' }}
        draggable={false}
      />
    </motion.div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center text-center overflow-hidden pt-12 pb-16">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
      <div className="absolute top-2/3 left-1/4 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

      <Section className="relative z-10">
        <motion.div variants={stagger} className="flex flex-col items-center gap-6">
          <TrustBadge />

          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight max-w-3xl">
            Protect Every Ride.<br />
            <span className="text-primary">Drive With Confidence.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed">
            Compare, purchase, and renew Bike & Car Insurance with expert assistance through our Policybazaar Certified Partner service. Simple, transparent, and hassle-free.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mt-2">
            <Button
              asChild
              className="wa-btn h-14 px-8 text-base font-bold rounded-full bg-[#25D366] hover:bg-[#22c55e] text-white gap-2.5 hover:scale-105 transition-transform"
            >
              <a href={WA_MAIN_URL} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Get Insurance on WhatsApp
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-14 px-8 text-base font-semibold rounded-full border-white/20 text-white hover:bg-white/5 hover:scale-105 transition-transform"
              onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Request a Quote
            </Button>
          </motion.div>

          {/* Trust strip */}
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-white/50">
            {['100% Secure', 'Expert Advisors', 'Instant Support', '5★ Rated Service'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-primary" />{t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </Section>
    </div>
  );
}

// ─── Coverage cards ───────────────────────────────────────────────────────────
const coverageTypes = [
  {
    icon: '🏍',
    title: 'Bike Insurance',
    desc: 'Comprehensive & third-party plans for motorcycles and scooters.',
    badge: 'Most Popular',
    features: ['Own damage cover', 'Third-party liability', 'Zero depreciation add-on', 'Roadside assistance', 'Personal accident cover'],
    accent: 'primary',
  },
  {
    icon: '🚗',
    title: 'Car Insurance',
    desc: 'Competitive coverage options for hatchbacks, sedans, SUVs & more.',
    badge: null,
    features: ['Comprehensive protection', 'Engine protection', 'Consumables cover', 'NCB protection', 'Invoice cover'],
    accent: 'blue',
  },
];

function CoverageCards() {
  return (
    <Section className="py-4">
      <motion.div variants={fadeUp} className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Instant Insurance Quotes</h2>
        <p className="text-white/50 text-lg max-w-xl mx-auto">Two-minute comparison. Expert-guided selection. Lifetime support.</p>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {coverageTypes.map((type) => (
          <motion.div
            key={type.title}
            variants={fadeUp}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`relative bg-card/60 backdrop-blur-xl border rounded-3xl p-8 flex flex-col gap-5 overflow-hidden ${type.accent === 'primary' ? 'border-primary/30 shadow-xl shadow-primary/5' : 'border-white/10'}`}
          >
            {type.badge && (
              <div className="absolute top-5 right-5 bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-full">{type.badge}</div>
            )}
            {/* glow */}
            {type.accent === 'primary' && <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/15 rounded-full blur-3xl pointer-events-none" />}

            <div className="text-5xl leading-none">{type.icon}</div>
            <div>
              <h3 className="text-2xl font-black text-white mb-1">{type.title}</h3>
              <p className="text-white/50 text-sm">{type.desc}</p>
            </div>
            <ul className="space-y-2">
              {type.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white/80">
                  <CheckCircle2 size={14} className="text-primary shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Button
              className={`mt-auto h-12 rounded-full font-bold gap-2.5 ${type.accent === 'primary' ? 'wa-btn bg-[#25D366] hover:bg-[#22c55e] text-white' : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'}`}
              onClick={() => openWhatsApp(`Hello MotoHippi Team, I am interested in ${type.title} through your Policybazaar Certified Partner service. Please help me compare plans.`)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Get {type.title} Quote
            </Button>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// ─── Why Choose MotoHippi ─────────────────────────────────────────────────────
const trustCards = [
  { icon: <ShieldCheck size={22} />, label: 'Policybazaar Certified Partner' },
  { icon: <FileText size={22} />, label: 'Compare Multiple Insurance Plans' },
  { icon: <Zap size={22} />, label: 'Quick Quote Assistance' },
  { icon: <RefreshCw size={22} />, label: 'Hassle-Free Renewals' },
  { icon: <HeartHandshake size={22} />, label: 'Claim Support' },
  { icon: <MessageCircle size={22} />, label: 'Dedicated WhatsApp Assistance' },
  { icon: <Shield size={22} />, label: 'Trusted & Secure Process' },
];

function WhyUs() {
  return (
    <Section className="py-20">
      <motion.div variants={fadeUp} className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Why Choose MotoHippi?</h2>
        <p className="text-white/50 text-lg max-w-lg mx-auto">We handle the complexity so you focus on the ride.</p>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {trustCards.map((t, i) => (
          <motion.div
            key={t.label}
            variants={fadeUp}
            whileHover={{ scale: 1.03 }}
            className={`relative flex flex-col items-start gap-3 bg-card/50 backdrop-blur-md border border-white/8 rounded-2xl p-5 overflow-hidden ${i === 0 ? 'md:col-span-2 border-primary/30' : ''}`}
          >
            {i === 0 && <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 0 ? 'bg-primary text-white' : 'bg-white/8 text-primary'}`}>
              {t.icon}
            </div>
            <p className={`text-sm font-semibold leading-snug ${i === 0 ? 'text-primary' : 'text-white/80'}`}>{t.label}</p>
            {i === 0 && (
              <p className="text-xs text-white/40 leading-relaxed">Helping you compare and choose insurance plans from leading insurers with confidence.</p>
            )}
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// ─── Insurance Services ───────────────────────────────────────────────────────
const services = [
  {
    emoji: '🏍',
    title: 'New Bike Insurance',
    desc: 'Protect your motorcycle with comprehensive or third-party insurance plans.',
    msg: 'Hello MotoHippi Team, I need a New Bike Insurance quote through your Policybazaar Certified Partner service.',
  },
  {
    emoji: '🚗',
    title: 'New Car Insurance',
    desc: 'Find the right coverage for your car with competitive insurance options.',
    msg: 'Hello MotoHippi Team, I need a New Car Insurance quote through your Policybazaar Certified Partner service.',
  },
  {
    emoji: '🔄',
    title: 'Policy Renewal',
    desc: 'Renew your existing Bike or Car insurance in just a few simple steps.',
    msg: 'Hello MotoHippi Team, I would like to renew my existing Bike/Car insurance policy.',
  },
  {
    emoji: '🛡',
    title: 'Claim Assistance',
    desc: 'Receive expert guidance throughout your insurance claim process.',
    msg: 'Hello MotoHippi Team, I need assistance with my insurance claim process.',
  },
];

function ServicesGrid() {
  return (
    <Section className="py-4 pb-20">
      <motion.div variants={fadeUp} className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Insurance Services</h2>
        <p className="text-white/50 text-lg max-w-lg mx-auto">End-to-end coverage — from first quote to final claim.</p>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {services.map((s) => (
          <motion.div
            key={s.title}
            variants={fadeUp}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="group bg-card/50 backdrop-blur-md border border-white/8 hover:border-primary/30 rounded-2xl p-6 flex flex-col gap-4 cursor-pointer transition-colors"
            onClick={() => openWhatsApp(s.msg)}
          >
            <div className="text-4xl">{s.emoji}</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1.5">{s.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
            </div>
            <div className="mt-auto flex items-center gap-1.5 text-[#25D366] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              <MessageCircle size={14} /> Chat on WhatsApp
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// ─── Quote Form ───────────────────────────────────────────────────────────────
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => String(currentYear - i));

function QuoteForm() {
  const [form, setForm] = useState({
    name: '', mobile: '', whatsapp: '', vehicleType: '',
    brand: '', model: '', regNo: '', year: '',
    existingInsurer: '', expiryDate: '', notes: '',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Hello MotoHippi Team,

I would like to request an insurance quote through your Policybazaar Certified Partner service.

📋 *My Details:*
• Full Name: ${form.name}
• Mobile: ${form.mobile}${form.whatsapp ? `\n• WhatsApp: ${form.whatsapp}` : ''}
• Vehicle Type: ${form.vehicleType}
• Vehicle Brand: ${form.brand}
• Vehicle Model: ${form.model}
• Registration No.: ${form.regNo}
• Manufacturing Year: ${form.year}${form.existingInsurer ? `\n• Existing Insurer: ${form.existingInsurer}` : ''}
• Policy Expiry: ${form.expiryDate}${form.notes ? `\n\n📝 Notes: ${form.notes}` : ''}

Please help me compare the best available plans. Thank you!`;
    openWhatsApp(msg);
  };

  return (
    <Section id="quote-form" className="py-4 pb-20">
      <motion.div variants={fadeUp} className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Request an Insurance Quote</h2>
        <p className="text-white/50 text-lg max-w-lg mx-auto">Fill in your details — we'll send a personalized quote on WhatsApp.</p>
      </motion.div>

      <motion.form
        variants={fadeUp}
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 space-y-5"
      >
        {/* Row 1 */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Full Name *</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <Input required value={form.name} onChange={set('name')} placeholder="Your full name" className="pl-9 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-11" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Mobile Number *</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <Input required type="tel" value={form.mobile} onChange={set('mobile')} placeholder="+91 XXXXX XXXXX" className="pl-9 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-11" />
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">WhatsApp Number <span className="text-white/30 normal-case font-normal">(optional)</span></label>
            <div className="relative">
              <MessageCircle size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <Input type="tel" value={form.whatsapp} onChange={set('whatsapp')} placeholder="If different from mobile" className="pl-9 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-11" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Vehicle Type *</label>
            <Select required onValueChange={(v) => setForm(p => ({ ...p, vehicleType: v }))}>
              <SelectTrigger className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-11">
                <SelectValue placeholder="Bike or Car?" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                <SelectItem value="Bike">🏍 Bike / Motorcycle / Scooter</SelectItem>
                <SelectItem value="Car">🚗 Car / SUV / 4x4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Vehicle Brand *</label>
            <Input required value={form.brand} onChange={set('brand')} placeholder="e.g. Royal Enfield, Honda" className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-11" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Vehicle Model *</label>
            <Input required value={form.model} onChange={set('model')} placeholder="e.g. Classic 350, City" className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-11" />
          </div>
        </div>

        {/* Row 4 */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Registration Number *</label>
            <div className="relative">
              <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <Input required value={form.regNo} onChange={set('regNo')} placeholder="e.g. DL01AB1234" className="pl-9 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-11 uppercase" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Manufacturing Year *</label>
            <Select required onValueChange={(v) => setForm(p => ({ ...p, year: v }))}>
              <SelectTrigger className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-11">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10 max-h-56 overflow-y-auto">
                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 5 */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Existing Insurance Company <span className="text-white/30 normal-case font-normal">(optional)</span></label>
            <Input value={form.existingInsurer} onChange={set('existingInsurer')} placeholder="e.g. HDFC Ergo, ICICI" className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-11" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Policy Expiry Date *</label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <Input required type="date" value={form.expiryDate} onChange={set('expiryDate')} className="pl-9 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-11" />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Additional Notes <span className="text-white/30 normal-case font-normal">(optional)</span></label>
          <div className="relative">
            <StickyNote size={15} className="absolute left-3.5 top-3.5 text-white/30" />
            <Textarea value={form.notes} onChange={set('notes')} placeholder="Any specific requirements or questions..." rows={3} className="pl-9 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl resize-none" />
          </div>
        </div>

        <Button type="submit" className="wa-btn w-full h-14 text-base font-bold rounded-full bg-[#25D366] hover:bg-[#22c55e] text-white gap-2.5 hover:scale-[1.02] transition-transform mt-2">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Request Insurance Quote
        </Button>

        <p className="text-center text-xs text-white/30 flex items-center justify-center gap-1.5">
          <AlertCircle size={12} /> Your details will be sent securely via WhatsApp to our expert team.
        </p>
      </motion.form>
    </Section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <Section className="py-4 pb-20">
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/25 rounded-3xl p-10 md:p-14 text-center"
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <ShieldCheck size={44} className="mx-auto text-primary mb-5" />
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Need Expert Insurance Assistance?</h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
            Our team will help you compare, purchase, or renew the right Bike or Car Insurance through our Policybazaar Certified Partner service.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              className="wa-btn h-13 px-8 font-bold rounded-full bg-[#25D366] hover:bg-[#22c55e] text-white gap-2.5 hover:scale-105 transition-transform text-base"
            >
              <a href={WA_MAIN_URL} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-13 px-8 font-semibold rounded-full border-white/20 text-white hover:bg-white/5 hover:scale-105 transition-transform text-base"
              onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Request Quote
            </Button>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: 'Why should I insure my Bike or Car?',
    a: 'Insurance is mandatory under Indian law and protects you from financial losses due to accidents, theft, natural disasters, or third-party liability. A good policy covers repair costs, hospital bills, and legal fees — giving you complete peace of mind on every ride.',
  },
  {
    q: 'Can I renew an expired insurance policy?',
    a: 'Yes, expired policies can be renewed, though your vehicle may require a fresh inspection by the insurer. It\'s always better to renew before expiry to avoid a break-in coverage period. Our team will guide you through the renewal process quickly and smoothly.',
  },
  {
    q: 'What documents are required?',
    a: 'Typically you\'ll need: Vehicle Registration Certificate (RC), existing insurance policy (for renewal), Driving Licence, and Aadhaar/PAN for KYC. For claims, you\'ll also need the FIR (if applicable) and repair estimate.',
  },
  {
    q: 'How long does it take to get insured?',
    a: 'With our streamlined WhatsApp process, most new policies are issued within 30–60 minutes of completing your KYC and payment. Renewals of active policies are often instant.',
  },
  {
    q: 'How do I make an insurance claim?',
    a: 'Contact us on WhatsApp immediately after an incident. Our Claim Assistance team will walk you through every step — from filing the FIR and notifying the insurer to getting your vehicle to an approved garage and tracking the settlement.',
  },
  {
    q: 'Is MotoHippi a Policybazaar Certified Partner?',
    a: 'Yes! MotoHippi operates as a Policybazaar Certified Partner, which means we are authorized to help you compare plans from multiple leading insurers and assist you through purchase, renewal, and claims — all with Policybazaar\'s quality assurance behind us.',
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Section className="py-4 pb-24">
      <motion.div variants={fadeUp} className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Frequently Asked Questions</h2>
        <p className="text-white/50 text-lg max-w-lg mx-auto">Everything you need to know about insurance with MotoHippi.</p>
      </motion.div>
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((f, i) => (
          <motion.div key={i} variants={fadeUp} className={`border rounded-2xl overflow-hidden transition-colors ${open === i ? 'border-primary/30 bg-primary/5' : 'border-white/8 bg-card/40'}`}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-semibold text-white/90 text-sm md:text-base">{f.q}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-primary transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <p className="px-6 pb-5 text-sm text-white/55 leading-relaxed">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────
export default function Insurance() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Hero />
      <div className="space-y-8">
        <CoverageCards />
        <WhyUs />
        <ServicesGrid />
        <QuoteForm />
        <CTABanner />
        <FAQ />
      </div>
    </div>
  );
}
