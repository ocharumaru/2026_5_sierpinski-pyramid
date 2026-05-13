import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./mandelbrotShader";
import { INITIAL_MANDELBROT_VIEW } from "./mandelbrotMath";

// 最大ズームアウト(view.width=8)でも余裕で覆える大きさ。
// 頂点数は4のままなので大きくしても描画コストは増えない。
const PLANE_SIZE = 1000;

function MandelbrotMesh({ maxIter, bailout, insideColor, accentColor }) {
  const matRef = useRef(null);

  const uniforms = useMemo(
    () => ({
      uMaxIterF: { value: 1.0 },
      uBailout: { value: 2.0 },
      uInsideColor: { value: new THREE.Color("#000000") },
      uAccentColor: { value: new THREE.Color("#ffffff") },
    }),
    []
  );

  useEffect(() => {
    if (!matRef.current) return;
    matRef.current.uniforms.uMaxIterF.value = Math.max(1, maxIter);
    matRef.current.uniforms.uBailout.value = bailout;
    matRef.current.uniforms.uInsideColor.value.set(insideColor);
    matRef.current.uniforms.uAccentColor.value.set(accentColor);
  }, [maxIter, bailout, insideColor, accentColor]);

  return (
    <mesh>
      <planeGeometry args={[PLANE_SIZE, PLANE_SIZE]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

// カメラとキャンバスサイズへの ref を上層に渡しつつ、初回描画時に
// 「マンデルブロ集合全体が見える」初期ズームを計算してカメラに反映する。
// three.js オブジェクトはミュータブルが前提なので、useThree 返り値を直接
// 書き換える方針で eslint(react-hooks/immutability) は抑制する。
function Setup({ cameraRef, canvasSizeRef }) {
  const three = useThree();
  const initializedRef = useRef(false);

  useEffect(() => {
    const { camera, size } = three;
    cameraRef.current = camera;
    canvasSizeRef.current = size;

    if (initializedRef.current || size.width === 0) return;
    // eslint-disable-next-line react-hooks/immutability
    camera.zoom = size.width / INITIAL_MANDELBROT_VIEW.width;
    camera.position.set(
      INITIAL_MANDELBROT_VIEW.centerX,
      INITIAL_MANDELBROT_VIEW.centerY,
      10
    );
    camera.updateProjectionMatrix();
    initializedRef.current = true;
  });

  return null;
}

export default function MandelbrotCanvas({
  maxIter,
  bailout,
  isMobile,
  background,
  insideColor,
  accentColor,
  cameraRef,
  controlsRef,
  canvasSizeRef,
}) {
  return (
    <Canvas
      orthographic
      camera={{
        position: [
          INITIAL_MANDELBROT_VIEW.centerX,
          INITIAL_MANDELBROT_VIEW.centerY,
          10,
        ],
        zoom: 400,
        near: 0.1,
        far: 100,
      }}
      style={{
        width: "100vw",
        height: "100dvh",
        background,
        touchAction: "none",
      }}
      dpr={[1, isMobile ? 1.25 : 2]}
    >
      <Setup cameraRef={cameraRef} canvasSizeRef={canvasSizeRef} />
      <MandelbrotMesh
        maxIter={maxIter}
        bailout={bailout}
        insideColor={insideColor}
        accentColor={accentColor}
      />
      <OrbitControls
        ref={controlsRef}
        target={[
          INITIAL_MANDELBROT_VIEW.centerX,
          INITIAL_MANDELBROT_VIEW.centerY,
          0,
        ]}
        enableRotate={false}
        screenSpacePanning
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
        touches={{
          ONE: THREE.TOUCH.PAN,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />
    </Canvas>
  );
}
