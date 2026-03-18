import { PRIZES, type Prize } from '../mocks/prizes';
import { supabase } from '../lib/supabaseClient';

export interface LotteryRecord {
  code: string;
  prizeId: string;
  prizeName: string;
  prizeEmoji: string;
  drawTime: string;
  redeemTime?: string;
}

export function drawPrize(): Prize {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const prize of PRIZES) {
    cumulative += prize.probability;
    if (rand <= cumulative) return prize;
  }
  return PRIZES[PRIZES.length - 1];
}

export function generateCode(): string {
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

export async function saveRecord(record: LotteryRecord): Promise<void> {
  await supabase.from('lottery_records').insert({
    code: record.code,
    prize_id: record.prizeId,
    prize_name: record.prizeName,
    prize_emoji: record.prizeEmoji,
    draw_time: record.drawTime,
    redeem_time: record.redeemTime ?? null,
  });
}

export async function getAllRecords(): Promise<LotteryRecord[]> {
  const { data, error } = await supabase
    .from('lottery_records')
    .select('*')
    .order('draw_time', { ascending: false });
  if (error || !data) return [];
  return data.map(row => ({
    code: row.code,
    prizeId: row.prize_id,
    prizeName: row.prize_name,
    prizeEmoji: row.prize_emoji,
    drawTime: row.draw_time,
    redeemTime: row.redeem_time ?? undefined,
  }));
}

export async function findRecord(code: string): Promise<LotteryRecord | null> {
  const { data, error } = await supabase
    .from('lottery_records')
    .select('*')
    .eq('code', code)
    .maybeSingle();
  if (error || !data) return null;
  return {
    code: data.code,
    prizeId: data.prize_id,
    prizeName: data.prize_name,
    prizeEmoji: data.prize_emoji,
    drawTime: data.draw_time,
    redeemTime: data.redeem_time ?? undefined,
  };
}

export async function redeemRecord(code: string): Promise<boolean> {
  const existing = await findRecord(code);
  if (!existing || existing.redeemTime) return false;
  const { error } = await supabase
    .from('lottery_records')
    .update({ redeem_time: new Date().toISOString() })
    .eq('code', code);
  return !error;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
