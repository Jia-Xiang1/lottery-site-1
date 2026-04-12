import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createPrizeItem,
  deletePrizeItem,
  getPrizeList,
  savePrizeList,
  type PrizeItem,
} from '../../utils/lotteryUtils';

export default function AdminPage() {
  const navigate = useNavigate();
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setPrizes(getPrizeList());
  }, []);

  const totalProbability = useMemo(() => {
    return prizes.reduce((sum, item) => sum + Number(item.probability || 0), 0);
  }, [prizes]);

  const handleFieldChange = (
    id: string,
    key: keyof PrizeItem,
    value: string | number,
  ) => {
    setPrizes((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [key]:
                key === 'probability'
                  ? Number(value)
                  : value,
            }
          : item,
      ),
    );
  };

  const handleSaveAll = () => {
    savePrizeList(prizes);
    alert('已儲存獎項設定');
  };

  const handleAddPrize = () => {
    const next = [...prizes, createPrizeItem()];
    setPrizes(next);
    setExpandedId(next[next.length - 1].id);
  };

  const handleDeletePrize = (id: string, name: string) => {
    const ok = window.confirm(`確定要刪除「${name}」嗎？`);
    if (!ok) return;

    const next = prizes.filter((item) => item.id !== id);
    setPrizes(next);
    deletePrizeItem(id);

    if (expandedId === id) {
      setExpandedId(null);
    }
  };

  return (
    <div
      className="min-h-screen px-4 py-6 md:px-6"
      style={{
        background: '#FFFBF0',
        fontFamily: "'Noto Serif TC', serif",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#C9341A]">後台管理系統</h1>
            <p className="text-sm text-[#2D1500]/50 mt-1">點擊單一獎項後可編輯細節</p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-full text-sm font-bold"
            style={{
              background: '#FFF5F0',
              border: '1.5px solid #C9341A55',
              color: '#C9341A',
            }}
          >
            返回前台
          </button>
        </div>

        <div
          className="rounded-2xl bg-white p-4 mb-4"
          style={{ border: '1.5px solid #C9341A20' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-[#C9341A]">機率總和</div>
              <div
                className={`text-lg font-black ${
                  totalProbability === 100 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {totalProbability}%
              </div>
              <div className="text-xs text-[#2D1500]/55 mt-1">
                不等於 100% 仍可運作，但建議調整
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddPrize}
                className="px-4 py-2 rounded-full text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #C9A227, #A37D10)' }}
              >
                新增品項
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-4 py-2 rounded-full text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #C9341A, #8B1A0A)' }}
              >
                儲存全部
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {prizes.map((item, index) => {
            const expanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-white overflow-hidden"
                style={{ border: '1.5px solid #C9341A20' }}
              >
                <div className="px-4 py-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : item.id)}
                    className="flex-1 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{item.emoji || '🎁'}</div>
                      <div>
                        <div className="text-base font-black text-[#2D1500]">
                          {index + 1}. {item.name || '未命名獎項'}
                        </div>
                        <div className="text-xs text-[#2D1500]/55 mt-1">
                          機率：{Number(item.probability || 0)}%
                          {!!item.remark && `　|　備註：${item.remark.slice(0, 20)}${item.remark.length > 20 ? '...' : ''}`}
                        </div>
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : item.id)}
                      className="px-3 py-2 rounded-full text-xs font-bold"
                      style={{
                        background: '#FFF8EE',
                        color: '#C9341A',
                        border: '1px solid #C9341A30',
                      }}
                    >
                      {expanded ? '收起' : '編輯'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePrize(item.id, item.name)}
                      className="px-3 py-2 rounded-full text-xs font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #C9341A, #8B1A0A)',
                      }}
                    >
                      刪除品項
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div
                    className="px-4 pb-4 pt-1 grid grid-cols-1 md:grid-cols-2 gap-4"
                    style={{ background: '#FFFDFC' }}
                  >
                    <label className="block">
                      <div className="text-sm font-bold text-[#C9341A] mb-2">獎項名稱</div>
                      <input
                        value={item.name || ''}
                        onChange={(e) => handleFieldChange(item.id, 'name', e.target.value)}
                        className="w-full rounded-xl px-4 py-3 outline-none"
                        style={{ border: '1px solid #C9341A30' }}
                      />
                    </label>

                    <label className="block">
                      <div className="text-sm font-bold text-[#C9341A] mb-2">圖示 Emoji</div>
                      <input
                        value={item.emoji || ''}
                        onChange={(e) => handleFieldChange(item.id, 'emoji', e.target.value)}
                        className="w-full rounded-xl px-4 py-3 outline-none"
                        style={{ border: '1px solid #C9341A30' }}
                      />
                    </label>

                    <label className="block">
                      <div className="text-sm font-bold text-[#C9341A] mb-2">機率 (%)</div>
                      <input
                        type="number"
                        step="0.1"
                        value={item.probability ?? 0}
                        onChange={(e) => handleFieldChange(item.id, 'probability', e.target.value)}
                        className="w-full rounded-xl px-4 py-3 outline-none"
                        style={{ border: '1px solid #C9341A30' }}
                      />
                    </label>

                    <label className="block">
                      <div className="text-sm font-bold text-[#C9341A] mb-2">分類</div>
                      <input
                        value={item.category_name || ''}
                        onChange={(e) => handleFieldChange(item.id, 'category_name', e.target.value)}
                        className="w-full rounded-xl px-4 py-3 outline-none"
                        style={{ border: '1px solid #C9341A30' }}
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <div className="text-sm font-bold text-[#C9341A] mb-2">品項名稱 / 對應商品</div>
                      <input
                        value={item.product_name || ''}
                        onChange={(e) => handleFieldChange(item.id, 'product_name', e.target.value)}
                        className="w-full rounded-xl px-4 py-3 outline-none"
                        style={{ border: '1px solid #C9341A30' }}
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <div className="text-sm font-bold text-[#C9341A] mb-2">備註</div>
                      <textarea
                        rows={4}
                        value={item.remark || ''}
                        onChange={(e) => handleFieldChange(item.id, 'remark', e.target.value)}
                        className="w-full rounded-xl px-4 py-3 outline-none resize-none"
                        style={{ border: '1px solid #C9341A30' }}
                        placeholder="例如：限平日使用、不可折現、兌換品項依現場公告為準"
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}