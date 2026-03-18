import { useState, useEffect, useRef } from 'react';
import { PRIZES, type Prize } from '../../../mocks/prizes';

interface LotteryDrumProps {
  isSpinning: boolean;
  finalPrize: Prize | null;
  onSpinComplete: () => void;
}

export default function LotteryDrum({ isSpinning, finalPrize, onSpinComplete }: LotteryDrumProps) {
  const [displayPrize, setDisplayPrize] = useState<Prize>(PRIZES[0]);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isSpinning && finalPrize) {
      runSpin();
    }
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isSpinning, finalPrize]);

  const runSpin = () => {
    if (!finalPrize) return;
    const totalFast = 18;
    const totalSlow = 8;
    const total = totalFast + totalSlow;

    const step = (count: number) => {
      if (count < totalFast) {
        setDisplayPrize(PRIZES[Math.floor(Math.random() * PRIZES.length)]);
        intervalRef.current = setTimeout(() => step(count + 1), 80);
      } else if (count < total - 1) {
        setDisplayPrize(PRIZES[Math.floor(Math.random() * PRIZES.length)]);
        const delay = 120 + (count - totalFast) * 60;
        intervalRef.current = setTimeout(() => step(count + 1), delay);
      } else {
        setDisplayPrize(finalPrize);
        setTimeout(() => onSpinComplete(), 400);
      }
    };
    step(0);
  };

  const prize = displayPrize;

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Outer decorative ring */}
      <div
        className="relative p-2 rounded-full"
        style={{
          background: isSpinning
            ? 'linear-gradient(135deg, #C9341A, #C9A227, #C9341A, #C9A227)'
            : 'linear-gradient(135deg, #C9A227, #C9341A, #C9A227)',
          animation: isSpinning ? 'ringRotate 1s linear infinite' : 'none',
        }}
      >
        {/* Middle ring */}
        <div
          className="p-1 rounded-full"
          style={{ background: '#FFFBF0' }}
        >
          <div
            className="w-64 h-64 rounded-full flex flex-col items-center justify-center relative overflow-hidden"
            style={{
              background: isSpinning
                ? 'linear-gradient(145deg, #FFF8F0, #FFE8D5, #FFF8F0)'
                : 'linear-gradient(145deg, #FFFBF0, #FFF0D5, #FFFBF0)',
              border: '3px solid #C9341A20',
            }}
          >
            {/* Inner wave pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='40' viewBox='0 0 80 40'%3E%3Cpath d='M0 30 Q20 10 40 30 Q60 50 80 30' fill='none' stroke='%23C9341A' stroke-width='2'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
              }}
            />

            {/* Inner decorative rings */}
            <div className="absolute inset-4 rounded-full" style={{ border: '1.5px solid #C9341A20' }} />
            <div className="absolute inset-8 rounded-full" style={{ border: '1px solid #C9A22720' }} />

            {/* Prize display */}
            <div
              className="flex flex-col items-center justify-center z-10 transition-all duration-100"
              style={{ opacity: isSpinning ? 0.9 : 1 }}
            >
              <span
                className="text-6xl mb-2 drop-shadow-lg"
                style={{
                  filter: isSpinning ? 'blur(0.5px)' : 'none',
                  animation: isSpinning ? 'emojiSpin 0.15s ease-in-out infinite' : 'none',
                }}
              >
                {prize.emoji}
              </span>
              <span
                className="font-bold text-center px-4 leading-tight text-lg text-[#C9341A]"
                style={{
                  fontFamily: '\'Noto Serif TC\', serif',
                  filter: isSpinning ? 'blur(0.3px)' : 'none',
                }}
              >
                {prize.name}
              </span>
            </div>

            {/* Shimmer when spinning */}
            {isSpinning && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(201,52,26,0.08) 50%, transparent 70%)',
                  animation: 'shimmer 0.4s linear infinite',
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Decorative dots */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <div
          key={deg}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: deg % 90 === 0 ? '#C9341A' : '#C9A227',
            transform: `rotate(${deg}deg) translateY(-152px)`,
            animation: isSpinning ? `dotPulse 0.4s ease-in-out ${deg / 360}s infinite alternate` : 'none',
          }}
        />
      ))}

      <style>{`
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes emojiSpin {
          0% { transform: scale(0.95) rotate(-3deg); }
          50% { transform: scale(1.05) rotate(3deg); }
          100% { transform: scale(0.95) rotate(-3deg); }
        }
        @keyframes shimmer {
          from { transform: translateX(-100%) rotate(45deg); }
          to { transform: translateX(200%) rotate(45deg); }
        }
        @keyframes dotPulse {
          from { opacity: 0.4; transform: rotate(var(--deg)) translateY(-152px) scale(0.8); }
          to { opacity: 1; transform: rotate(var(--deg)) translateY(-152px) scale(1.2); }
        }
      `}</style>
    </div>
  );
}
