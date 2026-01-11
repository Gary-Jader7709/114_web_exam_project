import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

const THEME_KEY = "todo_theme_v3";

const PRESETS = [
  {
    name: "預設（藍）",
    theme: {
      bg: "#f6f7fb",
      card: "#ffffff",
      text: "#111827",
      muted: "#6b7280",
      border: "#e5e7eb",
      primary: "#6d28d9",     // 你截圖那種紫色感
      primaryText: "#ffffff",
      success: "#16a34a",
      danger: "#ef4444",
      chip: "#f3f4f6",
    },
  },
  {
    name: "綠紅（預設）",
    theme: {
      bg: "#f7faf9",
      card: "#ffffff",
      text: "#0f172a",
      muted: "#64748b",
      border: "#e2e8f0",
      primary: "#1d4ed8",
      primaryText: "#ffffff",
      success: "#22c55e",
      danger: "#ef4444",
      chip: "#f1f5f9",
    },
  },
  {
    name: "深色（藍黑）",
    theme: {
      bg: "#0b1220",
      card: "#0f1b2d",
      text: "#e5e7eb",
      muted: "#94a3b8",
      border: "#1f2a44",
      primary: "#3b82f6",
      primaryText: "#0b1220",
      success: "#22c55e",
      danger: "#fb7185",
      chip: "#111c2f",
    },
  },
];

function loadTheme() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (!raw) return PRESETS[0].theme;
    return JSON.parse(raw);
  } catch {
    return PRESETS[0].theme;
  }
}
function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, JSON.stringify(theme));
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, [query]);
  return matches;
}

