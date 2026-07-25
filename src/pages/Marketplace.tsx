import React, { useState, useMemo } from 'react';
import { useGetProducts, useGetCart, useAddToCart } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag, Star, Check, ShoppingCart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import ProductDetailDrawer from '@/components/ProductDetailDrawer';

const CATEGORIES = [
  { label: 'All',                  match: null },
  { label: 'Biker Equipments',     match: ['biker', 'helmet', 'jacket', 'glove', 'boot', 'gear', 'riding'] },
  { label: 'Car Equipments',       match: ['car', 'auto', 'dash cam', 'tyre', 'tool'] },
  { label: 'Camping Equipments',   match: ['camping', 'camp', 'tent', 'sleeping', 'luggage'] },
  { label: 'Action Cam',           match: ['action cam', 'gopro', 'camera', 'mount', 'drone'] },
];

export default function Marketplace() {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useGetProducts();
  const { data: cart } = useGetCart();
  const { mutate: addToCart } = useAddToCart();

  const [activeCategory, setActiveCategory] = useState('All');
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const cartCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
  const cartProductIds = new Set(cart?.items?.map(i => i.product.id) ?? []);

  const filtered = useMemo(() => {
    if (!products) return [];
    const cat = CATEGORIES.find(c => c.label === activeCategory);
    if (!cat || !cat.match) return products;
    return products.filter(p =>
      cat.match!.some(m => p.category?.toLowerCase().includes(m))
    );
  }, [products, activeCategory]);

  const handleAddToCart = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      { data: { productId, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
          setAddedIds(prev => new Set(prev).add(productId));
          setTimeout(() => setAddedIds(prev => {
            const next = new Set(prev); next.delete(productId); return next;
          }), 2000);
        },
      }
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1">Shop</h1>
          <p className="text-muted-foreground">Premium gear from verified riders and brands.</p>
        </div>
        <Link href="/cart">
          <button className="relative flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/8 transition-all text-white font-semibold text-sm">
            <ShoppingCart size={18} />
            My Cart
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-black text-[10px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </Link>
      </div>

      {/* Category pills */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat.label;
            const ICONS: Record<string, string> = {
              All: '🛒', 'Biker Equipments': '🏍️', 'Car Equipments': '🚗', 'Camping Equipments': '⛺', 'Action Cam': '🎥',
            };
            return (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-2xl text-sm font-bold border whitespace-nowrap transition-all shrink-0 ${
                  active
                    ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(214,255,47,0.22)]'
                    : 'bg-white/5 text-muted-foreground border-white/10 hover:border-primary/30 hover:text-white hover:bg-white/8'
                }`}
              >
                <span className="text-base leading-none">{ICONS[cat.label]}</span>
                {cat.label}
                {active && cat.label !== 'All' && (
                  <span className={`ml-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${active ? 'bg-black/20' : 'bg-white/10'}`}>
                    {filtered.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {/* Active category underline indicator */}
        <div className="mt-3 h-px bg-white/5" />
      </div>

      {/* Product grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <ShoppingBag size={28} className="text-muted-foreground" />
          </div>
          <p className="text-white font-bold text-lg">No products in this category yet</p>
          <button onClick={() => setActiveCategory('All')} className="px-5 py-2 rounded-full bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-colors">
            Browse All
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((product, i) => {
            const inCart = cartProductIds.has(product.id);
            const justAdded = addedIds.has(product.id);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div onClick={() => setSelectedProduct(product)} className="cursor-pointer h-full">
                  <Card className="glass-card hover:bg-card/60 transition-all duration-300 overflow-hidden border-white/5 group h-full flex flex-col hover:border-primary/20 hover:shadow-[0_0_30px_rgba(26,107,46,0.12)]">
                    <div className="h-48 relative bg-white/5 p-4 flex items-center justify-center overflow-hidden">
                      <img
                        src={product.imageUrl || ''}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl"
                      />
                      {product.originalPrice && (
                        <Badge className="absolute top-2 left-2 bg-destructive text-white border-none text-[10px]">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </Badge>
                      )}
                      {inCart && !justAdded && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check size={12} className="text-black" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 flex flex-col flex-1">
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{product.category}</div>
                      <h3 className="font-bold mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors flex-1 text-sm">{product.name}</h3>
                      <div className="flex items-center gap-1 text-amber-500 text-xs mb-3">
                        <Star size={12} className="fill-amber-500" />
                        <span>{product.rating || '4.8'}</span>
                        <span className="text-muted-foreground ml-1">({product.reviewsCount || 12})</span>
                      </div>
                      <div className="flex items-center justify-between mt-auto gap-2">
                        <div>
                          <div className="font-black text-base text-white">₹{product.price.toLocaleString('en-IN')}</div>
                          {product.originalPrice && (
                            <div className="text-[10px] text-muted-foreground line-through">₹{product.originalPrice.toLocaleString('en-IN')}</div>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleAddToCart(e, product.id)}
                          className={`rounded-xl h-9 px-3 border text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                            justAdded
                              ? 'bg-primary/20 border-primary/40 text-primary'
                              : inCart
                              ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
                              : 'bg-white/5 border-white/10 text-white hover:bg-primary hover:text-black hover:border-primary'
                          }`}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {justAdded ? (
                              <motion.span key="added" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1">
                                <Check size={12} /> Added
                              </motion.span>
                            ) : inCart ? (
                              <motion.span key="incart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1">
                                <ShoppingCart size={12} /> In Cart
                              </motion.span>
                            ) : (
                              <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1">
                                <ShoppingBag size={12} /> Add
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <ProductDetailDrawer
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
