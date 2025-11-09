import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendMessageRequest {
  recipientUsername: string;
  contentCiphertext: string;
  contentNonce: string;
  senderPublicKey: string;
  deviceFingerprint: Record<string, any>;
  clientIP?: string;
}

async function hashData(data: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hashDeviceFingerprint(fingerprint: Record<string, any>): string {
  const fingerprintString = JSON.stringify(fingerprint, Object.keys(fingerprint).sort());
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprintString);
  
  // Create a simple hash (in production, use crypto.subtle)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data[i];
    hash = hash & hash;
  }
  return hash.toString(16);
}

async function checkModeration(ciphertext: string): Promise<{ score: number; shouldQuarantine: boolean; reason?: string }> {
  // Since content is encrypted, we can only do basic length checks
  // Real moderation happens after recipient decrypts (optional flow)
  
  // Check length (prevent spam)
  if (ciphertext.length > 10000) {
    return { score: 0.9, shouldQuarantine: true, reason: 'Message too long' };
  }
  
  // Placeholder for AI moderation hook (would analyze patterns, not content)
  return { score: 0.1, shouldQuarantine: false };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const rateLimitSalt = Deno.env.get('RATE_LIMIT_SALT') || 'default-salt-change-me';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: SendMessageRequest = await req.json();
    const {
      recipientUsername,
      contentCiphertext,
      contentNonce,
      senderPublicKey,
      deviceFingerprint,
    } = body;

    // Validate required fields
    if (!recipientUsername || !contentCiphertext || !contentNonce || !senderPublicKey || !deviceFingerprint) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get recipient user
    const { data: recipient, error: recipientError } = await supabase
      .from('users')
      .select('id, username, is_paid, message_count_received, public_key')
      .eq('username', recipientUsername)
      .single();

    if (recipientError || !recipient) {
      return new Response(
        JSON.stringify({ error: 'Recipient not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if recipient can receive more messages (free tier limit)
    if (!recipient.is_paid && recipient.message_count_received >= 50) {
      return new Response(
        JSON.stringify({ error: 'Recipient has reached their free tier message limit' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash device fingerprint and IP
    const deviceHash = hashDeviceFingerprint(deviceFingerprint);
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const ipHash = await hashData(clientIP, rateLimitSalt);

    // Check rate limit: 3 messages per device per recipient per hour
    const rateLimitKey = `${deviceHash}:${recipient.id}`;
    const { data: rateLimitResult } = await supabase.rpc('check_and_increment_rate_limit', {
      p_identifier: rateLimitKey,
      p_resource: 'message_send',
      p_limit: 3,
      p_window_seconds: 3600,
    });

    if (rateLimitResult === false) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Maximum 3 messages per hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check sender limit (free senders: 2 messages total across all recipients)
    // This requires tracking sender identity - use device hash as identifier
    const { data: senderMessages, error: senderCheckError } = await supabase
      .from('anonymous_messages')
      .select('id')
      .eq('sender_device_hash', deviceHash);

    if (!senderCheckError && senderMessages && senderMessages.length >= 2) {
      // Check if this sender has paid (would need a sender account system)
      // For MVP, enforce free sender limit strictly
      return new Response(
        JSON.stringify({ error: 'Free sender limit reached. Maximum 2 messages total.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Run moderation checks
    const moderation = await checkModeration(contentCiphertext);

    // Insert message
    const { data: message, error: insertError } = await supabase
      .from('anonymous_messages')
      .insert({
        recipient_user_id: recipient.id,
        content_ciphertext: contentCiphertext,
        content_nonce: contentNonce,
        sender_public_key: senderPublicKey,
        sender_device_hash: deviceHash,
        sender_ip_hash: ipHash,
        sender_device_details: {
          userAgent: deviceFingerprint.userAgent || 'unknown',
          platform: deviceFingerprint.platform || 'unknown',
          language: deviceFingerprint.language || 'unknown',
        },
        moderated: moderation.shouldQuarantine,
        moderation_score: moderation.score,
        status: moderation.shouldQuarantine ? 'quarantined' : 'visible',
        moderation_reason: moderation.reason,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to send message' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment recipient message count
    await supabase.rpc('increment_message_count', { p_user_id: recipient.id });

    // TODO: Trigger push notification to recipient

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: message.id,
        status: message.status,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
