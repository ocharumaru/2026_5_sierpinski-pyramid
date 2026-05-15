import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import FractalScene from "../../components/FractalScene";
import ControlPanel from "../../components/ControlPanel";
import PanelCheckbox from "../../components/PanelCheckbox";
import { useTheme } from "../../styles/pageStyles";
import { getFractalCatalogByPath } from "../../models/fractalCatalog";

const MODEL = getFractalCatalogByPath("hilbert");

/* =========================
   3次元ヒルベルト曲線 生成ロジック
   ========================= */

/**
 * 3次元ヒルベルト曲線の頂点列を再帰的に生成する標準的アルゴリズム。
 * (three.js などの実装をベースにした頂点置換ベース)
 */
function hilbert3D(vec, half, iterations, v0, v1, v2, v3, v4, v5, v6, v7, out) {
  // キューブの8つの頂点
  const vec_s = [
    [vec[0] - half, vec[1] + half, vec[2] - half],
    [vec[0] - half, vec[1] + half, vec[2] + half],
    [vec[0] - half, vec[1] - half, vec[2] + half],
    [vec[0] - half, vec[1] - half, vec[2] - half],
    [vec[0] + half, vec[1] - half, vec[2] - half],
    [vec[0] + half, vec[1] - half, vec[2] + half],
    [vec[0] + half, vec[1] + half, vec[2] + half],
    [vec[0] + half, vec[1] + half, vec[2] - half]
  ];

  // 指定された順序で頂点を並べ替え
  const v = [
    vec_s[v0], vec_s[v1], vec_s[v2], vec_s[v3],
    vec_s[v4], vec_s[v5], vec_s[v6], vec_s[v7]
  ];

  if (--iterations >= 0) {
    const nextHalf = half / 2;
    hilbert3D(v[0], nextHalf, iterations, v0, v3, v4, v7, v6, v5, v2, v1, out);
    hilbert3D(v[1], nextHalf, iterations, v0, v7, v6, v1, v2, v5, v4, v3, out);
    hilbert3D(v[2], nextHalf, iterations, v0, v7, v6, v1, v2, v5, v4, v3, out);
    hilbert3D(v[3], nextHalf, iterations, v2, v3, v0, v1, v6, v7, v4, v5, out);
    hilbert3D(v[4], nextHalf, iterations, v2, v3, v0, v1, v6, v7, v4, v5, out);
    hilbert3D(v[5], nextHalf, iterations, v4, v3, v2, v5, v6, v1, v0, v7, out);
    hilbert3D(v[6], nextHalf, iterations, v4, v3, v2, v5, v6, v1, v0, v7, out);
    hilbert3D(v[7], nextHalf, iterations, v6, v5, v2, v1, v0, v3, v4, v7, out);
  } else {
    // 最終レベルに達したら頂点を順に登録
    out.push(...v);
  }
}

/**
 * depth に応じた3次元ヒルベルト曲線の頂点座標配列を生成する。
 * drei の Line コンポーネントに渡すための関数。
 * 曲線は [-1, 1]^3 の範囲に正規化される。
 *
 * @param {number} depth - フラクタルの再帰の深さ
 * @returns {[number, number, number][]} [x,y,z] タプルの配列
 */
function generatePoints(depth) {
  const out = [];
  // iterations は depth - 1 とする（depth=1で8頂点）
  // 空間の中心を[0,0,0]とし、半分の幅(half)を1とする(幅2の立方体:-1～1)
  hilbert3D([0, 0, 0], 1, depth - 1, 0, 1, 2, 3, 4, 5, 6, 7, out);

  // 全体の大きさが depth によって変わらないように [-1, 1] の範囲に正規化
  let maxCoord = 0;
  for (const p of out) {
    maxCoord = Math.max(maxCoord, Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2]));
  }

  if (maxCoord > 0) {
    for (let i = 0; i < out.length; i++) {
      out[i][0] /= maxCoord;
      out[i][1] /= maxCoord;
      out[i][2] /= maxCoord;
    }
  }

  return out;
}

/* =========================
   描画コンポーネント
   ========================= */

