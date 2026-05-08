import type { Metadata } from 'next';
import './globals.css';
import { SolanaWalletProvider } from '@/components/WalletProvider';

export const metadata: Metadata = {
  title: 'SolPay — Stripe for Solana',
  description: 'Accept Solana payments on any website in under 5 minutes. SOL, USDC, and SPL tokens supported.',
  keywords: ['Solana', 'payments', 'crypto', 'checkout', 'USDC', 'web3'],
  openGraph: {
    title: 'SolPay — Stripe for Solana',
    description: 'The fastest way to accept crypto payments on your website.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
