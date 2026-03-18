import { useState, useEffect, useCallback } from 'react';
import { findRecord, redeemRecord, getAllRecords, formatDate, type LotteryRecord } from '../../utils/lotteryUtils';
import RecordList from './components/RecordList';

const ADMIN_PASSWORD = 'riceking168';

const waveBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='60' viewBox='0 0 120 60'%3E%3Cpath d='M0 40 Q15 20 30 40 Q45 60 60 40 Q75 20 90 40 Q105 60 120 40' fill='none' stroke='%23C9341A' stroke-width='1.5' opacity='0.1'/%3E%3Cpath d='M0 55 Q15 35 30 55 Q45 75 60 55 Q75 35 90 55 Q105 75 120 55' fill='none' stroke='%23C9A227' stroke-width='1' opacity='0.08'/%3E%3C/svg%3E")`;

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);

  const [searchCode, setSearchCode] = useState('');
  const [found, setFound] = useState<LotteryRecord | null | undefined>(undefined);
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [redeemError, setRedeemError] = useState('');
  const [allRecords, setAllRecords] = useState<LotteryRecord[]>([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [filterRedeemed, setFilterRedeemed] = useState<'all' | 'pending' | 'redeemed'>('all');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const records = await getAllRecords();
    setAllRecords(records);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) {
      fetchRecords();
    }
  }, [authed, fetchRecords]);

  const handleLogin = () => {
    if (pwInput === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  const handleSearch = async () => {
    const code = searchCode.trim();
    if (code.length !== 8) {
      setFound(null);
      return;
    }
    setSearchLoading(true);
    const result = await findRecord(code);
    setFound(result ?? null);
    setRedeemSuccess(false);
    setRedeemError('');
    if (result) setSelectedCode(result.code);
    setSearchLoading(false);
  };

  const handleRedeem = async () => {
    if (!found) return;
    if (found.redeemTime) {
      setRedeemError('此序號已於 ' + formatDate(found.redeemTime) + ' 兌換過，無法重複兌換。');
      return;
    }
    const ok = await redeemRecord(found.code);
    if (ok) {
      const updated = await findRecord(found.code);
      setFound(updated);
      setRedeemSuccess(true);
      setRedeemError('');
      await fetchRecords();
    }
  };

  const handleSelectRecord = (r: LotteryRecord) => {
    setSearchCode(r.code);
    setFound(r);
    setSelectedCode(r.code);
    setRedeemSuccess(false);
    setRedeemError('');
  };

  const handleQuickRedeem = async (code: string) => {
    const ok = await redeemRecord(code);
    if (ok) {
      await fetchRecords();
      if (found && found.code === code) {
        const updated = await findRecord(code);
        setFound(updated);
        setRedeemSuccess(true);
      }
    }
  };

  const filteredRecords = allRecords.filter((r) => {
    if (filterRedeemed === 'pending') return !r.redeemTime;
    if (filterRedeemed === 'redeemed') return !!r.redeemTime;
    return true;
  });

  const pendingCount = allRecords.filter(r => !r.redeemTime).length;
  const redeemedCount = allRecords.filter(r => !!r.redeemTime).length;

  const pageStyle = {
    background: '#FFFBF0',
    backgroundImage: waveBg,
    backgroundRepeat: 'repeat-x',
    backgroundPosition: 'bottom',
    fontFamily: '\'Noto Serif TC\', serif',
    minHeight: '100vh',
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={pageStyle}>
        {/* Cherry blossom deco */}
        <div className="fixed top-0 left-0 w-full h-2" style={{ background: 'linear-gradient(90deg, #C9341A, #C9A227, #C9341A)' }} />
        <div className="fixed bottom-0 left-0 w-full h-2" style={{ background: 'linear-gradient(90deg, #C9A227, #C9341A, #C9A227)' }} />

        <div
          className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden bg-white"
          style={{ border: '2px solid #C9341A40', boxShadow: '0 8px 32px #C9341A15' }}
        >
          {/* Top red band */}
          <div className="h-2" style={{ background: 'linear-gradient(90deg, #C9341A, #C9A227, #C9341A)' }} />

          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4" style={{ border: '3px solid #C9341A' }}>
                <img
                  src="https://static.readdy.ai/image/e6361e290b8884fd762f739a91bc6d40/480f1e28a91ad034c6508e3a59d6853e.jpeg"
                  alt="logo"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <h1 className="text-2xl font-bold text-[#C9341A]">後台管理系統</h1>
              <p className="text-xs text-[#2D1500]/50 mt-1">光盤有獎 · 店家專用登入</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#2D1500]/60 mb-1.5 block tracking-wider font-medium">管理員密碼</label>
                <input
                  type="password"
                  value={pwInput}
                  onChange={e => { setPwInput(e.target.value); setPwError(false); }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="請輸入密碼"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all bg-[#FFFBF0] text-[#2D1500]"
                  style={{
                    border: pwError ? '1.5px solid #ef4444' : '1.5px solid #C9341A40',
                    fontFamily: '\'Noto Serif TC\', serif',
                  }}
                />
                {pwError && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <i className="ri-error-warning-line" />密碼錯誤，請重新輸入
                  </p>
                )}
              </div>
              <button
                onClick={handleLogin}
                className="w-full py-3 rounded-xl font-bold text-sm cursor-pointer whitespace-nowrap transition-all duration-200 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #C9341A, #8B1A0A)', color: '#fff' }}
              >
                <i className="ri-login-box-line mr-2" />進入後台管理
              </button>
            </div>
          </div>

          <div className="h-2" style={{ background: 'linear-gradient(90deg, #C9A227, #C9341A, #C9A227)' }} />
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&display=swap');`}</style>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* Top band */}
      <div className="w-full h-2" style={{ background: 'linear-gradient(90deg, #C9341A, #C9A227, #C9341A)' }} />

      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 bg-white"
        style={{ borderBottom: '2px solid #C9341A20' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden" style={{ border: '2px solid #C9341A' }}>
            <img
              src="https://static.readdy.ai/image/e6361e290b8884fd762f739a91bc6d40/480f1e28a91ad034c6508e3a59d6853e.jpeg"
              alt="logo"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#C9341A]">後台管理系統</h1>
            <p className="text-xs text-[#2D1500]/40">光盤有獎 · 抽獎紀錄管理</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-xs text-[#2D1500]/50 hover:text-[#C9341A] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <i className="ri-arrow-left-line" />前台頁面
          </a>
          <button
            onClick={() => setAuthed(false)}
            className="text-xs text-[#2D1500]/50 hover:text-red-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-logout-box-line mr-1" />登出
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: '總抽獎次數', value: allRecords.length, icon: 'ri-ticket-line', bg: '#FFF8F0', border: '#C9341A30', color: '#C9341A' },
            { label: '待兌換', value: pendingCount, icon: 'ri-time-line', bg: '#FFFDE7', border: '#C9A22730', color: '#C9A227' },
            { label: '已兌換', value: redeemedCount, icon: 'ri-check-double-line', bg: '#F1F8E9', border: '#66BB6A30', color: '#388E3C' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-4 text-center"
              style={{ background: stat.bg, border: `2px solid ${stat.border}` }}
            >
              <i className={`${stat.icon} text-2xl block mb-1`} style={{ color: stat.color }} />
              <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-[#2D1500]/50 mt-0.5 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search Section */}
        <div
          className="rounded-2xl overflow-hidden bg-white"
          style={{ border: '2px solid #C9341A20' }}
        >
          <div
            className="px-5 py-3 text-sm font-bold tracking-wider flex items-center gap-2"
            style={{
              color: '#C9341A',
              borderBottom: '1.5px solid #C9341A20',
              background: '#FFF5F0',
            }}
          >
            <i className="ri-search-line" />序號查詢兌換
          </div>

          <div className="p-5 space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchCode}
                onChange={e => setSearchCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                maxLength={8}
                placeholder="輸入8碼數字序號"
                className="flex-1 px-4 py-3 rounded-xl text-sm font-mono tracking-widest outline-none bg-[#FFFBF0] text-[#2D1500]"
                style={{
                  border: '1.5px solid #C9341A30',
                  letterSpacing: '0.2em',
                  fontFamily: 'monospace',
                }}
              />
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="px-6 py-3 rounded-xl font-bold text-sm cursor-pointer whitespace-nowrap transition-all duration-200 hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #C9341A, #8B1A0A)', color: '#fff' }}
              >
                {searchLoading
                  ? <><i className="ri-loader-4-line animate-spin mr-1" />查詢中</>
                  : <><i className="ri-search-line mr-1" />查詢</>
                }
              </button>
            </div>

            {found === null && (
              <div
                className="rounded-xl p-4 text-center text-sm"
                style={{ background: '#FFF5F5', border: '1.5px solid #ef444440', color: '#ef4444' }}
              >
                <i className="ri-error-warning-line mr-2" />
                查無此序號，請確認輸入是否正確
              </div>
            )}

            {found && (
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: found.redeemTime ? '#F1F8E9' : '#FFF8F0',
                  border: found.redeemTime ? '1.5px solid #A5D6A7' : '1.5px solid #C9341A40',
                }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{found.prizeEmoji}</span>
                      <div>
                        <div className="font-bold text-lg text-[#C9341A]">{found.prizeName}</div>
                        <div className="font-mono text-sm tracking-widest mt-0.5 text-[#2D1500]/60" style={{ letterSpacing: '0.15em' }}>
                          {found.code}
                        </div>
                      </div>
                    </div>
                    <div>
                      {found.redeemTime ? (
                        <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7' }}>
                          ✓ 已兌換
                        </span>
                      ) : (
                        <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: '#FFF8E1', color: '#C9A227', border: '1px solid #C9A22760' }}>
                          待兌換
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-[#2D1500]/60">
                    <div className="flex items-center gap-2">
                      <i className="ri-calendar-line text-[#C9341A]" />
                      <span>抽獎時間：{formatDate(found.drawTime)}</span>
                    </div>
                    {found.redeemTime && (
                      <div className="flex items-center gap-2">
                        <i className="ri-check-line text-green-600" />
                        <span>兌換時間：{formatDate(found.redeemTime)}</span>
                      </div>
                    )}
                  </div>

                  {!found.redeemTime && (
                    <div className="mt-4">
                      {redeemError && (
                        <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
                          <i className="ri-error-warning-line" />{redeemError}
                        </p>
                      )}
                      {redeemSuccess ? (
                        <div
                          className="w-full py-3 rounded-xl text-center text-sm font-bold"
                          style={{ background: '#E8F5E9', color: '#2E7D32', border: '1.5px solid #A5D6A7' }}
                        >
                          <i className="ri-check-double-line mr-1" />兌換成功！
                        </div>
                      ) : (
                        <button
                          onClick={handleRedeem}
                          className="w-full py-3 rounded-xl font-bold text-sm cursor-pointer whitespace-nowrap transition-all duration-200 hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg, #C9341A, #8B1A0A)', color: '#fff' }}
                        >
                          <i className="ri-gift-line mr-2" />確認兌換此獎項
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Records List */}
        <div
          className="rounded-2xl overflow-hidden bg-white"
          style={{ border: '2px solid #C9341A20' }}
        >
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderBottom: '1.5px solid #C9341A20', background: '#FFF5F0' }}
          >
            <span className="text-sm font-bold tracking-wider text-[#C9341A] flex items-center gap-2">
              <i className="ri-list-check" />全部抽獎紀錄
            </span>
            <div className="flex gap-1">
              {(['all', 'pending', 'redeemed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterRedeemed(f)}
                  className="text-xs px-3 py-1 rounded-full cursor-pointer whitespace-nowrap transition-all duration-200"
                  style={{
                    background: filterRedeemed === f ? '#C9341A' : 'transparent',
                    color: filterRedeemed === f ? '#fff' : '#C9341A80',
                    border: `1px solid ${filterRedeemed === f ? '#C9341A' : '#C9341A30'}`,
                  }}
                >
                  {f === 'all' ? '全部' : f === 'pending' ? '待兌換' : '已兌換'}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="text-center py-8 text-[#C9341A]/50 text-sm">
                <i className="ri-loader-4-line animate-spin text-xl block mb-2" />
                載入中...
              </div>
            ) : (
              <RecordList
                records={filteredRecords}
                onSelect={handleSelectRecord}
                onQuickRedeem={handleQuickRedeem}
                selectedCode={selectedCode}
              />
            )}
          </div>
        </div>
      </div>

      <div className="pb-8 text-center text-xs text-[#2D1500]/30 mt-4">
        童叟無欺丼飯 · 光盤有獎後台管理系統
      </div>
      <div className="w-full h-2" style={{ background: 'linear-gradient(90deg, #C9A227, #C9341A, #C9A227)' }} />

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&display=swap');`}</style>
    </div>
  );
}
