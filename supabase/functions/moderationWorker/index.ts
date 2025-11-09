import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModerationRequest {
  messageId?: string;
  batchSize?: number;
}

async function performModerationCheck(message: any): Promise<{
  shouldQuarantine: boolean;
  score: number;
  reason?: string;
}> {
  // Placeholder: Since content is E2E encrypted, moderation is limited
  // In a real system, you might:
  // 1. Check metadata patterns (sending frequency, device patterns)
  // 2. Allow recipient to decrypt and re-submit for moderation
  // 3. Use ML on encrypted features (message length distribution, timing patterns)

  // For now, return safe defaults
  return {
    shouldQuarantine: false,
    score: 0.1,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ModerationRequest = await req.json();
    const { messageId, batchSize = 100 } = body;

    let messages;

    if (messageId) {
      // Re-moderate specific message
      const { data, error } = await supabase
        .from('anonymous_messages')
        .select('*')
        .eq('id', messageId)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Message not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      messages = [data];
    } else {
      // Batch process unmoderated messages
      const { data, error } = await supabase
        .from('anonymous_messages')
        .select('*')
        .eq('moderated', false)
        .eq('status', 'visible')
        .limit(batchSize);

      if (error) {
        throw error;
      }

      messages = data || [];
    }

    let processed = 0;
    let quarantined = 0;

    for (const message of messages) {
      const result = await performModerationCheck(message);

      await supabase
        .from('anonymous_messages')
        .update({
          moderated: true,
          moderation_score: result.score,
          status: result.shouldQuarantine ? 'quarantined' : 'visible',
          moderation_reason: result.reason,
        })
        .eq('id', message.id);

      processed++;
      if (result.shouldQuarantine) quarantined++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        quarantined,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Moderation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
