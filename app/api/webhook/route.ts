import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('[SolPay Webhook]', JSON.stringify(payload, null, 2));

    const webhookUrl = process.env.MERCHANT_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-solpay-signature': 'solpay-v1' },
        body: JSON.stringify(payload),
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
