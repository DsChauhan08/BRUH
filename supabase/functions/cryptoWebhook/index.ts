import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CryptoWebhookEvent {
  payment_status: string;
  order_id: string;
  payment_id?: string;
  invoice_id?: string;
  price_amount: string;
  price_currency: string;
  pay_currency?: string;
  pay_amount?: string;
  outcome?: {
    transaction_hash?: string;
  };
}

async function verifyNOWPaymentsSignature(
  signature: string,
  body: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );

  const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const computedSignature = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return computedSignature === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ipnSecret = Deno.env.get('NOWPAYMENTS_IPN_SECRET');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const signature = req.headers.get('x-nowpayments-sig') || '';

    // Verify signature if secret is set
    if (ipnSecret && signature) {
      const isValid = await verifyNOWPaymentsSignature(signature, body, ipnSecret);
      if (!isValid) {
        console.error('Invalid NOWPayments webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const event: CryptoWebhookEvent = JSON.parse(body);
    console.log('Crypto webhook event:', event.payment_status);

    // Handle payment confirmation
    if (event.payment_status === 'finished' || event.payment_status === 'confirmed') {
      const orderId = event.order_id; // Format: bruh_userId_timestamp
      const userId = orderId.split('_')[1];

      if (!userId) {
        console.error('Invalid order_id format:', orderId);
        return new Response(
          JSON.stringify({ error: 'Invalid order' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
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

      // Update user subscription status
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

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
  event_type: string;
  resource: {
    id: string;
    subscriber?: {
      email_address: string;
      payer_id: string;
    };
    billing_agreement_id?: string;
    amount?: {
      total: string;
      currency: string;
    };
    status?: string;
  };
}

async function verifyPayPalWebhook(
  webhookId: string,
  headers: Headers,
  body: string
): Promise<boolean> {
  const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID')!;
  const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')!;
  const paypalApiBase = Deno.env.get('PAYPAL_API_BASE') || 'https://api-m.sandbox.paypal.com';

  // Get OAuth token
  const authResponse = await fetch(`${paypalApiBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const authData = await authResponse.json();
  const accessToken = authData.access_token;

  // Verify webhook signature
  const verifyResponse = await fetch(`${paypalApiBase}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      transmission_id: headers.get('paypal-transmission-id'),
      transmission_time: headers.get('paypal-transmission-time'),
      cert_url: headers.get('paypal-cert-url'),
      auth_algo: headers.get('paypal-auth-algo'),
      transmission_sig: headers.get('paypal-transmission-sig'),
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }),
  });

  const verifyData = await verifyResponse.json();
  return verifyData.verification_status === 'SUCCESS';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const event: PayPalWebhookEvent = JSON.parse(body);

    // Verify webhook signature
    const isValid = await verifyPayPalWebhook(webhookId, req.headers, body);
    if (!isValid) {
      console.error('Invalid PayPal webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('PayPal webhook event:', event.event_type);

    // Handle different event types
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.UPDATED':
      case 'PAYMENT.SALE.COMPLETED': {
        const subscriberEmail = event.resource.subscriber?.email_address;
        const subscriptionId = event.resource.billing_agreement_id || event.resource.id;

        if (!subscriberEmail) {
          console.error('No subscriber email in webhook');
          break;
        }

        // Find user by email
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', subscriberEmail)
          .single();

        if (userError || !user) {
          console.error('User not found for email:', subscriberEmail);
          break;
        }

        // Create payment record
        const amount = parseFloat(event.resource.amount?.total || '0');
        await supabase.from('payments').insert({
          user_id: user.id,
          provider: 'paypal',
          provider_payment_id: event.resource.id,
          provider_subscription_id: subscriptionId,
          amount: amount,
          currency: event.resource.amount?.currency || 'USD',
          status: 'completed',
          metadata: { event_type: event.event_type },
        });

        // Update user subscription status
        await supabase
          .from('users')
          .update({
            is_paid: true,
            subscription_tier: 'basic', // Could be determined by plan ID
            subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('id', user.id);

        console.log('Subscription activated for user:', user.id);
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const subscriberEmail = event.resource.subscriber?.email_address;

        if (!subscriberEmail) break;

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('email', subscriberEmail)
          .single();

        if (user) {
          await supabase
            .from('users')
            .update({
              is_paid: false,
              subscription_tier: 'free',
            })
            .eq('id', user.id);

          console.log('Subscription cancelled for user:', user.id);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.event_type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
