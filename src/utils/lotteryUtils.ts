import { supabase } from '../lib/supabase';

export type PrizeItem = {
  id: string;
  name: string;
  emoji: string;
  probability: number;
  category_name?: string;
  product_name?: string;
  remark?: string;
  sort_order?: number;
  is_active?: boolean;
};

export type LotteryRecord = {
  code: string;
  prizeId: string;
  prizeName: string;
  prizeEmoji: string;
  drawTime: string;
};

export type CurrentPrizeResponse =
  | {
      status: 'none';
    }
  | {
      status: 'expired';
      record: LotteryRecord;
      expiresAt: string;
      prize?: PrizeItem;
    }
  | {
      status: 'active';
      record: LotteryRecord;
      expiresAt: string;
      prize?: PrizeItem;
    };

export type DrawPrizeResponse =
  | {
      ok: true;
      prize: PrizeItem;
      record: {
        code: string;
        prize_id: string;
        prize_name: string;
        prize_emoji: string;
        draw_time: string;
      };
      expiresAt: string;
    }
  | {
      ok: false;
      locked: true;
      expiresAt: string;
    };

const CURRENT_PRIZE_KEY = 'lottery_current_prize';
const ADMIN_AUTH_KEY = 'lottery_admin_authed';

export function isAdminAuthed() {
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
}

export function setAdminAuthed() {
  sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
}

export function clearAdminAuthed() {
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
}

export async function getPrizeList(): Promise<PrizeItem[]> {
  const { data, error } = await supabase
    .from('lottery_prizes')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((item) => ({
    id: item.id,
    name: item.name,
    emoji: item.emoji || '🎁',
    probability: Number(item.probability || 0),
    category_name: item.category_name || '',
    product_name: item.product_name || '',
    remark: item.remark || '',
    sort_order: item.sort_order || 0,
    is_active: item.is_active,
  }));
}

export async function createPrizeItem(): Promise<PrizeItem> {
  const prizes = await getPrizeList();
  const maxOrder =
    prizes.length > 0 ? Math.max(...prizes.map((p) => p.sort_order || 0)) : 0;

  const { data, error } = await supabase
    .from('lottery_prizes')
    .insert({
      name: '新獎項',
      emoji: '🎉',
      probability: 0,
      category_name: '',
      product_name: '',
      remark: '',
      sort_order: maxOrder + 1,
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.name,
    emoji: data.emoji,
    probability: Number(data.probability || 0),
    category_name: data.category_name || '',
    product_name: data.product_name || '',
    remark: data.remark || '',
    sort_order: data.sort_order || 0,
    is_active: data.is_active,
  };
}

export async function updatePrizeItem(
  id: string,
  patch: Partial<PrizeItem>,
): Promise<void> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.emoji !== undefined) payload.emoji = patch.emoji;
  if (patch.probability !== undefined) payload.probability = patch.probability;
  if (patch.category_name !== undefined) payload.category_name = patch.category_name;
  if (patch.product_name !== undefined) payload.product_name = patch.product_name;
  if (patch.remark !== undefined) payload.remark = patch.remark;
  if (patch.sort_order !== undefined) payload.sort_order = patch.sort_order;
  if (patch.is_active !== undefined) payload.is_active = patch.is_active;

  const { error } = await supabase
    .from('lottery_prizes')
    .update(payload)
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deletePrizeItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('lottery_prizes')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

function pickPrize(prizes: PrizeItem[]) {
  const total = prizes.reduce((sum, item) => sum + Number(item.probability || 0), 0);

  if (total <= 0) {
    throw new Error('目前沒有可抽獎項，請先到後台設定機率');
  }

  const rand = Math.random() * total;
  let cursor = 0;

  for (const item of prizes) {
    cursor += Number(item.probability || 0);
    if (rand <= cursor) return item;
  }

  return prizes[prizes.length - 1];
}

export async function drawPrizeSecure(): Promise<DrawPrizeResponse> {
  const now = Date.now();
  const currentRaw = localStorage.getItem(CURRENT_PRIZE_KEY);

  if (currentRaw) {
    const current = JSON.parse(currentRaw);
    const expiresAtMs = new Date(current.expiresAt).getTime();

    if (expiresAtMs > now) {
      return {
        ok: false,
        locked: true,
        expiresAt: current.expiresAt,
      };
    }
  }

  const prizes = await getPrizeList();
  const prize = pickPrize(prizes);
  const expiresAt = new Date(now + 2 * 60 * 60 * 1000).toISOString();

  const record = {
    code: `L${Date.now()}`,
    prize_id: prize.id,
    prize_name: prize.name,
    prize_emoji: prize.emoji,
    draw_time: new Date(now).toISOString(),
  };

  localStorage.setItem(
    CURRENT_PRIZE_KEY,
    JSON.stringify({
      status: 'active',
      expiresAt,
      record: {
        code: record.code,
        prizeId: record.prize_id,
        prizeName: record.prize_name,
        prizeEmoji: record.prize_emoji,
        drawTime: record.draw_time,
      },
      prize,
    }),
  );

  return {
    ok: true,
    prize,
    record,
    expiresAt,
  };
}

export async function getCurrentPrize(): Promise<CurrentPrizeResponse> {
  const raw = localStorage.getItem(CURRENT_PRIZE_KEY);

  if (!raw) {
    return { status: 'none' };
  }

  const parsed = JSON.parse(raw);
  const expiresAtMs = new Date(parsed.expiresAt).getTime();
  const now = Date.now();

  if (expiresAtMs <= now) {
    return {
      status: 'expired',
      expiresAt: parsed.expiresAt,
      record: parsed.record,
      prize: parsed.prize,
    };
  }

  return {
    status: 'active',
    expiresAt: parsed.expiresAt,
    record: parsed.record,
    prize: parsed.prize,
  };
}