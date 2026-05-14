import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import ControlPanel from "../../components/ControlPanel";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTheme } from "../../styles/pageStyles";
import { getFractalCatalogByPath } from "../../models/fractalCatalog";
import NewtonCanvas from "./NewtonCanvas";
import NewtonControls from "./NewtonControls";
import { DEFAULT_NEWTON, INITIAL_NEWTON_VIEW } from "./newtonMath";

const MODEL = getFractalCatalogByPath("newton");
const ZOOM_STEP = 1.333;
const MAX_VIEW_WIDTH = 8;
const MIN_VIEW_WIDTH = 0.0008;
const ROOT_COUNTS = [3, 4, 5, 3];

function buildRootPalette(baseHex, accentHex, count) {
  const base = new THREE.Color(baseHex);
  const accent = new THREE.Color(accentHex);
  const hsl = { h: 0, s: 0, l: 0 };
  base.getHSL(hsl);
  const palette = [];
  for (let k = 0; k < 5; k += 1) {
    if (k >= count) {
      palette.push("#000000");
      continue;
    }
    const c = new THREE.Color();
    c.setHSL(
      (hsl.h + k / count) % 1.0,
      Math.max(0.45, hsl.s),
      Math.min(0.7, Math.max(0.4, hsl.l))
    );
    c.lerp(accent, 0.15);
    palette.push(`#${c.getHexString()}`);
  }
  return palette;
}

export default function NewtonFractal() {
  const { color, theme } = useTheme();
  const isMobile = useIsMobile();
  const [polyMode, setPolyMode] = useState(DEFAULT_NEWTON.polyMode);
  const [aRe, setARe] = useState(DEFAULT_NEWTON.aRe);
  const [aIm, setAIm] = useState(DEFAULT_NEWTON.aIm);
  const [tol, setTol] = useState(DEFAULT_NEWTON.tol);
  const insideColor = color.bgPage;
  const baseColor = MODEL.meshColor[theme];
  const accentColor = MODEL.meshAccentColor[theme];
  const rootCount = ROOT_COUNTS[polyMode] ?? 3;
  const rootColors = useMemo(
    () => buildRootPalette(baseColor, accentColor, rootCount),
    [baseColor, accentColor, rootCount]
  );

  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const canvasSizeRef = useRef({ width: 0, height: 0 });

  function zoomIn() {
    const cam = cameraRef.current;
    if (!cam) return;
    const widthPx = canvasSizeRef.current.width;
    const maxZoom = widthPx / MIN_VIEW_WIDTH;
    cam.zoom = Math.min(cam.zoom * ZOOM_STEP, maxZoom);
    cam.updateProjectionMatrix();
    controlsRef.current?.update();
  }

  function zoomOut() {
    const cam = cameraRef.current;
    if (!cam) return;
    const widthPx = canvasSizeRef.current.width || 1;
    const minZoom = widthPx / MAX_VIEW_WIDTH;
    cam.zoom = Math.max(cam.zoom / ZOOM_STEP, minZoom);
    cam.updateProjectionMatrix();
    controlsRef.current?.update();
  }

  function resetView() {
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    const widthPx = canvasSizeRef.current.width;
    if (!cam || !ctrl || !widthPx) return;
    cam.position.set(
      INITIAL_NEWTON_VIEW.centerX,
      INITIAL_NEWTON_VIEW.centerY,
      10
    );
    cam.zoom = widthPx / INITIAL_NEWTON_VIEW.width;
    cam.updateProjectionMatrix();
    ctrl.target.set(
      INITIAL_NEWTON_VIEW.centerX,
      INITIAL_NEWTON_VIEW.centerY,
      0
    );
    ctrl.update();
  }

  return (
    <ControlPanel
      maxDepth={80}
      defaultDepth={30}
      defaultInterval={200}
      extraControls={<span />}
    >
      {({ currentDepth }) => (
        <>
          <NewtonControls
            polyMode={polyMode}
            setPolyMode={setPolyMode}
            aRe={aRe}
            setARe={setARe}
            aIm={aIm}
            setAIm={setAIm}
            tol={tol}
            setTol={setTol}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetView={resetView}
          />
          <NewtonCanvas
            maxIter={Math.max(2, currentDepth)}
            polyMode={polyMode}
            aRe={aRe}
            aIm={aIm}
            tol={tol}
            isMobile={isMobile}
            background={color.bgPage}
            insideColor={insideColor}
            rootColors={rootColors}
            rootCount={rootCount}
            cameraRef={cameraRef}
            controlsRef={controlsRef}
            canvasSizeRef={canvasSizeRef}
          />
        </>
      )}
    </ControlPanel>
  );
}
