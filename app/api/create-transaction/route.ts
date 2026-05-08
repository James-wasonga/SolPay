import { NextRequest, NextResponse } from 'next/server';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { connection } from '@/lib/solana';

export async function POST(req: NextRequest) {
  try {
    const { buyerWallet, merchantWallet, amount, token } = await req.json();

    if (!buyerWallet || !merchantWallet || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const buyer = new PublicKey(buyerWallet);
    const merchant = new PublicKey(merchantWallet);

    // Fetch blockhash FIRST, assign properties manually (most reliable approach)
    const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    const lamports = Math.max(1, Math.round(Number(amount) * LAMPORTS_PER_SOL));

    const tx = new Transaction();
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
    tx.feePayer = buyer;
    tx.add(
      SystemProgram.transfer({
        fromPubkey: buyer,
        toPubkey: merchant,
        lamports,
      })
    );

    const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false });

    return NextResponse.json({
      transaction: Buffer.from(serialized).toString('base64'),
      blockhash: latestBlockhash.blockhash,
    });
  } catch (err) {
    console.error('create-transaction error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to build transaction' },
      { status: 500 }
    );
  }
}
