import { useMemo } from "react";
import { Line } from "@react-three/drei";
import FractalScene from "../../components/FractalScene";
import ControlPanel from "../../components/ControlPanel";
import { useTheme } from "../../styles/pageStyles";
import { getFractalCatalogByPath } from "../../models/fractalCatalog";

const MODEL = getFractalCatalogByPath("dragon");
const VIEW_SIZE = 2.8;

/* =========================
   ドラゴン曲線 生成ロジック
   ========================= */

function normalizePoints(points) {
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

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const span = Math.max(maxX - minX, maxY - minY, 1);
  const scale = VIEW_SIZE / span;

  return points.map(([x, y]) => [
    (x - centerX) * scale,
    (y - centerY) * scale,
    0,
  ]);
}

/**
 * 終点を軸に、既存の折れ線を90度回転コピーしてつなげる。
 * depth に対して線分数は 2^depth になる。
 *
 * @param {number} depth - フラクタルの再帰の深さ
 * @returns {[number, number, number][]} [x,y,z] タプルの配列
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

  return normalizePoints(points);
}

/* =========================
   コンポーネント
   ========================= */

function DragonLine({ depth, color, lineWidth }) {
  const points = useMemo(() => generatePoints(depth), [depth]);
  return <Line points={points} color={color} lineWidth={lineWidth} />;
}

export default function DragonCurve() {
  const { theme } = useTheme();
  const lineColor = MODEL.meshColor[theme];

  // 明るい背景では暗い線が細く見えやすいため、既存の Hilbert と同じ補正を入れる。
  const lineWidth = theme === 'light' ? 2.6 : 2;

  return (
    <ControlPanel maxDepth={18} defaultDepth={14} defaultInterval={350}>
      {({ currentDepth }) => (
        <FractalScene cameraPosition={[0, 0, 4]}>
          <DragonLine depth={currentDepth} color={lineColor} lineWidth={lineWidth} />
        </FractalScene>
      )}
    </ControlPanel>
  );
}
