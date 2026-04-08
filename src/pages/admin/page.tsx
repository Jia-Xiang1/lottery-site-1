import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type PrizeConfig = {
  sortOrder: number | string;
  id: string;
  品項名稱: string;
  機率: number | string;
  分類: string;
  couponNameCode: string;
  啟用方式: "same_day" | "next_day" | "fixed_date";
  指定啟用日: string;
  有效月數: number | string;
  備註: string;
  啟用: boolean | string;
};

const API_BASE = "https://script.google.com/macros/s/AKfycbwqNjpZqi4i_YI-XlwoOIhiP6oLs2mpaqxwruaHJP-vNvY9UN6kVItjpGpsBCh3u0IK/exec";

const emptyForm = {
  id: "",
  name: "",
  rate: "0",
  category: "",
  couponNameCode: "",
  activationType: "same_day" as "same_day" | "next_day" | "fixed_date",
  fixedActivateDate: "",
  validMonths: "1",
  note: "",
  enabled: true,
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<PrizeConfig[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const selectedItem = useMemo(
    () => items.find((item) => String(item.id) === String(selectedId)),
    [items, selectedId]
  );

  const filteredItems = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return items;

    return items.filter((item) => {
      const text = [
        item.id,
        item.品項名稱,
        item.分類,
        item.couponNameCode,
      ]
        .map((v) => String(v || "").toLowerCase())
        .join(" ");

      return text.includes(kw);
    });
  }, [items, keyword]);

  const totalRate = useMemo(() => {
    return items.reduce((sum, item) => {
      const n = Number(item.機率 || 0);
      return sum + (isNaN(n) ? 0 : n);
    }, 0);
  }, [items]);

  useEffect(() => {
    fetchPrizeConfigs();
  }, []);

  useEffect(() => {
    if (!selectedItem || isCreating) return;

    setForm({
      id: String(selectedItem.id || ""),
      name: String(selectedItem.品項名稱 || ""),
      rate: String(selectedItem.機率 ?? ""),
      category: String(selectedItem.分類 || ""),
      couponNameCode: String(selectedItem.couponNameCode || ""),
      activationType:
        (selectedItem.啟用方式 as "same_day" | "next_day" | "fixed_date") ||
        "same_day",
      fixedActivateDate: normalizeDateInput(selectedItem.指定啟用日 || ""),
      validMonths: String(selectedItem.有效月數 ?? "1"),
      note: String(selectedItem.備註 || ""),
      enabled:
        selectedItem.啟用 === true ||
        String(selectedItem.啟用).toLowerCase() === "true" ||
        String(selectedItem.啟用) === "1",
    });
  }, [selectedItem, isCreating]);

  async function fetchPrizeConfigs() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}?action=getPrizeConfigs`);
      const json = await res.json();

      if (!json.success) {
        alert(json.message || "讀取失敗");
        return;
      }

      setItems(json.data || []);
    } catch (err) {
      console.error(err);
      alert("讀取獎項設定失敗");
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setIsCreating(true);
    setSelectedId("");
    setForm(emptyForm);
  }

  function selectItem(id: string) {
    setIsCreating(false);
    setSelectedId(id);
  }

  function resetEditor() {
    setIsCreating(false);
    setSelectedId("");
    setForm(emptyForm);
  }

  function validateForm() {
    if (!form.name.trim()) {
      alert("請輸入品項名稱");
      return false;
    }

    const rate = Number(form.rate);
    if (isNaN(rate) || rate < 0) {
      alert("機率格式錯誤");
      return false;
    }

    const validMonths = Number(form.validMonths);
    if (isNaN(validMonths) || validMonths < 0) {
      alert("有效月數格式錯誤");
      return false;
    }

    if (form.activationType === "fixed_date" && !form.fixedActivateDate) {
      alert("請選擇指定啟用日");
      return false;
    }

    return true;
  }

  async function handleCreate() {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const params = new URLSearchParams({
        action: "createPrizeConfig",
        name: form.name,
        rate: String(Number(form.rate)),
        category: form.category,
        couponNameCode: form.couponNameCode,
        activationType: form.activationType,
        fixedActivateDate:
          form.activationType === "fixed_date" ? form.fixedActivateDate : "",
        validMonths: String(Number(form.validMonths)),
        note: form.note,
        enabled: String(form.enabled),
      });

      const res = await fetch(`${API_BASE}?${params.toString()}`);
      const json = await res.json();

      if (!json.success) {
        alert(json.message || "新增失敗");
        return;
      }

      alert("新增成功");
      resetEditor();
      await fetchPrizeConfigs();
    } catch (err) {
      console.error(err);
      alert("新增失敗");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const params = new URLSearchParams({
        action: "updatePrizeConfig",
        id: form.id,
        name: form.name,
        rate: String(Number(form.rate)),
        category: form.category,
        couponNameCode: form.couponNameCode,
        activationType: form.activationType,
        fixedActivateDate:
          form.activationType === "fixed_date" ? form.fixedActivateDate : "",
        validMonths: String(Number(form.validMonths)),
        note: form.note,
        enabled: String(form.enabled),
      });

      const res = await fetch(`${API_BASE}?${params.toString()}`);
      const json = await res.json();

      if (!json.success) {
        alert(json.message || "儲存失敗");
        return;
      }

      alert("更新成功");
      await fetchPrizeConfigs();
    } catch (err) {
      console.error(err);
      alert("更新失敗");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedId) {
      alert("請先選擇品項");
      return;
    }

    const ok = window.confirm("確定要刪除這個品項嗎？刪除後無法復原。");
    if (!ok) return;

    setSaving(true);
    try {
      const params = new URLSearchParams({
        action: "deletePrizeConfig",
        id: selectedId,
      });

      const res = await fetch(`${API_BASE}?${params.toString()}`);
      const json = await res.json();

      if (!json.success) {
        alert(json.message || "刪除失敗");
        return;
      }

      alert("刪除成功");
      resetEditor();
      await fetchPrizeConfigs();
    } catch (err) {
      console.error(err);
      alert("刪除失敗");
    } finally {
      setSaving(false);
    }
  }

  async function handleMove(direction: "up" | "down", id: string) {
    setSaving(true);
    try {
      const params = new URLSearchParams({
        action: "movePrizeConfig",
        id,
        direction,
      });

      const res = await fetch(`${API_BASE}?${params.toString()}`);
      const json = await res.json();

      if (!json.success) {
        alert(json.message || "排序失敗");
        return;
      }

      await fetchPrizeConfigs();
    } catch (err) {
      console.error(err);
      alert("排序失敗");
    } finally {
      setSaving(false);
    }
  }

  const editorTitle = isCreating ? "新增品項" : "品項詳細設定";

  return (
    <div style={styles.page}>
      <div style={styles.card}>
       <div style={styles.topHeader}>
        <h1 style={styles.title}>後台管理系統</h1>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => navigate("/")}
           >
            返回前台
          </button>

          <button
            type="button"
            style={styles.addButton}
            onClick={startCreate}
          >
            ＋ 新增品項
          </button>
        </div>
      </div>

        <div style={styles.notice}>
          目前總機率：<b>{totalRate}%</b>
          {Math.abs(totalRate - 100) > 0.0001 && (
            <span style={styles.warn}>（提醒：總和不為 100%，仍可運作）</span>
          )}
        </div>

        <h2 style={styles.sectionTitle}>全部品項</h2>

        <div style={styles.searchWrap}>
          <input
            style={styles.searchInput}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜尋品項名稱 / 分類 / code / id"
          />
        </div>

        {loading ? (
          <div style={styles.empty}>載入中...</div>
        ) : filteredItems.length === 0 ? (
          <div style={styles.empty}>查無符合的品項</div>
        ) : (
          <div style={styles.list}>
            {filteredItems.map((item, index) => {
              const active = !isCreating && String(item.id) === String(selectedId);
              const enabled =
                item.啟用 === true ||
                String(item.啟用).toLowerCase() === "true" ||
                String(item.啟用) === "1";

              return (
                <div
                  key={item.id}
                  style={{
                    ...styles.listItemWrap,
                    ...(active ? styles.listItemWrapActive : {}),
                  }}
                >
                  <button
                    style={styles.listItemButton}
                    onClick={() => selectItem(String(item.id))}
                  >
                    <div style={styles.itemTopRow}>
                      <span style={styles.itemName}>
                        {item.sortOrder}. {item.品項名稱}
                      </span>
                      <span style={styles.itemRate}>{item.機率}%</span>
                    </div>

                    <div style={styles.itemSubRow}>
                      <span>{item.分類 || "未分類"}</span>
                      <span>{item.couponNameCode || "-"}</span>
                    </div>

                    <div style={styles.itemSubRow2}>
                      <span>ID：{item.id}</span>
                      <span>{enabled ? "啟用中" : "未啟用"}</span>
                    </div>
                  </button>

                  <div style={styles.sortButtons}>
                    <button
                      style={styles.sortButton}
                      disabled={saving || index === 0}
                      onClick={() => handleMove("up", String(item.id))}
                    >
                      ↑
                    </button>
                    <button
                      style={styles.sortButton}
                      disabled={saving || index === filteredItems.length - 1}
                      onClick={() => handleMove("down", String(item.id))}
                    >
                      ↓
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>{editorTitle}</h2>

        {!isCreating && !selectedId ? (
          <div style={styles.empty}>請先點擊上方某個品項，或按「新增品項」</div>
        ) : (
          <>
            <div style={styles.formGrid}>
              {!isCreating && (
                <Field label="品項 ID">
                  <input style={styles.inputDisabled} value={form.id} disabled />
                </Field>
              )}

              <Field label="品項名稱">
                <input
                  style={styles.input}
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </Field>

              <Field label="機率 (%)">
                <input
                  style={styles.input}
                  type="number"
                  step="0.1"
                  value={form.rate}
                  onChange={(e) => setForm((p) => ({ ...p, rate: e.target.value }))}
                />
              </Field>

              <Field label="分類">
                <input
                  style={styles.input}
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                />
              </Field>

              <Field label="couponNameCode">
                <input
                  style={styles.input}
                  value={form.couponNameCode}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, couponNameCode: e.target.value }))
                  }
                />
              </Field>

              <Field label="啟用方式">
                <select
                  style={styles.input}
                  value={form.activationType}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      activationType: e.target.value as
                        | "same_day"
                        | "next_day"
                        | "fixed_date",
                    }))
                  }
                >
                  <option value="same_day">當天使用</option>
                  <option value="next_day">隔天使用</option>
                  <option value="fixed_date">指定日期使用</option>
                </select>
              </Field>

              <Field label="指定啟用日">
                <input
                  style={{
                    ...styles.input,
                    opacity: form.activationType === "fixed_date" ? 1 : 0.55,
                  }}
                  type="date"
                  disabled={form.activationType !== "fixed_date"}
                  value={form.fixedActivateDate}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      fixedActivateDate: e.target.value,
                    }))
                  }
                />
              </Field>

              <Field label="有效月數">
                <select
                  style={styles.input}
                  value={form.validMonths}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, validMonths: e.target.value }))
                  }
                >
                  <option value="0">0 個月（當日）</option>
                  <option value="1">1 個月</option>
                  <option value="2">2 個月</option>
                  <option value="3">3 個月</option>
                  <option value="6">6 個月</option>
                  <option value="12">12 個月</option>
                </select>
              </Field>

              <Field label="是否啟用">
                <select
                  style={styles.input}
                  value={String(form.enabled)}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      enabled: e.target.value === "true",
                    }))
                  }
                >
                  <option value="true">啟用</option>
                  <option value="false">停用</option>
                </select>
              </Field>
            </div>

            <Field label="備註">
              <textarea
                style={styles.textarea}
                rows={5}
                value={form.note}
                onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                placeholder="例如：限內用、不得與其他優惠併用、僅限平日使用、需提前出示..."
              />
            </Field>

            <div style={styles.actionRow}>
              <button
                style={styles.secondaryButton}
                onClick={resetEditor}
                disabled={saving}
              >
                返回列表
              </button>

              {isCreating ? (
                <button
                  style={styles.primaryButton}
                  onClick={handleCreate}
                  disabled={saving}
                >
                  {saving ? "新增中..." : "新增品項"}
                </button>
              ) : (
                <>
                  <button
                    style={styles.dangerButton}
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    {saving ? "處理中..." : "刪除品項"}
                  </button>
                  <button
                    style={styles.primaryButton}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "儲存中..." : "儲存設定"}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={styles.fieldWrap}>
      <div style={styles.label}>{label}</div>
      {children}
    </div>
  );
}

function normalizeDateInput(v: string) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "";

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f6f8",
    padding: "20px 14px 40px",
  },
  card: {
    maxWidth: 920,
    margin: "0 auto 18px",
    background: "#fff",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  },
  topHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
  },
  addButton: {
    minHeight: 44,
    padding: "0 16px",
    borderRadius: 12,
    border: "none",
    background: "#111",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  sectionTitle: {
    margin: "0 0 14px",
    fontSize: 20,
    fontWeight: 700,
  },
  notice: {
    marginBottom: 16,
    padding: "12px 14px",
    borderRadius: 12,
    background: "#f7f7f7",
    fontSize: 15,
  },
  warn: {
    marginLeft: 8,
    color: "#c62828",
    fontWeight: 700,
  },
  searchWrap: {
    marginBottom: 14,
  },
  searchInput: {
    width: "100%",
    minHeight: 46,
    borderRadius: 12,
    border: "1px solid #ddd",
    padding: "0 14px",
    fontSize: 15,
    background: "#fff",
    boxSizing: "border-box",
  },
  empty: {
    padding: "24px 12px",
    textAlign: "center",
    color: "#666",
    background: "#fafafa",
    borderRadius: 12,
  },
  list: {
    display: "grid",
    gap: 10,
  },
  listItemWrap: {
    display: "flex",
    gap: 10,
    alignItems: "stretch",
    border: "1px solid #e6e6e6",
    borderRadius: 14,
    background: "#fff",
    overflow: "hidden",
  },
  listItemWrapActive: {
    border: "1px solid #111",
    background: "#f9f9f9",
  },
  listItemButton: {
    flex: 1,
    border: "none",
    background: "transparent",
    textAlign: "left",
    padding: 14,
    cursor: "pointer",
  },
  sortButtons: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 6,
    padding: 10,
    borderLeft: "1px solid #eee",
    background: "#fafafa",
  },
  sortButton: {
    width: 40,
    height: 36,
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 700,
  },
  itemTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
  },
  itemSubRow: {
    display: "flex",
    justifyContent: "space-between",
    color: "#666",
    fontSize: 13,
    marginBottom: 4,
  },
  itemSubRow2: {
    display: "flex",
    justifyContent: "space-between",
    color: "#888",
    fontSize: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 700,
  },
  itemRate: {
    fontSize: 15,
    fontWeight: 700,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },
  fieldWrap: {
    marginBottom: 14,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 700,
  },
  input: {
    width: "100%",
    minHeight: 46,
    borderRadius: 12,
    border: "1px solid #ddd",
    padding: "0 12px",
    fontSize: 15,
    background: "#fff",
    boxSizing: "border-box",
  },
  inputDisabled: {
    width: "100%",
    minHeight: 46,
    borderRadius: 12,
    border: "1px solid #e2e2e2",
    padding: "0 12px",
    fontSize: 15,
    background: "#f3f3f3",
    color: "#777",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid #ddd",
    padding: 12,
    fontSize: 15,
    resize: "vertical",
    background: "#fff",
    boxSizing: "border-box",
  },
  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 18,
    flexWrap: "wrap",
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    border: "none",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    minWidth: 140,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    border: "1px solid #ddd",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    minWidth: 140,
  },
  dangerButton: {
    flex: 1,
    minHeight: 48,
    border: "none",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    background: "#d32f2f",
    color: "#fff",
    cursor: "pointer",
    minWidth: 140,
  },
};