/**
 * 3次元ヒルベルト曲線のラインコンポーネント（静的描画モード）。
 * drei の Line を使うことで lineWidth による太線描画が可能。
 *
 * @param {{ depth: number }} props
 */
function HilbertLine({ depth, color, lineWidth }) {
  const points = useMemo(() => generatePoints(depth), [depth]);
  return <Line points={points} color={color} lineWidth={lineWidth} />;
}

/**
 * 3次元ヒルベルト曲線の追跡描画モード。
 * drei の Line（内部は Line2 / LineSegmentsGeometry）を ref 経由で取り、
 * 毎フレーム instanceCount を増やすことで太線のまま順次描画する演出を行う。
 * 最新の頂点位置にはヘッドマーカー(黄色の球)を置く。
 *
 * @param {{ depth: number, stepInterval: number }} props
 */
function HilbertLineTracking({ depth, stepInterval, lineColor, headColor, lineWidth }) {
  const points = useMemo(() => generatePoints(depth), [depth]);

  const lineRef = useRef(null);
  const visibleCountRef = useRef(0);
  const headRef = useRef(null);

  // depth=0 へのリセットでは先頭から描き直す
  useEffect(() => {
    if (depth <= 0) visibleCountRef.current = 0;
  }, [depth]);

  // points が変わった直後（geometry 再構築後）に、前の表示セグメント数へ揃える
  useLayoutEffect(() => {
    const totalSegments = Math.max(0, points.length - 1);
    if (visibleCountRef.current > totalSegments) {
      visibleCountRef.current = totalSegments;
    }
    if (lineRef.current?.geometry) {
      lineRef.current.geometry.instanceCount = visibleCountRef.current;
    }
  }, [points]);

  useFrame(() => {
    const totalSegments = Math.max(0, points.length - 1);
    if (visibleCountRef.current < totalSegments) {
      // 自動ステップ送り（stepInterval ms）の 80% 以内に描き終わるよう step を決める。
      // 60fps 想定で frames = stepInterval * 0.8 / (1000/60)
      const targetFrames = Math.max(1, (stepInterval * 0.8) / (1000 / 60));
      const step = Math.max(2, Math.ceil(totalSegments / targetFrames));
      visibleCountRef.current = Math.min(totalSegments, visibleCountRef.current + step);
    }
    if (lineRef.current?.geometry) {
      lineRef.current.geometry.instanceCount = visibleCountRef.current;
    }
    if (headRef.current && visibleCountRef.current > 0) {
      const p = points[visibleCountRef.current];
      headRef.current.position.set(p[0], p[1], p[2]);
    }
  });

  return (
    <>
      <Line ref={lineRef} points={points} color={lineColor} lineWidth={lineWidth} />
      <mesh ref={headRef}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color={headColor} />
      </mesh>
    </>
  );
}

/* =========================
   全体シーン
   ========================= */

/**
 * 3次元ヒルベルト曲線の完全なシーン。
 */
export default function HilbertCurve() {
  const { theme } = useTheme();
  const [tracking, setTracking] = useState(false);
  const lineColor = MODEL.meshColor[theme];
  const headColor = MODEL.meshAccentColor[theme];

  // 輻射錯視（Helmholtz irradiation illusion）への対策。
  // 明るい背景上の暗い線は、同じ物理太さでも暗い背景上の明るい線より細く見える。
  // ライト時のみ線幅を約30%太くして、ダーク時と知覚上の太さを揃える。
  const lineWidth = theme === 'light' ? 2.6 : 2;

  return (
    <ControlPanel
      maxDepth={6}
      defaultDepth={4}
      defaultInterval={600}
      extraControls={
        <PanelCheckbox label="追跡モード" checked={tracking} onChange={setTracking} />
      }
    >
      {({ currentDepth, stepInterval }) => (
        <FractalScene cameraPosition={[5, 5, 5]} showGrid={true}>
          {tracking
            ? <HilbertLineTracking depth={currentDepth} stepInterval={stepInterval} lineColor={lineColor} headColor={headColor} lineWidth={lineWidth} />
            : <HilbertLine depth={currentDepth} color={lineColor} lineWidth={lineWidth} />}
        </FractalScene>
      )}
    </ControlPanel>
  );
}
