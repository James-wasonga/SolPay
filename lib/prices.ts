const COINGECKO_IDS: Record<string, string> = {
  SOL: 'solana',
  USDC: 'usd-coin',
  BONK: 'bonk',
};

export async function getTokenPriceUSD(symbol: string): Promise<number> {
  try {
    const id = COINGECKO_IDS[symbol];
    if (!id) return 1;
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return 0;
    const data = await res.json();
    return data[id]?.usd ?? 0;
  } catch {
    return 0;
  }
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
