-- SolPay — Supabase Schema
-- Paste into: Supabase Dashboard → SQL Editor → Run

create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  signature   text not null unique,
  amount      numeric(20, 9) not null,
  token       text not null check (token in ('SOL', 'USDC', 'BONK')),
  usd_value   numeric(20, 4) not null default 0,
  from_wallet text not null,
  to_wallet   text not null,
  status      text not null check (status in ('confirmed', 'pending', 'failed')) default 'pending',
  label       text,
  order_id    text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_transactions_status     on public.transactions (status);
create index if not exists idx_transactions_created_at on public.transactions (created_at desc);
create index if not exists idx_transactions_token      on public.transactions (token);

create table if not exists public.merchants (
  id           uuid primary key default gen_random_uuid(),
  owner_wallet text not null unique,
  treasury     text not null,
  name         text not null,
  fee_bps      integer not null default 0 check (fee_bps between 0 and 1000),
  program_pda  text,
  created_at   timestamptz not null default now()
);

alter table public.transactions enable row level security;
alter table public.merchants    enable row level security;

create policy "service role full access - transactions"
  on public.transactions for all using (auth.role() = 'service_role');

create policy "service role full access - merchants"
  on public.merchants for all using (auth.role() = 'service_role');

create or replace view public.revenue_summary as
select
  coalesce(sum(usd_value) filter (where status = 'confirmed'), 0) as total_usd,
  coalesce(sum(usd_value) filter (where status = 'confirmed'
    and created_at >= now() - interval '24h'), 0)                 as today_usd,
  count(*) filter (where status = 'confirmed')                    as confirmed_count,
  coalesce(sum(usd_value) filter (where status = 'confirmed'
    and token = 'SOL'),  0)                                       as sol_usd,
  coalesce(sum(usd_value) filter (where status = 'confirmed'
    and token = 'USDC'), 0)                                       as usdc_usd,
  coalesce(sum(usd_value) filter (where status = 'confirmed'
    and token = 'BONK'), 0)                                       as bonk_usd
from public.transactions;