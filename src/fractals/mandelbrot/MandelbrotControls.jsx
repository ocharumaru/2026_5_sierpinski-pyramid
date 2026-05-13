import { useState } from "react";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTheme } from "../../styles/pageStyles";

const DEFAULT_BAILOUT = 2;

/* =========================
   コンポーネント
   ========================= */

/**
 * 1スライダー入力。ラベル・値表示・range をひとまとめにする。
 */
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

/**
 * マンデルブロ集合の表示パラメータ調整パネル。
 * バーンズリーのシダ（FernEditor）と同じ構造で構成する。
 */
export default function MandelbrotControls({ bailout, setBailout, onZoomIn, onZoomOut, onResetView }) {
  const isMobile = useIsMobile();
  const [isMinimized, setIsMinimized] = useState(false);
  const { color, shape, pageStyles } = useTheme();

  /* =========================
     調整パネル スタイル
     ========================= */

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
    panel:        { ...basePanel, top: 16, right: 16, padding: "12px 14px", width: 240, fontSize: 12 },
    header:       { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, paddingBottom: 8, borderBottom: `1px solid ${color.cpSubtle}`, marginBottom: 10 },
    title:        { fontWeight: 700, fontSize: 12, color: color.cpText },
    resetBtn:     { background: color.cpReset, color: color.cpResetText, border: "none", borderRadius: shape.radiusSm, padding: "4px 9px", fontSize: 11, cursor: "pointer" },
    field:        { marginBottom: 9 },
    labelRow:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
    label:        { color: color.cpText, fontSize: 11 },
    value:        { color: color.cpText, fontSize: 11 },
    slider:       { width: "100%", accentColor: color.accent1 },
    buttonRow:    { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 },
    button:       { ...pageStyles.primaryButton, padding: "6px 10px", fontSize: 11 },
    outlineBtn:   { ...pageStyles.outlineButton, padding: "6px 10px", fontSize: 11, textDecoration: "none" },
    hint:         { margin: "10px 0 0", color: color.cpText, fontSize: 11, lineHeight: 1.45 },
  };

  const mobilePanel = {
    ...desktopPanel,
    panel:        { ...basePanel, bottom: 12, left: 12, right: 12, padding: "8px 10px", fontSize: 11, maxHeight: "45vh", overflowY: "auto" },
    title:        { fontWeight: 700, fontSize: 11, color: color.cpText },
    field:        { marginBottom: 6 },
    button:       { ...pageStyles.primaryButton, padding: "5px 9px", fontSize: 11 },
    outlineBtn:   { ...pageStyles.outlineButton, padding: "5px 9px", fontSize: 11, textDecoration: "none" },
    hint:         { margin: "8px 0 0", color: color.cpText, fontSize: 10, lineHeight: 1.45 },
  };

  const s = isMobile ? mobilePanel : desktopPanel;

  function handleReset() {
    setBailout(DEFAULT_BAILOUT);
    onResetView();
  }

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <span style={s.title}>マンデルブロ集合</span>
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
        <>
          <Slider
            label="発散判定半径"
            value={bailout}
            min={1.2} max={2} step={0.1}
            format={(v) => v.toFixed(1)}
            onChange={setBailout}
            styles={s}
          />

          <div style={s.buttonRow}>
            <button type="button" onClick={onZoomIn} style={s.button}>
              拡大
            </button>
            <button type="button" onClick={onZoomOut} style={s.outlineBtn}>
              縮小
            </button>
            <button type="button" onClick={onResetView} style={s.outlineBtn}>
              表示リセット
            </button>
          </div>

          <p style={s.hint}>
            ドラッグで移動、ホイールで拡大縮小できます。
          </p>
        </>
      )}
    </div>
  );
}
