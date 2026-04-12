type LotteryRecord = {
  code: string;
  prizeId: string;
  prizeName: string;
  prizeEmoji: string;
  drawTime: string;
};

type Prize = {
  id: string;
  name: string;
  category_name?: string;
  product_name?: string;
  emoji: string;
  probability: number;
  remark?: string;
};

type Props = {
  record: LotteryRecord;
  prize: Prize;
  onReset: () => void;
};

export default function PrizeResultCard({ record, prize, onReset }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center px-5">
      <div
        className="w-full max-w-md rounded-[28px] overflow-hidden bg-white shadow-2xl"
        style={{ border: '2px solid #C9A22770' }}
      >
        <div
          className="px-6 py-5 text-center"
          style={{
            background: 'linear-gradient(135deg, #FFF7ED, #FFFDF7)',
          }}
        >
          <div className="text-5xl mb-3">{prize.emoji}</div>
          <div className="text-sm text-[#C9341A] tracking-[0.25em] font-bold mb-2">
            恭喜中獎
          </div>
          <div className="text-2xl font-black text-[#2D1500]">
            {prize.name}
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {!!prize.remark && (
            <div
              className="rounded-2xl px-4 py-4 text-sm leading-7"
              style={{
                background: '#FFF9EF',
                border: '1px solid #C9A22755',
                color: '#6B4B1F',
              }}
            >
              <div className="font-bold text-[#C9341A] mb-1">獎項備註</div>
              <div>{prize.remark}</div>
            </div>
          )}

          <div className="text-xs text-[#2D1500]/65 leading-6">
            <div>兌換碼：{record.code}</div>
            <div>抽獎時間：{new Date(record.drawTime).toLocaleString()}</div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-full py-3 text-base font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #C9341A, #8B1A0A)',
            }}
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}