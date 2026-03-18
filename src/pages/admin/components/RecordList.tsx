import { useState } from 'react';
import { formatDate, type LotteryRecord } from '../../../utils/lotteryUtils';

interface RecordListProps {
  records: LotteryRecord[];
  onSelect: (record: LotteryRecord) => void;
  onQuickRedeem: (code: string) => Promise<void>;
  selectedCode: string;
}

export default function RecordList({ records, onSelect, onQuickRedeem, selectedCode }: RecordListProps) {
  const [redeemingCode, setRedeemingCode] = useState<string>('');

  const handleQuickRedeem = async (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    setRedeemingCode(code);
    await onQuickRedeem(code);
    setRedeemingCode('');
  };

  if (records.length === 0) {
    return (
      <div
        className="rounded-xl p-8 text-center text-[#2D1500]/40 text-sm"
        style={{ border: '1.5px dashed #C9341A40' }}
      >
        <i className="ri-inbox-line text-3xl block mb-2 opacity-40" />
        尚無抽獎紀錄
      </div>
    );
  }

  return (
    <div
      className="space-y-2 max-h-96 overflow-y-auto pr-1"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#C9341A transparent' }}
    >
      {records.map((r) => (
        <div
          key={r.code}
          onClick={() => onSelect(r)}
          className="rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer transition-all duration-200"
          style={{
            background: selectedCode === r.code ? '#FFF0E8' : '#FFFBF0',
            border: selectedCode === r.code
              ? '1.5px solid #C9341A'
              : '1.5px solid #C9341A20',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{r.prizeEmoji}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-bold tracking-widest text-[#2D1500]">
                  {r.code}
                </span>
                {r.redeemTime ? (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7' }}
                  >
                    ✓ 已兌換
                  </span>
                ) : (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: '#FFF8E1', color: '#C9A227', border: '1px solid #C9A22760' }}
                  >
                    待兌換
                  </span>
                )}
              </div>
              <div className="text-xs text-[#2D1500]/50 mt-0.5">
                {r.prizeName} · {formatDate(r.drawTime)}
              </div>
            </div>
          </div>

          {!r.redeemTime && (
            <button
              onClick={(e) => handleQuickRedeem(e, r.code)}
              disabled={redeemingCode === r.code}
              className="ml-2 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-all duration-200 hover:opacity-80 disabled:opacity-50 flex items-center gap-1"
              style={{
                background: 'linear-gradient(135deg, #C9341A, #8B1A0A)',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {redeemingCode === r.code ? (
                <><i className="ri-loader-4-line animate-spin" />兌換中</>
              ) : (
                <><i className="ri-gift-2-line" />確認兌換</>
              )}
            </button>
          )}

          {r.redeemTime && (
            <i className="ri-check-double-line text-green-500 ml-2 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
