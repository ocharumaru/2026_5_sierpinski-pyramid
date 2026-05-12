import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFractalAnimation } from "../hooks/useFractalAnimation";
import { useIsMobile } from "../hooks/useIsMobile";
import { useTheme } from "../styles/pageStyles";

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
  extraControls,
  children,
}) {

  /* =========================
   スタイル定義
   ========================= */
  const { color, shape, pageStyles } = useTheme();
  const base = {
    panel: {
      position: "absolute",
      background: color.cpOverlay,
      color: color.cpText,
      borderRadius: shape.radiusMd,
      border: `1px solid ${color.cpBorder}`,
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
      borderBottom: `1px solid ${color.cpSubtle}`,
    },
    row: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
    input: {
      background: color.bgPanel,
      border: `1px solid ${color.cpBorder}`,
      borderRadius: shape.radiusSm,
      color: color.cpText,
      textAlign: "right",
    },
  };

  const desktop = {
    panel:  { ...base.panel,  top: 16, left: 16, padding: "12px 14px", fontSize: 13 },
    header: { ...base.header, marginBottom: 10 },
    row:    { ...base.row,    marginBottom: 8 },
    label:  { color: color.cpText, fontSize: 12 },
    input:  { ...base.input,  width: 72, padding: "3px 8px", fontSize: 13 },
    button: { ...pageStyles.primaryButton, padding: "7px 12px", fontSize: 12 },
    buttonRow: { display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" },
    link:   { ...pageStyles.outlineButton, padding: "6px 12px", fontSize: 12, display: "inline-block", textDecoration: "none" },
  };

  const mobile = {
    panel:  { ...base.panel,  top: 12, left: 12, padding: "8px 10px", fontSize: 12 },
    header: { ...base.header, marginBottom: 8 },
    row:    { ...base.row,    marginBottom: 6 },
    label:  { color: color.cpText, fontSize: 11 },
    input:  { ...base.input,  width: 60, padding: "2px 6px", fontSize: 12 },
    button: { ...pageStyles.primaryButton, padding: "5px 9px", fontSize: 11 },
    buttonRow: { display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" },
    link:   { ...pageStyles.outlineButton, padding: "4px 10px", fontSize: 11, display: "inline-block", textDecoration: "none" },
  };

  const [targetDepth, setTargetDepth] = useState(defaultDepth);
  const [stepInterval, setStepInterval] = useState(defaultInterval);
  const [isMinimized, setIsMinimized] = useState(false);
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

  return (
    <>
      <div style={s.panel}>
        {/* ヘッダー */}
        <div style={s.header}>
          <strong>フラクタル生成</strong>
          <span style={{ color: color.cpText, whiteSpace: "nowrap" }}>
            ステップ {currentDepth} / {targetDepth}
            {isPlaying ? " ▶" : isFinished ? " ■" : " ⏸"}
          </span>
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
        </div>

        {!isMinimized && (
          <>
            {/* パラメータ入力 */}
            <div style={{ ...s.row, marginTop: isMobile ? 8 : 10 }}>
              <span style={s.label}>ステップ数（depth）</span>
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
                  ...(isPlaying ? {
                    background: color.cpInput,
                    color: color.cpTextin,
                    border: `1px solid ${color.cpBorder}`,
                  } : {}),
                }}
              >
                生成スタート
              </button>
              <button
                onClick={isPlaying ? pause : resume}
                disabled={isFinished && !isPlaying}
                style={{
                  ...s.button,
                  ...(isFinished && !isPlaying ? {
                    background: color.cpInput,
                    color: color.cpTextin,
                    border: `1px solid ${color.cpBorder}`,
                  } : {
                    background: color.cpResume,
                    color: color.cpResumeText,
                    border: "none",
                  }),
                }}
              >
                {isPlaying ? "一時停止" : "再開"}
              </button>
              <button
                onClick={reset}
                style={{
                  ...s.button,
                  background: color.cpReset,
                  color: color.cpResetText,
                  border: "none",
                }}
              >
                リセット
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
              {/* 図形固有の追加UI（任意） */}
              {extraControls}

              <div style={{ marginTop: isMobile ? 8 : 10 }}>
                <Link to="/models" style={s.link}>
                  図形選択に戻る
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* render prop でMeshを描画 */}
      {children({ currentDepth, stepInterval })}
    </>
  );
}