import { useIsMobile } from "../../hooks/useIsMobile";
import { useTheme } from "../../styles/pageStyles";
import { useState } from "react";
import { DEFAULT_PARAMS, PRESETS } from "./barnsleyMath";


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
 * 意味付けされたパラメータを編集するパネル。
 * プリセットでスナップ → スライダーで微調整、という流れを想定。
 *
 * @param {{ params: typeof DEFAULT_PARAMS, onChange: (next: typeof DEFAULT_PARAMS) => void }} props
 */
export default function FernEditor({ params, onChange }) {
  const isMobile = useIsMobile();
  const [isMinimized, setIsMinimized] = useState(false);
  const {color, shape} = useTheme();

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
    header:       { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: `1px solid ${color.cpSubtle}`, marginBottom: 10 },
    title:        { fontWeight: 700, fontSize: 12, color: color.cpText },
    resetBtn:     { background: color.cpReset, color: color.cpResetText, border: "none", borderRadius: shape.radiusSm, padding: "4px 9px", fontSize: 11, cursor: "pointer" },
    presetRow:    { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 },
    presetBtn:    { background: color.bgPanel, color: color.cpText, border: `1px solid ${color.cpBorder}`, borderRadius: shape.radiusSm, padding: "3px 8px", fontSize: 11, cursor: "pointer" },
    presetBtnOn:  { background: color.accent1, color: color.accent1Text, border: "none" },
    field:        { marginBottom: 9 },
    labelRow:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
    label:        { color: color.cpText, fontSize: 11 },
    value:        { color: color.cpText, fontSize: 11 },
    slider:       { width: "100%", accentColor: color.accent1 },
  };

  const mobilePanel = {
    ...desktopPanel,
    panel:        { ...basePanel, bottom: 12, left: 12, right: 12, padding: "8px 10px", fontSize: 11, maxHeight: "45vh", overflowY: "auto" },
    title:        { fontWeight: 700, fontSize: 11, color: color.cpText },
    field:        { marginBottom: 6 },
  };

  const s = isMobile ? mobilePanel : desktopPanel;

  const activePreset = Object.entries(PRESETS).find(([, preset]) =>
    Object.keys(preset.params).every((k) => preset.params[k] === params[k])
  )?.[0];

  function update(key, value) {
    onChange({ ...params, [key]: value });
  }

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <span style={s.title}>シダの形</span>
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
          onClick={() => onChange({ ...DEFAULT_PARAMS })}
        >
          リセット
        </button>
      </div>

      {!isMinimized && (
        <>
          <div style={s.presetRow}>
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                style={{
                  ...s.presetBtn,
                  ...(activePreset === key ? s.presetBtnOn : {}),
                }}
                onClick={() => onChange({ ...preset.params })}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <Slider
            label="葉の傾き"
            value={params.leafTiltDeg}
            min={-15} max={20} step={0.5}
            format={(v) => `${v.toFixed(1)}°`}
            onChange={(v) => update("leafTiltDeg", v)}
            styles={s}
          />
          <Slider
            label="葉の大きさ"
            value={params.leafScale}
            min={0.6} max={0.95} step={0.01}
            format={(v) => v.toFixed(2)}
            onChange={(v) => update("leafScale", v)}
            styles={s}
          />
          <Slider
            label="左小葉の大きさ"
            value={params.leftLeafletSize}
            min={0} max={1.6} step={0.05}
            format={(v) => v.toFixed(2)}
            onChange={(v) => update("leftLeafletSize", v)}
            styles={s}
          />
          <Slider
            label="右小葉の大きさ"
            value={params.rightLeafletSize}
            min={0} max={1.6} step={0.05}
            format={(v) => v.toFixed(2)}
            onChange={(v) => update("rightLeafletSize", v)}
            styles={s}
          />
          <Slider
            label="茎の長さ"
            value={params.stemHeight}
            min={0.8} max={2.4} step={0.05}
            format={(v) => v.toFixed(2)}
            onChange={(v) => update("stemHeight", v)}
            styles={s}
          />
          <Slider
            label="小葉の出現比率"
            value={params.leafletRatio}
            min={0} max={0.5} step={0.01}
            format={(v) => `${(v * 100).toFixed(0)}%`}
            onChange={(v) => update("leafletRatio", v)}
            styles={s}
          />
        </>
      )}
    </div>
  );
}
