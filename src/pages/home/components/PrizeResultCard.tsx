import { useEffect, useState } from 'react';
import { type LotteryRecord, formatDate } from '../../../utils/lotteryUtils';
import { type Prize } from '../../../mocks/prizes';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  size: number;
}

interface PrizeResultCardProps {
  record: LotteryRecord;
  prize: Prize;
  onReset: () => void;
}

export default function PrizeResultCard({ record, prize, onReset }: PrizeResultCardProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
    const colors = ['#C9341A', '#C9A227', '#FFD700', '#FF6B35', '#E8372B', '#FFC107', '#FF8C42'];
    const newParticles: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 50,
      y: 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      size: 6 + Math.random() * 8,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2500);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(record.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isGrandPrize = prize.id === 'free';
  const isBigPrize = prize.id === 'cash100' || prize.id === 'free';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(45,21,0,0.6)', backdropFilter: 'blur(6px)' }}
    >
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-sm"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size / 2,
              backgroundColor: p.color,
              transform: `rotate(${p.rotation}deg)`,
              animation: `confettiFall ${1.5 + Math.random()}s ease-out forwards`,
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Result Card */}
      <div
        className="relative mx-4 w-full max-w-sm rounded-2xl overflow-hidden bg-white"
        style={{
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(40px)',
          opacity: visible ? 1 : 0,
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          border: isBigPrize ? '3px solid #C9341A' : '2px solid #C9341A60',
        }}
      >
        {/* Top colored band */}
        <div
          className="h-3 w-full"
          style={{ background: 'linear-gradient(90deg, #C9341A, #C9A227, #C9341A, #C9A227, #C9341A)' }}
        />

        {/* Header */}
        <div
          className="text-center pt-6 pb-4 px-6"
          style={{ background: 'linear-gradient(180deg, #FFF5F0 0%, #FFFFFF 100%)' }}
        >
          {isGrandPrize && (
            <div
              className="text-xs font-bold tracking-widest mb-2 px-4 py-1 rounded-full inline-block"
              style={{
                background: 'linear-gradient(90deg, #C9341A, #C9A227, #C9341A)',
                color: '#fff',
                animation: 'headerPulse 0.8s ease-in-out infinite alternate',
              }}
            >
              ★ 恭喜中大獎 ★
            </div>
          )}
          <div
            className="text-5xl mb-3"
            style={{ animation: 'bounceIn 0.5s ease-out' }}
          >
            {prize.emoji}
          </div>
          <h2 className="text-2xl font-bold mb-1 text-[#C9341A]">
            {prize.name}
          </h2>
          <p className="text-xs text-[#2D1500]/60 leading-relaxed">{prize.description}</p>
        </div>

        {/* Divider with wave */}
        <div className="relative h-3 overflow-hidden" style={{ background: '#FFF8F0' }}>
          <svg viewBox="0 0 300 12" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0 6 Q37.5 0 75 6 Q112.5 12 150 6 Q187.5 0 225 6 Q262.5 12 300 6" fill="none" stroke="#C9341A30" strokeWidth="2"/>
          </svg>
        </div>

        {/* Info section */}
        <div className="px-6 py-4 space-y-3 bg-white">
          {/* Serial number */}
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: '#FFF5F0', border: '1.5px solid #C9341A30' }}
          >
            <div className="text-[#C9341A]/60 text-xs mb-1 tracking-widest font-medium">抽獎序號</div>
            <div
              className="text-3xl font-mono font-bold tracking-widest text-[#C9341A]"
              style={{ letterSpacing: '0.2em' }}
            >
              {record.code}
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-[#2D1500]/60 text-sm">
            <i className="ri-calendar-line text-[#C9341A]" />
            <span>{formatDate(record.drawTime)}</span>
          </div>
        </div>

        {/* Bottom instruction */}
        <div
          className="mx-6 mb-4 rounded-lg p-3 text-center text-xs text-[#2D1500]/60 leading-relaxed"
          style={{ background: '#FFF8F0', border: '1px solid #C9341A15' }}
        >
          <i className="ri-camera-line mr-1 text-[#C9341A]" />
          請截圖保存此畫面，出示給店員核對序號兌換獎項
        </div>

        {/* Buttons */}
        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer"
            style={{
              background: '#FFF5F0',
              border: '1.5px solid #C9341A40',
              color: '#C9341A',
            }}
          >
            <i className={`${copied ? 'ri-check-line' : 'ri-file-copy-line'} mr-1`} />
            {copied ? '已複製' : '複製序號'}
          </button>
          <button
            onClick={onReset}
            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #C9341A, #8B1A0A)',
              color: '#fff',
            }}
          >
            <i className="ri-arrow-go-back-line mr-1" />
            返回
          </button>
        </div>

        {/* Bottom band */}
        <div
          className="h-3 w-full"
          style={{ background: 'linear-gradient(90deg, #C9A227, #C9341A, #C9A227, #C9341A, #C9A227)' }}
        />
      </div>

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(300px) rotate(720deg); opacity: 0; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes headerPulse {
          from { opacity: 0.85; }
          to { opacity: 1; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}
