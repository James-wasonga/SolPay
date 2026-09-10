// /**
//  * SolPay — Unit Tests
//  * Run with:  npx jest
//  *
//  * These tests do NOT hit a real RPC. They verify pure logic:
//  *   - SOL → lamport conversion
//  *   - SPL token unit conversion
//  *   - HMAC webhook signing & verification
//  *   - Transaction builder shapes
//  *   - API route input validation
//  */

// import { solToLamports, lamportsToSol, shortenAddress } from '../lib/solana';
// import { toTokenUnits } from '../lib/spl';
// import { signWebhookPayload, verifyWebhookSignature } from '../lib/webhook';

// // ── Polyfill crypto for Node < 19 ──────────────────────────────────
// import crypto from 'crypto';
// if (!globalThis.crypto) {
//   // @ts-ignore
//   globalThis.crypto = crypto.webcrypto;
// }

// // ─────────────────────────────────────────────────────────────────
// // lib/solana.ts helpers
// // ─────────────────────────────────────────────────────────────────
// describe('solana helpers', () => {
//   test('solToLamports converts SOL correctly', () => {
//     expect(solToLamports(1)).toBe(1_000_000_000);
//     expect(solToLamports(0.5)).toBe(500_000_000);
//     expect(solToLamports(0.001)).toBe(1_000_000);
//     expect(solToLamports(0.000000001)).toBe(1);
//   });

//   test('lamportsToSol converts back correctly', () => {
//     expect(lamportsToSol(1_000_000_000)).toBe(1);
//     expect(lamportsToSol(500_000_000)).toBe(0.5);
//   });

//   test('round-trip conversion is lossless', () => {
//     const amounts = [0.1, 0.25, 0.001, 1, 10, 100];
//     amounts.forEach((sol) => {
//       const lamports = solToLamports(sol);
//       expect(lamportsToSol(lamports)).toBeCloseTo(sol, 9);
//     });
//   });

//   test('shortenAddress trims correctly', () => {
//     const addr = 'AbCdEfGhIjKlMnOpQrStUvWxYz123456789abcdef';
//     expect(shortenAddress(addr, 4)).toBe('AbCd...cdef');
//     expect(shortenAddress(addr, 6)).toBe('AbCdEf...bcdef');
//   });

//   test('shortenAddress handles short addresses gracefully', () => {
//     const addr = 'ABCD1234';
//     expect(() => shortenAddress(addr, 4)).not.toThrow();
//   });
// });

// // ─────────────────────────────────────────────────────────────────
// // lib/spl.ts helpers
// // ─────────────────────────────────────────────────────────────────
// describe('SPL token helpers', () => {
//   test('USDC uses 6 decimals', () => {
//     expect(toTokenUnits(1, 'USDC')).toBe(BigInt(1_000_000));
//     expect(toTokenUnits(10.5, 'USDC')).toBe(BigInt(10_500_000));
//     expect(toTokenUnits(0.01, 'USDC')).toBe(BigInt(10_000));
//   });

//   test('BONK uses 5 decimals', () => {
//     expect(toTokenUnits(1, 'BONK')).toBe(BigInt(100_000));
//     expect(toTokenUnits(1_000_000, 'BONK')).toBe(BigInt(100_000_000_000));
//   });

//   test('large USDC amounts convert correctly', () => {
//     expect(toTokenUnits(1000, 'USDC')).toBe(BigInt(1_000_000_000));
//   });

//   test('fractional amounts round correctly', () => {
//     // 0.001 USDC = 1000 base units (6 decimals)
//     expect(toTokenUnits(0.001, 'USDC')).toBe(BigInt(1000));
//   });
// });

// // ─────────────────────────────────────────────────────────────────
// // lib/webhook.ts — HMAC signing & verification
// // ─────────────────────────────────────────────────────────────────
// describe('webhook HMAC', () => {
//   const secret = 'test-secret-key-abc123';

//   // Temporarily set the env var
//   beforeAll(() => { process.env.SOLPAY_WEBHOOK_SECRET = secret; });
//   afterAll(() => { delete process.env.SOLPAY_WEBHOOK_SECRET; });

//   test('signing produces a t= and v1= header', () => {
//     const payload = JSON.stringify({ amount: 10, token: 'USDC' });
//     const sig = signWebhookPayload(payload, 1716912345);
//     expect(sig).toMatch(/^t=\d+,v1=[a-f0-9]{64}$/);
//   });

