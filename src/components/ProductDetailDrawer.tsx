import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Shield, ShoppingBag, ShoppingCart, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAddToCart, useGetCart } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

// ─── Per-product enrichment (sizes, colors, safety, multi-angle images) ───────
interface ProductColor { name: string; hex: string }
interface ProductMeta {
  sizes: string[];
  colors: ProductColor[];
  safetyLevel: string;
  safetyBadge: string;
  images: string[];
  highlights: string[];
}

const PRODUCT_META: Record<string, ProductMeta> = {
  'Arai RX-7V Evo Helmet': {
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Matte Black',  hex: '#1c1c1e' },
      { name: 'Pearl White',  hex: '#efefed' },
      { name: 'Racing Red',   hex: '#c0392b' },
      { name: 'Carbon Grey',  hex: '#4a4a4a' },
    ],
    safetyLevel: 'FIA 8860-2018 / SNELL M2020',
    safetyBadge: 'Highest Racing Safety Rating',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop&crop=left',
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1508003680-0c3fbf67d4c2?w=800&h=800&fit=crop',
    ],
    highlights: [
      'Race-grade composite shell',
      'Pinlock 120 ready visor',
      'Advanced ventilation channel system',
      'Emergency Quick Release (EQR) lining',
    ],
  },
  'Alpinestars Andes V3 Jacket': {
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
    colors: [
      { name: 'Black',       hex: '#111111' },
      { name: 'Black/Grey',  hex: '#555555' },
      { name: 'Black/Red',   hex: '#8b1a1a' },
    ],
    safetyLevel: 'CE Level 2 EN 17092',
    safetyBadge: 'CE Level 2 Certified',
    images: [
      'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=800&h=800&fit=crop&crop=right',
      'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=800&h=800&fit=crop&crop=bottom',
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=800&h=800&fit=crop',
    ],
    highlights: [
      'Gore-Tex® waterproof membrane',
      '12-zone ventilation system',
      'CE Level 2 shoulder & elbow armor',
      'Removable thermal liner',
    ],
  },
  'Sidi Adventure 2 Gore Boots': {
    sizes: ['39', '40', '41', '42', '43', '44', '45', '46'],
    colors: [
      { name: 'Black',        hex: '#111111' },
      { name: 'Black/Brown',  hex: '#6b3a2a' },
      { name: 'Grey/Black',   hex: '#5a5a5a' },
    ],
    safetyLevel: 'CE Category II EN 13634',
    safetyBadge: 'CE Cat. II Certified',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&crop=right',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&crop=bottom',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop',
    ],
    highlights: [
      'Gore-Tex® waterproof lining',
      'BOA® speed-lace closure system',
      'Composite ankle protection plate',
      'Anti-slip sole with heel cup',
    ],
  },
  "REV'IT Sand 4 H2O Pants": {
    sizes: ['28', '30', '32', '34', '36', '38', '40'],
    colors: [
      { name: 'Black',       hex: '#111111' },
      { name: 'Sand/Grey',   hex: '#b5a08a' },
      { name: 'Black/Red',   hex: '#8b1a1a' },
    ],
    safetyLevel: 'CE Level 1 EN 17092-3',
    safetyBadge: 'CE Level 1 Armor',
    images: [
      'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&h=800&fit=crop&crop=top',
      'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&h=800&fit=crop&crop=bottom',
      'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=800&h=800&fit=crop',
    ],
    highlights: [
      'H2O waterproof membrane',
      'CE Level 1 hip & knee armor slots',
      'Removable thermal inner liner',
      'Compatible with REV\'IT jacket connectors',
    ],
  },
  'Kriega US-20 Drypack': {
    sizes: ['One Size (20L)'],
    colors: [
      { name: 'Black',  hex: '#111111' },
      { name: 'Olive',  hex: '#4a5240' },
    ],
    safetyLevel: '100% Waterproof IPX6',
    safetyBadge: 'Fully Waterproof',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&crop=right',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&crop=left',
      'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&h=800&fit=crop',
    ],
    highlights: [
      'MOLLE attachment system',
      '20L TPU welded dry bag',
      '10-year manufacturer guarantee',
      'Cargo net included',
    ],
  },
  'Cardo Packtalk Edge': {
    sizes: ['Universal Fit'],
    colors: [
      { name: 'Black',  hex: '#111111' },
      { name: 'White',  hex: '#e8e8e8' },
    ],
    safetyLevel: 'IP67 Waterproof / Dustproof',
    safetyBadge: 'IP67 Certified',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop&crop=left',
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop&crop=right',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop',
    ],
    highlights: [
      'Dynamic Mesh Communication (DMC)',
      '1.6 km open-air range',
      'Natural Voice Operation',
      'Up to 13 hours battery life',
    ],
  },
  'Touratech Zega Pro Pannier Set': {
    sizes: ['38L Left + 45L Right'],
    colors: [
      { name: 'Aluminium Silver',  hex: '#b0b8c1' },
      { name: 'Matte Black',       hex: '#1c1c1e' },
    ],
    safetyLevel: 'TSA-Lock / Impact-Tested Aluminium',
    safetyBadge: 'Aluminium Armour Shell',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&crop=top',
      'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&crop=bottom',
    ],
    highlights: [
      'CNC aluminium construction',
      'Expandable top lid (+5L each)',
      'Universal fitment system',
      'TSA-approved combination lock',
    ],
  },
  'Klim Badlands Pro A3 Jacket': {
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
    colors: [
      { name: 'Striking Black',    hex: '#111111' },
      { name: 'Asphalt/Hi-Vis',   hex: '#3a3a2a' },
      { name: 'Monument Grey',     hex: '#5a5a5a' },
    ],
    safetyLevel: 'CE Level 2 EN 17092-2 / Gore-Tex® Pro',
    safetyBadge: 'CE Level 2 + Gore-Tex® Pro',
    images: [
      'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=800&h=800&fit=crop&crop=left',
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=800&h=800&fit=crop&crop=bottom',
    ],
    highlights: [
      '3-layer Gore-Tex® Pro membrane',
      'CE Level 2 shoulder, elbow & back armor',
      '500g Primaloft® quilted liner',
      'D3O® back protector included',
    ],
  },
};

