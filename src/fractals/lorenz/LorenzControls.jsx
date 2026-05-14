import { useState } from "react";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTheme } from "../../styles/pageStyles";

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

function isSameParams(a, b) {
  return ["sigma", "rho", "beta"].every(
    (key) => Math.abs(a[key] - b[key]) < 0.0001
  );
}

export default function LorenzControls({
  params,
  setParams,
  onPresetSelect,
  defaultParams,
  presets,
}) {
  const isMobile = useIsMobile();
  const [isMinimized, setIsMinimized] = useState(false);
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
    panel: { ...basePanel, top: 16, right: 16, padding: "12px 14px", width: 280, fontSize: 12 },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, paddingBottom: 8, borderBottom: `1px solid ${color.cpSubtle}`, marginBottom: 10 },
    title: { fontWeight: 700, fontSize: 12, color: color.cpText },
    resetBtn: { background: color.cpReset, color: color.cpResetText, border: "none", borderRadius: shape.radiusSm, padding: "4px 9px", fontSize: 11, cursor: "pointer" },
    field: { marginBottom: 8 },
    labelRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
    label: { color: color.cpText, fontSize: 11 },
    value: { color: color.cpText, fontSize: 11 },
    slider: { width: "100%", accentColor: color.accent1 },
    sectionTitle: { margin: "10px 0 6px", color: color.cpText, fontSize: 11, fontWeight: 700 },
    presetRow: { display: "flex", gap: 6, flexWrap: "wrap" },
    presetButton: { ...pageStyles.outlineButton, padding: "5px 8px", fontSize: 11, cursor: "pointer" },
    presetButtonOn: { background: color.accent1, color: color.accent1Text ?? "#fff", border: `1px solid ${color.accent1}` },
  };

  const mobilePanel = {
    ...desktopPanel,
    panel: { ...basePanel, bottom: 12, left: 12, right: 12, padding: "8px 10px", fontSize: 11, maxHeight: "45vh", overflowY: "auto" },
    title: { fontWeight: 700, fontSize: 11, color: color.cpText },
    field: { marginBottom: 5 },
    sectionTitle: { margin: "8px 0 5px", color: color.cpText, fontSize: 10, fontWeight: 700 },
    presetButton: { ...pageStyles.outlineButton, padding: "5px 8px", fontSize: 10, cursor: "pointer" },
    presetButtonOn: { background: color.accent1, color: color.accent1Text ?? "#fff", border: `1px solid ${color.accent1}` },
  };

  const s = isMobile ? mobilePanel : desktopPanel;
  const activePresetName = presets.find((preset) => isSameParams(params, preset.params))?.name;

  function updateParam(key, value) {
    setParams({ ...params, [key]: value });
  }

  function handleReset() {
    setParams({ ...defaultParams });
  }

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <span style={s.title}>ローレンツ・アトラクタ</span>
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
        <button type="button" style={s.resetBtn} onClick={handleReset}>
          リセット
        </button>
      </div>

      {!isMinimized && (
        <>
          <div style={{ ...s.sectionTitle, marginTop: 0 }}>プリセット</div>
          <div style={{ ...s.presetRow, marginBottom: 10 }}>
            {presets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                style={{
                  ...s.presetButton,
                  ...(activePresetName === preset.name ? s.presetButtonOn : {}),
                }}
                onClick={() => onPresetSelect(preset)}
              >
                {preset.name}
              </button>
            ))}
          </div>

          <Slider
            label="σ (sigma)"
            value={params.sigma}
            min={1}
            max={20}
            step={0.1}
            format={(v) => v.toFixed(1)}
            onChange={(v) => updateParam("sigma", v)}
            styles={s}
          />
          <Slider
            label="ρ (rho)"
            value={params.rho}
            min={0}
            max={200}
            step={0.1}
            format={(v) => v.toFixed(1)}
            onChange={(v) => updateParam("rho", v)}
            styles={s}
          />
          <Slider
            label="β (beta)"
            value={params.beta}
            min={0.5}
            max={5}
            step={0.01}
            format={(v) => v.toFixed(2)}
            onChange={(v) => updateParam("beta", v)}
            styles={s}
          />
        </>
      )}
    </div>
  );
}
