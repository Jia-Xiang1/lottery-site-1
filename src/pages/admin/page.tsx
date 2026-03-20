import { useState } from 'react';
import PrizeManager from './components/PrizeManager';

const ADMIN_PASSWORD = 'riceking168';

const waveBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='60' viewBox='0 0 120 60'%3E%3Cpath d='M0 40 Q15 20 30 40 Q45 60 60 40 Q75 20 90 40 Q105 60 120 40' fill='none' stroke='%23C9341A' stroke-width='1.5' opacity='0.1'/%3E%3Cpath d='M0 55 Q15 35 30 55 Q45 75 60 55 Q75 35 90 55 Q105 75 120 55' fill='none' stroke='%23C9A227' stroke-width='1' opacity='0.08'/%3E%3C/svg%3E")`;

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);

  const handleLogin = () => {
    if (pwInput === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  const pageStyle = {
    background: '#FFFBF0',
    backgroundImage: waveBg,
    backgroundRepeat: 'repeat-x',
    backgroundPosition: 'bottom',
    minHeight: '100vh',
    fontFamily: "'Noto Serif TC', serif",
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={pageStyle}>
        <div
          className="fixed top-0 left-0 w-full h-2"
          style={{ background: 'linear-gradient(90deg, #C9341A, #C9A227, #C9341A)' }}
        />
        <div
          className="fixed bottom-0 left-0 w-full h-2"
          style={{ background: 'linear-gradient(90deg, #C9A227, #C9341A, #C9A227)' }}
        />

        <div
          className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden bg-white"
          style={{ border: '2px solid #C9341A40', boxShadow: '0 8px 32px #C9341A15' }}
        >
          <div
            className="h-2"
            style={{ background: 'linear-gradient(90deg, #C9341A, #C9A227, #C9341A)' }}
          />

          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#C9341A]">後台管理系統</h1>
              <p className="text-xs text-[#2D1500]/50 mt-1">獎項管理專用</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#2D1500]/60 mb-1.5 block tracking-wider font-medium">
                  管理員密碼
                </label>
                <input
                  type="password"
                  value={pwInput}
                  onChange={(e) => {
                    setPwInput(e.target.value);
                    setPwError(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="請輸入密碼"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all bg-[#FFFBF0] text-[#2D1500]"
                  style={{
                    border: pwError ? '1.5px solid #ef4444' : '1.5px solid #C9341A40',
                  }}
                />
                {pwError && (
                  <p className="text-xs text-red-500 mt-1.5">密碼錯誤，請重新輸入</p>
                )}
              </div>

              <button
                onClick={handleLogin}
                className="w-full py-3 rounded-xl font-bold text-sm cursor-pointer whitespace-nowrap transition-all duration-200 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #C9341A, #8B1A0A)', color: '#fff' }}
              >
                進入後台
              </button>
            </div>
          </div>

          <div
            className="h-2"
            style={{ background: 'linear-gradient(90deg, #C9A227, #C9341A, #C9A227)' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div
        className="w-full h-2"
        style={{ background: 'linear-gradient(90deg, #C9341A, #C9A227, #C9341A)' }}
      />

      <div
        className="flex items-center justify-between px-6 py-4 bg-white"
        style={{ borderBottom: '2px solid #C9341A20' }}
      >
        <div>
          <h1 className="font-bold text-lg text-[#C9341A]">後台管理系統</h1>
          <p className="text-xs text-[#2D1500]/40">獎項管理</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://jia-xiang1.github.io/lottery-site-1/"
            className="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap"
            style={{
              background: '#FFF5F0',
              color: '#C9341A',
              border: '1.5px solid #C9341A40',
            }}
          >
            返回前台
          </a>

          <button
            onClick={() => setAuthed(false)}
            className="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap"
            style={{ background: '#C9341A', color: '#fff' }}
          >
            登出
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <PrizeManager />
      </div>
    </div>
  );
}