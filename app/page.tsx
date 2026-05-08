'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { SolPayButton } from '@/components/SolPayButton';
import { MERCHANT_WALLET } from '@/lib/solana';

const STEPS = [
  {
    num: '01',
    title: 'Add one line of code',
    desc: 'Drop the SolPayButton component into any React or Next.js site. Pass your wallet, amount, and token. Done.',
    color: '#9945FF',
  },
  {
    num: '02',
    title: 'Customer clicks & pays',
    desc: 'A beautiful checkout modal opens. Customers pay with Phantom wallet or scan the QR code on mobile.',
    color: '#14F195',
  },
  {
    num: '03',
    title: 'Money in your wallet',
    desc: 'Solana settles in under 1 second. No bank. No 3-day hold. No 2.9% cut. Funds arrive instantly.',
    color: '#00C2FF',
  },
];

const STATS = [
  { value: '<1s', label: 'Settlement time', sub: 'vs 3 days for banks' },
  { value: '$0.00025', label: 'Per transaction', sub: 'vs 2.9% with Stripe' },
  { value: '1 line', label: 'To integrate', sub: 'vs weeks of dev work' },
  { value: '65K', label: 'TPS on Solana', sub: 'vs ~7 for Ethereum' },
];

const CODE_SNIPPET = `import { SolPayButton } from 'solpay';

// That's it. Seriously.
<SolPayButton
  merchantWallet="yourWallet.sol"
  amount={4.99}
  token="USDC"
  label="Buy Premium Plan"
/>`;

