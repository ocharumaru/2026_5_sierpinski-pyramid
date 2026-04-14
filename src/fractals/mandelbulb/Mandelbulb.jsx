import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import ControlPanel from "../../components/ControlPanel";
import { vertexShader, fragmentShader } from "./mandelbulbShader";

const extraPanelStyle = {
  position: "absolute",
  top: 20,
  right: 20,
  minWidth: 260,
  padding: "14px 16px",
  borderRadius: 10,
  background: "rgba(0, 0, 0, 0.75)",
  color: "white",
  fontFamily: "sans-serif",
  fontSize: 13,
  zIndex: 10,
};

const sliderStyle = {
  width: "100%",
  marginTop: 4,
};

/**
 * フルスクリーン平面にマンデルバルブをレイマーチング描画する。
 *
 * @param {{ power: number, bailout: number, maxIterCap: number }} props
 */
function MandelbulbFullscreen({ power, bailout, maxIterCap }) {
  const matRef = useRef(null);

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
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uRot: { value: new THREE.Vector2(0, 0) },
      uPan: { value: new THREE.Vector2(0, 0) },
      uGrow: { value: 0 },
      uZoom: { value: 1.0 },
      uPower: { value: power },
      uBailout: { value: bailout },
      uMaxIterF: { value: maxIterCap },
    }),
    []
  );

  useFrame(({ clock }) => {
    const material = matRef.current;
    if (!material) return;

    const t = clock.getElapsedTime();
    material.uniforms.uTime.value = t;

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
      isDownRef.current = false;

      if (!movedRef.current && dragModeRef.current === "rotate") {
        growStartRef.current = matRef.current?.uniforms?.uTime?.value ?? 0;
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

  return (
    <ControlPanel maxDepth={24} defaultDepth={14} defaultInterval={250}>
      {({ currentDepth }) => (
        <>
          <div style={extraPanelStyle}>
            <div style={{ fontWeight: 700 }}>Mandelbulb (Raymarch)</div>

            <div style={{ marginTop: 8 }}>
              べき乗の指数: {power}
              <input
                style={sliderStyle}
                type="range"
                min="2"
                max="12"
                step="1"
                value={power}
                onChange={(e) => setPower(parseInt(e.target.value, 10))}
              />
            </div>

            <div style={{ marginTop: 8 }}>
              広がりの限界: {bailout.toFixed(1)}
              <input
                style={sliderStyle}
                type="range"
                min="2"
                max="12"
                step="0.1"
                value={bailout}
                onChange={(e) => setBailout(parseFloat(e.target.value))}
              />
            </div>

            <div style={{ opacity: 0.85, marginTop: 8 }}>
              左ドラッグ: 回転 / 右ドラッグ: 平行移動 / ホイール: ズーム / クリック: 成長リセット
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