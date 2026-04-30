import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFractalAnimation } from "../hooks/useFractalAnimation";
import { color, shape, pageStyles } from "../styles/pageStyles";

function useIsMobile(breakpoint = 600) {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < breakpoint
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return isMobile;
}

/* =========================
   スタイル定義
   ========================= */

const base = {
  panel: {
    position: "absolute",
    background: color.bgOverlay,
    color: color.textPrimary,
    borderRadius: shape.radiusMd,
    border: `1px solid ${color.borderDefault}`,
    zIndex: 10,
    fontFamily: "sans-serif",
    maxWidth: "calc(100vw - 32px)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingBottom: 8,
    borderBottom: `1px solid ${color.borderSubtle}`,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  input: {
    background: color.bgPanel,
    border: `1px solid ${color.borderDefault}`,
    borderRadius: shape.radiusSm,
    color: color.textPrimary,
    textAlign: "right",
  },
};

const desktop = {
  panel:  { ...base.panel,  top: 16, left: 16, padding: "12px 14px", fontSize: 13 },
  header: { ...base.header, marginBottom: 10 },
  row:    { ...base.row,    marginBottom: 8 },
  label:  { color: color.textSecondary, fontSize: 12 },
  input:  { ...base.input,  width: 72, padding: "3px 8px", fontSize: 13 },
  button: { ...pageStyles.primaryButton, padding: "7px 12px", fontSize: 12 },
  buttonRow: { display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" },
  link:   { ...pageStyles.outlineButton, padding: "6px 12px", fontSize: 12, display: "inline-block", textDecoration: "none" },
};

const mobile = {
  panel:  { ...base.panel,  top: 12, left: 12, padding: "8px 10px", fontSize: 12 },
  header: { ...base.header, marginBottom: 8 },
  row:    { ...base.row,    marginBottom: 6 },
  label:  { color: color.textSecondary, fontSize: 11 },
  input:  { ...base.input,  width: 60, padding: "2px 6px", fontSize: 12 },
  button: { ...pageStyles.primaryButton, padding: "5px 9px", fontSize: 11 },
  buttonRow: { display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" },
  link:   { ...pageStyles.outlineButton, padding: "4px 10px", fontSize: 11, display: "inline-block", textDecoration: "none" },
};

/**
 * フラクタル生成の共通コントロールパネル。
 * ステップアニメーション制御、パラメータ入力、ワイヤーフレーム切り替えを提供する。
 *
 * @param {{ maxDepth: number, defaultDepth: number, defaultInterval: number, enableWireframe: boolean, children: (state: { currentDepth: number, wireframe: boolean }) => React.ReactNode }} props
 */
export default function ControlPanel({
  maxDepth,
  defaultDepth = 6,
  defaultInterval = 450,
  enableWireframe = true,
  children,
}) {
  const [targetDepth, setTargetDepth] = useState(defaultDepth);
  const [stepInterval, setStepInterval] = useState(defaultInterval);
  const [wireframe, setWireframe] = useState(false);
  const isMobile = useIsMobile();
  const s = isMobile ? mobile : desktop;

  const {
    currentDepth,
    isPlaying,
    isFinished,
    start,
    pause,
    resume,
    reset,
  } = useFractalAnimation(targetDepth, stepInterval);

  const effectiveWireframe = enableWireframe ? wireframe : false;

  return (
    <>
      <div style={s.panel}>
        {/* ヘッダー */}
        <div style={s.header}>
          <strong>フラクタル生成</strong>
          <span style={{ color: color.textSecondary, whiteSpace: "nowrap" }}>
            ステップ {currentDepth} / {targetDepth}
            {isPlaying ? " ▶" : isFinished ? " ■" : " ⏸"}
          </span>
        </div>

        {/* パラメータ入力 */}
        <div style={{ ...s.row, marginTop: isMobile ? 8 : 10 }}>
          <span style={s.label}>目標深さ（depth）</span>
          <input
            type="number"
            min={0}
            max={maxDepth}
            value={targetDepth}
            onChange={(e) => setTargetDepth(Math.max(0, Math.min(maxDepth, Number(e.target.value))))}
            style={s.input}
            disabled={isPlaying}
          />
        </div>
        <div style={{ ...s.row, marginBottom: isMobile ? 10 : 14 }}>
          <span style={s.label}>ステップ間隔（ms）</span>
          <input
            type="number"
            min={100}
            max={5000}
            step={50}
            value={stepInterval}
            onChange={(e) => setStepInterval(Math.max(100, Number(e.target.value)))}
            style={s.input}
            disabled={isPlaying}
          />
        </div>

        {/* 操作ボタン */}
        <div style={s.buttonRow}>
          <button
            onClick={start}
            disabled={isPlaying}
            style={{
              ...s.button,
              background: isPlaying ? color.bgPanel : color.teal,
              color: isPlaying ? color.textMuted : "#fff",
              border: isPlaying ? `1px solid ${color.borderDefault}` : "none",
            }}
          >
            生成スタート
          </button>
          <button
            onClick={isPlaying ? pause : resume}
            disabled={isFinished && !isPlaying}
            style={{
              ...s.button,
              background: isFinished && !isPlaying ? color.bgPanel : color.amber,
              color: isFinished && !isPlaying ? color.textMuted : "#1a1200",
              border: isFinished && !isPlaying ? `1px solid ${color.borderDefault}` : "none",
            }}
          >
            {isPlaying ? "一時停止" : "再開"}
          </button>
          <button
            onClick={reset}
            style={{
              ...s.button,
              background: "rgba(220, 60, 80, 0.85)",
              color: "#fff",
              border: "none",
            }}
          >
            リセット
          </button>
        </div>

        {/* オプション */}
        {enableWireframe && (
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: color.textSecondary, fontSize: s.label.fontSize }}>
            <input
              type="checkbox"
              checked={wireframe}
              onChange={(e) => setWireframe(e.target.checked)}
            />
            ワイヤーフレーム
          </label>
        )}

        <div style={{ marginTop: isMobile ? 8 : 10 }}>
          <Link to="/models" style={s.link}>
            図形選択に戻る
          </Link>
        </div>
      </div>

      {/* render prop でMeshを描画 */}
      {children({ currentDepth, wireframe: effectiveWireframe })}
    </>
  );
}
