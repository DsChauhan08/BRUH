import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, amount, currency = 'INR' } = await request.json();

    if (!userId || !amount) {
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

    const paytmMid = process.env.UPI_PROVIDER_MID!;
    const paytmKey = process.env.UPI_PROVIDER_KEY!;
    const paytmWebsite = process.env.UPI_PROVIDER_WEBSITE || 'WEBSTAGING';
    const paytmEnv = process.env.PAYTM_ENVIRONMENT || 'staging';
    
    const orderId = `user_${userId}_${Date.now()}`;
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/upi/callback`;

    // Paytm transaction token generation
    const paytmParams = {
      body: {
        requestType: 'Payment',
        mid: paytmMid,
        websiteName: paytmWebsite,
        orderId: orderId,
        callbackUrl: callbackUrl,
        txnAmount: {
          value: amount.toString(),
          currency: currency,
        },
        userInfo: {
          custId: userId,
        },
      },
    };

    const paytmUrl = paytmEnv === 'production'
      ? 'https://securegw.paytm.in/theia/api/v1/initiateTransaction'
      : 'https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction';

    // Generate checksum (simplified - in production use Paytm's SDK)
    const checksum = createHash('sha256')
      .update(JSON.stringify(paytmParams.body) + paytmKey)
      .digest('base64');

    const tokenResponse = await fetch(`${paytmUrl}?mid=${paytmMid}&orderId=${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...paytmParams,
        head: {
          signature: checksum,
        },
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.body.resultInfo.resultStatus !== 'S') {
      throw new Error(tokenData.body.resultInfo.resultMsg || 'Failed to create Paytm order');
    }

    return NextResponse.json({
      orderId: orderId,
      txnToken: tokenData.body.txnToken,
      amount: amount,
      mid: paytmMid,
      paytmUrl: paytmEnv === 'production'
        ? 'https://securegw.paytm.in/theia/api/v1/showPaymentPage'
        : 'https://securegw-stage.paytm.in/theia/api/v1/showPaymentPage',
    });
  } catch (error: any) {
    console.error('Paytm order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
