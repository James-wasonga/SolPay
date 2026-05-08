'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Transaction, PublicKey } from '@solana/web3.js';
import { connection, explorerUrl, shortenAddress } from '@/lib/solana';
import { getToken } from '@/lib/tokens';
import { QRCodeSVG } from 'qrcode.react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  token?: string;
  merchantWallet: string;
  label?: string;
  description?: string;
  onSuccess?: (signature: string) => void;
}

type Status = 'idle' | 'connecting' | 'pending' | 'signing' | 'confirming' | 'success' | 'error';

const STATUS_MESSAGES: Record<Status, string> = {
  idle: 'Ready to pay',
  connecting: 'Connecting wallet…',
  pending: 'Preparing transaction…',
  signing: 'Approve in your wallet…',
  confirming: 'Confirming on Solana…',
  success: 'Payment confirmed!',
  error: 'Something went wrong',
};

export function CheckoutModal({
  isOpen,
  onClose,
  amount,
  token = 'SOL',
  merchantWallet,
  label = 'Payment',
  description,
  onSuccess,
}: CheckoutModalProps) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [status, setStatus] = useState<Status>('idle');
  const [signature, setSignature] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [usdPrice, setUsdPrice] = useState<number>(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const confettiRef = useRef<(() => void) | null>(null);
  const tokenInfo = getToken(token);

  // Load confetti dynamically
  useEffect(() => {
    import('canvas-confetti').then((mod) => {
      confettiRef.current = () =>
        mod.default({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#9945FF', '#14F195', '#00C2FF', '#ffffff'],
        });
    });
  }, []);

  // Fetch USD price
  useEffect(() => {
    if (!isOpen) return;
    fetch(`/api/prices?symbol=${token}`)
      .then((r) => r.json())
      .then((d) => setUsdPrice(d.price ?? 0))
      .catch(() => {});
  }, [isOpen, token]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const reset = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setStatus('idle');
    setSignature('');
    setErrorMsg('');
    setShowQR(false);
  }, []);

  const handleClose = useCallback(() => {
    if (status === 'confirming' || status === 'signing') return;
    reset();
    onClose();
  }, [status, reset, onClose]);

  const handlePay = useCallback(async () => {
    if (!connected || !publicKey) {
      setVisible(true);
      return;
    }
    setStatus('pending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerWallet: publicKey.toString(),
          merchantWallet,
          amount,
          token,
        }),
      });
      if (!res.ok) throw new Error('Failed to build transaction');
      const { transaction } = await res.json();
      const tx = Transaction.from(Buffer.from(transaction, 'base64'));

      setStatus('signing');
      const sig = await sendTransaction(tx, connection);
      setSignature(sig);
      setStatus('confirming');

      // Poll for confirmation
      pollingRef.current = setInterval(async () => {
        try {
          const verifyRes = await fetch('/api/verify-transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ signature: sig }),
          });
          const { confirmed } = await verifyRes.json();
          if (confirmed) {
            clearInterval(pollingRef.current!);
            setStatus('success');
            confettiRef.current?.();
            onSuccess?.(sig);
          }
        } catch {}
      }, 2000);

      // Timeout after 90 seconds
      setTimeout(() => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          setStatus('error');
          setErrorMsg('Transaction confirmation timed out. Check Solana Explorer.');
        }
      }, 90000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('rejected') || msg.includes('cancelled')) {
        setStatus('idle');
      } else {
        setStatus('error');
        setErrorMsg(msg);
      }
    }
  }, [connected, publicKey, merchantWallet, amount, token, sendTransaction, onSuccess, setVisible]);

  if (!isOpen) return null;

  const usdValue = usdPrice > 0 ? (amount * usdPrice).toFixed(2) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,12,20,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="w-full max-w-md glass rounded-3xl overflow-hidden animate-slide-up"
        style={{ border: '1px solid rgba(153,69,255,0.3)' }}
      >
        {/* Header */}
        <div
          className="p-6 pb-5"
          style={{
            background: 'linear-gradient(135deg, rgba(153,69,255,0.15), rgba(20,241,149,0.08))',
            borderBottom: '1px solid rgba(153,69,255,0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #9945FF, #14F195)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-mono" style={{ color: 'var(--sol-muted)' }}>SolPay Checkout</p>
                <p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-display)' }}>{label}</p>
              </div>
            </div>
            {status !== 'confirming' && status !== 'signing' && (
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="var(--sol-muted)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>

          {/* Amount */}
          <div className="text-center py-2">
            <div className="flex items-baseline justify-center gap-2">
              <span
                className="text-5xl font-black"
                style={{ fontFamily: 'var(--font-display)', color: tokenInfo.color }}
              >
                {amount}
              </span>
              <span className="text-2xl font-bold" style={{ color: tokenInfo.color, opacity: 0.7 }}>
                {token}
              </span>
            </div>
            {usdValue && (
              <p className="text-sm mt-1" style={{ color: 'var(--sol-muted)' }}>
                ≈ ${usdValue} USD
              </p>
            )}
            {description && (
              <p className="text-sm mt-2" style={{ color: 'var(--sol-muted)' }}>{description}</p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Tabs: wallet / QR */}
          {status === 'idle' && (
            <div
              className="flex rounded-xl p-1 mb-5"
              style={{ background: 'rgba(26,34,53,0.5)' }}
            >
              {['Wallet', 'QR Code'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setShowQR(tab === 'QR Code')}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: (tab === 'QR Code') === showQR ? 'rgba(153,69,255,0.2)' : 'transparent',
                    color: (tab === 'QR Code') === showQR ? '#9945FF' : 'var(--sol-muted)',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* QR Mode */}
          {showQR && status === 'idle' && (
            <div className="flex flex-col items-center gap-4">
              <div
                className="p-4 rounded-2xl"
                style={{ background: 'white' }}
              >
                <QRCodeSVG
                  value={`solana:${merchantWallet}?amount=${amount}&spl-token=&label=${encodeURIComponent(label)}&message=${encodeURIComponent('Payment via SolPay')}&memo=${encodeURIComponent(label)}`}
                  size={200}
                  bgColor="white"
                  fgColor="#080C14"
                  level="Q"
                />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">Scan with Phantom mobile</p>
                <p className="text-xs" style={{ color: 'var(--sol-muted)' }}>Open Phantom → tap the scan icon → point at QR</p>
                <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: 'var(--sol-blue)' }}>Get Phantom mobile →</a>
              </div>
            </div>
          )}

          {/* Wallet pay mode */}
          {!showQR && status === 'idle' && (
            <div className="space-y-4">
              <div
                className="rounded-xl p-4 flex items-center justify-between"
                style={{ background: 'rgba(26,34,53,0.5)', border: '1px solid var(--sol-border)' }}
              >
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--sol-muted)' }}>Paying to</p>
                  <p className="font-mono text-sm">{shortenAddress(merchantWallet)}</p>
                </div>
                <div
                  className="token-badge"
                  style={{ background: `${tokenInfo.color}20`, color: tokenInfo.color, border: `1px solid ${tokenInfo.color}40` }}
                >
                  {token}
                </div>
              </div>

              {connected && publicKey ? (
                <div
                  className="rounded-xl p-3 flex items-center gap-3"
                  style={{ background: 'rgba(20,241,149,0.08)', border: '1px solid rgba(20,241,149,0.2)' }}
                >
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs" style={{ color: '#14F195' }}>
                    Connected: {shortenAddress(publicKey.toString())}
                  </p>
                </div>
              ) : (
                <div
                  className="rounded-xl p-3 flex items-center gap-3"
                  style={{ background: 'rgba(255,196,0,0.08)', border: '1px solid rgba(255,196,0,0.2)' }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: '#FFC400' }} />
                  <p className="text-xs" style={{ color: '#FFC400' }}>No wallet connected</p>
                </div>
              )}
            </div>
          )}

          {/* Processing states */}
          {(status === 'pending' || status === 'signing' || status === 'confirming') && (
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="relative w-20 h-20">
                <div
                  className="absolute inset-0 rounded-full border-2 animate-spin"
                  style={{
                    borderColor: `${tokenInfo.color} transparent transparent transparent`,
                    animationDuration: '1s',
                  }}
                />
                <div
                  className="absolute inset-3 rounded-full flex items-center justify-center"
                  style={{ background: `${tokenInfo.color}20` }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" fill={tokenInfo.color} opacity="0.8"/>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke={tokenInfo.color} strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  {STATUS_MESSAGES[status]}
                </p>
                {status === 'signing' && (
                  <p className="text-xs" style={{ color: 'var(--sol-muted)' }}>
                    Check your Phantom wallet
                  </p>
                )}
                {status === 'confirming' && signature && (
                  <a
                    href={explorerUrl(signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline mt-1 block"
                    style={{ color: 'var(--sol-blue)' }}
                  >
                    View on Solscan ↗
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(20,241,149,0.15)', border: '2px solid #14F195' }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#14F195" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-center">
                <p
                  className="text-xl font-bold mb-1"
                  style={{ fontFamily: 'var(--font-display)', color: '#14F195' }}
                >
                  Payment Confirmed!
                </p>
                <p className="text-sm mb-3" style={{ color: 'var(--sol-muted)' }}>
                  {amount} {token} sent successfully
                </p>
                {signature && (
                  <a
                    href={explorerUrl(signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(0,194,255,0.1)', color: 'var(--sol-blue)', border: '1px solid rgba(0,194,255,0.2)' }}
                  >
                    View transaction ↗
                  </a>
                )}
              </div>
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl text-sm font-semibold btn-secondary"
              >
                Close
              </button>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,77,77,0.15)', border: '2px solid #FF4D4D' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#FF4D4D" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="font-semibold mb-1" style={{ color: '#FF4D4D' }}>Transaction Failed</p>
                {errorMsg && <p className="text-xs" style={{ color: 'var(--sol-muted)' }}>{errorMsg}</p>}
              </div>
              <button onClick={reset} className="w-full py-3 rounded-xl text-sm font-semibold btn-primary">
                Try Again
              </button>
            </div>
          )}

          {/* CTA button */}
          {status === 'idle' && (
            <button
              onClick={handlePay}
              className="w-full py-4 rounded-xl text-base font-bold btn-primary mt-5"
              style={{ borderRadius: '14px' }}
            >
              {connected ? `Pay ${amount} ${token}` : 'Connect Wallet to Pay'}
            </button>
          )}

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="var(--sol-muted)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p className="text-xs" style={{ color: 'var(--sol-muted)' }}>
              Secured by Solana blockchain
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
