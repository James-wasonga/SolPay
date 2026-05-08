import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';

export const NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as 'devnet' | 'mainnet-beta') || 'devnet';

export const RPC_URL =
  process.env.NEXT_PUBLIC_HELIUS_RPC_URL || clusterApiUrl(NETWORK);

export const connection = new Connection(RPC_URL, 'confirmed');

export const MERCHANT_WALLET =
  process.env.NEXT_PUBLIC_MERCHANT_WALLET || '11111111111111111111111111111111';

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

export async function buildTransferTx(
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  lamports: number
): Promise<Transaction> {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  const tx = new Transaction({
    recentBlockhash: blockhash,
    feePayer: fromPubkey,
    // lastValidBlockHeight,
  });
  tx.add(
    SystemProgram.transfer({ fromPubkey, toPubkey, lamports })
  );
  return tx;
}
