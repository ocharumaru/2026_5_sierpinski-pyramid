import { useMemo } from "react";
import { Line } from "@react-three/drei";
import FractalScene from "../../components/FractalScene";
import ControlPanel from "../../components/ControlPanel";

/* =========================
   コッホ曲線 生成ロジック
   ========================= */

const COS60 = 0.5;
const SIN60 = Math.sqrt(3) / 2;

/**
 * コッホ曲線の頂点列を再帰的に out 配列へ追加する。
 * depth=0 では始点のみを out に追加する（終点は次の呼び出しの始点として追加される）。
 *
 * @param {number[]} out - [x,y,z, ...] 形式のフラット配列（破壊的に追加）
 * @param {number} ax - 始点 x
 * @param {number} ay - 始点 y
 * @param {number} bx - 終点 x
 * @param {number} by - 終点 y
 * @param {number} depth - 残りの再帰の深さ（0 で始点のみ追加）
 */
function kochRecurse(out, ax, ay, bx, by, depth) {
  if (depth === 0) {
    out.push([ax, ay, 0]);
    return;
  }

  const p1x = ax + (bx - ax) / 3;
  const p1y = ay + (by - ay) / 3;

  const p2x = ax + 2 * (bx - ax) / 3;
  const p2y = ay + 2 * (by - ay) / 3;

  // (P2-P1) を P1 中心に +60° 回転させて三角形の頂点 P3 を求める
  const dx = p2x - p1x;
  const dy = p2y - p1y;
  const p3x = p1x + dx * COS60 - dy * SIN60;
  const p3y = p1y + dx * SIN60 + dy * COS60;

  kochRecurse(out, ax, ay, p1x, p1y, depth - 1);
  kochRecurse(out, p1x, p1y, p3x, p3y, depth - 1);
  kochRecurse(out, p3x, p3y, p2x, p2y, depth - 1);
  kochRecurse(out, p2x, p2y, bx, by, depth - 1);
}

/**
 * depth に応じたコッホ曲線の頂点座標配列を生成する。
 * drei の Line コンポーネントに渡すための関数。
 *
 * @param {number} depth - フラクタルの再帰の深さ
 * @returns {[number, number, number][]} [x,y,z] タプルの配列
 */
function generatePoints(depth) {
  const out = [];
  kochRecurse(out, -1, 0, 1, 0, depth);
  out.push([1, 0, 0]);
  return out;
}

/* =========================
   コンポーネント
   ========================= */

/**
 * コッホ曲線のラインコンポーネント。
 * drei の Line を使うことで lineWidth による太線描画が可能。
 *
 * @param {{ depth: number }} props
 */
function KochLine({ depth }) {
  const points = useMemo(() => generatePoints(depth), [depth]);
  return <Line points={points} color="#00e5ff" lineWidth={2} />;
}

/**
 * コッホ曲線の完全なシーン。
 */
export default function KochCurve() {
  return (
    <ControlPanel maxDepth={7} defaultDepth={5} defaultInterval={400} enableWireframe={false}>
      {({ currentDepth }) => (
        <FractalScene>
          <KochLine depth={currentDepth} />
        </FractalScene>
      )}
    </ControlPanel>
  );
}
