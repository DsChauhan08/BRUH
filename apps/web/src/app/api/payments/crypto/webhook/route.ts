import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await request.text();
    const signature = request.headers.get('x-nowpayments-sig');
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

    // Verify signature
    if (ipnSecret && signature) {
      const hmac = createHmac('sha512', ipnSecret);
      hmac.update(body);
      const expectedSig = hmac.digest('hex');

      if (signature !== expectedSig) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    console.log('Crypto webhook event:', event);

    // Handle payment confirmation
    if (event.payment_status === 'finished' || event.payment_status === 'confirmed') {
      const orderId = event.order_id; // Format: bruh_userId_timestamp
      const userId = orderId.split('_')[1];

      if (!userId) {
        console.error('Invalid order_id format');
        return NextResponse.json({ error: 'Invalid order' }, { status: 400 });
      }

      // Create payment record
      await supabase.from('payments').insert({
        user_id: userId,
        provider: 'crypto_nowpayments',
        provider_payment_id: event.payment_id || event.invoice_id,
        amount: parseFloat(event.price_amount),
        currency: event.price_currency || 'USD',
        status: 'completed',
        metadata: {
          pay_currency: event.pay_currency,
          pay_amount: event.pay_amount,
          txn_id: event.outcome?.transaction_hash,
        },
      });

      // Update user subscription
      await supabase
        .from('users')
        .update({
          is_paid: true,
          subscription_tier: 'basic',
          subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', userId);

      console.log('Crypto payment confirmed for user:', userId);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Crypto webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
