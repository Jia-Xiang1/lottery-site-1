import { useState } from 'react';
import LotteryDrum from './components/LotteryDrum';
import PrizeResultCard from './components/PrizeResultCard';
import PrizeTable from './components/PrizeTable';
import { drawPrize, generateCode, saveRecord, type LotteryRecord } from '../../utils/lotteryUtils';
import { type Prize } from '../../mocks/prizes';

type Phase = 'idle' | 'spinning' | 'result';

const wavePatternBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='80' viewBox='0 0 200 80'%3E%3Cpath d='M0 50 Q25 20 50 50 Q75 80 100 50 Q125 20 150 50 Q175 80 200 50' fill='none' stroke='%23C9341A' stroke-width='2' opacity='0.08'/%3E%3Cpath d='M0 65 Q25 35 50 65 Q75 95 100 65 Q125 35 150 65 Q175 95 200 65' fill='none' stroke='%23C9A227' stroke-width='1.5' opacity='0.07'/%3E%3Cpath d='M0 25 Q25 5 50 25 Q75 45 100 25 Q125 5 150 25 Q175 45 200 25' fill='none' stroke='%23C9341A' stroke-width='1' opacity='0.05'/%3E%3C/svg%3E")`;

export default function Home() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [finalPrize, setFinalPrize] = useState<Prize | null>(null);
  const [currentRecord, setCurrentRecord] = useState<LotteryRecord | null>(null);
  const [showTable, setShowTable] = useState(false);

  const handleDraw = () => {
    if (phase !== 'idle') return;
    const prize = drawPrize();
    setFinalPrize(prize);
    setPhase('spinning');
  };

  const handleSpinComplete = async () => {
    if (!finalPrize) return;
    const code = generateCode();
    const record: LotteryRecord = {
      code,
      prizeId: finalPrize.id,
      prizeName: finalPrize.name,
      prizeEmoji: finalPrize.emoji,
      drawTime: new Date().toISOString(),
    };
    await saveRecord(record);
    setCurrentRecord(record);
    setPhase('result');
  };

  const handleReset = () => {
    setPhase('idle');
    setFinalPrize(null);
    setCurrentRecord(null);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start relative overflow-x-hidden"
      style={{
        background: '#FFFBF0',
        backgroundImage: wavePatternBg,
        backgroundRepeat: 'repeat',
        fontFamily: '\'Noto Serif TC\', serif',
      }}
    >
      {/* Top decorative band */}
      <div className="w-full h-3" style={{ background: 'linear-gradient(90deg, #C9341A 0%, #C9A227 30%, #C9341A 60%, #C9A227 80%, #C9341A 100%)' }} />

      {/* Top Nav Bar */}
      <div
        className="w-full flex items-center justify-between px-6 py-3 bg-white"
        style={{ borderBottom: '2px solid #C9341A20' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[#C9341A]/70 text-xs tracking-widest font-medium">童叟無欺丼飯</span>
          <span className="text-[#C9A227] text-xs">✦</span>
          <span className="text-[#2D1500]/40 text-xs tracking-wide">光盤有獎</span>
        </div>
        <a
          href="/admin"
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap hover:opacity-80"
          style={{
            background: '#FFF5F0',
            border: '1.5px solid #C9341A50',
            color: '#C9341A',
          }}
        >
          <i className="ri-shield-keyhole-line text-sm" />
          後台管理系統
        </a>
      </div>

      <div className="w-full max-w-lg mx-auto px-6 py-8 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-5 relative">
          <div
            className="w-32 h-32 rounded-full overflow-hidden"
            style={{
              border: '4px solid #C9341A',
              outline: '2px solid #C9A22760',
              outlineOffset: '3px',
            }}
          >
            <img
              src="https://static.readdy.ai/image/e6361e290b8884fd762f739a91bc6d40/480f1e28a91ad034c6508e3a59d6853e.jpeg"
              alt="童叟無欺"
              className="w-full h-full object-cover object-top"
            />
          </div>
          {/* Decorative petals */}
          <div className="absolute -top-1 -right-1 text-[#C9341A] text-xl" style={{ filter: 'drop-shadow(0 1px 2px #C9341A40)' }}>✿</div>
          <div className="absolute -bottom-1 -left-1 text-[#C9A227] text-base">✦</div>
        </div>

        {/* Title */}
        <section className="text-center mb-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #C9341A)' }} />
            <span className="text-xs tracking-widest text-[#C9341A] font-medium">吃飽就有獎</span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #C9341A, transparent)' }} />
          </div>
          <h1 className="text-3xl font-bold text-[#C9341A]" style={{ textShadow: '1px 1px 0 #C9A22740' }}>
            童叟無欺！開抽！
          </h1>
          <p className="text-[#2D1500]/50 text-sm mt-1 tracking-wider">光盤有獎 · 吃乾淨就能抽</p>
        </section>

        {/* Decorative divider */}
        <div className="flex items-center gap-3 my-4 w-full">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C9341A30)' }} />
          <span className="text-[#C9A227] text-lg">⊕</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #C9341A30, transparent)' }} />
        </div>

        {/* Lottery Drum */}
        <div className="my-6">
          <LotteryDrum
            isSpinning={phase === 'spinning'}
            finalPrize={finalPrize}
            onSpinComplete={handleSpinComplete}
          />
        </div>

        {/* Draw Button */}
        <button
          onClick={handleDraw}
          disabled={phase !== 'idle'}
          className="relative overflow-hidden rounded-full px-16 py-4 text-xl font-bold tracking-widest transition-all duration-300 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: phase === 'idle'
              ? 'linear-gradient(135deg, #C9341A, #8B1A0A, #C9341A)'
              : 'linear-gradient(135deg, #999, #666, #999)',
            color: '#fff',
            border: '2px solid #C9A22760',
          }}
        >
          {phase === 'idle' && (
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                animation: 'btnShimmer 2s linear infinite',
              }}
            />
          )}
          <span className="relative z-10">
            {phase === 'idle' ? '✦ 開始抽獎 ✦' : phase === 'spinning' ? '抽獎中⋯' : '已抽出'}
          </span>
        </button>

        {phase === 'idle' && (
          <p className="text-[#2D1500]/40 text-xs mt-3 text-center tracking-wider">
            吃完光盤後，請點擊按鈕開始抽獎
          </p>
        )}

        {/* Prize table toggle */}
        <div className="w-full mt-8">
          <button
            onClick={() => setShowTable(!showTable)}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs text-[#C9341A]/60 hover:text-[#C9341A] transition-colors cursor-pointer font-medium"
          >
            <span>{showTable ? '收起' : '查看'}中獎機率表</span>
            <i className={`ri-arrow-${showTable ? 'up' : 'down'}-s-line`} />
          </button>
          {showTable && (
            <div className="mt-2 animate-[fadeIn_0.3s_ease]">
              <PrizeTable />
            </div>
          )}
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="w-full mt-auto">
        <p className="text-[#2D1500]/30 text-xs text-center pb-3">童叟無欺丼飯 · 光盤有獎活動</p>
        <div className="w-full h-3" style={{ background: 'linear-gradient(90deg, #C9A227 0%, #C9341A 30%, #C9A227 60%, #C9341A 80%, #C9A227 100%)' }} />
      </div>

      {phase === 'result' && currentRecord && finalPrize && (
        <PrizeResultCard
          record={currentRecord}
          prize={finalPrize}
          onReset={handleReset}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700;900&display=swap');
        @keyframes btnShimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(200%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
