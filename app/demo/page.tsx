'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { MERCHANT_WALLET } from '@/lib/solana';

interface Product {
  id: number;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  token: string;
  emoji: string;
  tag: string;
  tagColor: string;
  ingredients?: string[];
  extras?: string[];
  prepTime?: string;
  calories?: string;
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Flat White',
    description: 'Double ristretto, velvety microfoam, silky texture',
    longDescription: 'Our signature Flat White is crafted with two perfectly pulled ristretto shots, topped with a thin layer of velvety steamed whole milk. The result is a rich, bold espresso taste with a silky smooth texture that coffee lovers adore.',
    price: 0.001,
    token: 'SOL',
    emoji: '☕',
    tag: 'Bestseller',
    tagColor: '#9945FF',
    ingredients: ['Double ristretto', 'Whole milk microfoam', 'Single origin beans'],
    extras: ['Oat milk +0.0001 SOL', 'Extra shot +0.0001 SOL', 'Vanilla syrup +0.00005 SOL'],
    prepTime: '3 min',
    calories: '120 kcal',
  },
  {
    id: 2,
    name: 'Avocado Toast',
    description: 'Sourdough, fresh avo, chili flakes, lemon zest',
    longDescription: 'Thick-cut artisan sourdough, toasted golden, loaded with smashed fresh avocado seasoned with sea salt, cracked pepper, chili flakes, and a bright lemon zest finish. A Nairobi brunch classic, now payable in USDC.',
    price: 5,
    token: 'USDC',
    emoji: '🥑',
    tag: 'USDC',
    tagColor: '#2775CA',
    ingredients: ['Artisan sourdough', 'Fresh Kenyan avocado', 'Chili flakes', 'Lemon zest', 'Sea salt'],
    extras: ['Add egg +1 USDC', 'Add smoked salmon +2 USDC', 'Extra avo +1 USDC'],
    prepTime: '7 min',
    calories: '380 kcal',
  },
  {
    id: 3,
    name: 'Acai Bowl',
    description: 'Organic acai, granola, banana, honey drizzle',
    longDescription: 'Blended organic acai base, topped with crunchy house-made granola, fresh banana slices, seasonal berries, and a wild honey drizzle. Nutritious, vibrant, and blockchain-verified fresh every morning.',
    price: 0.002,
    token: 'SOL',
    emoji: '🫐',
    tag: 'Healthy',
    tagColor: '#14F195',
    ingredients: ['Organic acai', 'House granola', 'Fresh banana', 'Seasonal berries', 'Wild honey'],
    extras: ['Add chia seeds +0.0001 SOL', 'Add protein powder +0.0002 SOL'],
    prepTime: '5 min',
    calories: '290 kcal',
  },
  {
    id: 4,
    name: 'Matcha Latte',
    description: 'Ceremonial grade matcha, oat milk, light sweetness',
    longDescription: 'Ceremonial-grade Japanese matcha whisked to a smooth paste, steamed together with creamy oat milk and a touch of agave. Rich in antioxidants, gentle on caffeine. The future of focus is green.',
    price: 0.001,
    token: 'SOL',
    emoji: '🍵',
    tag: 'Trending',
    tagColor: '#00C2FF',
    ingredients: ['Ceremonial matcha', 'Oat milk', 'Agave syrup'],
    extras: ['Extra matcha +0.0001 SOL', 'Almond milk swap free', 'Oat milk swap free'],
    prepTime: '4 min',
    calories: '150 kcal',
  },
  {
    id: 5,
    name: 'Solana Merch Tee',
    description: 'Limited edition dev3pack hackathon tee, unisex fit',
    longDescription: 'Premium 100% organic cotton tee, screen-printed with the exclusive Dev3pack Global Hackathon 2025 design. Unisex relaxed fit, available S–XL. Ships worldwide. Only 200 made — every purchase recorded on-chain.',
    price: 25,
    token: 'USDC',
    emoji: '👕',
    tag: 'Limited',
    tagColor: '#FF6B6B',
    ingredients: ['100% organic cotton', 'Screen print', 'Unisex S–XL'],
    extras: ['Size S', 'Size M', 'Size L', 'Size XL'],
    prepTime: 'Ships in 3 days',
    calories: undefined,
  },
  {
    id: 6,
    name: 'BONK Bundle',
    description: 'Get 3 drinks and a free BONK sticker pack',
    longDescription: 'The ultimate crypto coffee bundle. Choose any 3 drinks from our menu, get a limited-edition BONK dog sticker pack, and a collectible BrewNairobi loyalty NFT airdropped to your wallet. Perfect for the whole dev team.',
    price: 1000000,
    token: 'BONK',
    emoji: '🐶',
    tag: 'BONK',
    tagColor: '#F7931A',
    ingredients: ['Any 3 drinks', 'BONK sticker pack', 'Loyalty NFT airdrop'],
    extras: ['Choose your 3 drinks at counter'],
    prepTime: '10 min',
    calories: 'Varies',
  },
];

