export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  color: string;
  mintAddress?: string; // undefined = native SOL
}

export const TOKENS: Token[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    color: '#9945FF',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    color: '#2775CA',
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    decimals: 5,
    color: '#F7931A',
    mintAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  },
];

export function getToken(symbol: string): Token {
  return TOKENS.find((t) => t.symbol === symbol) ?? TOKENS[0];
}
