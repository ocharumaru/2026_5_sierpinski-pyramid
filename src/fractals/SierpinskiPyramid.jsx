import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useState } from "react";
import { useCreateGeometry } from "../hooks/useCreateGeometry";
import { useFractalAnimation } from "../hooks/useFractalAnimation";

/* =========================
   シェルピンスキー生成ロジック
   ========================= */

/**
 * 原点中心の正四面体の4頂点を生成する。
 *
 * @param {number} [scale=1] - 頂点から原点までの距離
 * @returns {THREE.Vector3[]} 正四面体の4頂点
 */
function regularTetrahedron(scale = 1) {
  const v = [
    new THREE.Vector3(1, 1, 1),
    new THREE.Vector3(1, -1, -1),
    new THREE.Vector3(-1, 1, -1),
    new THREE.Vector3(-1, -1, 1),
  ];
  const s = scale / v[0].length();
  return v.map((p) => p.clone().multiplyScalar(s));
}

/**
 * シェルピンスキー四面体を再帰的に生成する。
 * 各再帰で四面体を4つの小さな四面体に分割し、中央を空洞にする。
 *
 * @param {THREE.Vector3[]} vertices - 四面体の4頂点
 * @param {number} depth - 残りの再帰の深さ（0で再帰終了）
 * @returns {THREE.Vector3[][]} 最小単位の四面体の頂点配列のリスト
 */
function sierpinski(vertices, depth) {
  if (depth === 0) return [vertices];

  const mids = {};
  const mid = (i, j) => {
    const key = `${i}-${j}`;
    if (!mids[key]) {
      mids[key] = vertices[i].clone().add(vertices[j]).multiplyScalar(0.5);
    }
    return mids[key];
  };

  const result = [];
  for (let k = 0; k < 4; k++) {
    const others = [0, 1, 2, 3].filter((i) => i !== k);
    result.push(
      ...sierpinski(
        [
          vertices[k],
          mid(k, others[0]),
          mid(k, others[1]),
          mid(k, others[2]),
        ],
        depth - 1
      )
    );
  }
  return result;
}

/**
 * depthに応じたシェルピンスキー四面体のフラットな頂点座標配列を生成する。
 * useCreateGeometry に渡すための関数。
 *
 * @param {number} depth - フラクタルの再帰の深さ
 * @returns {number[]} フラットな頂点座標配列 [x,y,z, x,y,z, ...]
 */
function generateVertices(depth) {
  const base = regularTetrahedron(1);
  const tetras = sierpinski(base, depth);

  const positions = [];
  const faces = [
    [0, 1, 2],
    [0, 1, 3],
    [0, 2, 3],
    [1, 2, 3],
  ];

  tetras.forEach((tet) => {
    faces.forEach(([a, b, c]) => {
      positions.push(
        tet[a].x, tet[a].y, tet[a].z,
        tet[b].x, tet[b].y, tet[b].z,
        tet[c].x, tet[c].y, tet[c].z
      );
    });
  });

  return positions;
}

/* =========================
   コンポーネント
   ========================= */

/**
 * シェルピンスキー四面体のメッシュコンポーネント。
 * useCreateGeometry を使用してジオメトリを生成し描画する。
 *
 * @param {{ depth: number, wireframe: boolean }} props
 */
function SierpinskiMesh({ depth, wireframe }) {
  const geometry = useCreateGeometry(generateVertices, depth);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#4fd1ff"
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
 * シェルピンスキー四面体の完全なシーン。
 * Canvas、ライティング、カメラ操作、パラメータUI、ステップアニメーションを含む。
 */
export default function SierpinskiPyramid() {
  const [targetDepth, setTargetDepth] = useState(6);
  const [stepInterval, setStepInterval] = useState(450);
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
            max={8}
            value={targetDepth}
            onChange={(e) => setTargetDepth(Math.max(0, Math.min(8, Number(e.target.value))))}
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
          <SierpinskiMesh depth={currentDepth} wireframe={wireframe} />
          <OrbitControls enableDamping />
        </Canvas>
      </div>
    </>
  );
}
