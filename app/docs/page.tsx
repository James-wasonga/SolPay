'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
interface Section {
  id: string;
  label: string;
  icon: string;
}

/* ─────────────────────────────────────────
   SIDEBAR SECTIONS
───────────────────────────────────────── */
const SECTIONS: Section[] = [
  { id: 'overview',      label: 'What is SolPay?',     icon: '👋' },
  { id: 'how-it-works',  label: 'How it works',        icon: '⚙️' },
  { id: 'quickstart',    label: 'Quick Start',         icon: '🚀' },
  { id: 'installation',  label: 'Installation',        icon: '📦' },
  { id: 'env-setup',     label: 'Environment Setup',   icon: '🔑' },
  { id: 'solpaybutton',  label: 'SolPayButton',        icon: '🔘' },
  { id: 'checkout-modal',label: 'CheckoutModal',       icon: '💳' },
  { id: 'tokens',        label: 'Supported Tokens',    icon: '🪙' },
  { id: 'webhook',       label: 'Webhooks',            icon: '🔔' },
  { id: 'deployment',    label: 'Deployment',          icon: '🌐' },
  { id: 'faq',           label: 'FAQ',                 icon: '❓' },
];

/* ─────────────────────────────────────────
   SMALL REUSABLE COMPONENTS
───────────────────────────────────────── */
function CodeBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      className="rounded-2xl overflow-hidden my-4"
      style={{ border: '1px solid rgba(153,69,255,0.25)' }}
    >
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: 'rgba(153,69,255,0.1)', borderBottom: '1px solid rgba(153,69,255,0.2)' }}
      >
        <span className="text-xs font-mono" style={{ color: 'var(--sol-muted)' }}>{lang}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-xs px-3 py-1 rounded-lg transition-all"
          style={{
            background: copied ? 'rgba(20,241,149,0.2)' : 'rgba(255,255,255,0.05)',
            color: copied ? '#14F195' : 'var(--sol-muted)',
            border: `1px solid ${copied ? 'rgba(20,241,149,0.3)' : 'var(--sol-border)'}`,
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre
        className="p-5 text-sm overflow-x-auto leading-relaxed"
        style={{ fontFamily: 'var(--font-mono)', color: '#14F195', background: 'rgba(8,12,20,0.9)' }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Callout({ type, children }: { type: 'info' | 'warning' | 'tip' | 'success'; children: React.ReactNode }) {
  const styles = {
    info:    { bg: 'rgba(0,194,255,0.08)',   border: 'rgba(0,194,255,0.25)',   color: '#00C2FF',  icon: 'ℹ️' },
    warning: { bg: 'rgba(255,196,0,0.08)',   border: 'rgba(255,196,0,0.25)',   color: '#FFC400',  icon: '⚠️' },
    tip:     { bg: 'rgba(153,69,255,0.08)',  border: 'rgba(153,69,255,0.25)', color: '#9945FF',  icon: '💡' },
    success: { bg: 'rgba(20,241,149,0.08)',  border: 'rgba(20,241,149,0.25)', color: '#14F195',  icon: '✅' },
  };
  const s = styles[type];
  return (
    <div className="rounded-xl p-4 my-4 flex gap-3" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      <span className="flex-shrink-0 text-base">{s.icon}</span>
      <div className="text-sm leading-relaxed" style={{ color: s.color }}>{children}</div>
    </div>
  );
}

function PropRow({ name, type, required, def, desc }: { name: string; type: string; required?: boolean; def?: string; desc: string }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--sol-border)' }}>
      <td className="py-3 pr-4 align-top">
        <code className="text-sm font-mono" style={{ color: '#9945FF' }}>{name}</code>
        {required && (
          <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,77,77,0.15)', color: '#FF4D4D' }}>required</span>
        )}
      </td>
      <td className="py-3 pr-4 align-top">
        <code className="text-xs font-mono" style={{ color: '#00C2FF' }}>{type}</code>
      </td>
      <td className="py-3 pr-4 align-top text-xs" style={{ color: 'var(--sol-muted)' }}>{def ?? '—'}</td>
      <td className="py-3 align-top text-sm" style={{ color: 'var(--sol-muted)' }}>{desc}</td>
    </tr>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-3xl font-black mb-2 mt-12 scroll-mt-24"
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xl font-bold mt-8 mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--sol-text)' }}>
      {children}
    </h3>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-7 mb-4" style={{ color: 'var(--sol-muted)' }}>{children}</p>;
}

