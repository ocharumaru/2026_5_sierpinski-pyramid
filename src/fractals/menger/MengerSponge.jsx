import * as THREE from "three";
import { useCreateGeometry } from "../hooks/useCreateGeometry";
import FractalScene from "../components/FractalScene";
import ControlPanel from "../components/ControlPanel";

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

/**
 * メンガースポンジの完全なシーン。
 */
export default function MengerSponge() {
  return (
    <ControlPanel maxDepth={4} defaultDepth={4} defaultInterval={600}>
      {({ currentDepth, wireframe }) => (
        <FractalScene>
          <MengerMesh depth={currentDepth} wireframe={wireframe} />
        </FractalScene>
      )}
    </ControlPanel>
  );
}
