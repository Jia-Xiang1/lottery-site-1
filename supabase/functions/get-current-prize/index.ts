import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get('x-forwarded-for') || '';
  const realIp = req.headers.get('x-real-ip') || '';
  const candidate = forwardedFor.split(',')[0]?.trim() || realIp.trim();
  return candidate || null;
}

async function sha256(input: string) {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ip = getClientIp(req);
    if (!ip) {
      return json({ status: 'none' });
    }

    const ipHash = await sha256(ip);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: latestRecord, error } = await supabase
      .from('lottery_records')
      .select('*')
      .eq('ip_hash', ipHash)
      .order('draw_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return json({ error: error.message }, 500);
    }

    if (!latestRecord) {
      return json({ status: 'none' });
    }

    const now = Date.now();
    const expiresAtMs = latestRecord.view_expires_at
      ? new Date(latestRecord.view_expires_at).getTime()
      : new Date(latestRecord.draw_time).getTime() + 2 * 60 * 60 * 1000;

    if (now <= expiresAtMs) {
      return json({
        status: 'active',
        record: latestRecord,
        expiresAt: new Date(expiresAtMs).toISOString(),
      });
    }

    return json({
      status: 'expired',
      record: latestRecord,
      expiredAt: new Date(expiresAtMs).toISOString(),
    });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
});