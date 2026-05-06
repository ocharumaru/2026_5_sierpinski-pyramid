import { Canvas, useFrame, useThree } from "@react-three/fiber";
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
 * フルスクリーン平面にマンデルバルブをレイマーチング描画する。
 *
 * @param {{ power: number, bailout: number, maxIterCap: number }} props
 */
function MandelbulbFullscreen({ power, bailout, maxIterCap }) {
  const matRef = useRef(null);
  const elapsedRef = useRef(0);

  const rotRef = useRef(new THREE.Vector2(0, 0));
  const panRef = useRef(new THREE.Vector2(0, 0));
  const lastPosRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1.0);
  const dragModeRef = useRef("rotate");
  const isDownRef = useRef(false);
  const movedRef = useRef(false);
  const growStartRef = useRef(0);

  const { gl, size } = useThree();

  const uniforms = useMemo(
    () => ({
      uResolution: { value: new THREE.Vector2(1, 1) },
      uRot: { value: new THREE.Vector2(0, 0) },
      uPan: { value: new THREE.Vector2(0, 0) },
      uGrow: { value: 0 },
      uZoom: { value: 1.0 },
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

    const dpr = gl.getPixelRatio();
    material.uniforms.uResolution.value.set(size.width * dpr, size.height * dpr);

    material.uniforms.uPower.value = power;
    material.uniforms.uBailout.value = bailout;
    material.uniforms.uMaxIterF.value = maxIterCap;

    const grow = THREE.MathUtils.clamp((t - growStartRef.current) / 2.5, 0, 1);
    material.uniforms.uGrow.value = grow;

    material.uniforms.uZoom.value = THREE.MathUtils.lerp(material.uniforms.uZoom.value, zoomRef.current, 0.1);
    material.uniforms.uRot.value.copy(rotRef.current);
    material.uniforms.uPan.value.copy(panRef.current);
  });

  useEffect(() => {
    const el = gl.domElement;
    const clickThreshold = 6;
    const rotSpeed = 2.4;
    const panSpeed = 2.0;

    const onContextMenu = (e) => {
      e.preventDefault();
    };

    const onDown = (e) => {
      isDownRef.current = true;
      movedRef.current = false;
      dragModeRef.current = e.button === 2 ? "pan" : "rotate";
      lastPosRef.current.x = e.clientX;
      lastPosRef.current.y = e.clientY;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // noop
      }
    };

    const onMove = (e) => {
      if (!isDownRef.current) return;

      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;

      if (dx * dx + dy * dy > clickThreshold * clickThreshold) {
        movedRef.current = true;
      }

      lastPosRef.current.x = e.clientX;
      lastPosRef.current.y = e.clientY;

      if (dragModeRef.current === "pan") {
        panRef.current.x += (dx / size.height) * panSpeed;
        panRef.current.y -= (dy / size.height) * panSpeed;
      } else {
        const yaw = rotRef.current.x + (dx / size.width) * rotSpeed * Math.PI;
        const pitch = rotRef.current.y + (dy / size.height) * rotSpeed * Math.PI;
        rotRef.current.set(yaw, THREE.MathUtils.clamp(pitch, -1.45, 1.45));
      }
    };

    const onUp = (e) => {
      // pointerleave / pointercancel などで誤って再生成しないように、
      // 実際にポインターダウンした操作のみを終了処理の対象にする。
      if (!isDownRef.current) return;

      isDownRef.current = false;

      if (e.type === "pointerup" && e.button === 0 && !movedRef.current && dragModeRef.current === "rotate") {
        growStartRef.current = elapsedRef.current;
      }

      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        // noop
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      const zoomSpeed = 0.001;
      const nextZoom = zoomRef.current - e.deltaY * zoomSpeed;
      zoomRef.current = Math.max(0.1, Math.min(nextZoom, 10.0));
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("contextmenu", onContextMenu);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onUp);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("contextmenu", onContextMenu);
    };
  }, [gl, size.width, size.height]);

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
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
                ? "1本指ドラッグ: 回転 / タップ: 成長リセット"
                : "左ドラッグ: 回転 / 右ドラッグ: 平行移動 / ホイール: ズーム / クリック: 成長リセット"}
            </div>
          </div>

          <Canvas
            style={{ width: "100vw", height: "100vh" }}
            orthographic
            camera={{ position: [0, 0, 1], zoom: 1 }}
            dpr={[1, 2]}
          >
            <MandelbulbFullscreen
              power={power}
              bailout={bailout}
              maxIterCap={Math.max(2, currentDepth)}
            />
          </Canvas>
        </>
      )}
    </ControlPanel>
  );
}