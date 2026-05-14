import { useState } from "react";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTheme } from "../../styles/pageStyles";
import { DEFAULT_NEWTON, NEWTON_POLY_PRESETS } from "./newtonMath";

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

export default function NewtonControls({
  polyMode,
  setPolyMode,
  aRe,
  setARe,
  aIm,
  setAIm,
  tol,
  setTol,
  onZoomIn,
  onZoomOut,
  onResetView,
}) {
  const isMobile = useIsMobile();
  const [isMinimized, setIsMinimized] = useState(false);
  const [pressedZoom, setPressedZoom] = useState(null);
  const { color, shape, pageStyles } = useTheme();

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
    panel:        { ...basePanel, top: 16, right: 16, padding: "12px 14px", width: 260, fontSize: 12 },
    header:       { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, paddingBottom: 8, borderBottom: `1px solid ${color.cpSubtle}`, marginBottom: 10 },
    title:        { fontWeight: 700, fontSize: 12, color: color.cpText },
    resetBtn:     { background: color.cpReset, color: color.cpResetText, border: "none", borderRadius: shape.radiusSm, padding: "4px 9px", fontSize: 11, cursor: "pointer" },
    field:        { marginBottom: 9 },
    labelRow:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
    label:        { color: color.cpText, fontSize: 11 },
    value:        { color: color.cpText, fontSize: 11 },
    slider:       { width: "100%", accentColor: color.accent1 },
    buttonRow:    { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 },
    presetRow:    { display: "flex", flexDirection: "column", gap: 6, margin: "0 0 12px" },
    presetButton: { ...pageStyles.outlineButton, padding: "6px 10px", fontSize: 11, textAlign: "left", width: "100%" },
    presetActive: { ...pageStyles.primaryButton, padding: "6px 10px", fontSize: 11, textAlign: "left", width: "100%" },
    outlineBtn:   { padding: "6px 10px", fontSize: 11, cursor: "pointer", borderRadius: shape.radiusSm, border: `1px solid ${color.accent1}`, background: "transparent", color: color.accent1 },
    outlineBtnon: { padding: "6px 10px", fontSize: 11, cursor: "pointer", borderRadius: shape.radiusSm, border: `1px solid ${color.accent1}`, background: color.accent1, color: color.accent1Text ?? "#fff" },
    hint:         { margin: "10px 0 0", color: color.cpText, fontSize: 11, lineHeight: 1.45 },
  };

  const mobilePanel = {
    ...desktopPanel,
    panel:        { ...basePanel, bottom: 12, left: 12, right: 12, padding: "8px 10px", fontSize: 11, maxHeight: "45vh", overflowY: "auto" },
    title:        { fontWeight: 700, fontSize: 11, color: color.cpText },
    field:        { marginBottom: 6 },
    presetRow:    { display: "flex", flexDirection: "column", gap: 5, margin: "0 0 10px" },
    presetButton: { ...pageStyles.outlineButton, padding: "5px 9px", fontSize: 11, textAlign: "left", width: "100%" },
    presetActive: { ...pageStyles.primaryButton, padding: "5px 9px", fontSize: 11, textAlign: "left", width: "100%" },
    outlineBtn:   { padding: "5px 9px", fontSize: 11, cursor: "pointer", borderRadius: shape.radiusSm, border: `1px solid ${color.accent1}`, background: "transparent", color: color.accent1 },
    outlineBtnon: { padding: "5px 9px", fontSize: 11, cursor: "pointer", borderRadius: shape.radiusSm, border: `1px solid ${color.accent1}`, background: color.accent1, color: color.accent1Text ?? "#fff" },
    hint:         { margin: "8px 0 0", color: color.cpText, fontSize: 10, lineHeight: 1.45 },
  };

  const s = isMobile ? mobilePanel : desktopPanel;
  const tolSliderValue = Math.log10(tol);

  function handleReset() {
    setPolyMode(DEFAULT_NEWTON.polyMode);
    setARe(DEFAULT_NEWTON.aRe);
    setAIm(DEFAULT_NEWTON.aIm);
    setTol(DEFAULT_NEWTON.tol);
    onResetView();
  }

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <span style={s.title}>ニュートンフラクタル</span>
        <button
          onClick={() => setIsMinimized((v) => !v)}
          style={{
            background: "transparent",
            border: `1px solid ${color.cpBorder}`,
            borderRadius: shape.radiusSm,
            color: color.cpText,
            cursor: "pointer",
            fontSize: 11,
            padding: "2px 7px",
            lineHeight: 1,
          }}
        >
          {isMinimized ? "▲" : "▼"}
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
          <div style={s.presetRow}>
            {NEWTON_POLY_PRESETS.map((preset) => (
              <button
                key={preset.mode}
                type="button"
                title={preset.description}
                onClick={() => setPolyMode(preset.mode)}
                style={polyMode === preset.mode ? s.presetActive : s.presetButton}
              >
                {preset.name}
              </button>
            ))}
          </div>

          <Slider
            label="緩和係数 実部 aRe"
            value={aRe}
            min={-2}
            max={2}
            step={0.01}
            format={(v) => v.toFixed(2)}
            onChange={setARe}
            styles={s}
          />
          <Slider
            label="緩和係数 虚部 aIm"
            value={aIm}
            min={-2}
            max={2}
            step={0.01}
            format={(v) => v.toFixed(2)}
            onChange={setAIm}
            styles={s}
          />
          <Slider
            label="収束判定 tol"
            value={tolSliderValue}
            min={-5}
            max={-1}
            step={0.01}
            format={() => tol.toExponential(0)}
            onChange={(v) => setTol(10 ** v)}
            styles={s}
          />

          <div style={s.buttonRow}>
            <button
              type="button"
              onMouseDown={() => { setPressedZoom("in"); onZoomIn(); }}
              onMouseUp={() => setPressedZoom(null)}
              onMouseLeave={() => setPressedZoom(null)}
              style={{ ...(pressedZoom === "in" ? s.outlineBtnon : s.outlineBtn) }}
            >
              拡大
            </button>
            <button
              type="button"
              onMouseDown={() => { setPressedZoom("out"); onZoomOut(); }}
              onMouseUp={() => setPressedZoom(null)}
              onMouseLeave={() => setPressedZoom(null)}
              style={{ ...s.outlineBtn, ...(pressedZoom === "out" ? s.outlineBtnon : {}) }}
            >
              縮小
            </button>
            <button
              type="button"
              onMouseDown={() => { setPressedZoom("reset"); onResetView(); }}
              onMouseUp={() => setPressedZoom(null)}
              onMouseLeave={() => setPressedZoom(null)}
              style={{ ...s.outlineBtn, ...(pressedZoom === "reset" ? s.outlineBtnon : {}) }}
            >
              表示リセット
            </button>
          </div>

          <p style={s.hint}>
            a=1+0i のとき標準ニュートン法。a を動かすと収束領域が歪みます。
          </p>
        </>
      )}
    </div>
  );
}
