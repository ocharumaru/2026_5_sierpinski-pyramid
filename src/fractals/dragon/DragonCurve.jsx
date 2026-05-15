import { useEffect, useMemo, useRef } from "react";
import { Line } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import FractalScene from "../../components/FractalScene";
import ControlPanel from "../../components/ControlPanel";
import { useTheme } from "../../styles/pageStyles";
import { getFractalCatalogByPath } from "../../models/fractalCatalog";

const MODEL = getFractalCatalogByPath("dragon");
const BASE_CAMERA = [0, -1.2, 2.7];
const BASE_DISTANCE = Math.hypot(...BASE_CAMERA);
// 初期セグメント (0,0)-(1,0) の中点。最初のフレーム位置として固定。
const INITIAL_TARGET = [0.5, 0, 0];
// 1秒あたりの追従強度（大きいほど早く目標に追いつく）
const LERP_RATE = 3.5;
// 目標距離 = bbox サイズ × このマージン。大きいほど引き気味の画角になる。
const DISTANCE_MARGIN = 1.9;

/* =========================
   ドラゴン曲線 生成ロジック
   ========================= */

/**
 * 終点を軸に、既存の折れ線を90度回転コピーしてつなげる。
 * depth に対して線分数は 2^depth、各線分長は常に 1。
 * 最初のセグメント (0,0)-(1,0) は depth に関係なくその world 座標に固定。
 */
function generatePoints(depth) {
  let points = [
    [0, 0],
    [1, 0],
  ];

  for (let d = 0; d < depth; d++) {
    const pivot = points[points.length - 1];
    const next = points.map(([x, y]) => [x, y]);

    for (let i = points.length - 2; i >= 0; i--) {
      const dx = points[i][0] - pivot[0];
      const dy = points[i][1] - pivot[1];
      next.push([
        pivot[0] - dy,
        pivot[1] + dx,
      ]);
    }

    points = next;
  }

  return points.map(([x, y]) => [x, y, 0]);
}

function computeBounds(points) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const [x, y] of points) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  return {
    center: [(minX + maxX) / 2, (minY + maxY) / 2, 0],
    size: Math.max(maxX - minX, maxY - minY, 1),
  };
}

/* =========================
   コンポーネント
   ========================= */

/**
 * bbox の中心とサイズに合わせて、カメラ target と距離を毎フレーム lerp で追従する。
 * 離散的な depth 変化(useEffect snap) で発生していたカクつきを解消する目的。
 */
function CameraDepthSync({ targetGoal, sizeGoal }) {
  const { camera, controls, scene } = useThree();

  // 目標値は ref に保持して、useFrame からは最新値を読むだけにする。
  const goalRef = useRef({
    target: new THREE.Vector3(...targetGoal),
    dist: Math.max(BASE_DISTANCE, sizeGoal * DISTANCE_MARGIN),
  });

  useEffect(() => {
    goalRef.current.target.set(...targetGoal);
    goalRef.current.dist = Math.max(BASE_DISTANCE, sizeGoal * DISTANCE_MARGIN);
  }, [targetGoal, sizeGoal]);

  useFrame((_, delta) => {
    if (!controls) return;

    // 時間ベースの指数 lerp。フレームレートが変わっても挙動が一貫する。
    const t = 1 - Math.exp(-delta * LERP_RATE);

    // target を滑らかに追従
    controls.target.lerp(goalRef.current.target, t);

    // target からのオフセット方向は保持しつつ、距離だけ滑らかに合わせる
    const offset = camera.position.clone().sub(controls.target);
    if (offset.lengthSq() < 1e-6) offset.set(...BASE_CAMERA);

    const currentDist = offset.length();
    const newDist = currentDist + (goalRef.current.dist - currentDist) * t;
    offset.normalize().multiplyScalar(newDist);
    camera.position.copy(controls.target).add(offset);

    camera.near = Math.max(0.05, newDist * 0.005);
    camera.far = Math.max(50, newDist * 5);
    camera.updateProjectionMatrix();

    if (scene.fog && "near" in scene.fog && "far" in scene.fog) {
      scene.fog.near = newDist * 0.6;
      scene.fog.far = newDist * 2.4;
    }
  });

  return null;
}

function DragonScene({ depth, color, lineWidth }) {
  const { points, center, size } = useMemo(() => {
    const pts = generatePoints(depth);
    const bounds = computeBounds(pts);
    return { points: pts, ...bounds };
  }, [depth]);

  return (
    <FractalScene
      cameraPosition={BASE_CAMERA}
      cameraTarget={INITIAL_TARGET}
      showGrid={false}
    >
      <CameraDepthSync targetGoal={center} sizeGoal={size} />
      <Line points={points} color={color} lineWidth={lineWidth} />
    </FractalScene>
  );
}

export default function DragonCurve() {
  const { theme } = useTheme();
  const lineColor = MODEL.meshColor[theme];

  // 明るい背景では暗い線が細く見えやすいため、既存の Hilbert と同じ補正を入れる。
  const lineWidth = theme === 'light' ? 2.6 : 2;

  return (
    <ControlPanel maxDepth={16} defaultDepth={12} defaultInterval={800}>
      {({ currentDepth }) => (
        <DragonScene depth={currentDepth} color={lineColor} lineWidth={lineWidth} />
      )}
    </ControlPanel>
  );
}
