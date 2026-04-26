import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearAdminAuthed,
  createPrizeItem,
  createVersion,
  deletePrizeItem,
  getPrizeList,
  getVersions,
  isAdminAuthed,
  setActiveVersion,
  updatePrizeItem,
  type LotteryVersion,
  type PrizeItem,
} from '../../utils/lotteryUtils';

export default function AdminPage() {
  const navigate = useNavigate();

  const [versions, setVersions] = useState<LotteryVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const selectedVersion = versions.find((v) => v.id === selectedVersionId) || null;

  const loadVersions = async () => {
    const list = await getVersions();
    setVersions(list);

    if (!selectedVersionId && list.length > 0) {
      const active = list.find((v) => v.is_active) || list[0];
      setSelectedVersionId(active.id);
    }
  };

  const loadPrizes = async (versionId: string) => {
    const list = await getPrizeList(versionId);
    setPrizes(list);
  };

  const loadAll = async (keepVersionId?: string) => {
    try {
      setLoading(true);
      const versionList = await getVersions();
      setVersions(versionList);

      const nextVersionId =
        keepVersionId ||
        selectedVersionId ||
        versionList.find((v) => v.is_active)?.id ||
        versionList[0]?.id ||
        '';

      setSelectedVersionId(nextVersionId);

      if (nextVersionId) {
        const prizeList = await getPrizeList(nextVersionId);
        setPrizes(prizeList);
      } else {
        setPrizes([]);
      }
    } catch (e) {
      console.error(e);
      alert('載入資料失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdminAuthed()) {
      navigate('/admin-login');
      return;
    }
    loadAll();
  }, [navigate]);

  useEffect(() => {
    if (selectedVersionId) {
      loadPrizes(selectedVersionId).catch((e) => {
        console.error(e);
        alert('讀取版本獎項失敗');
      });
    }
  }, [selectedVersionId]);

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
          ? { ...item, [key]: key === 'probability' ? Number(value) : value }
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
      await loadPrizes(selectedVersionId);
    } catch (e) {
      console.error(e);
      alert('儲存失敗');
    } finally {
      setSavingId(null);
    }
  };

  const handleAddPrize = async () => {
    if (!selectedVersionId) {
      alert('請先選擇抽獎版本');
      return;
    }

    try {
      const newPrize = await createPrizeItem(selectedVersionId);
      await loadPrizes(selectedVersionId);
      setExpandedId(newPrize.id);
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
      await loadPrizes(selectedVersionId);
      if (expandedId === id) setExpandedId(null);
    } catch (e) {
      console.error(e);
      alert('刪除失敗');
    }
  };

  const handleCreateVersion = async () => {
    const name = window.prompt('請輸入新版本名稱');
    if (!name?.trim()) return;

    try {
      const newVersion = await createVersion(name.trim(), '');
      await loadAll(newVersion.id);
      alert('版本已建立');
    } catch (e) {
      console.error(e);
      alert('建立版本失敗');
    }
  };

  const handleActivateVersion = async (versionId: string) => {
    try {
      await setActiveVersion(versionId);
      await loadAll(versionId);
      alert('已切換抽獎版本');
    } catch (e) {
      console.error(e);
      alert('切換版本失敗');
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
      style={{ background: '#FFFBF0', fontFamily: "'Noto Serif TC', serif" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-[#C9341A]">後台管理系統</h1>
            <p className="text-sm text-[#2D1500]/50 mt-1">多版本抽獎管理</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCreateVersion}
              className="px-4 py-2 rounded-full text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #C9A227, #A37D10)' }}
            >
              新增版本
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
          <div className="text-sm font-bold text-[#C9341A] mb-3">抽獎版本</div>
          <div className="flex flex-wrap gap-2">
            {versions.map((version) => (
              <button
                key={version.id}
                type="button"
                onClick={() => setSelectedVersionId(version.id)}
                className="px-4 py-2 rounded-full text-sm font-bold"
                style={{
                  background:
                    selectedVersionId === version.id ? '#C9341A' : '#FFF8EE',
                  color: selectedVersionId === version.id ? '#fff' : '#C9341A',
                  border: '1px solid #C9341A30',
                }}
              >
                {version.name}
                {version.is_active ? '（啟用中）' : ''}
              </button>
            ))}
          </div>

          {selectedVersion && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-[#2D1500]/70">
                目前編輯版本：<span className="font-bold">{selectedVersion.name}</span>
              </div>

              {!selectedVersion.is_active && (
                <button
                  type="button"
                  onClick={() => handleActivateVersion(selectedVersion.id)}
                  className="px-4 py-2 rounded-full text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #C9341A, #8B1A0A)' }}
                >
                  一鍵切換為目前抽獎版本
                </button>
              )}
            </div>
          )}
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
                這是目前選中版本的總機率
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddPrize}
              className="px-4 py-2 rounded-full text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #C9A227, #A37D10)' }}
            >
              新增此版本獎項
            </button>
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