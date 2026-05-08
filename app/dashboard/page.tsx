'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { shortenAddress, explorerUrl } from '@/lib/solana';
import { formatUSD } from '@/lib/prices';
import type { TxRecord } from '@/lib/transactions';

const TOKEN_COLORS: Record<string, string> = {
  SOL: '#9945FF',
  USDC: '#2775CA',
  BONK: '#F7931A',
};

function StatCard({ label, value, sub, color, icon }: {
  label: string; value: string; sub?: string; color: string; icon: React.ReactNode;
}) {
  return (
    <div
      className="glass rounded-2xl p-6 relative overflow-hidden"
      style={{ border: '1px solid var(--sol-border)' }}
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
        style={{ background: color, filter: 'blur(30px)', transform: 'translate(30%, -30%)' }}
      />
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-display)', color }}>
        {value}
      </p>
      <p className="font-semibold text-sm mb-1">{label}</p>
      {sub && <p className="text-xs" style={{ color: 'var(--sol-muted)' }}>{sub}</p>}
    </div>
  );
}

function TxRow({ tx }: { tx: TxRecord }) {
  const color = TOKEN_COLORS[tx.token] ?? '#9945FF';
  const timeAgo = (() => {
    const diff = Date.now() - tx.timestamp;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  })();

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01]"
      style={{ background: 'rgba(26,34,53,0.4)', border: '1px solid var(--sol-border)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
        style={{ background: `${color}15`, color, border: `1px solid ${color}30`, fontFamily: 'var(--font-mono)' }}
      >
        {tx.token.slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-semibold text-sm truncate">{tx.label ?? 'Payment'}</p>
          <span
            className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: tx.status === 'confirmed' ? 'rgba(20,241,149,0.12)' : 'rgba(255,196,0,0.12)',
              color: tx.status === 'confirmed' ? '#14F195' : '#FFC400',
              border: `1px solid ${tx.status === 'confirmed' ? 'rgba(20,241,149,0.25)' : 'rgba(255,196,0,0.25)'}`,
            }}
          >
            {tx.status}
          </span>
        </div>
        <p className="text-xs" style={{ color: 'var(--sol-muted)', fontFamily: 'var(--font-mono)' }}>
          {shortenAddress(tx.fromWallet)} · {timeAgo}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-sm" style={{ color }}>
          +{tx.amount} {tx.token}
        </p>
        <p className="text-xs" style={{ color: 'var(--sol-muted)' }}>
          {formatUSD(tx.usdValue)}
        </p>
      </div>
      <a
        href={explorerUrl(tx.signature)}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:opacity-80"
        style={{ background: 'rgba(0,194,255,0.1)', border: '1px solid rgba(0,194,255,0.2)' }}
        title="View on Solscan"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="#00C2FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </a>
    </div>
  );
}

