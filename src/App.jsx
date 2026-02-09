import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useState } from "react";

/* =========================
   シェルピンスキー生成
   ========================= */

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

function useSierpinskiGeometry(depth) {
  return useMemo(() => {
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

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.computeVertexNormals();
    return geometry;
  }, [depth]);
}

function SierpinskiMesh({ depth }) {
  const geometry = useSierpinskiGeometry(depth);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
      color="#4fd1ff"
      roughness={0.35}
      metalness={0.1}
      side={THREE.DoubleSide}   // ★追加：裏面も描く
/>

    </mesh>
  );
}

/* =========================
   App（UI付き）
   ========================= */

export default function App() {
  const [depth, setDepth] = useState(3);

  return (
    <>
      {/* UI（スライダー） */}
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

      {/* 3D Canvas */}
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
