import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  TokenAccountNotFoundError,
} from '@solana/spl-token';

export const MINTS: Record<string, Record<string, string>> = {
  devnet: {
    USDC: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    BONK: 'Gh9ZwEMAKcou3zyRpLhX8ADPzqmePMCom4Xkz3j9KmF',
  },
  'mainnet-beta': {
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  },
};

export const TOKEN_DECIMALS: Record<string, number> = {
  USDC: 6,
  BONK: 5,
};

export function getMintAddress(token: string, network: string): PublicKey {
  const addr = MINTS[network]?.[token];
  if (!addr) throw new Error(`Unknown mint for ${token} on ${network}`);
  return new PublicKey(addr);
}

export function toTokenUnits(amount: number, token: string): bigint {
  const decimals = TOKEN_DECIMALS[token] ?? 6;
  return BigInt(Math.round(amount * 10 ** decimals));
}

/**
 * Build a real SPL token transfer transaction.
 * Auto-creates the recipient's Associated Token Account if it doesn't exist.
 */
export async function buildSplTransferTx(
  connection: Connection,
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  token: string,
  amount: number,
  network: string
): Promise<Transaction> {
  const mint  = getMintAddress(token, network);
  const units = toTokenUnits(amount, token);

  const fromAta = await getAssociatedTokenAddress(mint, fromPubkey);
  const toAta   = await getAssociatedTokenAddress(mint, toPubkey);

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('confirmed');

  const tx = new Transaction();
  tx.recentBlockhash      = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer             = fromPubkey;

  // Create recipient ATA if it doesn't exist yet
  try {
    await getAccount(connection, toAta);
  } catch (e) {
    if (e instanceof TokenAccountNotFoundError) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          fromPubkey, toAta, toPubkey, mint
        )
      );
    } else {
      throw e;
    }
  }

  tx.add(createTransferInstruction(fromAta, toAta, fromPubkey, units));
  return tx;
}