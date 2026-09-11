# SolPay — The Stripe for Solana 💜

> Accept SOL, USDC, and SPL token payments on any website in under 5 minutes.
> Built for payments in Solana Ecosystem.

---

## Why SolPay?

Accepting crypto payments shouldn't require every developer to understand wallets, transactions, token accounts, RPC infrastructure, confirmation handling, and payment UX.

SolPay provides the building blocks for accepting Solana payments through a familiar checkout experience.

Developers can integrate SolPay into an existing website and let SolPay handle the payment flow while merchants retain control of their funds.

### For developers

- Simple payment component
- Wallet and QR checkout
- SOL and SPL token support
- Transaction confirmation
- USD-denominated pricing
- Easy integration with existing applications

### For merchants

- Accept Solana payments
- Track transaction activity
- View revenue and token breakdowns
- Receive payments directly to a merchant wallet

## ✨ Features

- 🔐 **Secure checkout** — Phantom wallet and QR-code payment support
- ⚡ **Real-time confirmation** — monitor Solana transactions until confirmation
- 🪙 **Multi-token payments** — support SOL, USDC, BONK, and other SPL tokens
- 💱 **USD pricing** — display prices using live market rates
- 📊 **Merchant dashboard** — track transactions, revenue, and token activity
- 📋 **Simple integration** — add a SolPay payment button to an application
- 🌐 **Devnet and Mainnet** — switch networks through configuration
- 🔔 **Payment webhooks** — integrate confirmed payments into your application

---

## 🚀 Quick Setup

### Step 1 — Install dependencies

```bash
cd solpay
npm install
```

### Step 2 — Create your environment file

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in:

```env
NEXT_PUBLIC_HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_MERCHANT_WALLET=YOUR_SOLANA_WALLET_ADDRESS
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

### Step 3 — Get a free Helius RPC key

1. Go to https://helius.dev
2. Click "Get Started Free"
3. Create a project → copy the Devnet RPC URL
4. Paste it in `.env.local`

### Step 4 — Get your Solana wallet address

1. Install Phantom wallet from https://phantom.app
2. Open Phantom → copy your wallet address
3. Paste it as `NEXT_PUBLIC_MERCHANT_WALLET` in `.env.local`

### Step 5 — Run the app

```bash
npm run dev
```

Open http://localhost:3000 🎉

---

## 🧪 Testing with Devnet SOL (Free)

To test actual payments you need free devnet SOL:

1. Open Phantom wallet
2. Switch network to **Devnet** (Settings → Developer Settings → Testnet Mode)
3. Go to https://faucet.solana.com
4. Paste your wallet address → request 2 SOL
5. Now visit http://localhost:3000/demo and try paying!

## 📁 Project Structure

```
solpay/
├── app/
│   ├── layout.tsx                        # Root layout + WalletProvider
│   ├── page.tsx                          # Landing page (hero, stats, code snippet)
│   ├── demo/
│   │   └── page.tsx                      # BrewNairobi demo store (product cards + detail modal)
│   ├── dashboard/
│   │   └── page.tsx                      # Merchant dashboard (revenue, tx history, token breakdown)
│   ├── docs/
│   │   └── page.tsx                      # Full integration documentation portal
│   └── api/
│       ├── create-transaction/
│       │   └── route.ts                  # Builds unsigned SOL + real SPL token transactions
│       ├── verify-transaction/
│       │   └── route.ts                  # Polls Solana confirmation, writes to Supabase
│       ├── transactions/
│       │   └── route.ts                  # Dashboard data from Supabase
│       ├── prices/
│       │   └── route.ts                  # CoinGecko USD price proxy
│       └── webhook/
│           └── route.ts                  # HMAC-SHA256 signed payment webhooks
├── components/
│   ├── CheckoutModal.tsx                 # Full checkout UI (wallet + QR + polling + confetti)
│   ├── SolPayButton.tsx                  # Embeddable payment button component
│   ├── WalletProvider.tsx                # Solana wallet adapter setup
│   └── Navbar.tsx                        # Responsive nav with active link + mobile hamburger menu
├── lib/
│   ├── solana.ts                         # RPC connection, helpers, lastValidBlockHeight fix
│   ├── db.ts                             # Supabase client + typed queries (replaces transactions.ts)
│   ├── spl.ts                            # Real SPL token ATA transfers (USDC, BONK)
│   ├── webhook.ts                        # HMAC-SHA256 signing and verification
│   ├── tokens.ts                         # Token configs (SOL, USDC, BONK)
│   └── prices.ts                         # CoinGecko price fetch + USD formatter
├── programs/
│   └── solpay/
│       ├── src/
│       │   └── lib.rs                    # Anchor program (merchant registry + SOL pay + SPL escrow)
│       ├── tests/
│       │   ├── solpay.ts                 # Anchor integration tests (8 test cases)
│       │   └── tsconfig.json             # Separate TS config for Anchor tests
│       └── Cargo.toml                    # Anchor program dependencies
├── tests/
│   └── transaction.test.ts               # Unit tests (18 cases — tx logic, SPL, HMAC, validation)
├── supabase/
│   └── schema.sql                        # Postgres schema (paste into Supabase SQL editor)
├── Anchor.toml                           # Anchor workspace config + devnet program ID
├── Cargo.toml                            # Rust workspace config
├── jest.config.js                        # Jest config for unit tests
├── rust-toolchain.toml                   # Pins Rust 1.79.0 for Anchor 0.29.0 compatibility
├── tsconfig.json                         # Next.js TS config (excludes programs/ and target/)
├── .vercelignore                         # Tells Vercel to ignore Anchor/Rust files
├── .gitignore                            # Excludes .claude/, AGENTS.md, node_modules, target/
├── .env.example                          # All required environment variables documented
└── README.md
```

## 🌍 Deploy to Vercel (2 minutes)

```bash
npm install -g vercel
vercel
```

When prompted, set your environment variables:
- `NEXT_PUBLIC_HELIUS_RPC_URL`
- `NEXT_PUBLIC_MERCHANT_WALLET`
- `NEXT_PUBLIC_SOLANA_NETWORK`

Or set them in the Vercel dashboard under Project → Settings → Environment Variables.

---

## 🔧 Embed on any site

```tsx
import { SolPayButton } from './components/SolPayButton';

<SolPayButton
  merchantWallet="YourWalletAddress"
  amount={4.99}
  token="USDC"
  label="Buy Premium"
/>
```

---

## 🏆 Demo Script (90 seconds)

1. **Land on homepage** — show the hero and stats
2. **Click "Try Live Demo"** — opens BrewNairobi store
3. **Click "Pay with SolPay"** on Flat White
4. **Show checkout modal** — amount, QR code, wallet option
5. **Approve in Phantom** → live confirmation → confetti 🎉
6. **Switch to Dashboard** — show the transaction appearing
7. **Show embed snippet** — "any site can have this in 30 seconds"

---

## Tech Stack

- **Next.js 14** (App Router)
- **@solana/web3.js** + **@solana/wallet-adapter**
- **@solana/pay** (QR encoding)
- **Helius RPC** (fast Solana access)
- **Tailwind CSS** + custom design system
- **canvas-confetti** (success animation)
- **qrcode.react** (QR generation)

---

Built with 💜 for developers and merchants on Solana.
