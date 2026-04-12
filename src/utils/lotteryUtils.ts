import { supabase } from "../lib/supabase";

export type LotteryRecord = {
  id?: string;
  code?: string;
  prizeId?: string | null;
  prizeName: string;
  prizeEmoji?: string;
  drawTime: string;
  redeemTime?: string | null;
  note?: string;
};

export type PrizeItem = {
  id: string;
  name?: string;
  category_name: string;
  product_name: string;
  emoji: string;
  weight: number;
  is_active: boolean;
  sort_order: number;
  note?: string;
  created_at: string;
  updated_at: string;
};

export type DrawPrizeResponse =
  | {
      ok: true;
      locked: false;
      record: {
        id?: string;
        code?: string;
        prize_id: string;
        prize_name: string;
        prize_emoji: string;
        draw_time: string;
        view_expires_at: string;
      };
      expiresAt: string;
      prize: {
        id: string;
        name: string;
        category_name: string;
        product_name: string;
        emoji: string;
        probability: number;
        note?: string;
      };
    }
  | {
      ok: false;
      locked: true;
      message: string;
      record?: {
        id?: string;
        code?: string;
        prize_id: string;
        prize_name: string;
        prize_emoji: string;
        draw_time: string;
        view_expires_at: string;
      };
      expiresAt?: string;
    };

export type CurrentPrizeResponse =
  | { status: "none" }
  | {
      status: "active";
      record: {
        id?: string;
        code?: string;
        prize_id: string;
        prize_name: string;
        prize_emoji: string;
        draw_time: string;
        view_expires_at: string;
      };
      expiresAt: string;
    }
  | {
      status: "expired";
      record: {
        id?: string;
        code?: string;
        prize_id: string;
        prize_name: string;
        prize_emoji: string;
        draw_time: string;
        view_expires_at: string;
      };
      expiredAt: string;
    };

export async function getAllPrizes(includeInactive = true): Promise<PrizeItem[]> {
  let query = supabase
    .from("prizes")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    ...row,
    category_name: row.category_name ?? "",
    product_name: row.product_name ?? "",
    emoji: row.emoji ?? "🎁",
    weight: Number(row.weight ?? 0),
    sort_order: Number(row.sort_order ?? 0),
    note: row.note ?? "",
  }));
}

export async function addPrize(input: {
  category_name: string;
  product_name: string;
  emoji: string;
  weight: number;
  sort_order?: number;
  note?: string;
}) {
  const name = `${input.category_name} ${input.product_name}`.trim();

  const { data, error } = await supabase
    .from("prizes")
    .insert({
      name,
      category_name: input.category_name,
      product_name: input.product_name,
      emoji: input.emoji,
      weight: Number(input.weight),
      sort_order: Number(input.sort_order ?? 0),
      is_active: true,
      note: input.note ?? "",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updatePrize(
  id: string,
  input: Partial<{
    category_name: string;
    product_name: string;
    emoji: string;
    weight: number;
    is_active: boolean;
    sort_order: number;
    note: string;
  }>
) {
  const payload: Record<string, unknown> = { ...input };

  if (payload.weight !== undefined) payload.weight = Number(payload.weight);
  if (payload.sort_order !== undefined) payload.sort_order = Number(payload.sort_order);

  const categoryName =
    typeof payload.category_name === "string" ? payload.category_name : undefined;
  const productName =
    typeof payload.product_name === "string" ? payload.product_name : undefined;

  if (categoryName !== undefined || productName !== undefined) {
    const { data: current, error: readError } = await supabase
      .from("prizes")
      .select("category_name, product_name")
      .eq("id", id)
      .single();

    if (readError) throw readError;

    const finalCategory = categoryName ?? current.category_name ?? "";
    const finalProduct = productName ?? current.product_name ?? "";

    payload.name = `${finalCategory} ${finalProduct}`.trim();
    payload.category_name = finalCategory;
    payload.product_name = finalProduct;
  }

  const { data, error } = await supabase
    .from("prizes")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deletePrize(id: string) {
  const { error } = await supabase.from("prizes").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function drawPrizeSecure(): Promise<DrawPrizeResponse> {
  const { data, error } = await supabase.functions.invoke("draw-lottery", {
    body: {},
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error("抽獎失敗，未取得結果");

  return data as DrawPrizeResponse;
}

export async function getCurrentPrize(): Promise<CurrentPrizeResponse> {
  const { data, error } = await supabase.functions.invoke("get-current-prize", {
    body: {},
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error("讀取獎項失敗");

  return data as CurrentPrizeResponse;
}