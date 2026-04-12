import { useEffect, useMemo, useState } from "react";
import { drawPrizeSecure, getAllPrizes, getCurrentPrize, type PrizeItem } from "../../utils/lotteryUtils";

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

function getExpireDate(drawTime: string) {
  const base = new Date(drawTime);
  if (isNaN(base.getTime())) return "";
  const expire = new Date(base);
  expire.setMonth(expire.getMonth() + 1);
  return formatDate(expire);
}

function getStartDate(drawTime: string) {
  const base = new Date(drawTime);
  if (isNaN(base.getTime())) return "";
  return formatDate(base);
}

function formatTime(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString("zh-TW", {
    hour12: false,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function roundRate(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/\.?0+$/, "");
}

export default function HomePage() {
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);
  const [loadingPrizes, setLoadingPrizes] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState("");
  const [lockMessage, setLockMessage] = useState("");
  const [lockUntil, setLockUntil] = useState("");
  const [displayText, setDisplayText] = useState("開始抽獎");
  const [displayEmoji, setDisplayEmoji] = useState("🍚");
  const [result, setResult] = useState<{
    activityName: string;
    prizeName: string;
    note: string;
    startDate: string;
    expireDate: string;
  } | null>(null);

  const activePrizes = useMemo(
    () => prizes.filter((p) => p.is_active),
    [prizes]
  );

  const totalRate = useMemo(() => {
    return activePrizes.reduce((sum, p) => sum + Number(p.weight || 0), 0);
  }, [activePrizes]);

  useEffect(() => {
    void loadPrizes();
    void loadCurrentPrize();
  }, []);

  async function loadPrizes() {
    setLoadingPrizes(true);
    try {
      const data = await getAllPrizes(false);
      setPrizes(data);

      if (data.length > 0) {
        setDisplayText(data[0].product_name || "開始抽獎");
        setDisplayEmoji(data[0].emoji || "🍚");
      }
    } catch (err) {
      console.error(err);
      setError("讀取機率表失敗");
    } finally {
      setLoadingPrizes(false);
    }
  }

  async function loadCurrentPrize() {
    try {
      const data = await getCurrentPrize();

      if (data.status === "active") {
        const record = data.record;
        const name = String(record.prize_name || "").trim();
        const parts = name.split(" ");
        const activityName = parts[0] || "抽獎活動";
        const prizeName = name.replace(activityName, "").trim() || name;

        setResult({
          activityName,
          prizeName,
          note: "",
          startDate: getStartDate(record.draw_time),
          expireDate: getExpireDate(record.draw_time),
        });

        setDisplayText(prizeName);
        setDisplayEmoji(record.prize_emoji || "🎁");
        setLockMessage("此裝置 2 小時內已抽過獎");
        setLockUntil(formatTime(data.expiresAt));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDraw() {
    if (drawing) return;

    setDrawing(true);
    setError("");
    setLockMessage("");
    setResult(null);

    let timer: number | undefined;

    if (activePrizes.length > 0) {
      timer = window.setInterval(() => {
        const randomPrize = activePrizes[Math.floor(Math.random() * activePrizes.length)];
        setDisplayText(randomPrize.product_name || "抽獎中");
        setDisplayEmoji(randomPrize.emoji || "🎁");
      }, 120);
    }

    try {
      const res = await drawPrizeSecure();

      window.setTimeout(() => {
        if (timer) window.clearInterval(timer);

        if (!res.ok && res.locked) {
          setLockMessage(res.message || "2 小時內無法重複抽取");
          setLockUntil(formatTime(res.expiresAt));
          setDisplayText("已抽過");
          setDisplayEmoji("⏳");
          setDrawing(false);
          return;
        }

        if (res.ok) {
          const prize = res.prize;
          const drawTime = res.record?.draw_time || new Date().toISOString();

          setDisplayText(prize.product_name || prize.name || "中獎");
          setDisplayEmoji(prize.emoji || "🎁");

          setResult({
            activityName: prize.category_name || "抽獎活動",
            prizeName: prize.product_name || prize.name || "未命名獎項",
            note: prize.note || "",
            startDate: getStartDate(drawTime),
            expireDate: getExpireDate(drawTime),
          });

          setLockMessage("此裝置 2 小時內已抽過獎");
          setLockUntil(formatTime(res.expiresAt));
        }

        setDrawing(false);
      }, 5000);
    } catch (err) {
      if (timer) window.clearInterval(timer);
      console.error(err);
      setError("抽獎失敗，請稍後再試");
      setDisplayText("抽獎失敗");
      setDisplayEmoji("⚠️");
      setDrawing(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.patternOverlay} />

      <div style={styles.container}>
        <div style={styles.logoWrap}>
          <div style={styles.logoCircle}>
            <div style={styles.logoInner}>童叟無欺</div>
          </div>
        </div>

        <div style={styles.titleGroup}>
          <div style={styles.subTitleLine}>
            <span style={styles.subLine} />
            <span style={styles.subTitle}>吃飽就有獎</span>
            <span style={styles.subLine} />
          </div>

          <h1 style={styles.mainTitle}>童叟無欺！開抽！</h1>
          <div style={styles.desc}>光盤有獎，吃乾淨就能抽</div>
        </div>

        <div style={styles.midDivider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerIcon}>⊕</span>
          <span style={styles.dividerLine} />
        </div>

        <div style={styles.wheelArea}>
          <span style={{ ...styles.dot, top: -8, left: "50%", transform: "translateX(-50%)", background: "#d6421f" }} />
          <span style={{ ...styles.dot, top: 42, left: 20, background: "#d6a621" }} />
          <span style={{ ...styles.dot, top: 42, right: 20, background: "#d6a621" }} />
          <span style={{ ...styles.dot, top: "50%", left: -10, transform: "translateY(-50%)", background: "#d6421f" }} />
          <span style={{ ...styles.dot, top: "50%", right: -10, transform: "translateY(-50%)", background: "#d6421f" }} />
          <span style={{ ...styles.dot, bottom: 42, left: 20, background: "#d6a621" }} />
          <span style={{ ...styles.dot, bottom: 42, right: 20, background: "#d6a621" }} />
          <span style={{ ...styles.dot, bottom: -8, left: "50%", transform: "translateX(-50%)", background: "#d6421f" }} />

          <div style={styles.wheelOuter}>
            <div style={styles.wheelInner}>
              <div style={styles.wheelContent}>
                <div style={{ ...styles.wheelEmoji, ...(drawing ? styles.wheelEmojiSpinning : {}) }}>
                  {displayEmoji}
                </div>
                <div style={{ ...styles.wheelText, ...(drawing ? styles.wheelTextSpinning : {}) }}>
                  {displayText}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDraw}
          disabled={drawing || activePrizes.length === 0}
          style={{
            ...styles.drawButton,
            ...(drawing || activePrizes.length === 0 ? styles.drawButtonDisabled : {}),
          }}
        >
          ✦ 開始抽獎 ✦
        </button>

        <div style={styles.tip}>吃完光盤後，請點擊按鈕開始抽獎</div>

        {!!error && <div style={styles.errorBox}>{error}</div>}

        {!!lockMessage && (
          <div style={styles.noticeBox}>
            <div>{lockMessage}</div>
            {!!lockUntil && <div style={{ marginTop: 6 }}>可再次抽獎時間：{lockUntil}</div>}
          </div>
        )}

        {result && (
          <div style={styles.resultCard}>
            <div style={styles.resultBadge}>恭喜中獎</div>
            <div style={styles.resultActivity}>{result.activityName}</div>
            <div style={styles.resultPrize}>{result.prizeName}</div>

            {!!result.note && (
              <div style={styles.resultNoteBox}>
                <div style={styles.resultLabel}>備註</div>
                <div style={styles.resultNote}>{result.note}</div>
              </div>
            )}

            <div style={styles.resultDateBox}>
              <div style={styles.resultLabel}>使用期限</div>
              <div style={styles.resultDate}>
                {result.startDate}
                <br />～
                <br />
                {result.expireDate}
              </div>
            </div>
          </div>
        )}

        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <span>中獎機率表</span>
            <span>總機率：{roundRate(totalRate)}%</span>
          </div>

          {loadingPrizes ? (
            <div style={styles.emptyBox}>載入中...</div>
          ) : activePrizes.length === 0 ? (
            <div style={styles.emptyBox}>目前沒有可抽獎項</div>
          ) : (
            <div style={styles.prizeList}>
              {activePrizes.map((item) => (
                <div key={item.id} style={styles.prizeRow}>
                  <div style={styles.prizeRowLeft}>
                    <div style={styles.prizeName}>
                      {item.category_name}｜{item.product_name}
                    </div>
                    {!!item.note && (
                      <div style={styles.prizeNote}>備註：{item.note}</div>
                    )}
                  </div>
                  <div style={styles.prizeRate}>
                    {roundRate(Number(item.weight || 0))}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.adminLinkWrap}>
          <a href="#/admin" style={styles.adminLink}>
            後台管理
          </a>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    position: "relative",
    background: "#f8f4e8",
    overflowX: "hidden",
  },
  patternOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(circle at 20px 20px, rgba(216,74,40,0.03) 2px, transparent 2px), linear-gradient(rgba(223,122,94,0.10) 2px, transparent 2px)",
    backgroundSize: "80px 80px, 100% 88px",
    pointerEvents: "none",
  },
  container: {
    position: "relative",
    zIndex: 1,
    maxWidth: 760,
    margin: "0 auto",
    padding: "28px 16px 40px",
    textAlign: "center",
  },
  logoWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 18,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #d38d1e 0%, #d63e1d 100%)",
    padding: 6,
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },
  logoInner: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "#f7ecd8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#5b2d1a",
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: "0.08em",
  },
  titleGroup: {
    marginBottom: 24,
  },
  subTitleLine: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 10,
  },
  subLine: {
    width: 90,
    height: 2,
    background: "#c97d61",
    opacity: 0.65,
  },
  subTitle: {
    color: "#c36d4c",
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: "0.18em",
  },
  mainTitle: {
    margin: 0,
    fontSize: 46,
    lineHeight: 1.15,
    color: "#c83a1f",
    fontWeight: 900,
    letterSpacing: "0.04em",
  },
  desc: {
    marginTop: 12,
    color: "#9e8b79",
    fontSize: 18,
    fontWeight: 500,
  },
  midDivider: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    margin: "30px 0 24px",
  },
  dividerLine: {
    width: 150,
    height: 2,
    background: "#ddc6b7",
  },
  dividerIcon: {
    color: "#d1a52c",
    fontSize: 28,
    lineHeight: 1,
  },
  wheelArea: {
    position: "relative",
    width: 520,
    maxWidth: "100%",
    margin: "0 auto 26px",
    padding: "24px 16px",
  },
  dot: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: "50%",
  },
  wheelOuter: {
    width: "100%",
    aspectRatio: "1 / 1",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #cf8b18 0%, #d43d1f 100%)",
    padding: 12,
    boxShadow: "0 10px 24px rgba(162,64,26,0.14)",
  },
  wheelInner: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "#fff8ef",
    border: "6px solid #f0d5c6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  wheelContent: {
    width: "82%",
    height: "82%",
    borderRadius: "50%",
    border: "2px solid rgba(219,179,120,0.35)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    boxSizing: "border-box",
  },
  wheelEmoji: {
    fontSize: 70,
    lineHeight: 1,
    marginBottom: 14,
    transition: "transform 0.2s ease",
  },
  wheelEmojiSpinning: {
    transform: "scale(1.08)",
  },
  wheelText: {
    color: "#c83a1f",
    fontSize: 34,
    fontWeight: 900,
    lineHeight: 1.2,
    wordBreak: "break-word",
    transition: "transform 0.2s ease",
  },
  wheelTextSpinning: {
    transform: "scale(1.06)",
  },
  drawButton: {
    width: "100%",
    maxWidth: 460,
    minHeight: 78,
    borderRadius: 40,
    border: "3px solid #d08e1d",
    background: "linear-gradient(135deg, #d84421 0%, #a61712 100%)",
    color: "#fff",
    fontSize: 26,
    fontWeight: 900,
    letterSpacing: "0.08em",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(173,46,25,0.14)",
  },
  drawButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  tip: {
    marginTop: 18,
    color: "#b7a18f",
    fontSize: 16,
  },
  errorBox: {
    marginTop: 18,
    background: "#fff1ef",
    color: "#b42318",
    border: "1px solid #f2c4bf",
    borderRadius: 18,
    padding: "14px 16px",
  },
  noticeBox: {
    marginTop: 18,
    background: "#fff7eb",
    color: "#8c5b1c",
    border: "1px solid #f0c98e",
    borderRadius: 18,
    padding: "14px 16px",
    lineHeight: 1.7,
  },
  resultCard: {
    maxWidth: 560,
    margin: "24px auto 0",
    background: "#fff",
    borderRadius: 28,
    padding: "22px 18px",
    boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
  },
  resultBadge: {
    display: "inline-block",
    padding: "8px 16px",
    borderRadius: 999,
    background: "#fff1e8",
    color: "#b63317",
    fontWeight: 900,
    marginBottom: 10,
  },
  resultActivity: {
    color: "#8b1a0a",
    fontWeight: 800,
    fontSize: 18,
    marginBottom: 8,
  },
  resultPrize: {
    color: "#c83a1f",
    fontSize: 36,
    fontWeight: 900,
    lineHeight: 1.2,
    marginBottom: 16,
  },
  resultNoteBox: {
    background: "#faf7f2",
    border: "1px solid #eee0d1",
    borderRadius: 18,
    padding: 14,
    textAlign: "left",
    marginBottom: 14,
  },
  resultDateBox: {
    background: "#fffaf1",
    border: "1px solid #f1ddb3",
    borderRadius: 18,
    padding: 14,
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: 800,
    color: "#8b1a0a",
    marginBottom: 8,
  },
  resultNote: {
    color: "#5c4f48",
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  resultDate: {
    fontSize: 18,
    fontWeight: 800,
    color: "#6d4b1e",
    lineHeight: 1.8,
  },
  tableCard: {
    maxWidth: 700,
    margin: "28px auto 0",
    background: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 8px 22px rgba(0,0,0,0.05)",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    padding: "16px 18px",
    borderBottom: "1px solid #f1e3d6",
    color: "#d1421f",
    fontWeight: 900,
    fontSize: 18,
  },
  emptyBox: {
    padding: "26px 18px",
    color: "#888",
  },
  prizeList: {
    display: "grid",
  },
  prizeRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    padding: "16px 18px",
    borderBottom: "1px solid #f7eee7",
  },
  prizeRowLeft: {
    minWidth: 0,
    flex: 1,
    textAlign: "left",
  },
  prizeName: {
    color: "#2f2826",
    fontWeight: 800,
    fontSize: 16,
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  prizeNote: {
    marginTop: 6,
    color: "#8a7f78",
    fontSize: 13,
    lineHeight: 1.6,
    wordBreak: "break-word",
  },
  prizeRate: {
    color: "#9d6a2d",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  adminLinkWrap: {
    marginTop: 28,
  },
  adminLink: {
    color: "#b55a38",
    textDecoration: "none",
    fontWeight: 700,
  },
};