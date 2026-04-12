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
  活動名稱: string;
  商品名稱: string;
  emoji: string;
  機率: number | string;
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
  note: "",
  enabled: true,
};

function toPrizeConfig(item: PrizeItem): PrizeConfig {
  return {
    sortOrder: item.sort_order,
    id: item.id,
    品項名稱: `${item.category_name ?? ""} ${item.product_name ?? ""}`.trim(),
    活動名稱: item.category_name ?? "",
    商品名稱: item.product_name ?? "",
    emoji: item.emoji ?? "🎁",
    機率: Number(item.weight ?? 0),
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
      const text = [item.品項名稱, item.活動名稱, item.商品名稱, item.備註]
        .map((v) => String(v || "").toLowerCase())
        .join(" ");
      return text.includes(kw);
    });
  }, [items, keyword]);

  const totalRate = useMemo(() => {
    return items.reduce((sum, item) => {
      const enabled =
        item.啟用 === true ||
        String(item.啟用).toLowerCase() === "true" ||
        String(item.啟用) === "1";

      if (!enabled) return sum;

      const n = Number(item.機率 || 0);
      return sum + (isNaN(n) ? 0 : n);
    }, 0);
  }, [items]);

  useEffect(() => {
    if (isUnlocked) void fetchPrizeConfigs();
  }, [isUnlocked]);

  useEffect(() => {
    if (!selectedItem || isCreating) return;

    setForm({
      id: String(selectedItem.id || ""),
      category: String(selectedItem.活動名稱 || ""),
      productName: String(selectedItem.商品名稱 || ""),
      emoji: String(selectedItem.emoji || "🎁"),
      rate: String(selectedItem.機率 ?? "0"),
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
      alert("請輸入活動名稱");
      return false;
    }
    if (!form.productName.trim()) {
      alert("請輸入品項名稱");
      return false;
    }

    const rate = Number(form.rate);
    if (isNaN(rate) || rate < 0) {
      alert("機率格式錯誤");
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
      if (String(targetId) === String(selectedId)) resetEditor();
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
                placeholder="搜尋活動名稱 / 品項名稱 / 備註"
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
                                <span>活動：{item.活動名稱 || "未設定"}</span>
                                <span>品項：{item.商品名稱 || "未設定"}</span>
                              </div>

                              <div style={styles.itemSubRowStackLight}>
                                <span>{enabled ? "啟用中" : "未啟用"}</span>
                                {!!item.備註 && <span>備註：{item.備註}</span>}
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
  onSave,
  onCreate,
}: {
  form: typeof emptyForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  saving: boolean;
  isCreating: boolean;
  onCancel: () => void;
  onSave: () => void;
  onCreate: () => void;
}) {
  return (
    <>
      <div style={styles.formGrid}>
        <Field label="活動名稱">
          <input
            style={styles.input}
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
          />
        </Field>

        <Field label="品項名稱">
          <input
            style={styles.input}
            value={form.productName}
            onChange={(e) => setForm((p) => ({ ...p, productName: e.target.value }))}
          />
        </Field>

        <Field label="emoji">
          <input
            style={styles.input}
            value={form.emoji}
            onChange={(e) => setForm((p) => ({ ...p, emoji: e.target.value }))}
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
          placeholder="例如：限內用、不得與其他優惠併用、有效期限為抽中後 1 個月..."
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
          <button
            type="button"
            style={styles.primaryButton}
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "儲存中..." : "儲存設定"}
          </button>
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
   } }