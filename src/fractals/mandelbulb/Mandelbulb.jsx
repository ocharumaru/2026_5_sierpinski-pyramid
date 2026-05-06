import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import ControlPanel from "../../components/ControlPanel";
import { useIsMobile } from "../../hooks/useIsMobile";
import { color, shape } from "../../styles/pageStyles";
import { vertexShader, fragmentShader } from "./mandelbulbShader";

const basePanel = {
  position: "absolute",
  background: color.bgOverlay,
  color: color.textPrimary,
  border: `1px solid ${color.borderDefault}`,
  borderRadius: shape.radiusMd,
  fontFamily: "sans-serif",
  zIndex: 10,
};

const desktopPanel = {
  panel:  { ...basePanel, top: 16, right: 16, padding: "12px 14px", width: 260, fontSize: 13 },
  title:  { fontWeight: 700, fontSize: 13, color: color.textPrimary, paddingBottom: 8, borderBottom: `1px solid ${color.borderSubtle}` },
  field:  { marginTop: 10 },
  label:  { color: color.textSecondary, fontSize: 12 },
  slider: { width: "100%", marginTop: 4, accentColor: color.purple },
  hint:   { color: color.textMuted, fontSize: 11, marginTop: 10, lineHeight: 1.5 },
};

const mobilePanel = {
  panel:  { ...basePanel, bottom: 12, left: 12, right: 12, padding: "8px 10px", fontSize: 12 },
  title:  { fontWeight: 700, fontSize: 12, color: color.textPrimary, paddingBottom: 6, borderBottom: `1px solid ${color.borderSubtle}` },
  field:  { marginTop: 8 },
  label:  { color: color.textSecondary, fontSize: 11 },
  slider: { width: "100%", marginTop: 3, accentColor: color.purple },
  hint:   { color: color.textMuted, fontSize: 10, marginTop: 8, lineHeight: 1.45 },
};

/**
 * カメラを内包する大きな球の内側にマンデルバルブのレイマーチを描画する。
 * カメラ操作は OrbitControls に任せ、シェーダ側は cameraPosition と
 * 各フラグメントの worldPos からレイを再構築する。
 *
 * @param {{ power: number, bailout: number, maxIterCap: number }} props
 */
function MandelbulbBackground({ power, bailout, maxIterCap }) {
  const matRef = useRef(null);
  const elapsedRef = useRef(0);
  const growStartRef = useRef(0);
  const { gl } = useThree();

  const uniforms = useMemo(
    () => ({
      uGrow: { value: 0 },
      uPower: { value: 8.0 },
      uBailout: { value: 4.0 },
      uMaxIterF: { value: 2.0 },
    }),
    []
  );

  useFrame(({ clock }) => {
    const material = matRef.current;
    if (!material) return;

    const t = clock.getElapsedTime();
    elapsedRef.current = t;

    material.uniforms.uPower.value = power;
    material.uniforms.uBailout.value = bailout;
    material.uniforms.uMaxIterF.value = maxIterCap;

    const grow = THREE.MathUtils.clamp((t - growStartRef.current) / 2.5, 0, 1);
    material.uniforms.uGrow.value = grow;
  });

  // タップ/クリックで成長アニメをリセット。
  // ブラウザの click イベントは OrbitControls のドラッグ終端でも発火することが
  // あるので使わず、pointerdown→pointerup の移動量が閾値以下のときだけ
  // タップと判定する。
  useEffect(() => {
    const el = gl.domElement;
    const threshold = 6;
    let hasDown = false;
    let moved = false;
    let downX = 0;
    let downY = 0;

    const onDown = (e) => {
      if (!e.isPrimary) return;
      hasDown = true;
      moved = false;
      downX = e.clientX;
      downY = e.clientY;
    };

    const onMove = (e) => {
      if (!hasDown) return;
      const dx = e.clientX - downX;
      const dy = e.clientY - downY;
      if (dx * dx + dy * dy > threshold * threshold) {
        moved = true;
      }
    };

    const onUp = (e) => {
      if (!hasDown || !e.isPrimary) return;
      hasDown = false;
      if (!moved) {
        growStartRef.current = elapsedRef.current;
      }
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [gl]);

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
  const [power, setPower] = useState(8);
  const [bailout, setBailout] = useState(4);
  const isMobile = useIsMobile();
  const s = isMobile ? mobilePanel : desktopPanel;

  return (
    <ControlPanel
      maxDepth={24}
      defaultDepth={14}
      defaultInterval={250}
      enableWireframe={false}
    >
      {({ currentDepth }) => (
        <>
          <div style={s.panel}>
            <div style={s.title}>Mandelbulb (Raymarch)</div>

            <div style={s.field}>
              <div style={s.label}>べき乗の指数: {power}</div>
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

            <div style={s.field}>
              <div style={s.label}>広がりの限界: {bailout.toFixed(1)}</div>
              <input
                style={s.slider}
                type="range"
                min="2"
                max="12"
                step="0.1"
                value={bailout}
                onChange={(e) => setBailout(parseFloat(e.target.value))}
              />
            </div>

            <div style={s.hint}>
              {isMobile
                ? "1本指: 回転 / 2本指: ピンチで拡大・ドラッグで移動 / タップ: 成長リセット"
                : "左ドラッグ: 回転 / 右ドラッグ: 平行移動 / ホイール: ズーム / クリック: 成長リセット"}
            </div>
          </div>

          <Canvas
            style={{ width: "100vw", height: "100dvh" }}
            camera={{ position: [0, 0, 3.0], fov: 50 }}
            dpr={[1, isMobile ? 1.25 : 2]}
          >
            <MandelbulbBackground
              power={power}
              bailout={bailout}
              maxIterCap={Math.max(2, currentDepth)}
            />
            <OrbitControls
              enableDamping
              minDistance={1.5}
              maxDistance={20}
            />
          </Canvas>
        </>
      )}
    </ControlPanel>
  );
}