export default function DashboardPage() {
  const [txs, setTxs] = useState<TxRecord[]>([]);
  const [stats, setStats] = useState({ total: 0, today: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [snippet, setSnippet] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      setTxs(data.transactions);
      setStats(data.stats);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === 'all' ? txs : txs.filter((t) => t.token === filter);

  const embedCode = `<SolPayButton
  merchantWallet="YOUR_WALLET_ADDRESS"
  amount={9.99}
  token="USDC"
  label="Buy Now"
/>`;

  const copySnippet = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--sol-bg)' }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-sm font-mono mb-1" style={{ color: 'var(--sol-muted)' }}>MERCHANT DASHBOARD</p>
            <h1 className="text-4xl font-black" style={{ fontFamily: 'var(--font-display)' }}>
              Payment <span className="gradient-text">Overview</span>
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setSnippet(!snippet)}
              className="btn-secondary px-4 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Embed Code
            </button>
            <Link href="/demo" className="btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold">
              Live Demo →
            </Link>
          </div>
        </div>

        {/* Embed snippet */}
        {snippet && (
          <div
            className="mb-8 rounded-2xl overflow-hidden animate-slide-up"
            style={{ border: '1px solid rgba(153,69,255,0.3)' }}
          >
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ background: 'rgba(153,69,255,0.1)', borderBottom: '1px solid rgba(153,69,255,0.2)' }}
            >
              <p className="text-sm font-semibold" style={{ color: '#9945FF' }}>
                Add to any React/Next.js site:
              </p>
              <button
                onClick={copySnippet}
                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: copied ? 'rgba(20,241,149,0.2)' : 'rgba(255,255,255,0.05)',
                  color: copied ? '#14F195' : 'var(--sol-muted)',
                  border: `1px solid ${copied ? 'rgba(20,241,149,0.3)' : 'var(--sol-border)'}`,
                }}
              >
                {copied ? '✓ Copied!' : 'Copy code'}
              </button>
            </div>
            <pre
              className="p-5 text-sm overflow-x-auto"
              style={{ fontFamily: 'var(--font-mono)', color: '#14F195', background: 'rgba(13,18,32,0.8)' }}
            >
              {embedCode}
            </pre>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Revenue"
            value={formatUSD(stats.total)}
            sub="All time"
            color="#14F195"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="#14F195" strokeWidth="2" strokeLinecap="round"/></svg>}
          />
          <StatCard
            label="Today"
            value={formatUSD(stats.today)}
            sub="Last 24 hours"
            color="#9945FF"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 12h18M3 6h18M3 18h18" stroke="#9945FF" strokeWidth="2" strokeLinecap="round"/></svg>}
          />
          <StatCard
            label="Transactions"
            value={String(stats.count)}
            sub="Confirmed"
            color="#00C2FF"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#00C2FF" strokeWidth="2" strokeLinecap="round"/><path d="M22 4L12 14.01l-3-3" stroke="#00C2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          />
          <StatCard
            label="Settlement"
            value="<1 sec"
            sub="vs 3 days (banks)"
            color="#F7931A"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#F7931A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          />
        </div>

        {/* Transactions */}
        <div
          className="glass rounded-3xl overflow-hidden"
          style={{ border: '1px solid var(--sol-border)' }}
        >
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid var(--sol-border)' }}
          >
            <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Recent Transactions
            </h2>
            <div className="flex gap-2">
              {['all', 'SOL', 'USDC', 'BONK'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: filter === f ? 'rgba(153,69,255,0.2)' : 'transparent',
                    color: filter === f ? '#9945FF' : 'var(--sol-muted)',
                    border: `1px solid ${filter === f ? 'rgba(153,69,255,0.4)' : 'transparent'}`,
                  }}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl shimmer" />
              ))
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold mb-1">No transactions yet</p>
                <p className="text-sm" style={{ color: 'var(--sol-muted)' }}>
                  Try the{' '}
                  <Link href="/demo" className="underline" style={{ color: 'var(--sol-purple)' }}>
                    live demo store
                  </Link>{' '}
                  to generate your first payment.
                </p>
              </div>
            ) : (
              filtered.map((tx) => <TxRow key={tx.id} tx={tx} />)
            )}
          </div>

          {filtered.length > 0 && (
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderTop: '1px solid var(--sol-border)' }}
            >
              <p className="text-xs" style={{ color: 'var(--sol-muted)' }}>
                Showing {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs" style={{ color: 'var(--sol-muted)' }}>
                Auto-refreshes every 10s
              </p>
            </div>
          )}
        </div>

        {/* Token breakdown */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {['SOL', 'USDC', 'BONK'].map((tok) => {
            const tokTxs = txs.filter((t) => t.token === tok && t.status === 'confirmed');
            const total = tokTxs.reduce((s, t) => s + t.usdValue, 0);
            const color = TOKEN_COLORS[tok];
            return (
              <div
                key={tok}
                className="glass rounded-2xl p-5"
                style={{ border: '1px solid var(--sol-border)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="token-badge"
                    style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
                  >
                    {tok}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--sol-muted)' }}>
                    {tokTxs.length} tx
                  </span>
                </div>
                <p className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)', color }}>
                  {formatUSD(total)}
                </p>
                <div
                  className="mt-3 h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'var(--sol-border)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: stats.total > 0 ? `${(total / stats.total) * 100}%` : '0%',
                      background: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
