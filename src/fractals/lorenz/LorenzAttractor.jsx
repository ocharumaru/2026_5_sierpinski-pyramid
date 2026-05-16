import { useMemo, useState } from "react";
import { Line } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import FractalScene from "../../components/FractalScene";
import ControlPanel from "../../components/ControlPanel";
import PanelCheckbox from "../../components/PanelCheckbox";
import { useTheme } from "../../styles/pageStyles";
import { getFractalCatalogByPath } from "../../models/fractalCatalog";
import LorenzControls from "./LorenzControls";
import {
  DEFAULT_LORENZ,
  LORENZ_PRESETS,
  MAX_STEPS,
  POINTS_PER_STEP,
  generateTrajectory,
} from "./lorenzMath";

const MODEL = getFractalCatalogByPath("lorenz");
const TOTAL_POINTS = MAX_STEPS * POINTS_PER_STEP;
const LINE_WIDTH = 1.25;
// FractalScene へ渡すカメラ配列は毎レンダー新規生成しないよう module 定数化。
// (drei OrbitControls の primitive 再適用で controls.target がリセットされるのを防ぐため)
const CAMERA_POSITION = [2.2, 1.6, 2.6];
// カメラ追従の指数 lerp 強度(1/sec)。1.2 で約「1秒で 70% 詰める」。
const TARGET_FOLLOW_RATE = 1.2;
// 目標カメラ距離 = bbox サイズ × このマージン。プリセット切替時の画角を統一する用途。
const DISTANCE_MARGIN = 1.6;
// bbox が極端に小さい(収束プリセットなど)場合の最小距離。これ未満にはズームインしない。
const MIN_DISTANCE = 1.5;

/**
 * 可視軌跡の bbox 中心 / サイズに合わせて、target と camera 距離を緩やかに lerp する。
 * - target: bbox 中心(両翼を訪れたあと安定するため重心ではなく bbox 中心を採用)
 * - distance: bbox の最大辺 × DISTANCE_MARGIN
 *   → プリセット切替で attractor の大きさが変わっても画角がそのまま追従する
 */
function CameraTargetFollow({ positions, visibleCount }) {
  const { camera, controls } = useThree();

  const { goalTarget, goalDist } = useMemo(() => {
    if (visibleCount < 1) {
      return { goalTarget: new THREE.Vector3(), goalDist: MIN_DISTANCE };
    }
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < visibleCount; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
    const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
    return {
      goalTarget: new THREE.Vector3(
        (minX + maxX) / 2,
        (minY + maxY) / 2,
        (minZ + maxZ) / 2,
      ),
      goalDist: Math.max(MIN_DISTANCE, size * DISTANCE_MARGIN),
    };
  }, [positions, visibleCount]);

  useFrame((_, delta) => {
    if (!controls) return;
    const t = 1 - Math.exp(-delta * TARGET_FOLLOW_RATE);

    // target を lerp
    controls.target.lerp(goalTarget, t);

    // target からの方向は保持しつつ、距離だけ lerp
    const offset = camera.position.clone().sub(controls.target);
    if (offset.lengthSq() < 1e-6) offset.set(0, 0, 1);
    const currentDist = offset.length();
    const newDist = currentDist + (goalDist - currentDist) * t;
    offset.normalize().multiplyScalar(newDist);
    camera.position.copy(controls.target).add(offset);
  });

  return null;
}

function LorenzCurve({ visibleCount, params, color, accentColor, showHead }) {
  const positions = useMemo(
    () => generateTrajectory(TOTAL_POINTS, params),
    [params]
  );

  const colors = useMemo(() => {
    const arr = new Float32Array(TOTAL_POINTS * 3);
    const start = new THREE.Color(color);
    const end = new THREE.Color(accentColor);
    const mixed = new THREE.Color();

    for (let i = 0; i < TOTAL_POINTS; i++) {
      const index = i * 3;
      mixed.copy(start).lerp(end, i / (TOTAL_POINTS - 1));
      arr[index] = mixed.r;
      arr[index + 1] = mixed.g;
      arr[index + 2] = mixed.b;
    }

    return arr;
  }, [color, accentColor]);

  const clampedVisibleCount = Math.min(TOTAL_POINTS, Math.max(2, visibleCount));

  const { linePoints, lineColors } = useMemo(() => {
    const points = [];
    const vertexColors = [];

    for (let i = 0; i < clampedVisibleCount; i++) {
      const index = i * 3;
      points.push([positions[index], positions[index + 1], positions[index + 2]]);
      vertexColors.push([colors[index], colors[index + 1], colors[index + 2]]);
    }

    return { linePoints: points, lineColors: vertexColors };
  }, [positions, colors, clampedVisibleCount]);

  const headIndex = Math.min(clampedVisibleCount - 1, TOTAL_POINTS - 1);
  const headPos = [
    positions[headIndex * 3],
    positions[headIndex * 3 + 1],
    positions[headIndex * 3 + 2],
  ];

  return (
    <>
      <CameraTargetFollow positions={positions} visibleCount={clampedVisibleCount} />
      <Line
        points={linePoints}
        vertexColors={lineColors}
        lineWidth={LINE_WIDTH}
        transparent
        opacity={0.9}
        depthWrite={false}
      />
      {showHead && (
        <mesh position={headPos}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.6}
          />
        </mesh>
      )}
    </>
  );
}

export default function LorenzAttractor() {
  const { theme } = useTheme();
  const [showHead, setShowHead] = useState(true);
  const [params, setParams] = useState(DEFAULT_LORENZ);
  const meshColor = MODEL.meshColor[theme];
  const accentColor = MODEL.meshAccentColor[theme];

  function applyPreset(preset) {
    setParams({ ...preset.params });
  }

  return (
    <ControlPanel
      maxDepth={MAX_STEPS}
      defaultDepth={80}
      defaultInterval={130}
      extraControls={
        <PanelCheckbox label="現在地マーカー" checked={showHead} onChange={setShowHead} />
      }
    >
      {({ currentDepth }) => (
        <>
          <LorenzControls
            params={params}
            setParams={setParams}
            onPresetSelect={applyPreset}
            defaultParams={DEFAULT_LORENZ}
            presets={LORENZ_PRESETS}
          />
          <FractalScene cameraPosition={CAMERA_POSITION} showGrid={true} maxDistance={10}>
            <LorenzCurve
              visibleCount={Math.max(2, currentDepth * POINTS_PER_STEP)}
              params={params}
              color={meshColor}
              accentColor={accentColor}
              showHead={showHead}
            />
          </FractalScene>
        </>
      )}
    </ControlPanel>
  );
}
