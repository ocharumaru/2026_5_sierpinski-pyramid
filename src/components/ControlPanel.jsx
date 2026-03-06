import { useState } from "react";
import { useFractalAnimation } from "../hooks/useFractalAnimation";

/* =========================
   スタイル定義
   ========================= */

const panelStyle = {
  position: "absolute",
  top: 20,
  left: 20,
  padding: "16px 20px",
  background: "rgba(0,0,0,0.75)",
  color: "white",
  borderRadius: 10,
  zIndex: 10,
  fontFamily: "sans-serif",
  fontSize: 14,
  minWidth: 280,
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid rgba(255,255,255,0.2)",
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
};

const inputStyle = {
  width: 80,
  padding: "4px 8px",
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: 4,
  color: "white",
  fontSize: 14,
  textAlign: "right",
};

const buttonBase = {
  padding: "8px 16px",
  border: "none",
  borderRadius: 6,
  fontSize: 14,
  fontWeight: "bold",
  cursor: "pointer",
};

/**
 * フラクタル生成の共通コントロールパネル。
 * ステップアニメーション制御、パラメータ入力、ワイヤーフレーム切り替えを提供する。
 *
 * @param {{ maxDepth: number, defaultDepth: number, defaultInterval: number, children: (state: { currentDepth: number, wireframe: boolean }) => React.ReactNode }} props
 * @param {number} props.maxDepth - depthの最大値
 * @param {number} [props.defaultDepth=6] - depthの初期値
 * @param {number} [props.defaultInterval=450] - ステップ間隔の初期値（ms）
 * @param {Function} props.children - render prop。{ currentDepth, wireframe } を受け取りMeshを返す
 */
export default function ControlPanel({
  maxDepth,
  defaultDepth = 6,
  defaultInterval = 450,
  children,
}) {
  const [targetDepth, setTargetDepth] = useState(defaultDepth);
  const [stepInterval, setStepInterval] = useState(defaultInterval);
  const [wireframe, setWireframe] = useState(false);

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
      <div style={panelStyle}>
        {/* ヘッダー */}
        <div style={headerStyle}>
          <strong>フラクタル生成</strong>
          <span style={{ opacity: 0.7 }}>
            ステップ {currentDepth} / {targetDepth}
            {isPlaying ? " ▶" : isFinished ? " ■" : " ⏸"}
          </span>
        </div>

        {/* パラメータ入力 */}
        <div style={rowStyle}>
          <span>目標深さ（depth）</span>
          <input
            type="number"
            min={0}
            max={maxDepth}
            value={targetDepth}
            onChange={(e) => setTargetDepth(Math.max(0, Math.min(maxDepth, Number(e.target.value))))}
            style={inputStyle}
            disabled={isPlaying}
          />
        </div>
        <div style={{ ...rowStyle, marginBottom: 16 }}>
          <span>ステップ間隔（ms）</span>
          <input
            type="number"
            min={100}
            max={5000}
            step={50}
            value={stepInterval}
            onChange={(e) => setStepInterval(Math.max(100, Number(e.target.value)))}
            style={inputStyle}
            disabled={isPlaying}
          />
        </div>

        {/* 操作ボタン */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            onClick={start}
            disabled={isPlaying}
            style={{
              ...buttonBase,
              background: isPlaying ? "#555" : "#2dd4a8",
              color: isPlaying ? "#999" : "#000",
            }}
          >
            生成スタート
          </button>
          <button
            onClick={isPlaying ? pause : resume}
            disabled={isFinished && !isPlaying}
            style={{
              ...buttonBase,
              background: isFinished && !isPlaying ? "#555" : "#f0c040",
              color: isFinished && !isPlaying ? "#999" : "#000",
            }}
          >
            {isPlaying ? "一時停止" : "再開"}
          </button>
          <button
            onClick={reset}
            style={{
              ...buttonBase,
              background: "#f06080",
              color: "#fff",
            }}
          >
            リセット
          </button>
        </div>

        {/* オプション */}
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={wireframe}
            onChange={(e) => setWireframe(e.target.checked)}
          />
          ワイヤーフレーム
        </label>
      </div>

      {/* render prop でMeshを描画 */}
      {children({ currentDepth, wireframe })}
    </>
  );
}
