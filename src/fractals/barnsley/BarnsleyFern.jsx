import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import FractalScene from "../../components/FractalScene";
import ControlPanel from "../../components/ControlPanel";
import PanelCheckbox from "../../components/PanelCheckbox";
import { DEFAULT_PARAMS, generatePositions, paramsToTransforms } from "./barnsleyMath";
import FernEditor from "./FernEditor";
import { useTheme } from "../../styles/pageStyles";
import { getFractalCatalogByPath } from "../../models/fractalCatalog";

const MODEL = getFractalCatalogByPath("barnsley");

/* =========================
   描画コンポーネント
   ========================= */

/**
 * バーンズリーのシダの点群コンポーネント。
 * depth が 0 の場合は描画をスキップする。
 *
 * tracking=true: 1フレームごとに setDrawRange で表示点数を増やし、
 *                 カオスゲームの軌跡が順に描画されていく演出を行う。
 *                 最新の点位置にはヘッドマーカー(黄色の球)を置く。
 * tracking=false: depth に対応する全点を即座に表示する（演出なし）。
 *
 * @param {{ depth: number, transforms: object[], tracking: boolean }} props
 */
function BarnsleyFernPoints({ depth, transforms, tracking, pointColor, headColor }) {
  const positions = useMemo(
    () => generatePositions(Math.max(depth, 1), transforms),
    [depth, transforms]
  );

  const visibleCountRef = useRef(0);
  const headRef = useRef(null);

  // 形を変えたとき（変換が変わったとき）は最初から描き直す
  useEffect(() => {
    visibleCountRef.current = 0;
  }, [transforms]);

  // ControlPanel のリセット（depth=0）でも先頭から描き直す
  useEffect(() => {
    if (depth <= 0) visibleCountRef.current = 0;
  }, [depth]);

  // depth 変更時は新しい BufferGeometry を作る
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [positions]);

  // 新しい geometry の drawRange を、前の表示点数に揃えてから描画させる。
  // tracking=false のときは常に全点を表示状態にする。
  useLayoutEffect(() => {
    const totalPoints = positions.length / 3;
    if (!tracking) {
      visibleCountRef.current = totalPoints;
    } else if (visibleCountRef.current > totalPoints) {
      visibleCountRef.current = totalPoints;
    }
    geometry.setDrawRange(0, visibleCountRef.current);
  }, [geometry, positions, tracking]);

  // 毎フレーム: 表示点数を進めてヘッドマーカーを最新位置に移動する
  useFrame(() => {
    if (!tracking) return;

    const totalPoints = positions.length / 3;
    if (visibleCountRef.current < totalPoints) {
      // 小さい depth では1フレーム数点ずつ、大きい depth では多めに進める
      const step = Math.max(5, Math.floor(totalPoints / 180));
      visibleCountRef.current = Math.min(totalPoints, visibleCountRef.current + step);
      geometry.setDrawRange(0, visibleCountRef.current);
    }
    if (headRef.current && visibleCountRef.current > 0) {
      const i = (visibleCountRef.current - 1) * 3;
      headRef.current.position.set(positions[i], positions[i + 1], positions[i + 2]);
    }
  });

  if (depth <= 0) return null;

  return (
    <>
      <points geometry={geometry}>
        <pointsMaterial color={pointColor} size={0.012} sizeAttenuation />
      </points>
      {tracking && (
        <mesh ref={headRef}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial color={headColor} />
        </mesh>
      )}
    </>
  );
}

/* =========================
   全体シーン
   ========================= */

/**
 * バーンズリーのシダの完全なシーン。
 */
export default function BarnsleyFern() {
  const { theme } = useTheme();
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [tracking, setTracking] = useState(true);
  const transforms = useMemo(() => paramsToTransforms(params), [params]);
  const pointColor = MODEL.meshColor[theme];
  const headColor  = MODEL.meshAccentColor[theme];

  return (
    <ControlPanel
      maxDepth={6}
      defaultDepth={5}
      defaultInterval={500}
      extraControls={
        <PanelCheckbox label="追跡モード" checked={tracking} onChange={setTracking} />
      }
    >
      {({ currentDepth }) => (
        <>
          <FernEditor params={params} onChange={setParams} />
          <FractalScene cameraPosition={[0, 0, 3]} showGrid={false} maxDistance={7}>
            <BarnsleyFernPoints
              depth={currentDepth}
              transforms={transforms}
              tracking={tracking}
              pointColor={pointColor}
              headColor={headColor}
            />
          </FractalScene>
        </>
      )}
    </ControlPanel>
  );
}
