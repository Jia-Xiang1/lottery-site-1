type LotteryRecord = {
  code: string;
  prizeId: string;
  prizeName: string;
  prizeEmoji: string;
  drawTime: string;
};

type DisplayPrize = {
  id: string;
  name: string;
  category_name?: string;
  product_name?: string;
  emoji: string;
  probability: number;
};

type PrizeResultCardProps = {
  record: LotteryRecord;
  prize: DisplayPrize;
  onReset: () => void;
};

function getCouponCategory(prizeName: string) {
  if (prizeName === '甜點') return '甜點';
  if (prizeName === '特色小菜' ) return '特色小菜';
  if (prizeName === '單點主菜' ) return '單點主菜';

  if (
    prizeName === '現金折$20元' ||
    prizeName === '現金折$50元' ||
    prizeName === '現金折$100元'||
    prizeName === '現金折$200元'
  ) {
    return '現金卷';
  }
  if (prizeName === '下一碗免費') return '特獎類';
  return '其他';
}

export default function PrizeResultCard({
  record,
  prize,
  onReset,
}: PrizeResultCardProps) {
  const category = prize.category_name || getCouponCategory(prize.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5">
      <div
        className="w-full max-w-md rounded-[28px] overflow-hidden bg-white shadow-2xl animate-[fadeIn_0.25s_ease]"
        style={{ border: '2px solid #C9A22755' }}
      >
        <div
          className="px-5 py-4 text-center"
          style={{
            background: 'linear-gradient(135deg, #FFF5F0, #FFF8E8)',
            borderBottom: '1px solid #C9341A20',
          }}
        >
          <div className="text-xs tracking-[0.3em] text-[#C9341A]/70 mb-2">
            抽獎結果
          </div>
          <div className="text-5xl mb-2">{prize.emoji}</div>
          <div className="text-2xl font-bold text-[#C9341A]">{prize.name}</div>
          <div className="text-sm text-[#2D1500]/55 mt-2">
            分類：{category}
          </div>
        </div>

        <div className="px-5 py-5">
          <div
            className="rounded-2xl px-4 py-4 mb-4"
            style={{
              background: '#FFFBF5',
              border: '1px solid #C9A22755',
            }}
          >
            <div className="text-sm text-[#2D1500]/70 leading-7">
              <div>
                <span className="font-semibold text-[#8B1A0A]">抽獎代碼：</span>
                {record.code}
              </div>
              <div>
                <span className="font-semibold text-[#8B1A0A]">抽獎時間：</span>
                {new Date(record.drawTime).toLocaleString()}
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl px-4 py-4 text-sm leading-7"
            style={{
              background: '#FFF7F2',
              border: '1px dashed #C9341A66',
              color: '#8B1A0A',
            }}
          >
            <div className="font-bold mb-2 text-base">請出示本畫面給店員確認</div>
            <div>1. 店員先確認你抽中的獎項。</div>
            <div>2. 再由店員提供對應 QR 或 NFC 進行領券。</div>
            <div>3. 領券後可至「我的優惠券」查看領取日、啟用日、到期日與使用狀態。</div>
          </div>

          <div className="mt-5 flex justify-center">
            <button
              onClick={onReset}
              className="px-8 py-3 rounded-full text-sm font-bold transition-all duration-200 hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #C9341A, #8B1A0A)',
                color: '#fff',
                border: '2px solid #C9A22760',
              }}
            >
              返回首頁
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}