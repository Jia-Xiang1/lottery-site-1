export interface Prize {
  id: string;
  name: string;
  emoji: string;
  probability: number;
  description: string;
  colorFrom: string;
  colorTo: string;
}

export const PRIZES: Prize[] = [
  {
    id: 'drink',
    name: '飲料 or 甜點',
    emoji: '🥤',
    probability: 30,
    description: '可兌換店內飲料乙杯或甜點乙份',
    colorFrom: '#2196F3',
    colorTo: '#00BCD4',
  },
  {
    id: 'veggie',
    name: '特色小菜',
    emoji: '🥗',
    probability: 22,
    description: '可兌換店內特色小菜乙份',
    colorFrom: '#4CAF50',
    colorTo: '#8BC34A',
  },
  {
    id: 'cash20',
    name: '現金折 $20',
    emoji: '💰',
    probability: 16,
    description: '下次消費可折抵現金 $20 元',
    colorFrom: '#FF9800',
    colorTo: '#FFC107',
  },
  {
    id: 'cash50',
    name: '現金折 $50',
    emoji: '💰',
    probability: 10,
    description: '下次消費可折抵現金 $50 元',
    colorFrom: '#FF5722',
    colorTo: '#FF9800',
  },
  {
    id: 'main',
    name: '單點主菜',
    emoji: '🍗',
    probability: 10,
    description: '可免費單點主菜乙份',
    colorFrom: '#795548',
    colorTo: '#A1887F',
  },
  {
    id: 'upgrade',
    name: '豪華升級',
    emoji: '🍤',
    probability: 9,
    description: '本次餐點升級為豪華套餐',
    colorFrom: '#9C27B0',
    colorTo: '#E91E63',
  },
  {
    id: 'cash100',
    name: '現金折 $100',
    emoji: '💰',
    probability: 2.8,
    description: '下次消費可折抵現金 $100 元',
    colorFrom: '#F44336',
    colorTo: '#E91E63',
  },
  {
    id: 'free',
    name: '下一碗免費',
    emoji: '🍚',
    probability: 0.2,
    description: '下次來店享用一碗丼飯完全免費！',
    colorFrom: '#C9A227',
    colorTo: '#FFD700',
  },
];
