import { useEffect, useState } from 'react';
import { getPrizeList, type PrizeItem } from '../../../utils/lotteryUtils';

export default function PrizeTable() {
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);

  useEffect(() => {
    setPrizes(getPrizeList());
  }, []);

  return (
    <div
      className="rounded-2xl overflow-hidden bg-white"
      style={{ border: '1.5px solid #C9341A20' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ background: '#FFF5F0' }}>
            <tr>
              <th className="px-3 py-3 text-left text-[#C9341A]">獎項</th>
              <th className="px-3 py-3 text-left text-[#C9341A]">機率</th>
            </tr>
          </thead>
          <tbody>
            {prizes.map((item) => (
              <tr key={item.id} className="border-t border-[#C9341A14]">
                <td className="px-3 py-3 text-[#2D1500]">
                  {item.emoji} {item.name}
                </td>
                <td className="px-3 py-3 text-[#2D1500]/70">
                  {item.probability}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}