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

function buildPrizeName(categoryName: string, productName: string) {
  return `${categoryName} ${productName}`.trim();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ip = getClientIp(req);
    if (!ip) {
      return json({ error: '無法取得 IP' }, 400);
    }

    const ipHash = await sha256(ip);
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: existingRecord, error: existingError } = await supabase
      .from('lottery_records')
      .select('*')
      .eq('ip_hash', ipHash)
      .gte('draw_time', twoHoursAgo)
      .order('draw_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) {
      return json({ error: existingError.message }, 500);
    }

    if (existingRecord) {
      return json({
        ok: false,
        locked: true,
        message: '2 小時內無法重複抽取',
        record: existingRecord,
        expiresAt: existingRecord.view_expires_at,
      });
    }

    const { data: prizes, error: prizesError } = await supabase
      .from('prizes')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (prizesError) {
      return json({ error: prizesError.message }, 500);
    }

    if (!prizes || prizes.length === 0) {
      return json({ error: '沒有可用獎項' }, 400);
    }

    const total = prizes.reduce((sum, p) => sum + Number(p.weight), 0);
    if (total <= 0) {
      return json({ error: '機率總和不可為 0' }, 400);
    }

    const random = Math.random() * 100;
    let cumulative = 0;
    let picked = prizes[prizes.length - 1];

    for (const p of prizes) {
      cumulative += Number(p.weight);
      if (random <= cumulative) {
        picked = p;
        break;
      }
    }

    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    const prizeName = buildPrizeName(picked.category_name ?? '', picked.product_name ?? '');

    const insertPayload = {
      code,
      prize_id: picked.id,
      prize_name: prizeName,
      prize_emoji: picked.emoji,
      draw_time: now.toISOString(),
      ip_hash: ipHash,
      view_expires_at: expiresAt,
    };

    const { data: inserted, error: insertError } = await supabase
      .from('lottery_records')
      .insert(insertPayload)
      .select('*')
      .single();

    if (insertError) {
      return json({ error: insertError.message }, 500);
    }

    return json({
      ok: true,
      locked: false,
      record: inserted,
      expiresAt,
      prize: {
        id: picked.id,
        name: prizeName,
        category_name: picked.category_name,
        product_name: picked.product_name,
        emoji: picked.emoji,
        probability: Number(picked.weight),
      },
    });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
});