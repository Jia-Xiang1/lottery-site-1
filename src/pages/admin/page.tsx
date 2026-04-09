import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addPrize,
  deletePrize,
  getAllPrizes,
  updatePrize,
  type PrizeItem,
} from "../../utils/lotteryUtils";

type PrizeConfig = {
  sortOrder: number | string;
  id: string;
  品項名稱: string;
  分類: string;
  商品名稱: string;
  emoji: string;
  機率: number | string;
  couponNameCode: string;
  啟用方式: "same_day" | "next_day" | "fixed_date";
  指定啟用日: string;
  有效月數: number | string;
  備註: string;
  啟用: boolean | string;
};

const ADMIN_PASSWORDS = ["riceking168", "xiang1224"];

const emptyForm = {
  id: "",
  category: "",
  productName: "",
  emoji: "🎁",
  rate: "0",
  couponNameCode: "",
  activationType: "same_day" as "same_day" | "next_day" | "fixed_date",
  fixedActivateDate: "",
  validMonths: "1",
  note: "",
  enabled: true,
};

function toPrizeConfig(item: PrizeItem): PrizeConfig {
  return {
    sortOrder: item.sort_order,
    id: item.id,
    品項名稱: `${item.category_name ?? ""} ${item.product_name ?? ""}`.trim(),
    分類: item.category_name ?? "",
    商品名稱: item.product_name ?? "",
    emoji: item.emoji ?? "🎁",
    機率: Number(item.weight ?? 0),
    couponNameCode: item.coupon_name_code ?? "",
    啟用方式: (item.activation_type ?? "same_day") as
      | "same_day"
      | "next_day"
      | "fixed_date",
    指定啟用日: item.fixed_activate_date ?? "",
    有效月數: Number(item.valid_months ?? 1),
    備註: item.note ?? "",
    啟用: Boolean(item.is_active),
  };
}

