import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.SOLPAY_WEBHOOK_SECRET ?? '';

/**
 * Sign a webhook payload with HMAC-SHA256.
 * Format: t=<timestamp>,v1=<hex-signature>  (same as Stripe)
 */
export function signWebhookPayload(
  payload: string,
  timestamp: number = Math.floor(Date.now() / 1000)
): string {
  if (!WEBHOOK_SECRET) {
    console.warn('[Webhook] SOLPAY_WEBHOOK_SECRET not set');
    return `t=${timestamp},v1=unsigned`;
  }
  const signed = `${timestamp}.${payload}`;
  const hex = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(signed, 'utf8')
    .digest('hex');
  return `t=${timestamp},v1=${hex}`;
}

/**
 * Verify a webhook from SolPay in your own merchant backend.
 * Returns true only if signature is valid AND timestamp is within 5 minutes.
 */
export function verifyWebhookSignature(
  rawBody: string,
  header: string | null | undefined,
  toleranceSeconds = 300
): boolean {
  if (!WEBHOOK_SECRET || !header) return false;

  const parts = Object.fromEntries(
    header.split(',').map((part) => part.split('=') as [string, string])
  );
  const timestamp   = parseInt(parts['t'] ?? '0', 10);
  const receivedSig = parts['v1'] ?? '';

  if (!timestamp || !receivedSig) return false;

  const age = Math.floor(Date.now() / 1000) - timestamp;
  if (Math.abs(age) > toleranceSeconds) return false;

  const signed   = `${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(signed, 'utf8')
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedSig, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false; // mismatched buffer lengths = invalid sig
  }
}