function fallbackMeta(product: any): ProductMeta {
  return {
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Black', hex: '#111111' }],
    safetyLevel: 'CE Certified',
    safetyBadge: 'CE Certified',
    images: [product.imageUrl || ''],
    highlights: [product.description || ''],
  };
}

// ─── Drawer component ─────────────────────────────────────────────────────────
interface Props {
  product: any | null;
  onClose: () => void;
}

export default function ProductDetailDrawer({ product, onClose }: Props) {
  const queryClient = useQueryClient();
  const { data: cart } = useGetCart();
  const { mutate: addToCart } = useAddToCart();

  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const meta = product ? (PRODUCT_META[product.name] ?? fallbackMeta(product)) : null;
  const inCart = cart?.items?.some((i: any) => i.product.id === product?.id) ?? false;

  // Reset selections when product changes
  React.useEffect(() => {
    if (product && meta) {
      setActiveImg(0);
      setSelectedSize(meta.sizes[0] ?? null);
      setSelectedColor(meta.colors[0]?.name ?? null);
      setJustAdded(false);
    }
  }, [product?.id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ data: { productId: product.id, quantity: 1 } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2500);
      },
    });
  };

  const prevImg = () => setActiveImg(i => (i - 1 + (meta?.images.length ?? 1)) % (meta?.images.length ?? 1));
  const nextImg = () => setActiveImg(i => (i + 1) % (meta?.images.length ?? 1));

  const safetyColor = (badge: string) => {
    if (badge.includes('Level 2') || badge.includes('FIA') || badge.includes('SNELL')) return { bg: '#16a34a22', border: '#16a34a55', text: '#4ade80' };
    if (badge.includes('Level 1')) return { bg: '#ca8a0422', border: '#ca8a0455', text: '#fbbf24' };
    if (badge.includes('IP67') || badge.includes('Waterproof')) return { bg: '#2563eb22', border: '#2563eb55', text: '#60a5fa' };
    return { bg: '#7c3aed22', border: '#7c3aed55', text: '#a78bfa' };
  };

  return (
    <AnimatePresence>
      {product && meta && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer — bottom sheet on mobile, right panel on lg+ */}
          <motion.div
            key="drawer-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d] border-t border-white/10 rounded-t-3xl overflow-hidden flex flex-col"
            style={{ maxHeight: '92dvh' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="overflow-y-auto flex-1 pb-safe">
              {/* ── Image gallery ── */}
              <div className="relative bg-white/4 mx-4 mt-2 rounded-2xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    src={meta.images[activeImg]}
                    alt={`${product.name} angle ${activeImg + 1}`}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full object-contain p-6 drop-shadow-2xl"
                  />
                </AnimatePresence>

                {/* Prev / Next */}
                {meta.images.length > 1 && (
                  <>
                    <button onClick={prevImg}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:bg-black/70 transition-colors">
                      <ChevronLeft size={16} className="text-white" />
                    </button>
                    <button onClick={nextImg}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:bg-black/70 transition-colors">
                      <ChevronRight size={16} className="text-white" />
                    </button>
                  </>
                )}

                {/* Discount badge */}
                {product.originalPrice && (
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-black">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </div>
                )}

                {/* Close */}
                <button onClick={onClose}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:bg-black/70 transition-colors">
                  <X size={16} className="text-white" />
                </button>
              </div>

              {/* Thumbnail strip */}
              {meta.images.length > 1 && (
                <div className="flex gap-2 px-4 mt-3 overflow-x-auto scrollbar-hide">
                  {meta.images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`w-14 h-14 rounded-xl border-2 shrink-0 overflow-hidden transition-all ${
                        activeImg === i ? 'border-primary' : 'border-white/10 opacity-50 hover:opacity-75'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* ── Product info ── */}
              <div className="px-4 mt-4 space-y-4">
                {/* Name + rating */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{product.brand}</p>
                  <h2 className="text-xl font-black leading-tight text-white mb-2">{product.name}</h2>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-amber-400 text-sm">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={13} className={s <= Math.round(product.rating || 4.5) ? 'fill-amber-400' : 'fill-white/10 text-white/10'} />
                      ))}
                      <span className="text-white font-bold ml-1">{product.rating || '4.8'}</span>
                      <span className="text-muted-foreground">({product.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Safety level */}
                {(() => {
                  const sc = safetyColor(meta.safetyBadge);
                  return (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
                      style={{ background: sc.bg, borderColor: sc.border }}>
                      <Shield size={20} style={{ color: sc.text }} />
                      <div>
                        <p className="text-xs font-bold" style={{ color: sc.text }}>{meta.safetyBadge}</p>
                        <p className="text-[11px] text-white/50 mt-0.5">{meta.safetyLevel}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Colors */}
                {meta.colors.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2.5">
                      Color — <span className="text-white">{selectedColor}</span>
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {meta.colors.map(c => (
                        <button key={c.name} onClick={() => setSelectedColor(c.name)}
                          title={c.name}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            selectedColor === c.name ? 'border-primary scale-110 shadow-[0_0_10px_rgba(214,255,47,0.4)]' : 'border-white/20'
                          }`}
                          style={{ background: c.hex }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {meta.sizes.length > 0 && meta.sizes[0] !== 'One Size (20L)' && meta.sizes[0] !== 'Universal Fit' && meta.sizes[0] !== '38L Left + 45L Right' && (
                  <div>
                    <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2.5">Size</p>
                    <div className="flex flex-wrap gap-2">
                      {meta.sizes.map(sz => (
                        <button key={sz} onClick={() => setSelectedSize(sz)}
                          className={`min-w-[44px] px-3 py-2 rounded-xl text-sm font-bold border transition-all ${
                            selectedSize === sz
                              ? 'bg-primary text-black border-primary shadow-[0_0_12px_rgba(214,255,47,0.3)]'
                              : 'bg-white/5 text-white/70 border-white/10 hover:border-primary/40 hover:text-white'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highlights */}
                <div>
                  <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2.5">Highlights</p>
                  <ul className="space-y-1.5">
                    {meta.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <span className="text-primary mt-0.5 shrink-0">✓</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Description */}
                <p className="text-sm text-white/50 leading-relaxed">{product.description}</p>
              </div>

              {/* Spacer for sticky bar */}
              <div className="h-28" />
            </div>

            {/* ── Sticky bottom CTA ── */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/95 to-transparent pt-6 shrink-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-2xl font-black text-white">₹{product.price.toLocaleString('en-IN')}</div>
                  {product.originalPrice && (
                    <div className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toLocaleString('en-IN')}</div>
                  )}
                </div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 max-w-[220px] py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                    !product.inStock
                      ? 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                      : justAdded
                      ? 'bg-primary/20 border border-primary/40 text-primary'
                      : inCart
                      ? 'bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20'
                      : 'bg-primary text-black hover:bg-primary/90 shadow-[0_0_24px_rgba(214,255,47,0.3)]'
                  }`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {!product.inStock ? (
                      <motion.span key="oos" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Out of Stock</motion.span>
                    ) : justAdded ? (
                      <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                        <Check size={16} /> Added to Cart!
                      </motion.span>
                    ) : inCart ? (
                      <motion.span key="incart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <ShoppingCart size={16} /> In Cart
                      </motion.span>
                    ) : (
                      <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <ShoppingBag size={16} /> Add to Cart
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
