import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, plan } = await request.json();

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

    // Create PayPal subscription
    const paypalClientId = process.env.PAYPAL_CLIENT_ID!;
    const paypalSecret = process.env.PAYPAL_CLIENT_SECRET!;
    const paypalBase = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

    // Get access token
    const authResponse = await fetch(`${paypalBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${paypalClientId}:${paypalSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const { access_token } = await authResponse.json();

    // Create subscription
    const planId = plan === 'pro' ? 'P-XXXXXXXXXXXXX' : 'P-XXXXXXXXXXXXX'; // Configure in PayPal dashboard
    
    const subscriptionResponse = await fetch(`${paypalBase}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        subscriber: {
          email_address: user.email,
        },
        application_context: {
          brand_name: 'BRUH',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
        },
      }),
    });

    const subscription = await subscriptionResponse.json();

    if (!subscriptionResponse.ok) {
      throw new Error(subscription.message || 'Failed to create subscription');
    }

    // Get approval URL
    const approvalUrl = subscription.links.find((link: any) => link.rel === 'approve')?.href;

    return NextResponse.json({
      subscriptionId: subscription.id,
      approvalUrl,
    });
  } catch (error: any) {
    console.error('PayPal subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
