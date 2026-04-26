import { useEffect, useState } from 'react';
import {
  getActiveVersion,
  getPrizeList,
  type PrizeItem,
} from '../../../utils/lotteryUtils';

export default function PrizeTable() {
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);
  const [versionName, setVersionName] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    const loadPrizes = async () => {
      try {
        setLoading(true);
        setErrorText('');

        const version = await getActiveVersion();
        setVersionName(version.name);

        const list = await getPrizeList(version.id);
        setPrizes(list);
      } catch (e) {
        console.error('PrizeTable load error =', e);
        setErrorText('目前無法讀取中獎機率表');
      } finally {
        setLoading(false);
      }
    };

    loadPrizes();
  }, []);

  if (loading) {
    return (
      <div
        className="rounded-2xl overflow-hidden bg-white px-4 py-4 text-sm text-[#2D1500]/60"
        style={{ border: '1.5px solid #C9341A20' }}
      >
        載入中...
      </div>
    );
  }

  if (errorText) {
    return (
      <div
        className="rounded-2xl overflow-hidden bg-white px-4 py-4 text-sm text-red-600"
        style={{ border: '1.5px solid #C9341A20' }}
      >
        {errorText}
      </div>
    );
  }

  if (prizes.length === 0) {
    return (
      <div
        className="rounded-2xl overflow-hidden bg-white"
        style={{ border: '1.5px solid #C9341A20' }}
      >
        {versionName && (
          <div
            className="px-4 py-3 text-sm font-bold"
            style={{ background: '#FFF5F0', color: '#C9341A' }}
          >
            當前版本：{versionName}
          </div>
        )}

        <div className="px-4 py-4 text-sm text-[#2D1500]/60">
          目前版本尚未設定獎項
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden bg-white"
      style={{ border: '1.5px solid #C9341A20' }}
    >
      {versionName && (
        <div
          className="px-4 py-3 text-sm font-bold"
          style={{ background: '#FFF5F0', color: '#C9341A' }}
        >
          當前版本：{versionName}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ background: '#FFF9F2' }}>
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
                  {Number(item.probability || 0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}