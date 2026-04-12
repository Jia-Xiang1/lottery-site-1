import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAdminAuthed } from '../../utils/lotteryUtils';

const ADMIN_PASSWORD = 'xiang1224';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setAdminAuthed();
      navigate('/admin');
      return;
    }

    setErrorText('密碼錯誤，請重新輸入');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{
        background: '#FFFBF0',
        fontFamily: "'Noto Serif TC', serif",
      }}
    >
      <div
        className="w-full max-w-md rounded-[28px] bg-white p-6"
        style={{
          border: '1.5px solid #C9341A20',
          boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
        }}
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-2xl font-black text-[#C9341A]">後台登入</h1>
          <p className="text-sm text-[#2D1500]/50 mt-2">請輸入管理密碼</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="text-sm font-bold text-[#C9341A] mb-2">管理密碼</div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorText('');
              }}
              placeholder="請輸入密碼"
              className="w-full rounded-2xl px-4 py-3 outline-none"
              style={{ border: '1px solid #C9341A30' }}
            />
          </div>

          {errorText && (
            <div
              className="rounded-xl px-3 py-3 text-sm"
              style={{
                background: '#FFF1F1',
                border: '1px solid #DC262650',
                color: '#DC2626',
              }}
            >
              {errorText}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-full py-3 text-base font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #C9341A, #8B1A0A)',
            }}
          >
            進入後台
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full rounded-full py-3 text-sm font-bold"
            style={{
              background: '#FFF7ED',
              border: '1px solid #C9341A35',
              color: '#C9341A',
            }}
          >
            返回前台
          </button>
        </form>
      </div>
    </div>
  );
}