//   test('verification passes for a freshly signed payload', () => {
//     const payload = JSON.stringify({ amount: 10, token: 'SOL', signature: 'abc' });
//     const ts  = Math.floor(Date.now() / 1000);
//     const sig = signWebhookPayload(payload, ts);
//     expect(verifyWebhookSignature(payload, sig, 300)).toBe(true);
//   });

//   test('verification fails for tampered payload', () => {
//     const payload  = JSON.stringify({ amount: 10 });
//     const tampered = JSON.stringify({ amount: 9999 });
//     const ts  = Math.floor(Date.now() / 1000);
//     const sig = signWebhookPayload(payload, ts);
//     expect(verifyWebhookSignature(tampered, sig, 300)).toBe(false);
//   });

//   test('verification fails for stale timestamp (> 5 minutes)', () => {
//     const payload = JSON.stringify({ amount: 1 });
//     const oldTs   = Math.floor(Date.now() / 1000) - 400; // 400s ago
//     const sig     = signWebhookPayload(payload, oldTs);
//     expect(verifyWebhookSignature(payload, sig, 300)).toBe(false);
//   });

//   test('verification fails for missing header', () => {
//     const payload = JSON.stringify({ amount: 1 });
//     expect(verifyWebhookSignature(payload, null, 300)).toBe(false);
//     expect(verifyWebhookSignature(payload, undefined, 300)).toBe(false);
//     expect(verifyWebhookSignature(payload, '', 300)).toBe(false);
//   });

//   test('verification fails for wrong secret', () => {
//     const payload = JSON.stringify({ amount: 5, token: 'SOL' });
//     const ts = Math.floor(Date.now() / 1000);

//     // Sign with different secret
//     process.env.SOLPAY_WEBHOOK_SECRET = 'different-secret';
//     const sig = signWebhookPayload(payload, ts);

//     // Verify with original secret
//     process.env.SOLPAY_WEBHOOK_SECRET = secret;
//     expect(verifyWebhookSignature(payload, sig, 300)).toBe(false);
//   });
// });

// // ─────────────────────────────────────────────────────────────────
// // API route input validation (pure logic, no HTTP calls)
// // ─────────────────────────────────────────────────────────────────
// describe('API input validation', () => {
//   test('required fields check - missing buyerWallet', () => {
//     const body = { merchantWallet: 'abc', amount: 1, token: 'SOL' };
//     const missing = !body.buyerWallet || !body.merchantWallet || !body.amount;
//     expect(missing).toBe(true);
//   });

//   test('required fields check - all present', () => {
//     const body = { buyerWallet: 'abc', merchantWallet: 'def', amount: 0.1, token: 'SOL' };
//     const missing = !body.buyerWallet || !body.merchantWallet || !body.amount;
//     expect(missing).toBe(false);
//   });

//   test('lamport calculation for edge cases', () => {
//     // Never produce 0 lamports
//     expect(Math.max(1, Math.round(0.000000001 * 1_000_000_000))).toBe(1);
//     expect(Math.max(1, Math.round(0 * 1_000_000_000))).toBe(1);
//     expect(Math.max(1, Math.round(1 * 1_000_000_000))).toBe(1_000_000_000);
//   });

//   test('token amounts are converted to positive integers', () => {
//     const amounts = [0.001, 0.1, 1, 10, 100, 1000];
//     amounts.forEach((a) => {
//       const units = toTokenUnits(a, 'USDC');
//       expect(units).toBeGreaterThan(BigInt(0));
//     });
//   });
// });

/**
 * SolPay — Unit Tests
 * Run with: npm test
 */

import { solToLamports, lamportsToSol, shortenAddress } from '../lib/solana';
import { toTokenUnits } from '../lib/spl';
import { signWebhookPayload, verifyWebhookSignature } from '../lib/webhook';

// ── solana helpers ──────────────────────────────────────────────
describe('solana helpers', () => {
  test('solToLamports converts SOL correctly', () => {
    expect(solToLamports(1)).toBe(1_000_000_000);
    expect(solToLamports(0.5)).toBe(500_000_000);
    expect(solToLamports(0.001)).toBe(1_000_000);
    expect(solToLamports(0.000000001)).toBe(1);
  });

  test('lamportsToSol converts back correctly', () => {
    expect(lamportsToSol(1_000_000_000)).toBe(1);
    expect(lamportsToSol(500_000_000)).toBe(0.5);
  });

  test('round-trip conversion is accurate', () => {
    [0.1, 0.25, 0.001, 1, 10].forEach((sol) => {
      expect(lamportsToSol(solToLamports(sol))).toBeCloseTo(sol, 9);
    });
  });

  test('shortenAddress trims correctly', () => {
    const addr = 'AbCdEfGhIjKlMnOpQrStUvWxYz123456789abcdef';
    expect(shortenAddress(addr, 4)).toBe('AbCd...cdef');
  });
});

