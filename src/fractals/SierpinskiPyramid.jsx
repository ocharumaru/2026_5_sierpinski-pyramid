import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useState } from "react";
import { useCreateGeometry } from "../hooks/useCreateGeometry";

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

/**
 * シェルピンスキー四面体のメッシュコンポーネント。
 * useCreateGeometry を使用してジオメトリを生成し、水色のマテリアルで描画する。
 *
 * @param {{ depth: number }} props
 */
function SierpinskiMesh({ depth }) {
  const geometry = useCreateGeometry(generateVertices, depth);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#4fd1ff"
        roughness={0.35}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * シェルピンスキー四面体の完全なシーン。
 * Canvas、ライティング、カメラ操作、depthスライダーUIを含む。
 */
export default function SierpinskiPyramid() {
  const [depth, setDepth] = useState(3);

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          padding: "10px 14px",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          borderRadius: 8,
          zIndex: 10,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ marginBottom: 6 }}>
          depth : <strong>{depth}</strong>
        </div>
        <input
          type="range"
          min={0}
          max={6}
          step={1}
          value={depth}
          onChange={(e) => setDepth(Number(e.target.value))}
        />
      </div>

      <div style={{ width: "100vw", height: "100vh" }}>
        <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <SierpinskiMesh depth={depth} />
          <OrbitControls enableDamping />
        </Canvas>
      </div>
    </>
  );
}
