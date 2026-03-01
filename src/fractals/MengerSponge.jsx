import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useState } from "react";
import { useCreateGeometry } from "../hooks/useCreateGeometry";
import { useFractalAnimation } from "../hooks/useFractalAnimation";

/* =========================
   メンガースポンジ生成ロジック
   ========================= */

/**
 * 立方体の12三角形（6面×2三角形）の頂点座標を positions 配列に追加する。
 *
 * @param {number[]} positions - フラットな頂点座標配列（破壊的に追加される）
 * @param {number} cx - 立方体の中心 x
 * @param {number} cy - 立方体の中心 y
 * @param {number} cz - 立方体の中心 z
 * @param {number} half - 立方体の半辺長
 */
function pushCube(positions, cx, cy, cz, half) {
  const x0 = cx - half, x1 = cx + half;
  const y0 = cy - half, y1 = cy + half;
  const z0 = cz - half, z1 = cz + half;

  // 6面 × 2三角形 = 12三角形
  // 前面 (z1)
  positions.push(x0,y0,z1, x1,y0,z1, x1,y1,z1);
  positions.push(x0,y0,z1, x1,y1,z1, x0,y1,z1);
  // 背面 (z0)
  positions.push(x1,y0,z0, x0,y0,z0, x0,y1,z0);
  positions.push(x1,y0,z0, x0,y1,z0, x1,y1,z0);
  // 上面 (y1)
  positions.push(x0,y1,z1, x1,y1,z1, x1,y1,z0);
  positions.push(x0,y1,z1, x1,y1,z0, x0,y1,z0);
  // 下面 (y0)
  positions.push(x0,y0,z0, x1,y0,z0, x1,y0,z1);
  positions.push(x0,y0,z0, x1,y0,z1, x0,y0,z1);
  // 右面 (x1)
  positions.push(x1,y0,z1, x1,y0,z0, x1,y1,z0);
  positions.push(x1,y0,z1, x1,y1,z0, x1,y1,z1);
  // 左面 (x0)
  positions.push(x0,y0,z0, x0,y0,z1, x0,y1,z1);
  positions.push(x0,y0,z0, x0,y1,z1, x0,y1,z0);
}

/**
 * メンガースポンジを再帰的に生成する。
 * 各再帰で立方体を27個の小立方体に分割し、各面の中央と立方体の中心軸を通る7個を除去する（20個残す）。
 *
 * @param {number[]} positions - フラットな頂点座標配列（破壊的に追加される）
 * @param {number} cx - 立方体の中心 x
 * @param {number} cy - 立方体の中心 y
 * @param {number} cz - 立方体の中心 z
 * @param {number} half - 立方体の半辺長
 * @param {number} depth - 残りの再帰の深さ（0で再帰終了）
 */
function mengerRecurse(positions, cx, cy, cz, half, depth) {
  if (depth === 0) {
    pushCube(positions, cx, cy, cz, half);
    return;
  }

  const step = half * 2 / 3;
  const newHalf = half / 3;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        // 2軸以上が0のサブキューブを除去（面の中央 + 中心軸）
        const zeros = (dx === 0 ? 1 : 0) + (dy === 0 ? 1 : 0) + (dz === 0 ? 1 : 0);
        if (zeros >= 2) continue;

        mengerRecurse(
          positions,
          cx + dx * step,
          cy + dy * step,
          cz + dz * step,
          newHalf,
          depth - 1
        );
      }
    }
  }
}

/**
 * depthに応じたメンガースポンジのフラットな頂点座標配列を生成する。
 * useCreateGeometry に渡すための関数。
 *
 * @param {number} depth - フラクタルの再帰の深さ
 * @returns {number[]} フラットな頂点座標配列 [x,y,z, x,y,z, ...]
 */
function generateVertices(depth) {
  const positions = [];
  mengerRecurse(positions, 0, 0, 0, 1, depth);
  return positions;
}

/* =========================
   コンポーネント
   ========================= */

/**
 * メンガースポンジのメッシュコンポーネント。
 * useCreateGeometry を使用してジオメトリを生成し描画する。
 *
 * @param {{ depth: number, wireframe: boolean }} props
 */
function MengerMesh({ depth, wireframe }) {
  const geometry = useCreateGeometry(generateVertices, depth);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#e8a040"
        roughness={0.35}
        metalness={0.1}
        side={THREE.DoubleSide}
        wireframe={wireframe}
      />
    </mesh>
  );
}

/* =========================
   UIスタイル
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
 * メンガースポンジの完全なシーン。
 * Canvas、ライティング、カメラ操作、パラメータUI、ステップアニメーションを含む。
 */
export default function MengerSponge() {
  const [targetDepth, setTargetDepth] = useState(4);
  const [stepInterval, setStepInterval] = useState(600);
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
      {/* UIパネル */}
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
            max={4}
            value={targetDepth}
            onChange={(e) => setTargetDepth(Math.max(0, Math.min(4, Number(e.target.value))))}
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

      {/* 3D Canvas */}
      <div style={{ width: "100vw", height: "100vh" }}>
        <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <MengerMesh depth={currentDepth} wireframe={wireframe} />
          <OrbitControls enableDamping />
        </Canvas>
      </div>
    </>
  );
}