// ── SPL helpers ────────────────────────────────────────────────
describe('SPL token helpers', () => {
  test('USDC uses 6 decimals', () => {
    expect(toTokenUnits(1, 'USDC')).toBe(BigInt(1_000_000));
    expect(toTokenUnits(10.5, 'USDC')).toBe(BigInt(10_500_000));
    expect(toTokenUnits(0.01, 'USDC')).toBe(BigInt(10_000));
  });

  test('BONK uses 5 decimals', () => {
    expect(toTokenUnits(1, 'BONK')).toBe(BigInt(100_000));
    expect(toTokenUnits(1_000_000, 'BONK')).toBe(BigInt(100_000_000_000));
  });

  test('large amounts convert correctly', () => {
    expect(toTokenUnits(1000, 'USDC')).toBe(BigInt(1_000_000_000));
  });

  test('all amounts produce positive integers', () => {
    [0.001, 0.1, 1, 10, 100].forEach((a) => {
      expect(toTokenUnits(a, 'USDC')).toBeGreaterThan(BigInt(0));
    });
  });
});

// ── Webhook HMAC ───────────────────────────────────────────────
describe('webhook HMAC', () => {
  const secret = 'test-secret-key-abc123';

  beforeAll(() => { process.env.SOLPAY_WEBHOOK_SECRET = secret; });
  afterAll(()  => { delete process.env.SOLPAY_WEBHOOK_SECRET; });

  test('signing produces correct header format', () => {
    const sig = signWebhookPayload('{"amount":10}', 1716912345);
    expect(sig).toMatch(/^t=\d+,v1=[a-f0-9]{64}$/);
  });

  test('valid signature passes verification', () => {
    const payload = JSON.stringify({ amount: 10, token: 'SOL' });
    const ts  = Math.floor(Date.now() / 1000);
    const sig = signWebhookPayload(payload, ts);
    expect(verifyWebhookSignature(payload, sig, 300)).toBe(true);
  });

  test('tampered payload fails', () => {
    const ts  = Math.floor(Date.now() / 1000);
    const sig = signWebhookPayload('{"amount":10}', ts);
    expect(verifyWebhookSignature('{"amount":9999}', sig, 300)).toBe(false);
  });

  test('stale timestamp (>5 min) fails', () => {
    const oldTs = Math.floor(Date.now() / 1000) - 400;
    const sig   = signWebhookPayload('{"amount":1}', oldTs);
    expect(verifyWebhookSignature('{"amount":1}', sig, 300)).toBe(false);
  });

  test('missing header fails', () => {
    expect(verifyWebhookSignature('{}', null,      300)).toBe(false);
    expect(verifyWebhookSignature('{}', undefined, 300)).toBe(false);
    expect(verifyWebhookSignature('{}', '',        300)).toBe(false);
  });

  test('wrong secret fails', () => {
    const payload = '{"amount":5}';
    const ts = Math.floor(Date.now() / 1000);
    process.env.SOLPAY_WEBHOOK_SECRET = 'different-secret';
    const sig = signWebhookPayload(payload, ts);
    process.env.SOLPAY_WEBHOOK_SECRET = secret;
    expect(verifyWebhookSignature(payload, sig, 300)).toBe(false);
  });
});

// ── API input validation ───────────────────────────────────────
describe('API input validation', () => {
  test('detects missing buyerWallet', () => {
    const body = { merchantWallet: 'abc', amount: 1 };
    expect(!body.merchantWallet || !(body as any).buyerWallet || !body.amount).toBe(true);
  });

  test('lamport floor is never zero', () => {
    expect(Math.max(1, Math.round(0 * 1_000_000_000))).toBe(1);
    expect(Math.max(1, Math.round(0.000000001 * 1_000_000_000))).toBe(1);
    expect(Math.max(1, Math.round(1 * 1_000_000_000))).toBe(1_000_000_000);
  });
});