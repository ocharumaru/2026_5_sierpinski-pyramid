import { useState } from "react";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTheme } from "../../styles/pageStyles";

/* =========================
   コンポーネント
   ========================= */

function Slider({ label, value, min, max, step, format, onChange, styles }) {
  return (
    <div style={styles.field}>
      <div style={styles.labelRow}>
        <span style={styles.label}>{label}</span>
        <span style={styles.value}>{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={styles.slider}
      />
    </div>
  );
}

export default function PythagorasControls({
  branchAngleDeg,
  setBranchAngleDeg,
  defaultAngleDeg,
}) {
  const isMobile = useIsMobile();
  const [isMinimized, setIsMinimized] = useState(false);
  const { color, shape } = useTheme();

  const basePanel = {
    position: "absolute",
    background: color.cpOverlay,
    color: color.cpText,
    border: `1px solid ${color.cpBorder}`,
    borderRadius: shape.radiusMd,
    fontFamily: "sans-serif",
    zIndex: 10,
  };

  const desktopPanel = {
    panel:    { ...basePanel, top: 16, right: 16, padding: "12px 14px", width: 240, fontSize: 12 },
    header:   { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, paddingBottom: 8, borderBottom: `1px solid ${color.cpSubtle}`, marginBottom: 10 },
    title:    { fontWeight: 700, fontSize: 12, color: color.cpText },
    resetBtn: { background: color.cpReset, color: color.cpResetText, border: "none", borderRadius: shape.radiusSm, padding: "4px 9px", fontSize: 11, cursor: "pointer" },
    field:    { marginBottom: 4 },
    labelRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
    label:    { color: color.cpText, fontSize: 11 },
    value:    { color: color.cpText, fontSize: 11 },
    slider:   { width: "100%", accentColor: color.accent1 },
  };

  const mobilePanel = {
    ...desktopPanel,
    panel:  { ...basePanel, bottom: 12, left: 12, right: 12, padding: "8px 10px", fontSize: 11, maxHeight: "45vh", overflowY: "auto" },
    title:  { fontWeight: 700, fontSize: 11, color: color.cpText },
    field:  { marginBottom: 2 },
  };

  const s = isMobile ? mobilePanel : desktopPanel;

  function handleReset() {
    setBranchAngleDeg(defaultAngleDeg);
  }

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <span style={s.title}>ピタゴラスの木</span>
        <button
          onClick={() => setIsMinimized((v) => !v)}
          style={{
            background: 'transparent',
            border: `1px solid ${color.cpBorder}`,
            borderRadius: shape.radiusSm,
            color: color.cpText,
            cursor: 'pointer',
            fontSize: 11,
            padding: '2px 7px',
            lineHeight: 1,
          }}
        >
          {isMinimized ? '▲' : '▼'}
        </button>
        <button
          type="button"
          style={s.resetBtn}
          onClick={handleReset}
        >
          リセット
        </button>
      </div>

      {!isMinimized && (
        <Slider
          label="分岐角 θ"
          value={branchAngleDeg}
          min={20} max={70} step={1}
          format={(v) => `${v.toFixed(0)}°`}
          onChange={setBranchAngleDeg}
          styles={s}
        />
      )}
    </div>
  );
}
