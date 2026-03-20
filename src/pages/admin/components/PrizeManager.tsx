import { useEffect, useMemo, useState } from 'react';
import {
  getAllPrizes,
  addPrize,
  updatePrize,
  deletePrize,
  type PrizeItem,
} from '../../../utils/lotteryUtils';

export default function PrizeManager() {
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [newWeight, setNewWeight] = useState('0');

  const totalPercent = useMemo(() => {
    return prizes
      .filter((p) => p.is_active)
      .reduce((sum, p) => sum + Number(p.weight || 0), 0);
  }, [prizes]);

  const fetchPrizes = async () => {
    setLoading(true);
    try {
      const data = await getAllPrizes(true);
      setPrizes(data);
    } catch (e) {
      console.error('getAllPrizes error =', e);
      alert('抓不到獎項：' + (e instanceof Error ? e.message : JSON.stringify(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrizes();
  }, []);

  const handleAdd = async () => {
    if (!newCategoryName.trim()) {
      alert('請輸入類別');
      return;
    }

    if (!newProductName.trim()) {
      alert('請輸入商品名稱');
      return;
    }

    const weight = Number(newWeight);

    if (Number.isNaN(weight) || weight < 0) {
      alert('機率必須是 0 以上數字');
      return;
    }

    try {
      await addPrize({
        category_name: newCategoryName.trim(),
        product_name: newProductName.trim(),
        emoji: newEmoji.trim() || '🎁',
        weight,
        sort_order: prizes.length + 1,
      });

      setNewCategoryName('');
      setNewProductName('');
      setNewEmoji('');
      setNewWeight('0');
      await fetchPrizes();
    } catch (e) {
      console.error('addPrize error =', e);
      alert('新增失敗：' + (e instanceof Error ? e.message : JSON.stringify(e)));
    }
  };

  const handleUpdate = async (p: PrizeItem) => {
    const weight = Number(p.weight);

    if (!p.category_name.trim()) {
      alert('類別不可空白');
      return;
    }

    if (!p.product_name.trim()) {
      alert('商品名稱不可空白');
      return;
    }

    if (Number.isNaN(weight) || weight < 0) {
      alert('機率必須是 0 以上數字');
      return;
    }

    try {
      await updatePrize(p.id, {
        category_name: p.category_name,
        product_name: p.product_name,
        emoji: p.emoji,
        weight,
        is_active: p.is_active,
        sort_order: Number(p.sort_order),
      });

      await fetchPrizes();
    } catch (e) {
      console.error('updatePrize error =', e);
      alert('儲存失敗：' + (e instanceof Error ? e.message : JSON.stringify(e)));
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('確定刪除這個品項？');
    if (!ok) return;

    try {
      await deletePrize(id);
      await fetchPrizes();
    } catch (e) {
      console.error('deletePrize error =', e);
      alert('刪除失敗：' + (e instanceof Error ? e.message : JSON.stringify(e)));
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden bg-white"
      style={{ border: '2px solid #C9341A20' }}
    >
      <div
        className="px-5 py-3 text-sm font-bold tracking-wider flex items-center justify-between"
        style={{
          color: '#C9341A',
          borderBottom: '1.5px solid #C9341A20',
          background: '#FFF5F0',
        }}
      >
        <span>🎯 獎項管理</span>
        <span
          className="text-xs font-bold"
          style={{ color: Math.abs(totalPercent - 100) < 0.001 ? '#16a34a' : '#dc2626' }}
        >
          啟用中總機率：{totalPercent.toFixed(1)}%
        </span>
      </div>

      <div className="p-5 space-y-5">
        <div
          className="rounded-xl px-4 py-3 text-xs"
          style={{
            background: Math.abs(totalPercent - 100) < 0.001 ? '#F0FDF4' : '#FFF7ED',
            border:
              Math.abs(totalPercent - 100) < 0.001
                ? '1px solid #86EFAC'
                : '1px solid #FDBA74',
            color: Math.abs(totalPercent - 100) < 0.001 ? '#166534' : '#9A3412',
          }}
        >
          {Math.abs(totalPercent - 100) < 0.001
            ? '總機率為 100%，目前設定正常。'
            : '提醒：建議啟用中的獎項總機率加總為 100%。'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            placeholder="類別"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="px-4 py-3 rounded-xl text-sm outline-none bg-[#FFFBF0]"
            style={{ border: '1.5px solid #C9341A30' }}
          />

          <input
            placeholder="商品名稱"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            className="px-4 py-3 rounded-xl text-sm outline-none bg-[#FFFBF0]"
            style={{ border: '1.5px solid #C9341A30' }}
          />

          <input
            placeholder="emoji"
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
            className="px-4 py-3 rounded-xl text-sm outline-none bg-[#FFFBF0]"
            style={{ border: '1.5px solid #C9341A30' }}
          />

          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            placeholder="機率 %"
            className="px-4 py-3 rounded-xl text-sm outline-none bg-[#FFFBF0]"
            style={{ border: '1.5px solid #C9341A30' }}
          />

          <button
            onClick={handleAdd}
            className="rounded-xl font-bold text-sm transition-all duration-200 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C9341A, #8B1A0A)', color: '#fff' }}
          >
            新增品項
          </button>
        </div>

        <p className="text-xs text-[#2D1500]/40">
          類別與商品名稱分開管理，前台會自動顯示成兩行；機率請直接輸入百分比，例如 12.5 代表 12.5%
        </p>

        {loading ? (
          <p className="text-sm text-[#2D1500]/50">載入中...</p>
        ) : prizes.length === 0 ? (
          <p className="text-sm text-[#2D1500]/50">目前沒有獎項資料</p>
        ) : (
          <div className="space-y-3">
            {prizes.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl p-4"
                style={{ background: '#FFFBF0', border: '1.5px solid #C9341A20' }}
              >
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
                  <input
                    value={p.category_name}
                    onChange={(e) =>
                      setPrizes((prev) =>
                        prev.map((x) =>
                          x.id === p.id ? { ...x, category_name: e.target.value } : x
                        )
                      )
                    }
                    placeholder="類別"
                    className="px-3 py-2 rounded-xl text-sm outline-none bg-white"
                    style={{ border: '1.5px solid #C9341A20' }}
                  />

                  <input
                    value={p.product_name}
                    onChange={(e) =>
                      setPrizes((prev) =>
                        prev.map((x) =>
                          x.id === p.id ? { ...x, product_name: e.target.value } : x
                        )
                      )
                    }
                    placeholder="商品名稱"
                    className="px-3 py-2 rounded-xl text-sm outline-none bg-white"
                    style={{ border: '1.5px solid #C9341A20' }}
                  />

                  <input
                    value={p.emoji}
                    onChange={(e) =>
                      setPrizes((prev) =>
                        prev.map((x) => (x.id === p.id ? { ...x, emoji: e.target.value } : x))
                      )
                    }
                    className="px-3 py-2 rounded-xl text-sm outline-none bg-white"
                    style={{ border: '1.5px solid #C9341A20' }}
                  />

                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={p.weight}
                    onChange={(e) =>
                      setPrizes((prev) =>
                        prev.map((x) =>
                          x.id === p.id ? { ...x, weight: Number(e.target.value) } : x
                        )
                      )
                    }
                    className="px-3 py-2 rounded-xl text-sm outline-none bg-white"
                    style={{ border: '1.5px solid #C9341A20' }}
                  />

                  <div className="text-sm text-[#2D1500]/60">
                    {Number(p.weight).toFixed(1)}%
                  </div>

                  <label className="flex items-center gap-2 text-sm text-[#2D1500]/70">
                    <input
                      type="checkbox"
                      checked={p.is_active}
                      onChange={(e) =>
                        setPrizes((prev) =>
                          prev.map((x) =>
                            x.id === p.id ? { ...x, is_active: e.target.checked } : x
                          )
                        )
                      }
                    />
                    啟用
                  </label>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(p)}
                      className="px-3 py-2 rounded-xl text-sm font-bold"
                      style={{ background: '#C9341A', color: '#fff' }}
                    >
                      儲存
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-2 rounded-xl text-sm font-bold"
                      style={{
                        background: '#fff',
                        color: '#C9341A',
                        border: '1.5px solid #C9341A40',
                      }}
                    >
                      刪除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}