import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import {
  ShoppingBag, Trash2, Plus, Minus, Tag, ChevronRight,
  Shield, Truck, RotateCcw, Star, Heart, ArrowLeft,
  Zap, BadgeCheck, Gift, Info, CheckCircle2, Package,
  MapPin, Mail, Phone, X, MessageCircle, User as UserIcon,
} from 'lucide-react';
import { useGetCart, useRemoveFromCart, useAddToCart } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { customFetch } from '@workspace/api-client-react/custom-fetch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

const COUPONS: Record<string, number> = {
  RIDE10: 10,
  MOTO20: 20,
  FIRST15: 15,
  HIPPI25: 25,
};

const TRUST_BADGES = [
  { icon: Shield,   label: 'Secure Payment',    sub: '100% safe & encrypted' },
  { icon: Truck,    label: 'Fast Delivery',      sub: '3–7 business days' },
  { icon: RotateCcw,label: '7-Day Returns',      sub: 'Easy no-questions return' },
  { icon: BadgeCheck,label: 'Genuine Products',  sub: 'Brand authorised seller' },
];

// ─── Empty cart ───────────────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-28 text-center gap-6"
    >
      <div className="relative">
        <div className="w-28 h-28 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <ShoppingBag size={48} className="text-muted-foreground" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-sm">0</div>
      </div>
      <div>
        <h2 className="text-2xl font-black text-white mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground max-w-sm">
          Looks like you haven't added any gear yet. Explore the shop and find your perfect ride essentials.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/marketplace">
          <button className="px-8 py-3 rounded-2xl bg-primary text-black font-black text-base hover:bg-primary/90 transition-all hover:scale-[1.02] flex items-center gap-2">
            <ShoppingBag size={18} /> Shop Now
          </button>
        </Link>
        <Link href="/home">
          <button className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-base hover:bg-white/10 transition-all">
            Go Home
          </button>
        </Link>
      </div>
      {/* Popular categories */}
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {['Biker Equipments', 'Car Equipments', 'Camping Equipments', 'Action Cam'].map(cat => (
          <Link key={cat} href="/marketplace">
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-muted-foreground hover:text-white hover:border-primary/40 transition-all cursor-pointer">{cat}</span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Cart item card ───────────────────────────────────────────────────────────
interface CartItemProduct {
  id: number; name: string; category?: string; brand?: string;
  imageUrl?: string; price: number; originalPrice?: number | null;
  rating?: number | null; inStock?: boolean;
}

function CartItem({
  product, quantity, onRemove, onQtyChange, index,
}: {
  product: CartItemProduct;
  quantity: number;
  onRemove: () => void;
  onQtyChange: (q: number) => void;
  index: number;
}) {
  const [removing, setRemoving] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const savings = product.originalPrice ? product.originalPrice - product.price : 0;
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleRemove = async () => {
    setRemoving(true);
    await new Promise(r => setTimeout(r, 300));
    onRemove();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: removing ? 0 : 1, x: removing ? -40 : 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex gap-4 p-4 md:p-5 rounded-2xl bg-card/40 border border-white/8 backdrop-blur-sm hover:border-white/15 transition-colors"
    >
      {/* Image */}
      <div className="relative shrink-0">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-2" />
          ) : (
            <ShoppingBag size={32} className="text-muted-foreground/40" />
          )}
        </div>
        {discount > 0 && (
          <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-black shadow-lg">
            -{discount}%
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-0.5">{product.brand || product.category}</p>
            <h3 className="font-bold text-white text-sm md:text-base line-clamp-2 leading-snug">{product.name}</h3>
          </div>
          <button onClick={handleRemove} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0">
            <Trash2 size={16} />
          </button>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mt-1">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs text-muted-foreground">{product.rating}</span>
          </div>
        )}

        {/* Stock */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${product.inStock !== false ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={`text-xs font-semibold ${product.inStock !== false ? 'text-green-400' : 'text-red-400'}`}>
            {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Price + qty row */}
        <div className="flex items-end justify-between mt-3 gap-3 flex-wrap">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg md:text-xl font-black text-white">{fmt(product.price * quantity)}</span>
              {savings > 0 && quantity > 0 && (
                <span className="text-xs text-muted-foreground line-through">{fmt((product.originalPrice! * quantity))}</span>
              )}
            </div>
            {savings > 0 && (
              <p className="text-xs text-green-400 font-semibold">You save {fmt(savings * quantity)}</p>
            )}
            {quantity > 1 && (
              <p className="text-[11px] text-muted-foreground">{fmt(product.price)} each</p>
            )}
          </div>

          {/* Qty stepper */}
          <div className="flex items-center gap-0">
            <button
              onClick={() => onQtyChange(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-l-xl bg-white/8 border border-white/10 flex items-center justify-center text-white hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={13} />
            </button>
            <div className="w-10 h-8 bg-white/5 border-y border-white/10 flex items-center justify-center text-sm font-bold text-white">
              {quantity}
            </div>
            <button
              onClick={() => onQtyChange(Math.min(10, quantity + 1))}
              disabled={quantity >= 10}
              className="w-8 h-8 rounded-r-xl bg-white/8 border border-white/10 flex items-center justify-center text-white hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* Move to wishlist */}
        <button
          onClick={() => setWishlisted(w => !w)}
          className={`mt-3 flex items-center gap-1.5 text-xs font-semibold transition-colors ${wishlisted ? 'text-red-400' : 'text-muted-foreground hover:text-white'}`}
        >
          <Heart size={12} className={wishlisted ? 'fill-red-400' : ''} />
          {wishlisted ? 'Wishlisted' : 'Move to Wishlist'}
        </button>

        {/* Delivery estimate */}
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Truck size={11} className="text-primary shrink-0" />
          Delivery by <span className="text-white font-semibold ml-0.5">
            {new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CartPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useGetCart();
  const { mutate: removeFromCart } = useRemoveFromCart();
  const { mutate: addToCart } = useAddToCart();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [confirmingOrder, setConfirmingOrder] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '',
  });
  const [addrErrors, setAddrErrors] = useState<Record<string, string>>({});

  const items = cart?.items || [];
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const mrp = items.reduce((s, i) => s + (i.product.originalPrice ?? i.product.price) * i.quantity, 0);
  const itemDiscount = mrp - subtotal;
  const couponPct = COUPONS[appliedCoupon] || 0;
  const couponAmt = Math.round(subtotal * couponPct / 100);
  const delivery = subtotal > 2000 ? 0 : 99;
  const platformFee = 19;
  const total = subtotal - couponAmt + delivery + platformFee;
  const totalSavings = itemDiscount + couponAmt + (delivery === 0 ? 99 : 0);

  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: ['/api/cart'] });

  const handleQtyChange = async (productId: number, qty: number) => {
    await customFetch(`/api/cart/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: qty }),
    });
    invalidateCart();
  };

  const handleRemove = (productId: number) => {
    removeFromCart({ productId }, { onSuccess: invalidateCart });
  };

  const handleCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const code = couponInput.toUpperCase().trim();
    if (!code) { setCouponError('Enter a coupon code.'); return; }
    if (COUPONS[code]) {
      setAppliedCoupon(code);
      setCouponSuccess(`"${code}" applied! ${COUPONS[code]}% off.`);
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code.');
    }
  };

  const handlePlaceOrder = () => setShowAddressModal(true);

  const handleConfirmOrder = async () => {
    const errors: Record<string, string> = {};
    if (!deliveryInfo.name.trim()) errors.name = 'Name is required';
    if (!/^[6-9]\d{9}$/.test(deliveryInfo.phone.trim())) errors.phone = 'Valid 10-digit mobile number required';
    if (!deliveryInfo.email.trim() || !deliveryInfo.email.includes('@')) errors.email = 'Valid email required';
    if (!deliveryInfo.address.trim()) errors.address = 'Address is required';
    if (!deliveryInfo.city.trim()) errors.city = 'City is required';
    if (!/^\d{6}$/.test(deliveryInfo.pincode.trim())) errors.pincode = '6-digit pincode required';
    if (Object.keys(errors).length) { setAddrErrors(errors); return; }
    setAddrErrors({});
    setConfirmingOrder(true);
    const orderId = `MH-${Math.floor(100000 + Math.random() * 900000)}`;
    setCurrentOrderId(orderId);
    await new Promise(r => setTimeout(r, 1500));
    setConfirmingOrder(false);
    setShowAddressModal(false);

    // WhatsApp confirmation to customer
    const itemsList = items.map(i => `• ${i.product.name} x${i.quantity} — ${fmt(i.product.price * i.quantity)}`).join('\n');
    const waText = encodeURIComponent(
      `🏍️ *MotoHippi Order Confirmed!*\n\n` +
      `📦 *Order ID:* ${orderId}\n\n` +
      `*Your Items:*\n${itemsList}\n\n` +
      `💰 *Total Paid: ${fmt(total)}*\n\n` +
      `📍 *Deliver To:*\n${deliveryInfo.name}\n${deliveryInfo.address}, ${deliveryInfo.city}${deliveryInfo.state ? ', ' + deliveryInfo.state : ''} — ${deliveryInfo.pincode}\n📞 ${deliveryInfo.phone}\n\n` +
      `🚚 Estimated delivery: 3–7 business days.\n\nThank you for riding with MotoHippi! 🏍️`
    );
    window.open(`https://wa.me/91${deliveryInfo.phone.replace(/\D/g, '')}?text=${waText}`, '_blank');

    // Email confirmation via mailto
    const emailSub = encodeURIComponent(`Order Confirmed — ${orderId} | MotoHippi`);
    const emailBody = encodeURIComponent(
      `Hi ${deliveryInfo.name},\n\nYour MotoHippi order is confirmed!\n\nOrder ID: ${orderId}\n\nItems:\n` +
      items.map(i => `${i.product.name} x${i.quantity} — ${fmt(i.product.price * i.quantity)}`).join('\n') +
      `\n\nTotal: ${fmt(total)}\n\nDelivery Address:\n${deliveryInfo.address}, ${deliveryInfo.city}${deliveryInfo.state ? ', ' + deliveryInfo.state : ''} — ${deliveryInfo.pincode}\n\nEstimated delivery: 3–7 business days.\n\nRide safe!\nMotoHippi Team`
    );
    setTimeout(() => window.open(`mailto:${deliveryInfo.email}?subject=${emailSub}&body=${emailBody}`), 600);

    setOrderPlaced(true);
  };

  // ── Order placed screen ──────────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
          <div className="w-28 h-28 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto">
            <CheckCircle2 size={56} className="text-primary" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-3xl font-black text-white mb-1">Order Confirmed! 🎉</h2>
          <p className="text-muted-foreground max-w-sm">Your gear is on its way. Estimated delivery in 3–7 business days.</p>
          <div className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-semibold text-white">
            <Package size={16} className="text-primary" />
            Order ID: {currentOrderId}
          </div>
        </motion.div>

        {/* Delivery address recap */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-1.5">
          <p className="text-[11px] font-black uppercase tracking-widest text-primary mb-2">Delivering To</p>
          <p className="text-sm font-bold text-white">{deliveryInfo.name}</p>
          <p className="text-xs text-muted-foreground">{deliveryInfo.address}, {deliveryInfo.city}{deliveryInfo.state ? ', ' + deliveryInfo.state : ''} — {deliveryInfo.pincode}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone size={11} /> {deliveryInfo.phone}</p>
        </motion.div>

        {/* Confirmation channels */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="w-full max-w-sm space-y-2">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <MessageCircle size={16} className="text-green-400 shrink-0" />
            <p className="text-xs text-green-300 font-semibold">WhatsApp confirmation sent to {deliveryInfo.phone}</p>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Mail size={16} className="text-blue-400 shrink-0" />
            <p className="text-xs text-blue-300 font-semibold">Email confirmation sent to {deliveryInfo.email}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }} className="flex gap-3 flex-wrap justify-center">
          <Link href="/marketplace">
            <button className="px-6 py-3 rounded-2xl bg-primary text-black font-black hover:bg-primary/90 transition-all">
              Continue Shopping
            </button>
          </Link>
          <Link href="/home">
            <button className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all">
              Go Home
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center gap-4">
          <Link href="/marketplace">
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-white transition-colors text-sm">
              <ArrowLeft size={16} /> Shop
            </button>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="font-black text-white text-lg">My Cart</h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-xs font-black">
              {items.length}
            </div>
            <span className="text-muted-foreground text-sm hidden sm:block">item{items.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            {/* ── Left: items ── */}
            <div className="space-y-4">
              {/* Delivery banner */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold ${
                subtotal > 2000
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                <Truck size={16} />
                {subtotal > 2000
                  ? '🎉 You\'ve unlocked FREE delivery!'
                  : `Add ${fmt(2000 - subtotal)} more for FREE delivery`}
              </div>

              {/* Items */}
              <div className="space-y-3">
                <AnimatePresence>
                  {items.map((item, i) => (
                    <CartItem
                      key={item.product.id}
                      product={item.product}
                      quantity={item.quantity}
                      index={i}
                      onRemove={() => handleRemove(item.product.id)}
                      onQtyChange={qty => handleQtyChange(item.product.id, qty)}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Coupon section */}
              <div className="rounded-2xl bg-card/40 border border-white/8 backdrop-blur-sm p-5">
                <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                  <Tag size={16} className="text-primary" /> Apply Coupon
                </h3>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-400" />
                      <span className="text-green-400 font-bold text-sm">{appliedCoupon}</span>
                      <span className="text-muted-foreground text-xs">— {COUPONS[appliedCoupon]}% off applied</span>
                    </div>
                    <button onClick={() => { setAppliedCoupon(''); setCouponSuccess(''); }} className="text-xs text-muted-foreground hover:text-red-400 transition-colors font-semibold">Remove</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleCoupon()}
                        placeholder="Enter coupon code"
                        className="flex-1 h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all uppercase tracking-widest font-semibold"
                      />
                      <button onClick={handleCoupon} className="px-5 h-11 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-bold hover:bg-primary/20 transition-all">
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-red-400 text-xs font-semibold px-1">{couponError}</p>}
                    {couponSuccess && <p className="text-green-400 text-xs font-semibold px-1">{couponSuccess}</p>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(COUPONS).map(([code, pct]) => (
                        <button key={code} onClick={() => { setCouponInput(code); setCouponError(''); }} className="px-3 py-1 rounded-full border border-dashed border-primary/30 text-primary text-[11px] font-bold hover:bg-primary/10 transition-all">
                          {code} ({pct}% off)
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Trust badges (desktop hidden, shown mobile) */}
              <div className="grid grid-cols-2 gap-3 lg:hidden">
                {TRUST_BADGES.map(b => (
                  <div key={b.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/6">
                    <b.icon size={18} className="text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">{b.label}</p>
                      <p className="text-[10px] text-muted-foreground">{b.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: order summary ── */}
            <div className="space-y-4">
              {/* Price details */}
              <div className="rounded-2xl bg-card/40 border border-white/8 backdrop-blur-sm p-5 sticky top-20">
                <h3 className="font-black text-white text-base mb-5 flex items-center gap-2">
                  <Zap size={16} className="text-primary" />
                  Price Details
                  <span className="ml-auto text-xs text-muted-foreground font-normal">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MRP Total</span>
                    <span className="text-white font-semibold">{fmt(mrp)}</span>
                  </div>
                  {itemDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Item Discount</span>
                      <span className="text-green-400 font-semibold">-{fmt(itemDiscount)}</span>
                    </div>
                  )}
                  {couponAmt > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coupon ({appliedCoupon})</span>
                      <span className="text-green-400 font-semibold">-{fmt(couponAmt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Delivery Charges
                      {delivery === 0 && <span className="ml-1 text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold">FREE</span>}
                    </span>
                    {delivery === 0
                      ? <span className="text-green-400 font-semibold line-through text-muted-foreground/60">₹99</span>
                      : <span className="text-white font-semibold">{fmt(delivery)}</span>
                    }
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Platform Fee <Info size={11} className="text-muted-foreground/50" />
                    </span>
                    <span className="text-white font-semibold">{fmt(platformFee)}</span>
                  </div>

                  <div className="h-px bg-white/8 my-1" />

                  <div className="flex justify-between">
                    <span className="font-black text-white text-base">Total Amount</span>
                    <span className="font-black text-white text-base">{fmt(total)}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2.5 flex items-center justify-between">
                      <span className="text-green-400 text-xs font-bold flex items-center gap-1.5">
                        <Gift size={13} /> You save
                      </span>
                      <span className="text-green-400 font-black text-sm">{fmt(totalSavings)}</span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="mt-6 w-full h-14 rounded-2xl bg-[#D6FF2F] hover:bg-[#c8f020] disabled:opacity-70 text-black font-black text-base flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_30px_rgba(214,255,47,0.2)]"
                >
                  {placing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                      />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      Place Order · {fmt(total)}
                    </>
                  )}
                </button>

                {/* Secure payment */}
                <p className="text-center text-[11px] text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
                  <Shield size={11} className="text-primary" />
                  Secured by 256-bit SSL encryption
                </p>

                {/* Payment icons */}
                <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
                  {['Visa', 'Mastercard', 'UPI', 'GPay', 'PhonePe', 'NetBanking'].map(p => (
                    <span key={p} className="px-2 py-1 rounded border border-white/10 text-[10px] text-muted-foreground font-semibold bg-white/3">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trust badges (desktop) */}
              <div className="hidden lg:grid grid-cols-1 gap-2">
                {TRUST_BADGES.map(b => (
                  <div key={b.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/6">
                    <b.icon size={17} className="text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">{b.label}</p>
                      <p className="text-[10px] text-muted-foreground">{b.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* ── Delivery Address Modal ────────────────────────────────────────────── */}
    <AnimatePresence>
      {showAddressModal && (
        <>
          {/* Backdrop */}
          <motion.div
            key="addr-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !confirmingOrder && setShowAddressModal(false)}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
          />
          {/* Sheet */}
          <motion.div
            key="addr-sheet"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 36 }}
            className="fixed bottom-0 left-0 right-0 z-[71] bg-[#0e0e0e] border-t border-white/10 rounded-t-3xl p-5 max-h-[92svh] overflow-y-auto"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
          >
            {/* Handle + Header */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <MapPin size={15} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">Delivery Address</p>
                  <p className="text-[10px] text-muted-foreground">Where should we deliver your gear?</p>
                </div>
              </div>
              {!confirmingOrder && (
                <button onClick={() => setShowAddressModal(false)}
                  className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Form */}
            <div className="space-y-3 max-w-lg mx-auto">
              {/* Name + Phone row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <UserIcon size={10} /> Full Name *
                  </label>
                  <input
                    value={deliveryInfo.name}
                    onChange={e => setDeliveryInfo(d => ({ ...d, name: e.target.value }))}
                    placeholder="Rahul Sharma"
                    className={`w-full h-11 px-3.5 rounded-xl bg-white/6 border text-white text-sm placeholder:text-white/25 outline-none focus:border-primary/60 transition-colors ${addrErrors.name ? 'border-red-500/60' : 'border-white/10'}`}
                  />
                  {addrErrors.name && <p className="text-[10px] text-red-400 mt-0.5">{addrErrors.name}</p>}
                </div>
                <div>
                  <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Phone size={10} /> Mobile Number *
                  </label>
                  <input
                    value={deliveryInfo.phone}
                    onChange={e => setDeliveryInfo(d => ({ ...d, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    placeholder="9876543210"
                    inputMode="numeric"
                    className={`w-full h-11 px-3.5 rounded-xl bg-white/6 border text-white text-sm placeholder:text-white/25 outline-none focus:border-primary/60 transition-colors ${addrErrors.phone ? 'border-red-500/60' : 'border-white/10'}`}
                  />
                  {addrErrors.phone && <p className="text-[10px] text-red-400 mt-0.5">{addrErrors.phone}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mail size={10} /> Email Address *
                </label>
                <input
                  value={deliveryInfo.email}
                  onChange={e => setDeliveryInfo(d => ({ ...d, email: e.target.value }))}
                  placeholder="rahul@email.com"
                  type="email"
                  inputMode="email"
                  className={`w-full h-11 px-3.5 rounded-xl bg-white/6 border text-white text-sm placeholder:text-white/25 outline-none focus:border-primary/60 transition-colors ${addrErrors.email ? 'border-red-500/60' : 'border-white/10'}`}
                />
                {addrErrors.email && <p className="text-[10px] text-red-400 mt-0.5">{addrErrors.email}</p>}
              </div>

              {/* Street Address */}
              <div>
                <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin size={10} /> Street Address *
                </label>
                <input
                  value={deliveryInfo.address}
                  onChange={e => setDeliveryInfo(d => ({ ...d, address: e.target.value }))}
                  placeholder="Flat 4B, Sunrise Apartments, MG Road"
                  className={`w-full h-11 px-3.5 rounded-xl bg-white/6 border text-white text-sm placeholder:text-white/25 outline-none focus:border-primary/60 transition-colors ${addrErrors.address ? 'border-red-500/60' : 'border-white/10'}`}
                />
                {addrErrors.address && <p className="text-[10px] text-red-400 mt-0.5">{addrErrors.address}</p>}
              </div>

              {/* City + State + Pincode row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider mb-1 block">City *</label>
                  <input
                    value={deliveryInfo.city}
                    onChange={e => setDeliveryInfo(d => ({ ...d, city: e.target.value }))}
                    placeholder="Mumbai"
                    className={`w-full h-11 px-3.5 rounded-xl bg-white/6 border text-white text-sm placeholder:text-white/25 outline-none focus:border-primary/60 transition-colors ${addrErrors.city ? 'border-red-500/60' : 'border-white/10'}`}
                  />
                  {addrErrors.city && <p className="text-[10px] text-red-400 mt-0.5">{addrErrors.city}</p>}
                </div>
                <div>
                  <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider mb-1 block">State</label>
                  <input
                    value={deliveryInfo.state}
                    onChange={e => setDeliveryInfo(d => ({ ...d, state: e.target.value }))}
                    placeholder="Maharashtra"
                    className="w-full h-11 px-3.5 rounded-xl bg-white/6 border border-white/10 text-white text-sm placeholder:text-white/25 outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider mb-1 block">Pincode *</label>
                  <input
                    value={deliveryInfo.pincode}
                    onChange={e => setDeliveryInfo(d => ({ ...d, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    placeholder="400001"
                    inputMode="numeric"
                    className={`w-full h-11 px-3.5 rounded-xl bg-white/6 border text-white text-sm placeholder:text-white/25 outline-none focus:border-primary/60 transition-colors ${addrErrors.pincode ? 'border-red-500/60' : 'border-white/10'}`}
                  />
                  {addrErrors.pincode && <p className="text-[10px] text-red-400 mt-0.5">{addrErrors.pincode}</p>}
                </div>
              </div>

              {/* Confirmation channels note */}
              <div className="flex gap-2 pt-1">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-500/8 border border-green-500/15">
                  <MessageCircle size={13} className="text-green-400 shrink-0" />
                  <p className="text-[11px] text-green-300">Booking confirmation on WhatsApp</p>
                </div>
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-500/8 border border-blue-500/15">
                  <Mail size={13} className="text-blue-400 shrink-0" />
                  <p className="text-[11px] text-blue-300">Confirmation on Email</p>
                </div>
              </div>

              {/* CTA */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmOrder}
                disabled={confirmingOrder}
                className="w-full h-14 mt-2 rounded-2xl bg-[#D6FF2F] hover:bg-[#c8f020] disabled:opacity-70 text-black font-black text-base flex items-center justify-center gap-2.5 transition-all shadow-[0_0_30px_rgba(214,255,47,0.2)]"
              >
                {confirmingOrder ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full" />
                    Confirming Order…
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    Confirm Order · {fmt(total)}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