function Divider() {
  return <div className="my-8" style={{ borderTop: '1px solid var(--sol-border)' }} />;
}

/* ─────────────────────────────────────────
   FAQ ITEM
───────────────────────────────────────── */
function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-2xl overflow-hidden mb-3"
      style={{ border: '1px solid var(--sol-border)', background: 'rgba(13,18,32,0.6)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-semibold text-sm">{q}</span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--sol-muted)' }}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm leading-7" style={{ color: 'var(--sol-muted)', borderTop: '1px solid var(--sol-border)' }}>
          <div className="pt-3">{children}</div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   STEP BADGE
───────────────────────────────────────── */
function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-8">
      <div className="flex-shrink-0 flex flex-col items-center">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
          style={{ background: 'linear-gradient(135deg,#9945FF,#14F195)', color: 'white' }}
        >
          {n}
        </div>
        <div className="flex-1 w-px mt-2" style={{ background: 'var(--sol-border)', minHeight: 24 }} />
      </div>
      <div className="pb-6 flex-1">
        <p className="font-bold mb-2">{title}</p>
        <div className="text-sm leading-7" style={{ color: 'var(--sol-muted)' }}>{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */
export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--sol-bg)' }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 flex gap-10">

        {/* ── Sidebar ── */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--sol-muted)' }}>
              Documentation
            </p>
            <nav className="space-y-0.5">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-2.5 transition-all"
                  style={{
                    background: activeSection === s.id ? 'rgba(153,69,255,0.12)' : 'transparent',
                    color: activeSection === s.id ? '#9945FF' : 'var(--sol-muted)',
                    fontWeight: activeSection === s.id ? 600 : 400,
                  }}
                >
                  <span className="text-base leading-none">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </nav>

            <div
              className="mt-8 p-4 rounded-2xl"
              style={{ background: 'rgba(20,241,149,0.08)', border: '1px solid rgba(20,241,149,0.2)' }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: '#14F195' }}>Try it live</p>
              <p className="text-xs mb-3" style={{ color: 'var(--sol-muted)' }}>See SolPay in action on the demo store.</p>
              <Link
                href="/demo"
                className="text-xs px-3 py-1.5 rounded-lg font-semibold block text-center"
                style={{ background: 'rgba(20,241,149,0.15)', color: '#14F195', border: '1px solid rgba(20,241,149,0.3)' }}
              >
                Open Demo →
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 max-w-3xl">

          {/* Hero */}
          <div className="mb-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-5"
              style={{ background: 'rgba(153,69,255,0.12)', border: '1px solid rgba(153,69,255,0.3)', color: '#9945FF' }}
            >
              📖 Documentation · v0.1.0
            </div>
            <h1 className="text-5xl font-black mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              SolPay <span className="gradient-text">Docs</span>
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--sol-muted)' }}>
              Everything you need to accept Solana payments on your website — from a sneaker store to a SaaS platform.
            </p>
          </div>

          {/* ── OVERVIEW ── */}
          <SectionTitle id="overview">👋 What is SolPay?</SectionTitle>
          <Prose>
            SolPay is an open-source checkout toolkit for the Solana blockchain. Think of it like{' '}
            <strong style={{ color: 'var(--sol-text)' }}>Stripe, but for crypto</strong>. Instead of setting up a merchant account,
            dealing with bank transfers, or waiting 3 days for settlement — you add one React component to your site, pass it
            your Solana wallet address, and your customers can pay you in SOL, USDC, or BONK instantly.
          </Prose>
          <Prose>
            You do not need to know anything about blockchain to use SolPay. If you can build a website with Next.js,
            you can accept Solana payments in under 5 minutes.
          </Prose>

          <div className="grid grid-cols-3 gap-3 my-6">
            {[
              { label: 'Settlement', value: '< 1 second', color: '#14F195' },
              { label: 'Fee per tx', value: '$0.00025', color: '#9945FF' },
              { label: 'Integration', value: '1 component', color: '#00C2FF' },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4 text-center" style={{ border: '1px solid var(--sol-border)' }}>
                <p className="text-2xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</p>
                <p className="text-xs" style={{ color: 'var(--sol-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          <Callout type="tip">
            <strong>Real-world example:</strong> You sell custom sneakers at KES 8,000. A buyer in Dubai wants to pay with
            crypto. You add one SolPayButton to your product page. They click it, approve in Phantom wallet, and in under
            a second — the equivalent in USDC lands in your wallet. No intermediary, no conversion fee, no waiting.
          </Callout>

          <Divider />

          {/* ── HOW IT WORKS ── */}
          <SectionTitle id="how-it-works">⚙️ How it works</SectionTitle>
          <Prose>
            Here is the exact sequence of events when a customer pays on your site:
          </Prose>

          <Step n={1} title="Merchant adds the SolPayButton to their site">
            You copy one component tag into your website code. You pass it three things: your wallet address,
            the price, and the token (SOL, USDC, or BONK).
          </Step>
          <Step n={2} title="Customer clicks the button">
            A beautiful checkout modal pops up showing the amount, a QR code, and a Connect Wallet button.
            The customer can pay from desktop (Phantom browser extension) or mobile (Phantom app via QR scan).
          </Step>
          <Step n={3} title="Your server builds the transaction">
            SolPay's API route creates a Solana transaction instruction: "transfer X from buyer to merchant."
            This is sent to the browser. Importantly — <strong style={{ color: 'var(--sol-text)' }}>your server cannot sign or steal funds</strong>.
            Only the buyer's wallet can authorise it.
          </Step>
          <Step n={4} title="Buyer approves in their wallet">
            Phantom shows the buyer exactly what they are approving — amount, destination, fee.
            They click Approve. Their private key signs the transaction. It is broadcast to Solana.
          </Step>
          <Step n={5} title="Solana confirms in under 1 second">
            Thousands of validators agree the transaction is valid. The funds move from buyer to your wallet.
            SolPay detects the confirmation and shows a success animation.
          </Step>

          <Callout type="success">
            The money is in your wallet before the confetti animation finishes. No bank. No hold. No fees beyond $0.00025.
          </Callout>

          <Divider />

          {/* ── QUICKSTART ── */}
          <SectionTitle id="quickstart">🚀 Quick Start</SectionTitle>
          <Prose>
            This gets you from zero to a working payment button in under 5 minutes.
          </Prose>
          <CodeBlock lang="bash" code={`# 1. Clone or download the SolPay project
git clone https://github.com/your-username/solpay
cd solpay

# 2. Install dependencies
npm install

# 3. Copy the environment file
cp .env.example .env.local

# 4. Fill in your values (see Environment Setup section below)
# 5. Run the dev server
npm run dev

# Open http://localhost:3000`} />

          <Callout type="info">
            That is all you need to see SolPay running locally. The demo store at{' '}
            <code style={{ color: '#9945FF' }}>/demo</code> and dashboard at <code style={{ color: '#9945FF' }}>/dashboard</code>{' '}
            are ready to use immediately on devnet.
          </Callout>

          <Divider />

          {/* ── INSTALLATION ── */}
          <SectionTitle id="installation">📦 Installation</SectionTitle>

          <SubTitle>Option A — Use SolPay as a full project (recommended for hackathon)</SubTitle>
          <Prose>
            Download the complete SolPay project and run it as your own Next.js app.
            Customise the demo store, add your products, change the branding — it is all yours.
          </Prose>
          <CodeBlock lang="bash" code={`npm install
npm run dev`} />

          <SubTitle>Option B — Add SolPay to an existing Next.js project</SubTitle>
          <Prose>
            If you already have a Next.js site (like a sneaker store), you can copy just the
            components and API routes you need into your existing project.
          </Prose>
          <CodeBlock lang="bash" code={`# Install required dependencies into your existing project
npm install @solana/web3.js @solana/wallet-adapter-react \\
  @solana/wallet-adapter-react-ui @solana/wallet-adapter-phantom \\
  @solana/pay qrcode.react canvas-confetti`} />

          <Prose>Then copy these files from the SolPay project into yours:</Prose>
          <CodeBlock lang="text" code={`Files to copy into your project:
├── components/
│   ├── CheckoutModal.tsx     ← The full checkout UI
│   ├── SolPayButton.tsx      ← The button you add to product pages
│   └── WalletProvider.tsx    ← Wrap your app layout with this
├── lib/
│   ├── solana.ts             ← RPC connection helper
│   └── tokens.ts             ← SOL / USDC / BONK config
└── app/api/
    ├── create-transaction/route.ts   ← Builds the Solana tx
    └── verify-transaction/route.ts   ← Confirms on-chain`} />

          <Callout type="warning">
            Make sure your project uses <strong>Next.js 13+</strong> with the App Router and <strong>TypeScript</strong>.
            The API routes use the <code style={{ color: '#FFC400' }}>route.ts</code> convention.
          </Callout>

          <Divider />

          {/* ── ENV SETUP ── */}
          <SectionTitle id="env-setup">🔑 Environment Setup</SectionTitle>
          <Prose>
            You need two things: a Helius RPC key (for fast Solana access) and your wallet address (where payments go).
            Both are free.
          </Prose>

          <CodeBlock lang="bash" code={`# .env.local (create this file in your project root)

# Your Helius RPC key — get free at https://helius.dev
NEXT_PUBLIC_HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY

# Your Solana wallet address (from Phantom)
NEXT_PUBLIC_MERCHANT_WALLET=YOUR_WALLET_ADDRESS

# "devnet" for testing (free), "mainnet-beta" for real money
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Optional: fires a POST to your backend when a payment confirms
MERCHANT_WEBHOOK_URL=https://yoursite.com/api/payment-confirmed`} />

          <SubTitle>Getting your Helius RPC key</SubTitle>
          <Step n={1} title="Go to helius.dev">Visit <a href="https://helius.dev" target="_blank" rel="noopener noreferrer" style={{ color: '#9945FF' }}>helius.dev</a> and click Get Started Free.</Step>
          <Step n={2} title="Sign up with Google">Takes about 30 seconds. No credit card needed.</Step>
          <Step n={3} title="Create a project">Select Devnet. Copy the RPC URL that looks like: <code style={{ color: '#14F195' }}>https://devnet.helius-rpc.com/?api-key=abc123</code></Step>

          <SubTitle>Getting your Solana wallet address</SubTitle>
          <Step n={1} title="Install Phantom">Go to <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" style={{ color: '#9945FF' }}>phantom.app</a> and install the browser extension (Chrome, Firefox, Brave) or the mobile app.</Step>
          <Step n={2} title="Create a wallet">Follow the setup. Write down your seed phrase — this is your password and cannot be recovered.</Step>
          <Step n={3} title="Copy your address">Click your wallet name at the top of Phantom. It copies your public address — paste it as <code style={{ color: '#14F195' }}>NEXT_PUBLIC_MERCHANT_WALLET</code>.</Step>

          <Callout type="tip">
            For testing, switch Phantom to Devnet mode: Settings → Developer Settings → Testnet Mode.
            Then get free devnet SOL at <a href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer" style={{ color: '#9945FF' }}>faucet.solana.com</a>.
          </Callout>

          <Divider />

          {/* ── SOLPAYBUTTON ── */}
          <SectionTitle id="solpaybutton">🔘 SolPayButton</SectionTitle>
          <Prose>
            This is the component you add to any product page. It opens the full checkout modal when clicked.
          </Prose>

          <SubTitle>Basic usage</SubTitle>
          <CodeBlock lang="tsx" code={`import { SolPayButton } from '@/components/SolPayButton';

// On any page — a sneaker product page, a SaaS pricing page, etc.
<SolPayButton
  merchantWallet="YourSolanaWalletAddress"
  amount={0.5}
  token="SOL"
  label="Buy Air Max 95"
/>`} />

          <SubTitle>With USDC (stablecoin — recommended for products)</SubTitle>
          <CodeBlock lang="tsx" code={`<SolPayButton
  merchantWallet="YourSolanaWalletAddress"
  amount={89.99}
  token="USDC"
  label="Buy Sneaker Bundle"
  description="Air Max 95 + socks, size 42"
  onSuccess={(signature) => {
    console.log('Payment confirmed!', signature);
    // redirect to order confirmation, send email, etc.
  }}
/>`} />

          <SubTitle>Sizes</SubTitle>
          <CodeBlock lang="tsx" code={`<SolPayButton ... size="sm" />   {/* small — fits inside a card */}
<SolPayButton ... size="md" />   {/* medium — default */}
<SolPayButton ... size="lg" />   {/* large — hero section CTA */}`} />

          <SubTitle>Props reference</SubTitle>
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--sol-border)' }}>
                  {['Prop', 'Type', 'Default', 'Description'].map((h) => (
                    <th key={h} className="py-2 pr-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sol-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <PropRow name="merchantWallet" type="string"  required desc="Your Solana wallet address — where payments land." />
                <PropRow name="amount"         type="number"  required desc="The price in the chosen token (e.g. 89.99 for USDC)." />
                <PropRow name="token"          type="string"  def='"SOL"' desc='Which token to accept. Options: "SOL", "USDC", "BONK".' />
                <PropRow name="label"          type="string"  def='"Pay with SOL"' desc="Button text and modal heading." />
                <PropRow name="description"    type="string"  def="—" desc="Subtitle shown in the checkout modal (e.g. product details)." />
                <PropRow name="onSuccess"      type="(sig: string) => void" def="—" desc="Called with the transaction signature when payment confirms." />
                <PropRow name="size"           type='"sm"|"md"|"lg"' def='"md"' desc="Controls the button padding and font size." />
                <PropRow name="className"      type="string"  def="—" desc="Extra Tailwind classes for the button wrapper." />
              </tbody>
            </table>
          </div>

          <Divider />

          {/* ── CHECKOUT MODAL ── */}
          <SectionTitle id="checkout-modal">💳 CheckoutModal</SectionTitle>
          <Prose>
            If you want more control — for example, triggering the checkout from your own button —
            you can use CheckoutModal directly.
          </Prose>
          <CodeBlock lang="tsx" code={`'use client';
import { useState } from 'react';
import { CheckoutModal } from '@/components/CheckoutModal';

export default function ProductPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Your own custom button */}
      <button onClick={() => setOpen(true)}>
        Buy Now — 0.5 SOL
      </button>

      <CheckoutModal
        isOpen={open}
        onClose={() => setOpen(false)}
        amount={0.5}
        token="SOL"
        merchantWallet="YourWalletAddress"
        label="Air Max 95"
        description="Size 42 · Black colourway"
        onSuccess={(signature) => {
          setOpen(false);
          alert('Payment done! Sig: ' + signature);
        }}
      />
    </>
  );
}`} />

          <Divider />

          {/* ── TOKENS ── */}
          <SectionTitle id="tokens">🪙 Supported Tokens</SectionTitle>
          <Prose>
            SolPay currently supports three tokens. USDC is recommended for e-commerce because its value is stable.
          </Prose>

          <div className="space-y-3 my-6">
            {[
              { symbol: 'SOL',  name: 'Solana',   color: '#9945FF', desc: 'Native Solana token. Fast, ultra-cheap ($0.00025/tx). Price fluctuates with market.',    best: 'Donations, tips, micro-payments' },
              { symbol: 'USDC', name: 'USD Coin',  color: '#2775CA', desc: '1 USDC = 1 USD always. Stablecoin. Perfect for product sales where you need a fixed price.', best: 'Products, services, subscriptions' },
              { symbol: 'BONK', name: 'Bonk',      color: '#F7931A', desc: 'Popular Solana meme coin. Fun for community-driven stores and NFT drops.',                 best: 'NFTs, community stores, fun demos' },
            ].map((t) => (
              <div key={t.symbol} className="flex gap-4 p-4 rounded-2xl" style={{ background: 'rgba(13,18,32,0.6)', border: '1px solid var(--sol-border)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm"
                  style={{ background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}30`, fontFamily: 'var(--font-mono)' }}>
                  {t.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{t.symbol}</span>
                    <span className="text-xs" style={{ color: 'var(--sol-muted)' }}>{t.name}</span>
                  </div>
                  <p className="text-xs leading-relaxed mb-1" style={{ color: 'var(--sol-muted)' }}>{t.desc}</p>
                  <p className="text-xs" style={{ color: t.color }}>Best for: {t.best}</p>
                </div>
              </div>
            ))}
          </div>

          <Callout type="tip">
            For a sneaker store or any physical product — always use <strong>USDC</strong>.
            Price in USDC means your buyer pays exactly $89.99 and you receive exactly $89.99.
            No exchange rate risk.
          </Callout>

          <Divider />

          {/* ── WEBHOOKS ── */}
          <SectionTitle id="webhook">🔔 Webhooks</SectionTitle>
          <Prose>
            Webhooks let you run code on your server when a payment confirms — send a confirmation email,
            mark an order as paid, trigger shipping, etc.
          </Prose>
          <CodeBlock lang="bash" code={`# In .env.local — set your backend endpoint
MERCHANT_WEBHOOK_URL=https://yoursite.com/api/payment-confirmed`} />

          <Prose>SolPay will POST this payload to your URL when a payment confirms:</Prose>
          <CodeBlock lang="json" code={`{
  "signature": "5xV9kJME8qP3nRtYw...",
  "amount": 89.99,
  "token": "USDC",
  "fromWallet": "BuyerWalletAddress",
  "toWallet": "YourWalletAddress",
  "label": "Air Max 95",
  "timestamp": 1716912345678
}`} />

          <SubTitle>Example webhook handler (Next.js)</SubTitle>
          <CodeBlock lang="tsx" code={`// app/api/payment-confirmed/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { signature, amount, token, label } = await req.json();

  // Do whatever you need:
  // - Send confirmation email
  // - Mark order as paid in your database
  // - Trigger Shopify fulfillment
  // - Send a WhatsApp message
  console.log(\`Payment of \${amount} \${token} confirmed for: \${label}\`);
  console.log(\`Verify at: https://solscan.io/tx/\${signature}\`);

  return NextResponse.json({ ok: true });
}`} />

          <Divider />

          {/* ── DEPLOYMENT ── */}
          <SectionTitle id="deployment">🌐 Deployment</SectionTitle>

          <SubTitle>Deploy to Vercel (recommended — free)</SubTitle>
          <CodeBlock lang="bash" code={`# Install Vercel CLI
npm install -g vercel

# Deploy from your project folder
cd solpay
vercel

# Follow the prompts — it will ask for your env variables.
# Add these three when prompted:
#   NEXT_PUBLIC_HELIUS_RPC_URL
#   NEXT_PUBLIC_MERCHANT_WALLET
#   NEXT_PUBLIC_SOLANA_NETWORK`} />

          <Prose>
            After deployment Vercel gives you a URL like <code style={{ color: '#14F195' }}>solpay.vercel.app</code>.
            Share this with hackathon judges so they can test it live.
          </Prose>

          <SubTitle>Switch from devnet to mainnet (real money)</SubTitle>
          <CodeBlock lang="bash" code={`# In .env.local (or Vercel env vars)
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`} />

          <Callout type="warning">
            On mainnet, transactions use <strong>real money</strong>. Test everything thoroughly on devnet first.
            A confirmed transaction on Solana cannot be reversed.
          </Callout>

          <Divider />

          {/* ── FAQ ── */}
          <SectionTitle id="faq">❓ FAQ</SectionTitle>

          <FaqItem q="Do my customers need to know about blockchain?">
            No. They just need a Phantom wallet — which is a free browser extension or mobile app.
            Installing it takes 2 minutes. After that, paying feels like any other checkout form.
          </FaqItem>
          <FaqItem q="Can I use SolPay on a non-Next.js site (plain HTML, WordPress, Shopify)?">
            SolPay is built on Next.js and React. For plain HTML sites, you would need to embed a hosted
            version of the checkout. For Shopify or WordPress, the cleanest approach is to host SolPay
            separately and link to it as a payment page. A standalone embeddable script version is on the roadmap.
          </FaqItem>
          <FaqItem q="What happens if the transaction fails halfway?">
            Solana transactions either fully complete or fully fail — there is no partial state.
            If a transaction fails, no funds move. SolPay shows an error state and lets the customer retry.
          </FaqItem>
          <FaqItem q="Can a merchant steal a customer's funds?">
            No. The server only builds a transaction instruction — it cannot sign or broadcast it.
            Only the customer's own Phantom wallet can authorise the payment. The customer sees exactly
            what they are approving before clicking Confirm.
          </FaqItem>
          <FaqItem q="How do I accept payments for physical products like shoes?">
            Use USDC as the token — it is pegged 1:1 to USD so your prices are stable.
            Add a SolPayButton to each product page, set the amount in USDC, and point it at your wallet.
            When onSuccess fires, record the order and signature in your database.
          </FaqItem>
          <FaqItem q="Is there a transaction fee beyond Solana's $0.00025?">
            No. SolPay is open source and takes zero commission. The only cost is the Solana network fee,
            which is approximately $0.00025 per transaction — paid by the buyer.
          </FaqItem>
          <FaqItem q="Can I use this for subscriptions or recurring payments?">
            Not automatically — Solana does not have built-in recurring billing like a card network.
            Each payment requires an explicit wallet approval. You could implement a reminder system
            that prompts users to re-approve each billing period.
          </FaqItem>
          <FaqItem q="What is the difference between devnet and mainnet?">
            Devnet is a test environment — SOL is free and worthless, transactions are fake.
            Mainnet is the real Solana blockchain where SOL and USDC have real monetary value.
            Always build and test on devnet first.
          </FaqItem>
          <FaqItem q="How do I verify a payment was real and not faked?">
            Every confirmed transaction has a unique signature (a long string like <code style={{ color: '#14F195' }}>5xV9kJME8...</code>).
            You can verify any transaction at{' '}
            <a href="https://solscan.io" target="_blank" rel="noopener noreferrer" style={{ color: '#9945FF' }}>solscan.io</a>{' '}
            — it shows the exact amount, wallets, and timestamp, all immutably recorded on-chain.
            In your code, use the verify-transaction API route to confirm the signature before fulfilling an order.
          </FaqItem>

          {/* Footer CTA */}
          <div
            className="mt-14 rounded-3xl p-8 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(153,69,255,0.12), rgba(20,241,149,0.06))', border: '1px solid rgba(153,69,255,0.25)' }}
          >
            <h3 className="text-2xl font-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Ready to accept crypto?
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--sol-muted)' }}>
              Try the live demo store or check the merchant dashboard.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/demo" className="btn-primary px-6 py-3 rounded-xl text-sm font-bold inline-block">
                Launch Demo Store
              </Link>
              <Link href="/dashboard" className="btn-secondary px-6 py-3 rounded-xl text-sm font-bold inline-block">
                Merchant Dashboard
              </Link>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
