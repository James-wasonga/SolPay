import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';

export const NETWORK =
  (process.env.NEXT_PUBLIC_SOLANA_NETWORK as 'devnet' | 'mainnet-beta') ||
  'devnet';

export const RPC_URL =
  process.env.NEXT_PUBLIC_HELIUS_RPC_URL || clusterApiUrl(NETWORK);

export const connection = new Connection(RPC_URL, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60_000,
});

export const MERCHANT_WALLET =
  process.env.NEXT_PUBLIC_MERCHANT_WALLET ||
  '11111111111111111111111111111111';

// ── ID of the deployed Anchor program (update after anchor deploy) ──
export const SOLPAY_PROGRAM_ID =
  process.env.NEXT_PUBLIC_SOLPAY_PROGRAM_ID ||
  'SoLPayXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

export function solToLamports(sol: number): number {
  return Math.round(sol * LAMPORTS_PER_SOL);
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function explorerUrl(signature: string): string {
  const cluster = NETWORK === 'devnet' ? '?cluster=devnet' : '';
  return `https://solscan.io/tx/${signature}${cluster}`;
}

/**
 * Build a native SOL transfer transaction with proper blockhash
 * and lastValidBlockHeight so the TX expires correctly (~90 seconds).
 */
export async function buildTransferTx(
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  lamports: number
): Promise<{ tx: Transaction; lastValidBlockHeight: number }> {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('confirmed');

  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight; // ← fixed: was commented out
  tx.feePayer = fromPubkey;
  tx.add(SystemProgram.transfer({ fromPubkey, toPubkey, lamports }));

  return { tx, lastValidBlockHeight };
}
