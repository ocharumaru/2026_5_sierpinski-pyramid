import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "../styles/pageStyles";

function createLatticeGeometry(extent, divisions) {
  const positions = [];
  const step = (extent * 2) / divisions;
  const coords = Array.from({ length: divisions + 1 }, (_, i) => -extent + step * i);

  for (const a of coords) {
    for (const b of coords) {
      positions.push(-extent, a, b, extent, a, b);
      positions.push(a, -extent, b, a, extent, b);
      positions.push(a, b, -extent, a, b, extent);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function createAxisGeometry(extent, axis) {
  const positions = {
    x: [-extent, 0, 0, extent, 0, 0],
    y: [0, -extent, 0, 0, extent, 0],
    z: [0, 0, -extent, 0, 0, extent],
  }[axis];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function SceneGrid({ color }) {
  const grid = color.sceneGrid;
  const latticeGeometry = useMemo(() => createLatticeGeometry(2.25, 10), []);
  const xAxisGeometry = useMemo(() => createAxisGeometry(2.55, "x"), []);
  const yAxisGeometry = useMemo(() => createAxisGeometry(2.55, "y"), []);
  const zAxisGeometry = useMemo(() => createAxisGeometry(2.55, "z"), []);

  return (
    <group>
      <lineSegments geometry={latticeGeometry}>
        <lineBasicMaterial
          color={grid.cell}
          transparent
          opacity={grid.opacity}
          depthWrite={false}
        />
      </lineSegments>
      <lineSegments geometry={xAxisGeometry}>
        <lineBasicMaterial color={grid.axisX} transparent opacity={grid.axisOpacity} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={yAxisGeometry}>
        <lineBasicMaterial color={grid.axisY} transparent opacity={grid.axisOpacity} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={zAxisGeometry}>
        <lineBasicMaterial color={grid.axisZ} transparent opacity={grid.axisOpacity} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

/**
 * 3Dフラクタル表示用の共通シーン。
 * Canvas、ライティング、OrbitControls をまとめたラッパー。
 * children に Mesh コンポーネントを渡して使う。
 * 背景色はテーマの bgPage に統一される（モデル別では持たない）。
 *
 * @param {{ children: React.ReactNode, cameraPosition: [number, number, number] }} props
 */
export default function FractalScene({ children, cameraPosition = [3, 3, 3] }) {
  const { color } = useTheme();
  return (
    <div style={{ width: "100vw", height: "100dvh", ...color.bgGenPage }}>
      <Canvas camera={{ position: cameraPosition, fov: 50 }}>
        <fog attach="fog" args={[color.sceneGrid.fog, 7, 14]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <SceneGrid color={color} />
        {children}
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}
