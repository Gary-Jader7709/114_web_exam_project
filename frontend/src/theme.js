const KEY = "todo_theme_v1";

export const PRESETS = [
  {
    name: "預設（藍）",
    theme: {
      mode: "light",
      bg: "#f6f7fb",
      card: "#ffffff",
      text: "#111827",
      muted: "#6b7280",
      border: "#e5e7eb",
      primary: "#2563eb",
      primaryText: "#ffffff",
      success: "#16a34a",
      danger: "#ef4444",
      chip: "#f3f4f6",
    },
  },
  {
    name: "綠紅（你說的預設）",
    theme: {
      mode: "light",
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
      mode: "dark",
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
  {
    name: "夕陽（橘紫）",
    theme: {
      mode: "light",
      bg: "#fff7ed",
      card: "#ffffff",
      text: "#111827",
      muted: "#6b7280",
      border: "#fde68a",
      primary: "#f97316",
      primaryText: "#ffffff",
      success: "#16a34a",
      danger: "#db2777",
      chip: "#ffedd5",
    },
  },
];

export function loadTheme() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return PRESETS[0].theme;
    return JSON.parse(raw);
  } catch {
    return PRESETS[0].theme;
  }
}

export function saveTheme(theme) {
  localStorage.setItem(KEY, JSON.stringify(theme));
}

export function applyTheme(theme) {
  const root = document.documentElement;

  Object.entries(theme).forEach(([k, v]) => {
    if (k === "mode") return;
    root.style.setProperty(`--${k}`, v);
  });

  if (theme.mode === "dark") document.body.classList.add("dark");
  else document.body.classList.remove("dark");
}
