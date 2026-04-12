export type PrizeItem = {
  id: string;
  name: string;
  emoji: string;
  probability: number;
  category_name?: string;
  product_name?: string;
  remark?: string;
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

const STORAGE_KEY = 'lottery_prizes';
const CURRENT_PRIZE_KEY = 'lottery_current_prize';

const defaultPrizes: PrizeItem[] = [
  {
    id: crypto.randomUUID(),
    name: '飲料或甜點',
    emoji: '🍮',
    probability: 30,
    category_name: '甜點',
    product_name: '',
    remark: '可兌換指定飲料或甜點一份，實際品項依店內公告為主',
  },
  {
    id: crypto.randomUUID(),
    name: '特色小菜',
    emoji: '🥗',
    probability: 22,
    category_name: '特色小菜',
    product_name: '',
    remark: '可兌換指定特色小菜一份',
  },
  {
    id: crypto.randomUUID(),
    name: '現金折$20元',
    emoji: '💴',
    probability: 16,
    category_name: '現金卷',
    product_name: '',
    remark: '限下次消費使用，不得折現',
  },
  {
    id: crypto.randomUUID(),
    name: '現金折$50元',
    emoji: '💰',
    probability: 10,
    category_name: '現金卷',
    product_name: '',
    remark: '限下次消費使用，不得折現',
  },
  {
    id: crypto.randomUUID(),
    name: '現金折$100元',
    emoji: '🎁',
    probability: 2.8,
    category_name: '現金卷',
    product_name: '',
    remark: '限下次消費使用，不得折現',
  },
  {
    id: crypto.randomUUID(),
    name: '單點主菜',
    emoji: '🍱',
    probability: 10,
    category_name: '單點主菜',
    product_name: '',
    remark: '可兌換指定單點主菜一份',
  },
  {
    id: crypto.randomUUID(),
    name: '豪華升級',
    emoji: '✨',
    probability: 9,
    category_name: '升級類',
    product_name: '',
    remark: '可升級套餐內容一次，依店內規則為準',
  },
  {
    id: crypto.randomUUID(),
    name: '下一碗免費',
    emoji: '🏆',
    probability: 0.2,
    category_name: '特獎類',
    product_name: '',
    remark: '限兌換指定餐點，詳細規則請洽店員',
  },
];

export function getPrizeList(): PrizeItem[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPrizes));
    return defaultPrizes;
  }

  try {
    const parsed = JSON.parse(raw) as PrizeItem[];
    return parsed.map((item) => ({
      ...item,
      remark: item.remark || '',
    }));
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPrizes));
    return defaultPrizes;
  }
}

export function savePrizeList(prizes: PrizeItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prizes));
}

export function createPrizeItem(): PrizeItem {
  return {
    id: crypto.randomUUID(),
    name: '新獎項',
    emoji: '🎉',
    probability: 0,
    category_name: '',
    product_name: '',
    remark: '',
  };
}

export function updatePrizeItem(id: string, patch: Partial<PrizeItem>) {
  const prizes = getPrizeList();
  const next = prizes.map((item) => (item.id === id ? { ...item, ...patch } : item));
  savePrizeList(next);
  return next;
}

export function deletePrizeItem(id: string) {
  const prizes = getPrizeList();
  const next = prizes.filter((item) => item.id !== id);
  savePrizeList(next);
  return next;
}

function pickPrize(prizes: PrizeItem[]) {
  const total = prizes.reduce((sum, item) => sum + Number(item.probability || 0), 0);
  if (total <= 0) throw new Error('目前沒有可抽獎項，請先到後台設定機率');

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

  const prizes = getPrizeList();
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
  if (!raw) return { status: 'none' };

  const parsed = JSON.parse(raw);
  const expiresAtMs = new Date(parsed.expiresAt).getTime();
  const now = Date.now();

  if (expiresAtMs <= now) {
    return {
      status: 'expired',
      expiresAt: parsed.expiresAt,
      record: parsed.record,
    };
  }

  return {
    status: 'active',
    expiresAt: parsed.expiresAt,
    record: parsed.record,
    prize: parsed.prize,
  };
}