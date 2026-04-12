import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearAdminAuthed,
  createPrizeItem,
  deletePrizeItem,
  getPrizeList,
  isAdminAuthed,
  updatePrizeItem,
  type PrizeItem,
} from '../../utils/lotteryUtils';

export default function AdminPage() {
  const navigate = useNavigate();
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadPrizes = async () => {
    try {
      setLoading(true);
      const list = await getPrizeList();
      setPrizes(list);
    } catch (e) {
      console.error(e);
      alert('讀取獎項失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdminAuthed()) {
      navigate('/admin-login');
      return;
    }

    loadPrizes();
  }, [navigate]);

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
              [key]: key === 'probability' ? Number(value) : value,
            }
          : item,
      ),
    );
  };

  const handleSaveOne = async (item: PrizeItem) => {
    try {
      setSavingId(item.id);
      await updatePrizeItem(item.id, {
        name: item.name,
        emoji: item.emoji,
        probability: Number(item.probability || 0),
        category_name: item.category_name || '',
        product_name: item.product_name || '',
        remark: item.remark || '',
      });
      alert('此品項已儲存');
      await loadPrizes();
    } catch (e) {
      console.error(e);
      alert('儲存失敗');
    } finally {
      setSavingId(null);
    }
  };

  const handleAddPrize = async () => {
    try {
      const newPrize = await createPrizeItem(); // 直接新增到 Supabase
      await loadPrizes();                       // 重新抓最新資料
      setExpandedId(newPrize.id);              // 展開剛新增的那一筆
    } catch (e) {
      console.error(e);
      alert('新增品項失敗');
    }
  };

  const handleDeletePrize = async (id: string, name: string) => {
    const ok = window.confirm(`確定要刪除「${name}」嗎？`);
    if (!ok) return;

    try {
      await deletePrizeItem(id);
      await loadPrizes();
      if (expandedId === id) setExpandedId(null);
    } catch (e) {
      console.error(e);
      alert('刪除失敗');
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-[#C9341A] text-lg font-bold"
        style={{ background: '#FFFBF0', fontFamily: "'Noto Serif TC', serif" }}
      >
        載入中...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 py-6 md:px-6"
      style={{
        background: '#FFFBF0',
        fontFamily: "'Noto Serif TC', serif",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-[#C9341A]">後台管理系統</h1>
            <p className="text-sm text-[#2D1500]/50 mt-1">點擊單一獎項後可編輯細節</p>
          </div>

          <div className="flex gap-2 flex-wrap">
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

            <button
              type="button"
              onClick={() => {
                clearAdminAuthed();
                navigate('/');
              }}
              className="px-4 py-2 rounded-full text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #C9341A, #8B1A0A)' }}
            >
              登出
            </button>
          </div>
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
                          {!!item.remark &&
                            `　|　備註：${item.remark.slice(0, 20)}${
                              item.remark.length > 20 ? '...' : ''
                            }`}
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
                        onChange={(e) =>
                          handleFieldChange(item.id, 'probability', e.target.value)
                        }
                        className="w-full rounded-xl px-4 py-3 outline-none"
                        style={{ border: '1px solid #C9341A30' }}
                      />
                    </label>

                    <label className="block">
                      <div className="text-sm font-bold text-[#C9341A] mb-2">分類</div>
                      <input
                        value={item.category_name || ''}
                        onChange={(e) =>
                          handleFieldChange(item.id, 'category_name', e.target.value)
                        }
                        className="w-full rounded-xl px-4 py-3 outline-none"
                        style={{ border: '1px solid #C9341A30' }}
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <div className="text-sm font-bold text-[#C9341A] mb-2">
                        品項名稱 / 對應商品
                      </div>
                      <input
                        value={item.product_name || ''}
                        onChange={(e) =>
                          handleFieldChange(item.id, 'product_name', e.target.value)
                        }
                        className="w-full rounded-xl px-4 py-3 outline-none"
                        style={{ border: '1px solid #C9341A30' }}
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <div className="text-sm font-bold text-[#C9341A] mb-2">備註</div>
                      <textarea
                        rows={4}
                        value={item.remark || ''}
                        onChange={(e) =>
                          handleFieldChange(item.id, 'remark', e.target.value)
                        }
                        className="w-full rounded-xl px-4 py-3 outline-none resize-none"
                        style={{ border: '1px solid #C9341A30' }}
                        placeholder="例如：限平日使用、不可折現、兌換品項依現場公告為準"
                      />
                    </label>

                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSaveOne(item)}
                        disabled={savingId === item.id}
                        className="px-5 py-3 rounded-full text-sm font-bold text-white disabled:opacity-60"
                        style={{
                          background: 'linear-gradient(135deg, #C9341A, #8B1A0A)',
                        }}
                      >
                        {savingId === item.id ? '儲存中...' : '儲存此品項'}
                      </button>
                    </div>
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