import { PRIZES } from '../../../mocks/prizes';

export default function PrizeTable() {
  return (
    <div
      className="rounded-2xl overflow-hidden bg-white"
      style={{ border: '2px solid #C9341A25' }}
    >
      <div
        className="text-center py-3 px-4 text-sm font-bold tracking-widest text-[#C9341A] flex items-center justify-center gap-2"
        style={{
          fontFamily: '\'Noto Serif TC\', serif',
          background: '#FFF5F0',
          borderBottom: '1.5px solid #C9341A20',
        }}
      >
        <span className="text-[#C9A227]">✦</span>
        中獎機率表
        <span className="text-[#C9A227]">✦</span>
      </div>
      <div className="divide-y" style={{ borderColor: '#C9341A10' }}>
        {PRIZES.map((prize) => (
          <div key={prize.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-[#FFF8F0] transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">{prize.emoji}</span>
              <span
                className="text-sm text-[#2D1500]/80"
                style={{ fontFamily: '\'Noto Serif TC\', serif' }}
              >
                {prize.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${Math.max(prize.probability * 2, 4)}px`,
                  background: `linear-gradient(90deg, #C9341A, #C9A227)`,
                  minWidth: '4px',
                  maxWidth: '70px',
                }}
              />
              <span
                className="text-xs font-mono font-bold min-w-12 text-right text-[#C9341A]"
              >
                {prize.probability}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
