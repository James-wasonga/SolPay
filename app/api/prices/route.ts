import { NextRequest, NextResponse } from 'next/server';
import { getTokenPriceUSD } from '@/lib/prices';

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol') ?? 'SOL';
  const price = await getTokenPriceUSD(symbol);
  return NextResponse.json({ symbol, price });
}
