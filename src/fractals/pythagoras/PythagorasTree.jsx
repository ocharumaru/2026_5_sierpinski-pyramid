import { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import FractalScene from "../../components/FractalScene";
import ControlPanel from "../../components/ControlPanel";
import PanelCheckbox from "../../components/PanelCheckbox";
import { useTheme } from "../../styles/pageStyles";
import { getFractalCatalogByPath } from "../../models/fractalCatalog";
import PythagorasControls from "./PythagorasControls";

const MODEL = getFractalCatalogByPath("pythagoras");
const DEFAULT_BRANCH_ANGLE_DEG = 45;
const VIEW_SIZE = 3.2;
const REFERENCE_SPAN = 2.4;
const ROOT_SCALE = VIEW_SIZE / REFERENCE_SPAN;
const ROOT_ANCHOR_Y = 0.5;
const SLAB_THICKNESS = 0.045;
const LEVEL_Z_OFFSET = 0.004;

/* =========================
   ピタゴラスの木 生成ロジック
   ========================= */

function pushBounds(bounds, x, y) {
  bounds.minX = Math.min(bounds.minX, x);
  bounds.maxX = Math.max(bounds.maxX, x);
  bounds.minY = Math.min(bounds.minY, y);
  bounds.maxY = Math.max(bounds.maxY, y);
}

function addSquare(out, bounds, ax, ay, bx, by, depth, level, branchAngle) {
  const dx = bx - ax;
  const dy = by - ay;
  const side = Math.hypot(dx, dy);
  if (side === 0) return;

  const ux = dx / side;
  const uy = dy / side;
  const nx = -uy;
  const ny = ux;

  const cx = bx + nx * side;
  const cy = by + ny * side;
  const dxTop = ax + nx * side;
  const dyTop = ay + ny * side;
  const centerX = (ax + bx + cx + dxTop) / 4;
  const centerY = (ay + by + cy + dyTop) / 4;

  out.push({
    x: centerX,
    y: centerY,
    side,
    angle: Math.atan2(uy, ux),
    level,
  });

  pushBounds(bounds, ax, ay);
  pushBounds(bounds, bx, by);
  pushBounds(bounds, cx, cy);
  pushBounds(bounds, dxTop, dyTop);

  if (depth === 0) return;

  const cos = Math.cos(branchAngle);
  const sin = Math.sin(branchAngle);
  const apexX = dxTop + ux * side * cos * cos + nx * side * cos * sin;
  const apexY = dyTop + uy * side * cos * cos + ny * side * cos * sin;

  addSquare(out, bounds, dxTop, dyTop, apexX, apexY, depth - 1, level + 1, branchAngle);
  addSquare(out, bounds, apexX, apexY, cx, cy, depth - 1, level + 1, branchAngle);
}

function normalizeSquares(squares) {
  return squares.map((square) => ({
    ...square,
    x: square.x * ROOT_SCALE,
    y: (square.y - ROOT_ANCHOR_Y) * ROOT_SCALE,
    side: square.side * ROOT_SCALE,
  }));
}

function generateTree(depth, branchAngle) {
  const squares = [];
  const bounds = {
    minX: Infinity, maxX: -Infinity,
    minY: Infinity, maxY: -Infinity,
  };
  addSquare(squares, bounds, -0.5, 0, 0.5, 0, depth, 0, branchAngle);

  const rawCenterX = (bounds.minX + bounds.maxX) / 2;
  const rawCenterY = (bounds.minY + bounds.maxY) / 2;

  return {
    squares: normalizeSquares(squares),
    maxLevel: depth,
    centerX: rawCenterX * ROOT_SCALE,
    centerY: (rawCenterY - ROOT_ANCHOR_Y) * ROOT_SCALE,
  };
}

/* =========================
   コンポーネント
   ========================= */

function SquareInstances({ squares, color, wireframe }) {
  const meshRef = useRef(null);
  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const position = useMemo(() => new THREE.Vector3(), []);
  const rotation = useMemo(() => new THREE.Quaternion(), []);
  const euler = useMemo(() => new THREE.Euler(), []);
  const scale = useMemo(() => new THREE.Vector3(), []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    squares.forEach((square, index) => {
      position.set(square.x, square.y, square.level * LEVEL_Z_OFFSET);
      euler.set(0, 0, square.angle);
      rotation.setFromEuler(euler);
      scale.set(square.side, square.side, SLAB_THICKNESS);
      matrix.compose(position, rotation, scale);
      mesh.setMatrixAt(index, matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  }, [squares, matrix, position, rotation, euler, scale]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, squares.length]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        roughness={0.42}
        metalness={0.08}
        wireframe={wireframe}
      />
    </instancedMesh>
  );
}

function PythagorasTreeMesh({ tree, color, accentColor, wireframe }) {
  const groups = useMemo(() => {
    const baseColor = new THREE.Color(color);
    const topColor = new THREE.Color(accentColor);
    const byLevel = Array.from({ length: tree.maxLevel + 1 }, () => []);

    tree.squares.forEach((square) => {
      byLevel[square.level].push(square);
    });

    return byLevel
      .map((squares, level) => {
        const t = tree.maxLevel === 0 ? 0 : level / tree.maxLevel;
        return {
          level,
          squares,
          color: baseColor.clone().lerp(topColor, t).getStyle(),
        };
      })
      .filter((group) => group.squares.length > 0);
  }, [tree, color, accentColor]);

  return (
    <>
      {groups.map((group) => (
        <SquareInstances
          key={group.level}
          squares={group.squares}
          color={group.color}
          wireframe={wireframe}
        />
      ))}
    </>
  );
}

function PythagorasContent({
  currentDepth,
  branchAngleDeg,
  setBranchAngleDeg,
  meshColor,
  accentColor,
  wireframe,
}) {
  const branchAngle = THREE.MathUtils.degToRad(branchAngleDeg);
  const tree = useMemo(
    () => generateTree(currentDepth, branchAngle),
    [currentDepth, branchAngle]
  );
  const cameraTarget = useMemo(
    () => [tree.centerX, tree.centerY, 0],
    [tree.centerX, tree.centerY]
  );

  return (
    <>
      <PythagorasControls
        branchAngleDeg={branchAngleDeg}
        setBranchAngleDeg={setBranchAngleDeg}
        defaultAngleDeg={DEFAULT_BRANCH_ANGLE_DEG}
      />
      <FractalScene
        cameraPosition={[0, 1.5, 5]}
        cameraTarget={cameraTarget}
        showGrid={false}
      >
        <PythagorasTreeMesh
          tree={tree}
          color={meshColor}
          accentColor={accentColor}
          wireframe={wireframe}
        />
      </FractalScene>
    </>
  );
}

export default function PythagorasTree() {
  const { theme } = useTheme();
  const [wireframe, setWireframe] = useState(false);
  const [branchAngleDeg, setBranchAngleDeg] = useState(DEFAULT_BRANCH_ANGLE_DEG);
  const meshColor = MODEL.meshColor[theme];
  const accentColor = MODEL.meshAccentColor[theme];

  return (
    <ControlPanel
      maxDepth={12}
      defaultDepth={8}
      defaultInterval={450}
      extraControls={
        <PanelCheckbox label="ワイヤーフレーム" checked={wireframe} onChange={setWireframe} />
      }
    >
      {({ currentDepth }) => (
        <PythagorasContent
          currentDepth={currentDepth}
          branchAngleDeg={branchAngleDeg}
          setBranchAngleDeg={setBranchAngleDeg}
          meshColor={meshColor}
          accentColor={accentColor}
          wireframe={wireframe}
        />
      )}
    </ControlPanel>
  );
}
