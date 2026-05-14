import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./newtonShader";
import { DEFAULT_NEWTON, INITIAL_NEWTON_VIEW } from "./newtonMath";

const PLANE_SIZE = 1000;

function NewtonMesh({
  maxIter,
  polyMode,
  aRe,
  aIm,
  tol,
  insideColor,
  rootColors,
  rootCount,
}) {
  const matRef = useRef(null);

  const uniforms = useMemo(
    () => ({
      uMaxIterF: { value: 1.0 },
      uPolyMode: { value: DEFAULT_NEWTON.polyMode },
      uA: { value: new THREE.Vector2(DEFAULT_NEWTON.aRe, DEFAULT_NEWTON.aIm) },
      uTol: { value: DEFAULT_NEWTON.tol },
      uInsideColor: { value: new THREE.Color("#000000") },
      uRootColors: {
        value: [
          new THREE.Color("#000000"),
          new THREE.Color("#000000"),
          new THREE.Color("#000000"),
          new THREE.Color("#000000"),
          new THREE.Color("#000000"),
        ],
      },
      uRootCount: { value: 3 },
    }),
    []
  );

  useEffect(() => {
    if (!matRef.current) return;
    const { uniforms: shaderUniforms } = matRef.current;
    shaderUniforms.uMaxIterF.value = Math.max(1, maxIter);
    shaderUniforms.uPolyMode.value = polyMode;
    shaderUniforms.uA.value.set(aRe, aIm);
    shaderUniforms.uTol.value = tol;
    shaderUniforms.uInsideColor.value.set(insideColor);
    shaderUniforms.uRootCount.value = rootCount;
    for (let i = 0; i < 5; i += 1) {
      shaderUniforms.uRootColors.value[i].set(rootColors[i] ?? "#000000");
    }
  }, [maxIter, polyMode, aRe, aIm, tol, insideColor, rootColors, rootCount]);

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

function Setup({ cameraRef, canvasSizeRef }) {
  const three = useThree();
  const initializedRef = useRef(false);

  useEffect(() => {
    const { camera, size } = three;
    cameraRef.current = camera;
    canvasSizeRef.current = size;

    if (initializedRef.current || size.width === 0) return;
    // eslint-disable-next-line react-hooks/immutability
    camera.zoom = size.width / INITIAL_NEWTON_VIEW.width;
    camera.position.set(
      INITIAL_NEWTON_VIEW.centerX,
      INITIAL_NEWTON_VIEW.centerY,
      10
    );
    camera.updateProjectionMatrix();
    initializedRef.current = true;
  });

  return null;
}

export default function NewtonCanvas({
  maxIter,
  polyMode,
  aRe,
  aIm,
  tol,
  isMobile,
  background,
  insideColor,
  rootColors,
  rootCount,
  cameraRef,
  controlsRef,
  canvasSizeRef,
}) {
  return (
    <Canvas
      orthographic
      camera={{
        position: [
          INITIAL_NEWTON_VIEW.centerX,
          INITIAL_NEWTON_VIEW.centerY,
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
      <NewtonMesh
        maxIter={maxIter}
        polyMode={polyMode}
        aRe={aRe}
        aIm={aIm}
        tol={tol}
        insideColor={insideColor}
        rootColors={rootColors}
        rootCount={rootCount}
      />
      <OrbitControls
        ref={controlsRef}
        target={[
          INITIAL_NEWTON_VIEW.centerX,
          INITIAL_NEWTON_VIEW.centerY,
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
