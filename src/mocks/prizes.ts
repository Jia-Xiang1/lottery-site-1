export type Prize = {
  id: string;
  name: string;
  emoji: string;
  probability: number;
};

export const PRIZES: Prize[] = [
  {
    id: 'free-bowl',
    name: '下一碗免費',
    emoji: '🍚',
    probability: 0.2,
  },
  {
    id: 'luxury-upgrade',
    name: '豪華升級',
    emoji: '✨',
    probability: 9,
  },
  {
    id: 'main-dish',
    name: '單點主菜',
    emoji: '🍖',
    probability: 10,
  },
  {
    id: 'cash-100',
    name: '現金折$100元',
    emoji: '💵',
    probability: 2.8,
  },
  {
    id: 'cash-50',
    name: '現金折$50元',
    emoji: '💴',
    probability: 10,
  },
  {
    id: 'cash-20',
    name: '現金折$20元',
    emoji: '💰',
    probability: 16,
  },
  {
    id: 'side-dish',
    name: '特色小菜',
    emoji: '🥗',
    probability: 22,
  },
  {
    id: 'drink-dessert',
    name: '飲料或甜點',
    emoji: '🥤',
    probability: 30,
  },
];

export const prizes = PRIZES;
export default PRIZES;