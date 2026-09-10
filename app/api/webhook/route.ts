import { NextRequest, NextResponse } from 'next/server';
import { signWebhookPayload } from '@/lib/webhook';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const body    = JSON.stringify(payload);
    const ts      = Math.floor(Date.now() / 1000);
    const sig     = signWebhookPayload(body, ts);

    console.log('[SolPay Webhook] Payment confirmed:', {
      signature: payload.signature,
      amount:    payload.amount,
      token:     payload.token,
      label:     payload.label,
    });

    const webhookUrl = process.env.MERCHANT_WEBHOOK_URL;
    if (webhookUrl) {
      const res = await fetch(webhookUrl, {
        method:  'POST',
        headers: {
          'Content-Type':       'application/json',
          'x-solpay-signature': sig,
          'x-solpay-timestamp': String(ts),
        },
        body,
      });
      if (!res.ok) {
        console.error('[Webhook] Delivery failed:', res.status);
      }
    }

    return NextResponse.json({ received: true, timestamp: ts });
  } catch (err) {
    console.error('[webhook]', err);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}