import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaytmWebhookEvent {
  ORDERID: string;
  MID: string;
  TXNID: string;
  TXNAMOUNT: string;
  PAYMENTMODE: string;
  CURRENCY: string;
  TXNDATE: string;
  STATUS: string;
  RESPCODE: string;
  RESPMSG: string;
  GATEWAYNAME: string;
  BANKTXNID: string;
  CHECKSUMHASH: string;
}

async function verifyPaytmChecksum(
  params: Record<string, string>,
  checksumHash: string,
  merchantKey: string
): Promise<boolean> {
  // Paytm uses checksums for verification
  // In production, use Paytm's official checksum library
  // For now, basic verification
  try {
    const encoder = new TextEncoder();
    const paramStr = Object.keys(params)
      .filter(k => k !== 'CHECKSUMHASH')
      .sort()
      .map(k => `${k}=${params[k]}`)
      .join('|');
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(merchantKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(paramStr));
    const computedHash = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));

    return computedHash === checksumHash;
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const upiProvider = Deno.env.get('UPI_PROVIDER') || 'paytm';
    const merchantKey = Deno.env.get('UPI_PROVIDER_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const params: PaytmWebhookEvent = JSON.parse(body);
    
    console.log('Paytm webhook received:', params.ORDERID);

    // Verify Paytm checksum
    const checksumHash = params.CHECKSUMHASH;
    const isValid = await verifyPaytmChecksum(params as any, checksumHash, merchantKey);
    
    if (!isValid) {
      console.error('Invalid Paytm checksum');
      return new Response(
        JSON.stringify({ error: 'Invalid checksum' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract user ID from order ID (format: user_{userId}_{timestamp})
    const orderIdParts = params.ORDERID.split('_');
    const userId = orderIdParts[1];

    if (!userId) {
      console.error('No user_id in order ID');
      return new Response(
        JSON.stringify({ error: 'Missing user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if payment is successful
    if (params.STATUS === 'TXN_SUCCESS' && params.RESPCODE === '01') {
      // Create payment record
      await supabase.from('payments').insert({
        user_id: userId,
        provider: 'upi_paytm',
        provider_payment_id: params.TXNID,
        amount: parseFloat(params.TXNAMOUNT),
        currency: params.CURRENCY,
        status: 'completed',
        metadata: {
          orderId: params.ORDERID,
          bankTxnId: params.BANKTXNID,
          paymentMode: params.PAYMENTMODE,
          gateway: params.GATEWAYNAME,
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

      console.log('Paytm payment completed for user:', userId);
    } else {
      console.log('Payment failed or pending:', params.STATUS);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('UPI webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
