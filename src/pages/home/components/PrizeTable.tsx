import { useEffect, useState } from 'react';
import { getAllPrizes, type PrizeItem } from '../../../utils/lotteryUtils';

export default function PrizeTable() {
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const data = await getAllPrizes(false);
        setPrizes(data);
      } catch (e) {
        console.error('PrizeTable error =', e);
      } finally {
        setLoading(false);
      }
    };

    fetchPrizes();
  }, []);

  if (loading) {
    return (
      <div
        className="rounded-2xl overflow-hidden bg-white"
        style={{ border: '1.5px solid #C9341A20' }}
      >
        <div className="px-4 py-4 text-sm text-[#2D1500]/50 text-center">
          載入中...
        </div>
      </div>
    );
  }

  if (!prizes.length) {
    return (
      <div
        className="rounded-2xl overflow-hidden bg-white"
        style={{ border: '1.5px solid #C9341A20' }}
      >
        <div className="px-4 py-4 text-sm text-[#2D1500]/50 text-center">
          目前沒有可顯示的獎項
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden bg-white"
      style={{ border: '1.5px solid #C9341A20' }}
    >
      <div
        className="grid items-center px-4 py-3 text-xs font-bold tracking-wider"
        style={{
          background: '#FFF5F0',
          color: '#C9341A',
          gridTemplateColumns: '48px minmax(0,1fr) 76px',
        }}
      >
        <div className="text-left">圖示</div>
        <div className="text-center">獎項</div>
        <div className="text-right">機率</div>
      </div>

      {prizes.map((item) => (
        <div
          key={item.id}
          className="grid items-center px-4 py-3"
          style={{
            borderTop: '1px solid #C9341A10',
            gridTemplateColumns: '48px minmax(0,1fr) 76px',
          }}
        >
          <div className="text-2xl leading-none">{item.emoji}</div>

          <div className="text-center text-[#2D1500] leading-[1.25]">
            <div className="text-[12px] sm:text-[13px] text-[#C9341A]/75">
              {item.category_name}
            </div>
            <div className="text-[14px] sm:text-[15px] font-medium">
              {item.product_name}
            </div>
          </div>

          <div
            className="text-right font-bold text-[#C9341A] whitespace-nowrap"
            style={{ fontSize: '15px' }}
          >
            {Number(item.weight).toFixed(1)}%
          </div>
        </div>
      ))}
    </div>
  );
}