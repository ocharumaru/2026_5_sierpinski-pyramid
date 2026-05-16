import { useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "../styles/pageStyles";

// ── グリッドジオメトリ生成 ────────────────────────────────────

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

function createFlatGridGeometry(extent, divisions) {
  const positions = [];
  const step = (extent * 2) / divisions;
  const coords = Array.from({ length: divisions + 1 }, (_, i) => -extent + step * i);

  for (const c of coords) {
    positions.push(-extent, c, 0, extent, c, 0);
    positions.push(c, -extent, 0, c, extent, 0);
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

// ── カメラ距離からグリッドレベルを決定 ───────────────────────
//
// カメラが近づくほど extent を小さく・divisions を多くして
// 常に一定の見た目密度を保つ。
//
// レベル定義: { maxDist: この距離以下で適用, extent, divisions }
// 遠い順に並べておき、最初にマッチしたものを使う。

const GRID_LEVELS_3D = [
  { maxDist:  1.5, extent: 10,  divisions: 18 },
  { maxDist:  3.0, extent: 15,  divisions: 18 },
  { maxDist:  6.0, extent: 20, divisions: 15},
  { maxDist: 12.0, extent: 25,  divisions: 18 },
  { maxDist: Infinity, extent: 30, divisions: 20 },
];

const GRID_LEVELS_2D = [
  { maxDist:  1.5, extent: 0.8,  divisions: 30 },
  { maxDist:  3.0, extent: 1.5,  divisions: 25 },
  { maxDist:  6.0, extent: 2.7, divisions: 20 },
  { maxDist: 12.0, extent: 5.0,  divisions: 15 },
  { maxDist: 25.0, extent: 12.0, divisions: 18 },
  { maxDist: 60.0, extent: 30.0, divisions: 20 },
  { maxDist: 150.0, extent: 80.0, divisions: 20 },
  { maxDist: Infinity, extent: 200.0, divisions: 20 },
];

function getGridLevel(dist, levels) {
  return levels.find((l) => dist <= l.maxDist) ?? levels[levels.length - 1];
}

// ── SceneGrid ─────────────────────────────────────────────────

function SceneGrid({ color, showGrid }) {
  const grid = color.sceneGrid;
  const { camera } = useThree();
  const levels = showGrid ? GRID_LEVELS_3D : GRID_LEVELS_2D;

  // 現在適用中のレベルを state で持ち、変化時だけ再レンダリング
  const [level, setLevel] = useState(() => getGridLevel(camera.position.length(), levels));
  const prevDistRef = useRef(camera.position.length());

  useFrame(() => {
    const dist = camera.position.length();
    // 0.1以上変化したときだけ再計算（毎フレーム setState を避ける）
    if (Math.abs(dist - prevDistRef.current) > 0.1) {
      prevDistRef.current = dist;
      const next = getGridLevel(dist, levels);
      if (next.extent !== level.extent) setLevel(next);
    }
  });

  const mainGeometry = useMemo(
    () => showGrid
      ? createLatticeGeometry(level.extent, level.divisions)
      : createFlatGridGeometry(level.extent, level.divisions),
    [showGrid, level.extent, level.divisions]
  );

  const axisExtent = level.extent * 1.13;
  const xAxis = useMemo(() => createAxisGeometry(axisExtent, "x"), [axisExtent]);
  const yAxis = useMemo(() => createAxisGeometry(axisExtent, "y"), [axisExtent]);
  const zAxis = useMemo(() => createAxisGeometry(axisExtent, "z"), [axisExtent]);

  return (
    <group>
      <lineSegments geometry={mainGeometry}>
        <lineBasicMaterial color={grid.cell} transparent opacity={grid.opacity} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={xAxis}>
        <lineBasicMaterial color={grid.axisX} transparent opacity={grid.axisOpacity} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={yAxis}>
        <lineBasicMaterial color={grid.axisY} transparent opacity={grid.axisOpacity} depthWrite={false} />
      </lineSegments>
      {showGrid && (
        <lineSegments geometry={zAxis}>
          <lineBasicMaterial color={grid.axisZ} transparent opacity={grid.axisOpacity} depthWrite={false} />
        </lineSegments>
      )}
    </group>
  );
}

// ── FractalScene ──────────────────────────────────────────────

/**
 * 3Dフラクタル表示用の共通シーン。
 *
 * Props:
 *   children       : ReactNode  フラクタル本体 (Mesh 等)
 *   cameraPosition : [x,y,z]    カメラ初期位置 (デフォルト [3,3,3])
 *   cameraTarget   : [x,y,z]    OrbitControls の回転中心 (デフォルト [0,0,0])
 *                               配列の参照が変わるたびに反映されるので、
 *                               フラクタルの重心に追従させる用途にも使える。
 *                               注: target を動かしてもカメラ位置は不変
 *                               (target 中心の球面角度だけが保たれる)。
 *   maxDistance    : number     Optional OrbitControls zoom-out limit.
 *   minDistance    : number     Optional OrbitControls zoom-in limit.
 *   showGrid       : boolean    グリッド表示フラグ (デフォルト true)
 *                               2Dフラクタルには false を渡す
 *
 * 使い方:
 *   // 3Dフラクタル → グリッドあり（デフォルト）
 *   <FractalScene>
 *     <HilbertCurve3D />
 *   </FractalScene>
 *
 *   // 2Dフラクタル → グリッドなし
 *   <FractalScene showGrid={false}>
 *     <SierpinskiTriangle />
 *   </FractalScene>
 *
 *   // 原点中心じゃないフラクタル → cameraTarget で回転中心を移動
 *   //   (動的に変えたい場合は useMemo で配列を返す)
 *   <FractalScene cameraTarget={[0, 2, 0]}>
 *     <PythagorasTree />
 *   </FractalScene>
 */
// デフォルト値は呼び出しごとに新しい配列を作らないようモジュール定数で固定する。
// 配列参照が毎レンダー変わると、drei OrbitControls が <primitive> 経由で
// controls.target を毎レンダーリセットしてしまい、useFrame 内で lerp している
// 追従カメラ(Dragon / Lorenz)が「警告なしに飛ぶ」ように見える原因になる。
const DEFAULT_CAMERA_POSITION = [3, 3, 3];
const DEFAULT_CAMERA_TARGET = [0, 0, 0];

export default function FractalScene({
  children,
  cameraPosition = DEFAULT_CAMERA_POSITION,
  cameraTarget = DEFAULT_CAMERA_TARGET,
  maxDistance,
  minDistance,
  showGrid = true,
}) {
  const { color } = useTheme();

  return (
    <div style={{ width: "100vw", height: "100dvh", ...color.bgGenPage }}>
      <Canvas camera={{ position: cameraPosition, fov: 50 }}>
        <fog attach="fog" args={[color.sceneGrid.fog, 7, 14]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <SceneGrid color={color} showGrid={showGrid} />
        {children}
        <OrbitControls
          makeDefault
          enableDamping
          target={cameraTarget}
          maxDistance={maxDistance}
          minDistance={minDistance}
        />
      </Canvas>
    </div>
  );
}
