import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, plan, currency = 'btc' } = await request.json();

    if (!userId || !plan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const provider = process.env.CRYPTO_PAYMENT_PROVIDER || 'nowpayments';
    const apiKey = process.env.NOWPAYMENTS_API_KEY;

    // Pricing in USD (converted to crypto by provider)
    const planPrices: Record<string, number> = {
      basic: 2.99, // ~₹250
      pro: 9.99,   // ~₹830
    };

    const priceUsd = planPrices[plan] || 2.99;

    if (provider === 'nowpayments') {
      // Create NOWPayments invoice
      const response = await fetch('https://api.nowpayments.io/v1/invoice', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_amount: priceUsd,
          price_currency: 'usd',
          pay_currency: currency, // btc, eth, usdt, etc.
          ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/crypto/webhook`,
          order_id: `bruh_${userId}_${Date.now()}`,
          order_description: `BRUH ${plan} plan subscription`,
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
        }),
      });

      const invoice = await response.json();

      if (!response.ok) {
        throw new Error(invoice.message || 'Failed to create payment');
      }

      return NextResponse.json({
        paymentId: invoice.id,
        paymentUrl: invoice.invoice_url,
        amount: invoice.price_amount,
        currency: invoice.price_currency,
        payCurrency: invoice.pay_currency,
      });
    }

    // Fallback: Manual crypto address
    const walletAddress = process.env.CRYPTO_WALLET_ADDRESS;
    return NextResponse.json({
      paymentId: `manual_${Date.now()}`,
      walletAddress,
      amount: priceUsd,
      currency: 'USD',
      payCurrency: currency,
      manual: true,
    });
  } catch (error: any) {
    console.error('Crypto payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}
