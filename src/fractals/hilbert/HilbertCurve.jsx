import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import FractalScene from "../../components/FractalScene";
import ControlPanel from "../../components/ControlPanel";
import PanelCheckbox from "../../components/PanelCheckbox";

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
function HilbertLine({ depth }) {
  const points = useMemo(() => generatePoints(depth), [depth]);
  return <Line points={points} color="#a78bfa" lineWidth={2} />;
}

/**
 * 3次元ヒルベルト曲線の追跡描画モード。
 * 1フレームごとに setDrawRange で表示頂点数を増やし、曲線が空間を
 * 埋めていく様子をアニメーションで見せる。最新の頂点位置にはヘッド
 * マーカー(黄色の球)を置く。
 *
 * GL の line は仕様上 1px 固定なので静的モードのような太線にはできない。
 *
 * @param {{ depth: number }} props
 */
function HilbertLineTracking({ depth, stepInterval }) {
  const points = useMemo(() => generatePoints(depth), [depth]);

  // [x,y,z] タプル配列を Float32Array に詰め直す
  const positions = useMemo(() => {
    const arr = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      arr[i * 3] = points[i][0];
      arr[i * 3 + 1] = points[i][1];
      arr[i * 3 + 2] = points[i][2];
    }
    return arr;
  }, [points]);

  const visibleCountRef = useRef(0);
  const headRef = useRef(null);

  // depth=0 へのリセットでは先頭から描き直す
  useEffect(() => {
    if (depth <= 0) visibleCountRef.current = 0;
  }, [depth]);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [positions]);

  // 新しい geometry の drawRange を、前の表示頂点数に揃えてから描画させる
  useLayoutEffect(() => {
    const totalPoints = positions.length / 3;
    if (visibleCountRef.current > totalPoints) {
      visibleCountRef.current = totalPoints;
    }
    geometry.setDrawRange(0, visibleCountRef.current);
  }, [geometry, positions]);

  useFrame(() => {
    const totalPoints = positions.length / 3;
    if (visibleCountRef.current < totalPoints) {
      // 自動ステップ送り（stepInterval ms）の 80% 以内に描き終わるよう step を決める。
      // 60fps 想定で frames = stepInterval * 0.8 / (1000/60)
      const targetFrames = Math.max(1, (stepInterval * 0.8) / (1000 / 60));
      const step = Math.max(2, Math.ceil(totalPoints / targetFrames));
      visibleCountRef.current = Math.min(totalPoints, visibleCountRef.current + step);
      geometry.setDrawRange(0, visibleCountRef.current);
    }
    if (headRef.current && visibleCountRef.current > 0) {
      const i = (visibleCountRef.current - 1) * 3;
      headRef.current.position.set(positions[i], positions[i + 1], positions[i + 2]);
    }
  });

  return (
    <>
      <line geometry={geometry}>
        <lineBasicMaterial color="#a78bfa" />
      </line>
      <mesh ref={headRef}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color="#fde047" />
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
  const [tracking, setTracking] = useState(false);

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
        <FractalScene>
          {tracking
            ? <HilbertLineTracking depth={currentDepth} stepInterval={stepInterval} />
            : <HilbertLine depth={currentDepth} />}
        </FractalScene>
      )}
    </ControlPanel>
  );
}
