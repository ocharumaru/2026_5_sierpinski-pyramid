import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import ControlPanel from "../../components/ControlPanel";
import PanelCheckbox from "../../components/PanelCheckbox";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTheme } from "../../styles/pageStyles";
import { vertexShader, fragmentShader } from "./mandelbulbShader";
import { getFractalCatalogByPath } from "../../models/fractalCatalog";


/**
 * カメラを内包する大きな球の内側にマンデルバルブのレイマーチを描画する。
 * カメラ操作は OrbitControls に任せ、シェーダ側は cameraPosition と
 * 各フラグメントの worldPos からレイを再構築する。
 *
 * @param {{ power: number, bailout: number, maxIterCap: number, shadow: boolean }} props
 */
function MandelbulbBackground({ power, bailout, maxIterCap, shadow }) {
  const matRef = useRef(null);
  // ControlPanel から渡る maxIterCap は整数で 250ms ごとに飛ぶので、
  // 描画用の uMaxIterF は毎フレーム少しずつ追従させて視覚的な階段を消す。
  const displayedIterRef = useRef(2);

  const uniforms = useMemo(
    () => ({
      uPower: { value: 8.0 },
      uBailout: { value: 4.0 },
      uMaxIterF: { value: 2.0 },
      uShadow: { value: 0.0 },
    }),
    []
  );

  useFrame(() => {
    const material = matRef.current;
    if (!material) return;

    displayedIterRef.current = THREE.MathUtils.lerp(displayedIterRef.current, maxIterCap, 0.08);

    material.uniforms.uPower.value = power;
    material.uniforms.uBailout.value = bailout;
    material.uniforms.uMaxIterF.value = displayedIterRef.current;
    material.uniforms.uShadow.value = shadow ? 1.0 : 0.0;
  });

  return (
    <mesh>
      <sphereGeometry args={[30, 16, 16]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

/**
 * マンデルバルブの完全なシーン。
 */
export default function Mandelbulb() {
  const { color, shape } = useTheme();
  const [power, setPower] = useState(8);
  const [bailout, setBailout] = useState(4);
  const [shadow, setShadow] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const isMobile = useIsMobile();

  const basePanel = {
    position: "absolute",
    background: color.cpOverlay,
    color: color.cpText,
    border: `1px solid ${color.cpBorder}`,
    borderRadius: shape.radiusMd,
    fontFamily: "sans-serif",
    zIndex: 10,
  };

  const desktopPanel = {
    panel:  { ...basePanel, top: 16, right: 16, padding: "12px 14px", width: 260, fontSize: 13 },
    title:  { fontWeight: 700, fontSize: 13, color: color.cpText, paddingBottom: 8, borderBottom: `1px solid ${color.cpSubtle}` },
    field:  { marginTop: 10 },
    label:  { color: color.cpText, fontSize: 12 },
    slider: { width: "100%", marginTop: 4, accentColor: color.accent1 },
    hint:   { color: color.cpText, fontSize: 11, marginTop: 10, lineHeight: 1.5 },
  };

  const mobilePanel = {
    panel:  { ...basePanel, bottom: 12, left: 12, right: 12, padding: "8px 10px", fontSize: 12 },
    title:  { fontWeight: 700, fontSize: 12, color: color.cpText, paddingBottom: 6, borderBottom: `1px solid ${color.cpSubtle}` },
    field:  { marginTop: 8 },
    label:  { color: color.cpText, fontSize: 11 },
    slider: { width: "100%", marginTop: 3, accentColor: color.accent1 },
    hint:   { color: color.cpText, fontSize: 10, marginTop: 8, lineHeight: 1.45 },
  };

  const s = isMobile ? mobilePanel : desktopPanel;

  
  return (
    <ControlPanel
      maxDepth={24}
      defaultDepth={14}
      defaultInterval={250}
      extraControls={
        <PanelCheckbox label="影をつける" checked={shadow} onChange={setShadow} />
      }
    >
      {({ currentDepth }) => (
        <>
          <div style={s.panel}>
            <div style={s.header}>
              <span style={s.title}>Mandelbulb (Raymarch)</span>

              <button
                onClick={() => setIsMinimized((v) => !v)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${color.cpBorder}`,
                  borderRadius: shape.radiusSm,
                  color: color.cpText,
                  cursor: 'pointer',
                  fontSize: 11,
                  padding: '2px 7px',
                  lineHeight: 1,
                }}
              >
                {isMinimized ? '▲' : '▼'}
              </button>
            </div>
            
            {!isMinimized && (
              <>
            <div style={s.field}>
                  <div style={s.label}>べき乗の指数: {power} <span style={{fontSize: '0.9em'}}>（花弁の数などが変わる）</span></div>
              <input
                style={s.slider}
                type="range"
                min="2"
                max="12"
                step="1"
                value={power}
                onChange={(e) => setPower(parseInt(e.target.value, 10))}
              />
            </div>

            <div style={s.hint}>
              {isMobile
                ? "1本指: 回転 / 2本指: ピンチで拡大・ドラッグで移動"
                : "左ドラッグ: 回転 / 右ドラッグ: 平行移動 / ホイール: ズーム"}
            </div>
              </>
            )}
          </div>

          <Canvas
            style={{ width: "100vw", height: "100dvh", background: color.bgPage }}
            gl={{ alpha: true }}
            camera={{ position: [0, 0, 4.8], fov: 50 }}
            dpr={[1, isMobile ? 1.25 : 2]}
          >
            <MandelbulbBackground
              power={power}
              bailout={bailout}
              maxIterCap={Math.max(2, currentDepth)}
              shadow={shadow}
            />
            <OrbitControls
              enableDamping
              minDistance={1.5}
              maxDistance={4.8}
            />
          </Canvas>
        </>
      )}
    </ControlPanel>
  );
}
