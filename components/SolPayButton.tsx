'use client';

import { useState } from 'react';
import { CheckoutModal } from './CheckoutModal';
import { getToken } from '@/lib/tokens';

interface SolPayButtonProps {
  amount: number;
  token?: string;
  merchantWallet: string;
  label?: string;
  description?: string;
  onSuccess?: (signature: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SolPayButton({
  amount,
  token = 'SOL',
  merchantWallet,
  label = 'Pay with SOL',
  description,
  onSuccess,
  className = '',
  size = 'md',
}: SolPayButtonProps) {
  const [open, setOpen] = useState(false);
  const tokenInfo = getToken(token);

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 font-bold btn-primary ${sizes[size]} ${className}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>{label}</span>
        <span
          className="text-xs px-2 py-0.5 rounded-lg font-mono"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        >
          {amount} {token}
        </span>
      </button>

      <CheckoutModal
        isOpen={open}
        onClose={() => setOpen(false)}
        amount={amount}
        token={token}
        merchantWallet={merchantWallet}
        label={label}
        description={description}
        onSuccess={(sig) => {
          setOpen(false);
          onSuccess?.(sig);
        }}
      />
    </>
  );
}
