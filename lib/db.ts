import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[SolPay] Supabase env vars missing — using in-memory fallback for dev.');
}

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export interface TxRecord {
  id?:         string;
  signature:   string;
  amount:      number;
  token:       string;
  usd_value:   number;
  from_wallet: string;
  to_wallet:   string;
  status:      'confirmed' | 'pending' | 'failed';
  label?:      string;
  order_id?:   string | null;
  created_at?: string;
}

// Fallback in-memory store used only when Supabase is not configured
const DEV_STORE: TxRecord[] = [
  {
    id: '1',
    signature:   '5xV9kJME8qP3nRtYwZA2cFbDhLsK7GmNvXuEoTyPiQr',
    amount:      0.5,   token: 'SOL',  usd_value: 92.5,
    from_wallet: 'Gh9ZwEMAKcou3zyRpLhX8ADPzqmePMCom4Xkz3j9KmF',
    to_wallet:   'YourWalletHere', status: 'confirmed', label: 'Premium plan',
    created_at:  new Date(Date.now() - 5 * 60_000).toISOString(),
  },
  {
    id: '2',
    signature:   '3aB7mNpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz',
    amount:      10, token: 'USDC', usd_value: 10.0,
    from_wallet: '4kFmRnDpQr8StUvWxYzAbCdEfGhIjKlMnOpQrStUvW',
    to_wallet:   'YourWalletHere', status: 'confirmed', label: 'Digital art NFT',
    created_at:  new Date(Date.now() - 32 * 60_000).toISOString(),
  },
];

export async function insertTx(tx: TxRecord): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('transactions').insert({
      signature:   tx.signature,
      amount:      tx.amount,
      token:       tx.token,
      usd_value:   tx.usd_value,
      from_wallet: tx.from_wallet,
      to_wallet:   tx.to_wallet,
      status:      tx.status,
      label:       tx.label ?? null,
      order_id:    tx.order_id ?? null,
    });
    if (error) console.error('[DB] insertTx error:', error.message);
  } else {
    DEV_STORE.unshift({
      ...tx,
      id:         tx.signature.slice(0, 16),
      created_at: new Date().toISOString(),
    });
  }
}

export async function getAllTx(): Promise<TxRecord[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) { console.error('[DB] getAllTx error:', error.message); return []; }
    return data ?? [];
  }
  return [...DEV_STORE];
}

export async function getTotalRevenue(): Promise<number> {
  if (supabase) {
    const { data, error } = await supabase
      .from('transactions')
      .select('usd_value')
      .eq('status', 'confirmed');
    if (error) { console.error('[DB] getTotalRevenue error:', error.message); return 0; }
    return (data ?? []).reduce(
      (s: number, r: { usd_value: number }) => s + (r.usd_value ?? 0), 0
    );
  }
  return DEV_STORE
    .filter(t => t.status === 'confirmed')
    .reduce((s, t) => s + t.usd_value, 0);
}

export async function getTodayRevenue(): Promise<number> {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (supabase) {
    const { data, error } = await supabase
      .from('transactions')
      .select('usd_value')
      .eq('status', 'confirmed')
      .gte('created_at', today.toISOString());
    if (error) { console.error('[DB] getTodayRevenue error:', error.message); return 0; }
    return (data ?? []).reduce(
      (s: number, r: { usd_value: number }) => s + (r.usd_value ?? 0), 0
    );
  }
  return DEV_STORE
    .filter(t => t.status === 'confirmed' &&
      new Date(t.created_at!).getTime() >= today.getTime())
    .reduce((s, t) => s + t.usd_value, 0);
}