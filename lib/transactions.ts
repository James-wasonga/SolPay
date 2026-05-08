// In-memory transaction store for demo purposes
// In production, replace with a real database (Supabase, PlanetScale, etc.)

export interface TxRecord {
  id: string;
  signature: string;
  amount: number;
  token: string;
  usdValue: number;
  fromWallet: string;
  toWallet: string;
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: number;
  label?: string;
}

const store: TxRecord[] = [
  {
    id: '1',
    signature: '5xV9kJME8qP3nRtYwZA2cFbDhLsK7GmNvXuEoTyPiQr',
    amount: 0.5,
    token: 'SOL',
    usdValue: 92.5,
    fromWallet: 'Gh9ZwEMAKcou3zyRpLhX8ADPzqmePMCom4Xkz3j9KmF',
    toWallet: 'YourWalletHere',
    status: 'confirmed',
    timestamp: Date.now() - 1000 * 60 * 5,
    label: 'Premium plan',
  },
  {
    id: '2',
    signature: '3aB7mNpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz',
    amount: 10,
    token: 'USDC',
    usdValue: 10.0,
    fromWallet: '4kFmRnDpQr8StUvWxYzAbCdEfGhIjKlMnOpQrStUvW',
    toWallet: 'YourWalletHere',
    status: 'confirmed',
    timestamp: Date.now() - 1000 * 60 * 32,
    label: 'Digital art NFT',
  },
  {
    id: '3',
    signature: '7cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV0wX1yZ2aB3cD',
    amount: 0.1,
    token: 'SOL',
    usdValue: 18.5,
    fromWallet: '9pGhRnDqQr8StUvWxYzAbCdEfGhIjKlMnOpQrStUvW',
    toWallet: 'YourWalletHere',
    status: 'confirmed',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    label: 'Coffee shop order',
  },
  {
    id: '4',
    signature: '2zY1xW0vU9tS8rQ7pO6nM5lK4jI3hG2fE1dC0bA9zY',
    amount: 50000,
    token: 'BONK',
    usdValue: 2.15,
    fromWallet: '7rFmRnDpQr8StUvWxYzAbCdEfGhIjKlMnOpQrStUvW',
    toWallet: 'YourWalletHere',
    status: 'confirmed',
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    label: 'Merch store',
  },
];

export function getAllTx(): TxRecord[] {
  return [...store].sort((a, b) => b.timestamp - a.timestamp);
}

export function addTx(tx: TxRecord): void {
  store.unshift(tx);
}

export function getTotalRevenue(): number {
  return store.filter((t) => t.status === 'confirmed').reduce((s, t) => s + t.usdValue, 0);
}

export function getTodayRevenue(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return store
    .filter((t) => t.status === 'confirmed' && t.timestamp >= today.getTime())
    .reduce((s, t) => s + t.usdValue, 0);
}