export default function LandingPage() {
  const [codeVisible, setCodeVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCodeVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(CODE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-grid" style={{ background: 'var(--sol-bg)' }}>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden pt-20">
        {/* Ambient blobs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, #9945FF, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, #14F195, transparent 70%)', filter: 'blur(60px)', animationDelay: '1.5s' }}
        />

        <div className="relative z-10 max-w-4xl">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium animate-fade-in"
            style={{
              background: 'rgba(153,69,255,0.12)',
              border: '1px solid rgba(153,69,255,0.3)',
              color: '#9945FF',
            }}
          >
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            Built on Solana · Devnet Ready · Open Source
          </div>

          <h1
            className="text-6xl md:text-8xl font-black mb-6 leading-none tracking-tighter animate-slide-up"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The{' '}
            <span className="gradient-text">Stripe</span>
            <br />
            for Solana
          </h1>

          <p
            className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up"
            style={{ color: 'var(--sol-muted)', animationDelay: '0.1s' }}
          >
            Accept SOL, USDC, and SPL token payments on any website in{' '}
            <span style={{ color: 'var(--sol-text)' }}>under 5 minutes</span>.
            Beautiful checkout. Real-time confirmation. Zero blockchain knowledge needed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/demo"
              className="btn-primary px-8 py-4 rounded-2xl text-lg font-bold inline-flex items-center gap-2"
            >
              Try Live Demo
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/dashboard"
              className="btn-secondary px-8 py-4 rounded-2xl text-lg font-bold inline-flex items-center gap-2"
            >
              View Dashboard
            </Link>
          </div>

          {/* Quick demo button */}
          <div className="mt-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <p className="text-sm mb-3" style={{ color: 'var(--sol-muted)' }}>
              Or click below for a live payment demo:
            </p>
            <SolPayButton
              amount={0.001}
              token="SOL"
              merchantWallet={MERCHANT_WALLET}
              label="Pay with SolPay"
              description="Live demo — devnet only"
              size="lg"
            />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 flex items-start justify-center pt-2" style={{ borderColor: 'var(--sol-border2)' }}>
            <div className="w-1 h-3 rounded-full animate-bounce" style={{ background: 'var(--sol-purple)' }} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="glass rounded-2xl p-6 text-center"
              style={{ border: '1px solid var(--sol-border)' }}
            >
              <p
                className="text-4xl font-black mb-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--sol-green)' }}
              >
                {s.value}
              </p>
              <p className="font-semibold text-sm mb-1">{s.label}</p>
              <p className="text-xs" style={{ color: 'var(--sol-muted)' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-mono mb-3" style={{ color: 'var(--sol-purple)' }}>HOW IT WORKS</p>
            <h2 className="text-5xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
              Three steps to{' '}
              <span className="gradient-text">crypto payments</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="glass rounded-3xl p-8 group hover:scale-105 transition-transform duration-300"
                style={{ border: '1px solid var(--sol-border)' }}
              >
                <div
                  className="text-6xl font-black mb-4 opacity-20"
                  style={{ fontFamily: 'var(--font-display)', color: step.color }}
                >
                  {step.num}
                </div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ fontFamily: 'var(--font-display)', color: step.color }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--sol-muted)' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code snippet */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-mono mb-3" style={{ color: 'var(--sol-green)' }}>INTEGRATION</p>
            <h2 className="text-5xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
              Seriously, it&apos;s{' '}
              <span className="gradient-text">one component</span>
            </h2>
          </div>
          <div
            className={`glass rounded-3xl overflow-hidden transition-all duration-700 ${codeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ border: '1px solid rgba(153,69,255,0.3)' }}
          >
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ background: 'rgba(153,69,255,0.1)', borderBottom: '1px solid rgba(153,69,255,0.2)' }}
            >
              <div className="flex gap-2">
                {['#FF5F56', '#FFBD2E', '#27C93F'].map((c) => (
                  <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
                ))}
              </div>
              <span className="text-xs font-mono" style={{ color: 'var(--sol-muted)' }}>checkout.tsx</span>
              <button
                onClick={copyCode}
                className="text-xs px-3 py-1 rounded-lg transition-all"
                style={{
                  background: copied ? 'rgba(20,241,149,0.2)' : 'rgba(255,255,255,0.05)',
                  color: copied ? '#14F195' : 'var(--sol-muted)',
                  border: `1px solid ${copied ? 'rgba(20,241,149,0.3)' : 'var(--sol-border)'}`,
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre
              className="p-6 text-sm overflow-x-auto"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--sol-text)', lineHeight: 1.8 }}
            >
              <code>
                <span style={{ color: 'var(--sol-muted)' }}>{'import'}</span>
                {' { SolPayButton } '}
                <span style={{ color: 'var(--sol-muted)' }}>{'from'}</span>
                <span style={{ color: '#14F195' }}>{' \'solpay\''}</span>
                {'\n\n'}
                <span style={{ color: 'var(--sol-muted)' }}>{'// That\'s it. Seriously.'}</span>
                {'\n'}
                {'<'}<span style={{ color: '#00C2FF' }}>SolPayButton</span>
                {'\n  '}<span style={{ color: '#9945FF' }}>merchantWallet</span>{'='}
                <span style={{ color: '#14F195' }}>{'"yourWallet.sol"'}</span>
                {'\n  '}<span style={{ color: '#9945FF' }}>amount</span>{'={'}
                <span style={{ color: '#FFC400' }}>{'4.99'}</span>
                {'}'}
                {'\n  '}<span style={{ color: '#9945FF' }}>token</span>{'='}
                <span style={{ color: '#14F195' }}>{'"USDC"'}</span>
                {'\n  '}<span style={{ color: '#9945FF' }}>label</span>{'='}
                <span style={{ color: '#14F195' }}>{'"Buy Premium Plan"'}</span>
                {'\n/>'}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="glass rounded-3xl p-12 gradient-border"
            style={{ border: '1px solid var(--sol-border)' }}
          >
            <h2
              className="text-5xl font-black mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Ready to accept{' '}
              <span className="gradient-text">crypto?</span>
            </h2>
            <p className="text-lg mb-8" style={{ color: 'var(--sol-muted)' }}>
              Try the live demo or explore the merchant dashboard.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/demo" className="btn-primary px-8 py-4 rounded-2xl text-lg font-bold inline-block">
                Launch Demo Store
              </Link>
              <Link href="/dashboard" className="btn-secondary px-8 py-4 rounded-2xl text-lg font-bold inline-block">
                Merchant Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-center" style={{ borderTop: '1px solid var(--sol-border)' }}>
        <p className="text-sm" style={{ color: 'var(--sol-muted)' }}>
          Built with Next.js + Solana ·{' '}
          <span style={{ color: 'var(--sol-purple)' }}>Dev3pack Global Hackathon 2025</span>
        </p>
      </footer>
    </div>
  );
}
