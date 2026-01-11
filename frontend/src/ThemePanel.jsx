import { PRESETS } from "./theme";

export default function ThemePanel({ theme, setTheme }) {
  function setField(key, value) {
    setTheme((t) => ({ ...t, [key]: value }));
  }

  function onPresetChange(e) {
    const found = PRESETS.find((p) => p.name === e.target.value);
    if (found) setTheme(found.theme);
  }

  return (
    <div className="themePanel">
      <button
        className="btn ghost"
        onClick={() => setField("mode", theme.mode === "dark" ? "light" : "dark")}
        title="切換深色/淺色"
      >
        {theme.mode === "dark" ? "🌙 深色模式" : "☀️ 淺色模式"}
      </button>

      <select className="select" value={presetName(theme)} onChange={onPresetChange}>
        {PRESETS.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>

      <div className="colorsRow">
        <ColorPick label="主按鈕" value={theme.primary} onChange={(v) => setField("primary", v)} />
        <ColorPick label="文字" value={theme.text} onChange={(v) => setField("text", v)} />
        <ColorPick label="已完成" value={theme.success} onChange={(v) => setField("success", v)} />
        <ColorPick label="刪除/清除" value={theme.danger} onChange={(v) => setField("danger", v)} />
      </div>

      <div className="hint">
        以上顏色會即時套用（也會自動保存，下次開專案還在）。
      </div>
    </div>
  );
}

function ColorPick({ label, value, onChange }) {
  return (
    <label className="colorPick">
      <span className="label">{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      <span className="hex">{value}</span>
    </label>
  );
}

// 讓目前 theme 能對應到某個 preset 名稱（找不到就顯示 "自訂"）
function presetName(theme) {
  const hit = PRESETS.find((p) => JSON.stringify(p.theme) === JSON.stringify(theme));
  return hit ? hit.name : PRESETS[0].name; // 不強求顯示自訂，避免 select 無值
}
