const SUPABASE_REST_URL =
  "https://uhclrilrpbibgdedjlrg.supabase.co/rest/v1";

const SUPABASE_FUNCTIONS_URL =
  "https://uhclrilrpbibgdedjlrg.supabase.co/functions/v1";

const SUPABASE_ANON_KEY = "sb_publishable_60gSAw07rLwRY6G7nk2QvQ_nnY35AGL";

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
  created_at?: string;
};

export type DrawPrizeResponse =
  | {
      ok: true;
      locked: false;
      record: {
        id?: string;
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
        prize_id: string;
        prize_name: string;
        prize_emoji: string;
        draw_time: string;
        view_expires_at: string;
      };
      expiredAt: string;
    };

function authHeaders(extra?: Record<string, string>) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...extra,
  };
}

function normalizePrize(row: any): PrizeItem {
  return {
    ...row,
    category_name: row.category_name ?? "",
    product_name: row.product_name ?? "",
    emoji: row.emoji ?? "🎁",
    weight: Number(row.weight ?? 0),
    is_active: Boolean(row.is_active),
    sort_order: Number(row.sort_order ?? 0),
    note: row.note ?? "",
  };
}

export async function getAllPrizes(includeInactive = true): Promise<PrizeItem[]> {
  const query = includeInactive
    ? "select=*&order=sort_order.asc"
    : "select=*&is_active=eq.true&order=sort_order.asc";

  const res = await fetch(`${SUPABASE_REST_URL}/prizes?${query}`, {
    headers: authHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || "讀取獎項失敗");
  }

  return (data ?? []).map(normalizePrize);
}

export async function addPrize(input: {
  category_name: string;
  product_name: string;
  emoji: string;
  weight: number;
  sort_order?: number;
  note?: string;
}) {
  const payload = {
    name: `${input.category_name} ${input.product_name}`.trim(),
    category_name: input.category_name,
    product_name: input.product_name,
    emoji: input.emoji || "🎁",
    weight: Number(input.weight || 0),
    sort_order: Number(input.sort_order ?? 0),
    is_active: true,
    note: input.note ?? "",
  };

  const res = await fetch(`${SUPABASE_REST_URL}/prizes`, {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }),
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || data?.error || "新增品項失敗");
  }

  return Array.isArray(data) ? data[0] : data;
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

  if (payload.category_name !== undefined || payload.product_name !== undefined) {
    const currentRes = await fetch(
      `${SUPABASE_REST_URL}/prizes?id=eq.${id}&select=category_name,product_name`,
      {
        headers: authHeaders(),
      }
    );

    const currentData = await currentRes.json();
    if (!currentRes.ok) {
      throw new Error(currentData?.message || currentData?.error || "讀取原始資料失敗");
    }

    const current = Array.isArray(currentData) ? currentData[0] : currentData;

    const finalCategory =
      typeof payload.category_name === "string"
        ? payload.category_name
        : current?.category_name ?? "";

    const finalProduct =
      typeof payload.product_name === "string"
        ? payload.product_name
        : current?.product_name ?? "";

    payload.name = `${finalCategory} ${finalProduct}`.trim();
    payload.category_name = finalCategory;
    payload.product_name = finalProduct;
  }

  const res = await fetch(`${SUPABASE_REST_URL}/prizes?id=eq.${id}`, {
    method: "PATCH",
    headers: authHeaders({
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }),
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || data?.error || "更新失敗");
  }

  return Array.isArray(data) ? data[0] : data;
}

export async function deletePrize(id: string) {
  const res = await fetch(`${SUPABASE_REST_URL}/prizes?id=eq.${id}`, {
    method: "DELETE",
    headers: authHeaders({
      Prefer: "return=minimal",
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || data?.error || "刪除失敗");
  }

  return true;
}

export async function drawPrizeSecure(): Promise<DrawPrizeResponse> {
  const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/draw-lottery`, {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({}),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || data?.message || "抽獎失敗");
  }

  return data as DrawPrizeResponse;
}

export async function getCurrentPrize(): Promise<CurrentPrizeResponse> {
  const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/get-current-prize`, {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({}),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || data?.message || "讀取目前獎項失敗");
  }

  return data as CurrentPrizeResponse;
}