export default function AdminPage() {
  const navigate = useNavigate();

  const [passwordInput, setPasswordInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(
    sessionStorage.getItem("admin_unlocked") === "true"
  );

  const [items, setItems] = useState<PrizeConfig[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateBox, setShowCreateBox] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const selectedItem = useMemo(
    () => items.find((item) => String(item.id) === String(selectedId)),
    [items, selectedId]
  );

  const filteredItems = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return items;

    return items.filter((item) => {
      const text = [item.品項名稱, item.分類, item.商品名稱, item.couponNameCode]
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
    if (isUnlocked) {
      fetchPrizeConfigs();
    }
  }, [isUnlocked]);

  useEffect(() => {
    if (!selectedItem || isCreating) return;

    setForm({
      id: String(selectedItem.id || ""),
      category: String(selectedItem.分類 || ""),
      productName: String(selectedItem.商品名稱 || ""),
      emoji: String(selectedItem.emoji || "🎁"),
      rate: String(selectedItem.機率 ?? "0"),
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
      const data = await getAllPrizes(true);
      setItems(data.map(toPrizeConfig));
    } catch (err) {
      console.error(err);
      alert("讀取獎項設定失敗");
    } finally {
      setLoading(false);
    }
  }

  function handleUnlock() {
    if (ADMIN_PASSWORDS.includes(passwordInput)) {
      sessionStorage.setItem("admin_unlocked", "true");
      setIsUnlocked(true);
      setPasswordInput("");
      return;
    }
    alert("密碼錯誤");
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_unlocked");
    setIsUnlocked(false);
    setPasswordInput("");
    setSelectedId("");
    setIsCreating(false);
    setShowCreateBox(false);
    setForm(emptyForm);
  }

  function openCreateEditor() {
    setShowCreateBox(true);
    setIsCreating(true);
    setSelectedId("");
    setForm(emptyForm);
  }

  function selectItem(id: string) {
    if (String(selectedId) === String(id) && !isCreating) {
      setSelectedId("");
      return;
    }
    setShowCreateBox(false);
    setIsCreating(false);
    setSelectedId(id);
  }

  function resetEditor() {
    setIsCreating(false);
    setSelectedId("");
    setForm(emptyForm);
  }

  function validateForm() {
    if (!form.category.trim()) {
      alert("請輸入分類");
      return false;
    }

    if (!form.productName.trim()) {
      alert("請輸入商品名稱");
      return false;
    }

    if (!form.couponNameCode.trim()) {
      alert("請輸入 couponNameCode");
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
      const sortOrder = items.length
        ? Math.max(...items.map((i) => Number(i.sortOrder || 0))) + 1
        : 1;

      await addPrize({
        category_name: form.category,
        product_name: form.productName,
        emoji: form.emoji || "🎁",
        weight: Number(form.rate),
        sort_order: sortOrder,
        coupon_name_code: form.couponNameCode,
        activation_type: form.activationType,
        fixed_activate_date:
          form.activationType === "fixed_date" ? form.fixedActivateDate : null,
        valid_months: Number(form.validMonths),
        note: form.note,
      });

      alert("新增成功");
      resetEditor();
      setShowCreateBox(false);
      await fetchPrizeConfigs();
    } catch (err) {
      console.error(err);
      alert("新增失敗");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (!validateForm() || !form.id) return;

    setSaving(true);
    try {
      await updatePrize(form.id, {
        category_name: form.category,
        product_name: form.productName,
        emoji: form.emoji || "🎁",
        weight: Number(form.rate),
        is_active: form.enabled,
        coupon_name_code: form.couponNameCode,
        activation_type: form.activationType,
        fixed_activate_date:
          form.activationType === "fixed_date" ? form.fixedActivateDate : null,
        valid_months: Number(form.validMonths),
        note: form.note,
      });

      alert("更新成功");
      await fetchPrizeConfigs();
    } catch (err) {
      console.error(err);
      alert("更新失敗");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id?: string) {
    const targetId = id || selectedId;
    if (!targetId) {
      alert("請先選擇品項");
      return;
    }

    const ok = window.confirm("確定要刪除這個品項嗎？刪除後無法復原。");
    if (!ok) return;

    setSaving(true);
    try {
      await deletePrize(targetId);
      alert("刪除成功");

      if (String(targetId) === String(selectedId)) {
        resetEditor();
      }

      await fetchPrizeConfigs();
    } catch (err) {
      console.error(err);
      alert("刪除失敗");
    } finally {
      setSaving(false);
    }
  }

  async function handleMove(direction: "up" | "down", id: string) {
    const currentIndex = items.findIndex((item) => String(item.id) === String(id));
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const current = items[currentIndex];
    const target = items[targetIndex];

    setSaving(true);
    try {
      await updatePrize(String(current.id), {
        sort_order: Number(target.sortOrder),
      });

      await updatePrize(String(target.id), {
        sort_order: Number(current.sortOrder),
      });

      await fetchPrizeConfigs();
    } catch (err) {
      console.error(err);
      alert("排序失敗");
    } finally {
      setSaving(false);
    }
  }

  if (!isUnlocked) {
    return (
      <div style={styles.page}>
        <div style={styles.topBar} />
        <div style={styles.shell}>
          <div style={styles.headerCard}>
            <div style={styles.headerTop}>
              <div style={styles.headerTitleRow}>
                <h1 style={styles.brandTitle}>後台管理系統</h1>
              </div>

              <button
                type="button"
                style={styles.headerOutlineButton}
                onClick={() => navigate("/")}
              >
                返回前台
              </button>
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>輸入管理密碼</h2>

            <div style={{ maxWidth: 420 }}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUnlock();
                }}
                placeholder="請輸入後台密碼"
                style={styles.input}
              />

              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() => navigate("/")}
                >
                  返回前台
                </button>

                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={handleUnlock}
                >
                  進入後台
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar} />
      <div style={styles.shell}>
        <div style={styles.headerCard}>
          <div style={styles.headerTop}>
            <div style={styles.headerTitleRow}>
              <h1 style={styles.brandTitle}>後台管理系統</h1>
            </div>

            <div style={styles.headerButtonGroup}>
              <button
                type="button"
                style={styles.headerOutlineButton}
                onClick={() => navigate("/")}
              >
                返回前台
              </button>

              <button
                type="button"
                style={styles.headerSolidButton}
                onClick={handleLogout}
              >
                登出
              </button>
            </div>
          </div>
        </div>

        <div style={styles.cardWarm}>
          <div style={styles.cardWarmHeader}>
            <span>🎯 獎項管理</span>
            <span style={styles.rateInfo}>啟用中總機率：{roundRate(totalRate)}%</span>
          </div>

          <div style={styles.cardWarmBody}>
            <div style={styles.noticeBox}>
              提醒：建議啟用中的獎項總機率加總為 100%。
            </div>

            <div style={styles.createBox}>
              <button
                type="button"
                style={styles.createToggleButton}
                onClick={openCreateEditor}
              >
                ＋新增品項
              </button>
            </div>

            {isCreating && showCreateBox && (
              <div style={styles.inlineEditorCard}>
                <div style={styles.inlineEditorTitle}>新增品項</div>
                <EditorForm
                  form={form}
                  setForm={setForm}
                  saving={saving}
                  isCreating={true}
                  onCancel={() => {
                    resetEditor();
                    setShowCreateBox(false);
                  }}
                  onDelete={() => handleDelete()}
                  onSave={handleSave}
                  onCreate={handleCreate}
                />
              </div>
            )}

            <h2 style={styles.sectionTitle}>全部品項</h2>

            <div style={styles.searchWrap}>
              <input
                style={styles.searchInput}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜尋品項名稱 / 分類 / 商品名稱 / couponNameCode"
              />
            </div>

            {loading ? (
              <div style={styles.empty}>載入中...</div>
            ) : filteredItems.length === 0 ? (
              <div style={styles.empty}>查無符合的品項</div>
            ) : (
              <div style={styles.list}>
                {filteredItems.map((item, index) => {
                  const active = String(item.id) === String(selectedId);
                  const enabled =
                    item.啟用 === true ||
                    String(item.啟用).toLowerCase() === "true" ||
                    String(item.啟用) === "1";

                  return (
                    <div key={item.id} style={styles.inlineBlock}>
                      <div
                        style={{
                          ...styles.listItemWrapWarm,
                          ...(active ? styles.listItemWrapActive : {}),
                        }}
                      >
                        <button
                          type="button"
                          style={styles.listItemButton}
                          onClick={() => selectItem(String(item.id))}
                        >
                          <div style={styles.itemTopRowMobile}>
                            <div style={styles.itemMainInfo}>
                              <div style={styles.itemName}>
                                {item.sortOrder}. {item.品項名稱}
                              </div>

                              <div style={styles.itemSubRowStack}>
                                <span>{item.分類 || "未分類"}</span>
                                <span>{item.couponNameCode || "-"}</span>
                              </div>

                              <div style={styles.itemSubRowStackLight}>
                                <span>{enabled ? "啟用中" : "未啟用"}</span>
                              </div>
                            </div>

                            <div style={styles.itemRightInfo}>
                              <div style={styles.itemRate}>
                                {roundRate(Number(item.機率 || 0))}%
                              </div>
                              <div style={styles.itemTapHint}>
                                {active ? "收起" : "點擊編輯"}
                              </div>
                            </div>
                          </div>
                        </button>

                        <div style={styles.sideActions}>
                          <button
                            type="button"
                            style={styles.sortButton}
                            disabled={saving || index === 0}
                            onClick={() => handleMove("up", String(item.id))}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            style={styles.sortButton}
                            disabled={saving || index === filteredItems.length - 1}
                            onClick={() => handleMove("down", String(item.id))}
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            style={styles.deleteMiniButton}
                            disabled={saving}
                            onClick={() => handleDelete(String(item.id))}
                          >
                            刪
                          </button>
                        </div>
                      </div>

                      {active && !isCreating && (
                        <div style={styles.inlineEditorCard}>
                          <div style={styles.inlineEditorTitle}>品項詳細設定</div>
                          <EditorForm
                            form={form}
                            setForm={setForm}
                            saving={saving}
                            isCreating={false}
                            onCancel={resetEditor}
                            onDelete={() => handleDelete()}
                            onSave={handleSave}
                            onCreate={handleCreate}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditorForm({
  form,
  setForm,
  saving,
  isCreating,
  onCancel,
  onDelete,
  onSave,
  onCreate,
}: {
  form: typeof emptyForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  saving: boolean;
  isCreating: boolean;
  onCancel: () => void;
  onDelete: () => void;
  onSave: () => void;
  onCreate: () => void;
}) {
  return (
    <>
      <div style={styles.formGrid}>
        <Field label="分類">
          <input
            style={styles.input}
            value={form.category}
            onChange={(e) =>
              setForm((p) => ({ ...p, category: e.target.value }))
            }
          />
        </Field>

        <Field label="商品名稱">
          <input
            style={styles.input}
            value={form.productName}
            onChange={(e) =>
              setForm((p) => ({ ...p, productName: e.target.value }))
            }
          />
        </Field>

        <Field label="emoji">
          <input
            style={styles.input}
            value={form.emoji}
            onChange={(e) =>
              setForm((p) => ({ ...p, emoji: e.target.value }))
            }
          />
        </Field>

        <Field label="機率 (%)">
          <input
            style={styles.input}
            type="number"
            step="0.1"
            value={form.rate}
            onChange={(e) =>
              setForm((p) => ({ ...p, rate: e.target.value }))
            }
          />
        </Field>

        <Field label="couponNameCode">
          <input
            style={styles.input}
            value={form.couponNameCode}
            onChange={(e) =>
              setForm((p) => ({ ...p, couponNameCode: e.target.value }))
            }
            placeholder="例如：E01"
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
              ...styles.dateInput,
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
          rows={4}
          value={form.note}
          onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
          placeholder="例如：限內用、不得與其他優惠併用、僅限平日使用、需提前出示..."
        />
      </Field>

      <div style={styles.actionRow}>
        <button
          type="button"
          style={styles.secondaryButton}
          onClick={onCancel}
          disabled={saving}
        >
          返回列表
        </button>

        {isCreating ? (
          <button
            type="button"
            style={styles.primaryButton}
            onClick={onCreate}
            disabled={saving}
          >
            {saving ? "新增中..." : "新增品項"}
          </button>
        ) : (
          <>
            <button
              type="button"
              style={styles.dangerButton}
              onClick={onDelete}
              disabled={saving}
            >
              {saving ? "處理中..." : "刪除品項"}
            </button>
            <button
              type="button"
              style={styles.primaryButton}
              onClick={onSave}
              disabled={saving}
            >
              {saving ? "儲存中..." : "儲存設定"}
            </button>
          </>
        )}
      </div>
    </>
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

function roundRate(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/\.?0+$/, "");
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f6f1e7",
  },
  topBar: {
    width: "100%",
    height: 10,
    background:
      "linear-gradient(90deg, #d46b2c 0%, #c43f1e 40%, #d7a328 100%)",
  },
  shell: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "10px 10px 24px",
  },
  headerCard: {
    background: "#fff",
    borderBottom: "1px solid #edd7cf",
    padding: "12px 16px",
    marginBottom: 14,
    borderRadius: 18,
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "nowrap",
  },
  headerTitleRow: {
    display: "flex",
    alignItems: "center",
    minHeight: 44,
  },
  headerButtonGroup: {
    display: "flex",
    gap: 8,
    flexWrap: "nowrap",
    justifyContent: "flex-end",
    flexShrink: 0,
  },
  brandTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 800,
    color: "#c43f1e",
    lineHeight: 1,
    whiteSpace: "nowrap",
  },
  cardWarm: {
    background: "#f8f2ef",
    borderRadius: 20,
    overflow: "hidden",
    border: "1px solid #ead5ca",
    marginBottom: 16,
  },
  cardWarmHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    padding: "14px 16px",
    color: "#d1421f",
    fontSize: 18,
    fontWeight: 800,
    borderBottom: "1px solid #ead5ca",
  },
  rateInfo: {
    fontSize: 14,
    fontWeight: 700,
  },
  cardWarmBody: {
    padding: 14,
  },
  noticeBox: {
    border: "1px solid #f0b67f",
    borderRadius: 16,
    padding: "14px 16px",
    background: "#fffaf4",
    color: "#9a5b2b",
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 1.6,
  },
  createBox: {
    marginBottom: 16,
  },
  createToggleButton: {
    width: "100%",
    minHeight: 50,
    border: "none",
    borderRadius: 14,
    background: "#d1421f",
    color: "#fff",
    fontSize: 18,
    fontWeight: 800,
    cursor: "pointer",
  },
  card: {
    background: "#fff",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    marginBottom: 16,
  },
  sectionTitle: {
    margin: "0 0 14px",
    fontSize: 20,
    fontWeight: 800,
    color: "#3d3330",
  },
  searchWrap: {
    marginBottom: 14,
  },
  searchInput: {
    width: "100%",
    minHeight: 50,
    borderRadius: 16,
    border: "1px solid #ead5ca",
    padding: "0 14px",
    fontSize: 15,
    background: "#fff",
    boxSizing: "border-box",
  },
  empty: {
    padding: "20px 12px",
    textAlign: "center",
    color: "#666",
    background: "#fafafa",
    borderRadius: 12,
  },
  list: {
    display: "grid",
    gap: 14,
  },
  inlineBlock: {
    display: "grid",
    gap: 10,
  },
  listItemWrapWarm: {
    display: "grid",
    gridTemplateColumns: "1fr 82px",
    gap: 0,
    border: "1px solid #ecdac7",
    borderRadius: 18,
    background: "#fbf7ef",
    overflow: "hidden",
  },
  listItemWrapActive: {
    border: "1px solid #d46b2c",
    background: "#fffaf5",
  },
  listItemButton: {
    border: "none",
    background: "transparent",
    textAlign: "left",
    padding: 16,
    cursor: "pointer",
    width: "100%",
  },
  itemTopRowMobile: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  itemMainInfo: {
    minWidth: 0,
    flex: 1,
  },
  itemRightInfo: {
    textAlign: "right",
    minWidth: 72,
  },
  itemTapHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#9a8f87",
  },
  itemSubRowStack: {
    display: "grid",
    gap: 4,
    color: "#76675e",
    fontSize: 14,
    marginTop: 8,
  },
  itemSubRowStackLight: {
    display: "grid",
    gap: 4,
    color: "#9a8f87",
    fontSize: 12,
    marginTop: 8,
    lineHeight: 1.5,
  },
  sideActions: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 8,
    padding: 10,
    borderLeft: "1px solid #eee3d7",
    background: "#f7f2ea",
  },
  sortButton: {
    width: 46,
    height: 40,
    borderRadius: 12,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: 20,
    fontWeight: 700,
  },
  deleteMiniButton: {
    width: 46,
    height: 40,
    borderRadius: 12,
    border: "none",
    background: "#d32f2f",
    color: "#fff",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 800,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 800,
    color: "#2f2826",
    lineHeight: 1.35,
    wordBreak: "break-word",
  },
  itemRate: {
    fontSize: 18,
    fontWeight: 800,
    color: "#9d6a2d",
    whiteSpace: "nowrap",
  },
  inlineEditorCard: {
    background: "#fff",
    border: "1px solid #ecdac7",
    borderRadius: 18,
    padding: 14,
    boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
  },
  inlineEditorTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#3d3330",
    marginBottom: 14,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
  },
  fieldWrap: {
    marginBottom: 2,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 700,
    color: "#544843",
  },
  input: {
    width: "100%",
    minHeight: 48,
    borderRadius: 14,
    border: "1px solid #ddd",
    padding: "0 12px",
    fontSize: 15,
    background: "#fff",
    boxSizing: "border-box",
  },
  dateInput: {
    appearance: "none",
    WebkitAppearance: "none",
    minHeight: 48,
    lineHeight: "48px",
    paddingRight: 12,
  },
  textarea: {
    width: "100%",
    borderRadius: 14,
    border: "1px solid #ddd",
    padding: 12,
    fontSize: 15,
    resize: "vertical",
    background: "#fff",
    boxSizing: "border-box",
  },
  actionRow: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10,
    marginTop: 18,
  },
  primaryButton: {
    minHeight: 48,
    border: "none",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    width: "100%",
  },
  secondaryButton: {
    minHeight: 48,
    border: "1px solid #ddd",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    width: "100%",
  },
  dangerButton: {
    minHeight: 48,
    border: "none",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    background: "#d32f2f",
    color: "#fff",
    cursor: "pointer",
    width: "100%",
  },
  headerOutlineButton: {
    minHeight: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid #ebc9bb",
    background: "#fff7f3",
    color: "#c43f1e",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  headerSolidButton: {
    minHeight: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "none",
    background: "#d1421f",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
};