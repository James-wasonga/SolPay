import { NextRequest, NextResponse } from 'next/server';
import { connection } from '@/lib/solana';
import { addTx } from '@/lib/transactions';
import { getTokenPriceUSD } from '@/lib/prices';

export async function POST(req: NextRequest) {
  try {
    const { signature, amount, token, fromWallet, toWallet, label } = await req.json();

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const result = await connection.getSignatureStatuses([signature], {
      searchTransactionHistory: true,
    });

    const status = result.value[0];

    if (!status) {
      return NextResponse.json({ confirmed: false, status: 'not_found' });
    }

    if (status.err) {
      return NextResponse.json({ confirmed: false, status: 'failed', error: status.err });
    }

    const confirmationStatus = status.confirmationStatus;
    const confirmed = confirmationStatus === 'confirmed' || confirmationStatus === 'finalized';

    // Record to our in-memory store when confirmed
    if (confirmed && amount && fromWallet) {
      const price = await getTokenPriceUSD(token ?? 'SOL');
      addTx({
        id: signature.slice(0, 16),
        signature,
        amount: parseFloat(amount),
        token: token ?? 'SOL',
        usdValue: parseFloat(amount) * price,
        fromWallet: fromWallet ?? 'unknown',
        toWallet: toWallet ?? 'unknown',
        status: 'confirmed',
        timestamp: Date.now(),
        label: label ?? 'Payment',
      });
    }

    return NextResponse.json({ confirmed, status: confirmationStatus });
  } catch (err) {
    console.error('verify-transaction error:', err);
    return NextResponse.json({ confirmed: false, status: 'error' }, { status: 500 });
  }
}