const TOKEN_COLORS: Record<string, string> = {
  SOL: '#9945FF',
  USDC: '#2775CA',
  BONK: '#F7931A',
};

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const color = TOKEN_COLORS[product.token] ?? '#9945FF';
  return (
    <div
      className="glass rounded-3xl overflow-hidden group transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl cursor-pointer"
      style={{ border: '1px solid var(--sol-border)' }}
      onClick={onClick}
    >
      <div
        className="h-44 flex items-center justify-center relative overflow-hidden"
        style={{ background: 'rgba(153,69,255,0.06)' }}
      >
        <span className="text-8xl transition-transform duration-300 group-hover:scale-110" role="img" aria-label={product.name}>
          {product.emoji}
        </span>
        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ background: `${product.tagColor}20`, color: product.tagColor, border: `1px solid ${product.tagColor}40` }}
        >
          {product.tag}
        </div>
        {/* View details hint */}
        <div
          className="absolute bottom-0 left-0 right-0 py-2 text-center text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(8,12,20,0.8)', color: 'var(--sol-muted)' }}
        >
          Tap to view details
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-display)' }}>{product.name}</h3>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--sol-muted)' }}>{product.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)', color }}>
              {product.token === 'BONK' ? (product.price / 1000).toFixed(0) + 'K' : product.price}
            </span>
            <span className="text-sm ml-1.5" style={{ color: 'var(--sol-muted)' }}>{product.token}</span>
          </div>
          <div
            className="px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
          >
            View & Buy →
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetailModal({
  product,
  onClose,
  onPaid,
}: {
  product: Product;
  onClose: () => void;
  onPaid: (sig: string) => void;
}) {
  const [showCheckout, setShowCheckout] = useState(false);
  const color = TOKEN_COLORS[product.token] ?? '#9945FF';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        style={{ background: 'rgba(8,12,20,0.9)', backdropFilter: 'blur(12px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          className="w-full max-w-lg glass rounded-3xl overflow-hidden animate-slide-up"
          style={{ border: `1px solid ${color}40`, maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Hero image area */}
          <div
            className="h-52 flex items-center justify-center relative"
            style={{ background: `linear-gradient(135deg, ${color}15, rgba(20,241,149,0.06))` }}
          >
            <span className="text-9xl" role="img" aria-label={product.name}>{product.emoji}</span>
            <div
              className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: `${product.tagColor}25`, color: product.tagColor, border: `1px solid ${product.tagColor}50` }}
            >
              {product.tag}
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'rgba(8,12,20,0.7)', border: '1px solid var(--sol-border)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="var(--sol-muted)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Name + price */}
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
                {product.name}
              </h2>
              <div className="text-right">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black" style={{ color }}>
                    {product.token === 'BONK' ? (product.price / 1000).toFixed(0) + 'K' : product.price}
                  </span>
                  <span className="text-sm font-semibold" style={{ color }}>{product.token}</span>
                </div>
              </div>
            </div>

            {/* Meta row */}
            {(product.prepTime || product.calories) && (
              <div className="flex gap-3 mb-4">
                {product.prepTime && (
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
                    style={{ background: 'rgba(26,34,53,0.8)', color: 'var(--sol-muted)', border: '1px solid var(--sol-border)' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {product.prepTime}
                  </div>
                )}
                {product.calories && (
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
                    style={{ background: 'rgba(26,34,53,0.8)', color: 'var(--sol-muted)', border: '1px solid var(--sol-border)' }}
                  >
                    🔥 {product.calories}
                  </div>
                )}
              </div>
            )}

            {/* Long description */}
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--sol-muted)' }}>
              {product.longDescription}
            </p>

            {/* Ingredients */}
            {product.ingredients && (
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--sol-muted)' }}>
                  What&apos;s inside
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extras / options */}
            {product.extras && (
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--sol-muted)' }}>
                  Add-ons & options
                </p>
                <div className="space-y-1.5">
                  {product.extras.map((ex) => (
                    <div
                      key={ex}
                      className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl"
                      style={{ background: 'rgba(26,34,53,0.5)', color: 'var(--sol-muted)', border: '1px solid var(--sol-border)' }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      {ex}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pay button */}
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-4 rounded-2xl text-base font-bold btn-primary flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Buy {product.name} · {product.token === 'BONK' ? (product.price / 1000).toFixed(0) + 'K' : product.price} {product.token}
            </button>

            <p className="text-center text-xs mt-3" style={{ color: 'var(--sol-muted)' }}>
              Secured by Solana · Devnet (no real money)
            </p>
          </div>
        </div>
      </div>

      {/* Checkout modal on top */}
      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          amount={product.price}
          token={product.token}
          merchantWallet={MERCHANT_WALLET}
          label={`Buy ${product.name}`}
          description={product.description}
          onSuccess={(sig) => {
            setShowCheckout(false);
            onClose();
            onPaid(sig);
          }}
        />
      )}
    </>
  );
}

export default function DemoPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [paidItems, setPaidItems] = useState<number[]>([]);
  const [lastSig, setLastSig] = useState<string>('');

  return (
    <div className="min-h-screen bg-grid" style={{ background: 'var(--sol-bg)' }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm"
            style={{ background: 'rgba(20,241,149,0.1)', border: '1px solid rgba(20,241,149,0.2)', color: '#14F195' }}
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live Demo — Devnet (no real money)
          </div>
          <h1 className="text-6xl font-black mb-3 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            ☕ Brew<span className="gradient-text">Nairobi</span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--sol-muted)' }}>
            Nairobi&apos;s first crypto-native coffee shop — powered by SolPay
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--sol-muted)' }}>
            Tap any item card to view full details and pay
          </p>
        </div>

        {/* Success banner */}
        {lastSig && (
          <div
            className="mb-8 rounded-2xl p-5 flex items-center gap-4 animate-slide-up"
            style={{ background: 'rgba(20,241,149,0.1)', border: '1px solid rgba(20,241,149,0.3)' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(20,241,149,0.2)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="#14F195" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#14F195' }}>Payment confirmed on Solana!</p>
              <a
                href={`https://solscan.io/tx/${lastSig}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline"
                style={{ color: 'rgba(20,241,149,0.7)' }}
              >
                {lastSig.slice(0, 20)}...{lastSig.slice(-8)} ↗
              </a>
            </div>
          </div>
        )}

        {/* Product grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="relative">
              {paidItems.includes(product.id) && (
                <div
                  className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: '#14F195' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="#080C14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              <ProductCard
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
            </div>
          ))}
        </div>

        {/* Info note */}
        <div
          className="mt-10 rounded-2xl p-5 text-center"
          style={{ background: 'rgba(153,69,255,0.08)', border: '1px solid rgba(153,69,255,0.2)' }}
        >
          <p className="text-sm" style={{ color: 'var(--sol-muted)' }}>
            This is a <span style={{ color: 'var(--sol-purple)' }}>devnet demo</span> — no real money involved.
            Get free devnet SOL at{' '}
            <a href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--sol-blue)' }}>
              faucet.solana.com
            </a>
            {' '}to test payments.
          </p>
        </div>

        <div className="text-center mt-8">
          <Link href="/dashboard" className="btn-secondary px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
            View payments in Dashboard →
          </Link>
        </div>
      </div>

      {/* Product detail modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onPaid={(sig) => {
            setPaidItems((prev) => [...prev, selectedProduct.id]);
            setLastSig(sig);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