function ThemePanel({ theme, setTheme }) {
  const [preset, setPreset] = useState(PRESETS[0].name);

  useEffect(() => {
    const hit = PRESETS.find((p) => JSON.stringify(p.theme) === JSON.stringify(theme));
    if (hit) setPreset(hit.name);
  }, [theme]);

  function setField(key, value) {
    setTheme((t) => ({ ...t, [key]: value }));
  }

  function onPresetChange(e) {
    const name = e.target.value;
    setPreset(name);
    const found = PRESETS.find((p) => p.name === name);
    if (found) setTheme(found.theme);
  }

  return (
    <div style={styles.themePanel(theme)}>
      {/* ✅ 這裡已把深淺色切換按鈕移除，只剩套餐 + 自訂色 */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <select value={preset} onChange={onPresetChange} style={styles.select(theme)}>
          {PRESETS.map((p) => (
            <option key={p.name} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <ColorPick label="主按鈕" value={theme.primary} onChange={(v) => setField("primary", v)} />
        <ColorPick label="文字" value={theme.text} onChange={(v) => setField("text", v)} />
        <ColorPick label="已完成" value={theme.success} onChange={(v) => setField("success", v)} />
        <ColorPick label="清除/刪除" value={theme.danger} onChange={(v) => setField("danger", v)} />
      </div>

      <div style={{ fontSize: 12, color: theme.muted, textAlign: "right" }}>
        顏色會即時預覽，並自動保存（localStorage）。
      </div>
    </div>
  );
}

function ColorPick({ label, value, onChange }) {
  return (
    <label style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 8px",
      borderRadius: 12,
      border: "1px solid var(--border)",
      background: "transparent",
      boxSizing: "border-box",
      maxWidth: "100%",
    }}>
      <span style={{ fontSize: 12, opacity: 0.8, whiteSpace: "nowrap" }}>{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      <span style={{ fontSize: 12, opacity: 0.7 }}>{value}</span>
    </label>
  );
}

const CATEGORIES = ["學業", "生活", "工作", "其他"];
const PRIORITIES = ["低", "中", "高"];

export default function App() {
  const [theme, setTheme] = useState(loadTheme());

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([k, v]) => root.style.setProperty(`--${k}`, v));
    document.body.style.margin = "0";
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
    document.body.style.fontFamily =
      'system-ui, -apple-system, "Microsoft JhengHei", Segoe UI, Roboto, sans-serif';

    saveTheme(theme);
  }, [theme]);

  const isNarrow = useMediaQuery("(max-width: 520px)");

  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  // ✅ 新欄位
  const [category, setCategory] = useState("其他");
  const [customCategory, setCustomCategory] = useState(""); // 只有選「其他」時用
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("中");

  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function refresh() {
    const r = await api.listTodos();
    setTodos(r.data || []);
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.done);
    if (filter === "done") return todos.filter((t) => t.done);
    return todos;
  }, [todos, filter]);

  const finalCategory =
    category === "其他" ? (customCategory.trim() || "其他") : category;

  async function onCreate(e) {
    e.preventDefault();
    setErr("");
    if (!title.trim()) return setErr("請輸入事項內容（title）");

    setLoading(true);
    try {
      await api.createTodo({
        title,
        note,
        category: finalCategory,
        dueDate: dueDate || null,
        priority,
      });
      setTitle("");
      setNote("");
      setCategory("其他");
      setCustomCategory("");
      setDueDate("");
      setPriority("中");
      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleDone(todo) {
    setErr("");
    try {
      await api.updateTodo(todo._id, { done: !todo.done });
      await refresh();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function removeTodo(todo) {
    if (!confirm(`確定刪除：${todo.title} ?`)) return;
    setErr("");
    try {
      await api.deleteTodo(todo._id);
      await refresh();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function clearCompleted() {
    const doneList = todos.filter((t) => t.done);
    if (doneList.length === 0) return;
    if (!confirm(`清除已完成：${doneList.length} 筆？`)) return;

    setLoading(true);
    try {
      for (const t of doneList) await api.deleteTodo(t._id);
      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function clearAll() {
    if (todos.length === 0) return;
    if (!confirm(`清除全部：${todos.length} 筆？`)) return;

    setLoading(true);
    try {
      for (const t of todos) await api.deleteTodo(t._id);
      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <div style={styles.container(theme)}>
      <div style={styles.header(theme)}>
        <div>
          <h1 style={{ margin: 0, fontSize: 32 }}>迷你待辦清單</h1>
          <div style={{ marginTop: 6, color: theme.muted }}>
            類別 / 截止日 / 優先順序（存 MongoDB）+ CRUD + 自訂顏色
          </div>
        </div>
        <ThemePanel theme={theme} setTheme={setTheme} />
      </div>

      {err && (
        <div style={{ ...styles.card(theme), borderColor: theme.danger }}>
          ❗ {err}
        </div>
      )}

      <div style={styles.grid(theme, isNarrow)}>
        {/* 左：新增 */}
        <div style={styles.card(theme)}>
          <h2 style={{ marginTop: 0 }}>新增待辦事項</h2>

          <form onSubmit={onCreate} style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={styles.label(theme)}>事項內容</div>
              <input
                style={styles.input(theme)}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：完成網路程式設計作業"
              />
            </div>

            <div>
              <div style={styles.label(theme)}>備註（可選）</div>
              <input
                style={styles.input(theme)}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="例如：demo用"
              />
            </div>

            {/* ✅ 這裡就是你說會凸出去的地方：改成 RWD 自動縮進來 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isNarrow ? "1fr" : "repeat(3, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={styles.label(theme)}>類別</div>
                <select
                  style={styles.select(theme)}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={styles.label(theme)}>截止日期</div>
                <input
                  style={styles.input(theme)}
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={styles.label(theme)}>優先順序</div>
                <select
                  style={styles.select(theme)}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ✅ 選「其他」才出現自訂類別 */}
            {category === "其他" && (
              <div>
                <div style={styles.label(theme)}>自訂類別（選填）</div>
                <input
                  style={styles.input(theme)}
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="例如：社團 / 家事 / 健身"
                />
              </div>
            )}

            <button disabled={loading} style={styles.btn(theme, "primary")}>
              {loading ? "處理中..." : "新增待辦"}
            </button>

            <button
              type="button"
              style={styles.btn(theme, "ghost")}
              onClick={() => {
                setTitle("");
                setNote("");
                setCategory("其他");
                setCustomCategory("");
                setDueDate("");
                setPriority("中");
              }}
            >
              清除表單
            </button>
          </form>
        </div>

        {/* 右：清單 */}
        <div style={styles.card(theme)}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0 }}>待辦清單</h2>
              <div style={{ color: theme.muted, marginTop: 6 }}>
                目前共有 {todos.length} 筆事項，已完成 {doneCount} 筆。
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button style={styles.pill(theme, filter === "all")} onClick={() => setFilter("all")}>全部</button>
              <button style={styles.pill(theme, filter === "active")} onClick={() => setFilter("active")}>未完成</button>
              <button style={styles.pill(theme, filter === "done")} onClick={() => setFilter("done")}>已完成</button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button style={styles.btn(theme)} onClick={clearCompleted} disabled={loading}>
              清除已完成
            </button>
            <button style={styles.btn(theme, "danger")} onClick={clearAll} disabled={loading}>
              清除全部
            </button>
          </div>

          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {filtered.map((t) => (
              <div key={t._id} style={styles.todoItem(theme, isNarrow)}>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      textDecoration: t.done ? "line-through" : "none",
                      opacity: t.done ? 0.85 : 1,
                      wordBreak: "break-word",
                    }}
                  >
                    {t.title}
                  </div>

                  <div style={{ color: theme.muted, marginTop: 4, wordBreak: "break-word" }}>
                    {t.note || <span style={{ opacity: 0.6 }}>（無備註）</span>}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    <span style={styles.badge(theme, t.done ? "done" : "chip")}>
                      {t.done ? "已完成" : "未完成"}
                    </span>
                    <span style={styles.badge(theme)}>{`類別：${t.category || "其他"}`}</span>
                    <span style={styles.badge(theme)}>{`優先：${t.priority || "中"}`}</span>
                    <span style={styles.badge(theme)}>
                      截止：{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "無"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 8, alignContent: "start" }}>
                  <button style={styles.btn(theme)} onClick={() => toggleDone(t)} disabled={loading}>
                    {t.done ? "標記未完成" : "標記完成"}
                  </button>
                  <button style={styles.btn(theme, "danger")} onClick={() => removeTodo(t)} disabled={loading}>
                    刪除
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ color: theme.muted, padding: 12, border: `1px dashed ${theme.border}`, borderRadius: 12 }}>
                目前沒有資料（或此篩選沒有符合項目）。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: (t) => ({
    maxWidth: 1180,
    margin: "24px auto",
    padding: "0 16px",
    boxSizing: "border-box",
  }),
  header: (t) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  }),
  grid: (t, narrow) => ({
    display: "grid",
    gridTemplateColumns: narrow ? "1fr" : "420px 1fr",
    gap: 18,
  }),
  card: (t) => ({
    background: t.card,
    border: `1px solid ${t.border}`,
    borderRadius: 18,
    padding: 16,
    boxSizing: "border-box",
    overflow: "hidden", // ✅ 防止內容凸出去
  }),
  label: (t) => ({
    fontSize: 13,
    color: t.muted,
    marginBottom: 6,
  }),
  input: (t) => ({
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${t.border}`,
    background: "transparent",
    color: t.text,
    outline: "none",
    boxSizing: "border-box", // ✅ 很關鍵：防爆版
    minWidth: 0,
  }),
  select: (t) => ({
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${t.border}`,
    background: "transparent",
    color: t.text,
    outline: "none",
    boxSizing: "border-box",
    minWidth: 0,
  }),
  btn: (t, kind) => {
    const base = {
      padding: "10px 12px",
      borderRadius: 12,
      border: `1px solid ${t.border}`,
      background: t.chip,
      cursor: "pointer",
      color: t.text,
      boxSizing: "border-box",
    };
    if (kind === "primary") return { ...base, background: t.primary, color: t.primaryText, border: "1px solid transparent" };
    if (kind === "danger") return { ...base, background: t.danger, color: "#fff", border: "1px solid transparent" };
    if (kind === "ghost") return { ...base, background: "transparent" };
    return base;
  },
  pill: (t, active) => ({
    padding: "8px 10px",
    borderRadius: 999,
    border: `1px solid ${t.border}`,
    background: active ? t.chip : "transparent",
    cursor: "pointer",
    color: t.text,
  }),
  todoItem: (t, narrow) => ({
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: 12,
    border: `1px solid ${t.border}`,
    borderRadius: 14,
    background: "transparent",
    flexDirection: narrow ? "column" : "row",
  }),
  badge: (t, kind) => {
    if (kind === "done") {
      return {
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 8px",
        borderRadius: 999,
        background: t.success,
        color: "#fff",
        fontSize: 12,
        border: "1px solid transparent",
      };
    }
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 8px",
      borderRadius: 999,
      background: t.chip,
      color: t.muted,
      fontSize: 12,
      border: `1px solid ${t.border}`,
    };
  },
  themePanel: (t) => ({
    display: "grid",
    gap: 10,
    padding: 12,
    border: `1px solid ${t.border}`,
    borderRadius: 18,
    background: t.card,
    minWidth: 280,
    boxSizing: "border-box",
  }),
};
