import { useRef, useState } from "react";
import ControlPanel from "../../components/ControlPanel";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTheme } from "../../styles/pageStyles";
import { getFractalCatalogByPath } from "../../models/fractalCatalog";
import JuliaCanvas from "./JuliaCanvas";
import JuliaControls from "./JuliaControls";
import { DEFAULT_JULIA_C, INITIAL_JULIA_VIEW } from "./juliaMath";

const MODEL = getFractalCatalogByPath("julia");
const ZOOM_STEP = 1.333;
const MAX_VIEW_WIDTH = 8;
const MIN_VIEW_WIDTH = 0.0008;

export default function JuliaSet() {
  const { color, theme } = useTheme();
  const isMobile = useIsMobile();
  const [bailout, setBailout] = useState(2);
  const [cRe, setCRe] = useState(DEFAULT_JULIA_C.re);
  const [cIm, setCIm] = useState(DEFAULT_JULIA_C.im);
  const insideColor = color.bgPage;
  const accentColor = MODEL.meshColor[theme];

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
      INITIAL_JULIA_VIEW.centerX,
      INITIAL_JULIA_VIEW.centerY,
      10
    );
    cam.zoom = widthPx / INITIAL_JULIA_VIEW.width;
    cam.updateProjectionMatrix();
    ctrl.target.set(
      INITIAL_JULIA_VIEW.centerX,
      INITIAL_JULIA_VIEW.centerY,
      0
    );
    ctrl.update();
  }

  function selectPreset(c) {
    setCRe(c.re);
    setCIm(c.im);
  }

  return (
    <ControlPanel
      maxDepth={360}
      defaultDepth={120}
      defaultInterval={250}
      extraControls={<span />}
    >
      {({ currentDepth }) => (
        <>
          <JuliaControls
            bailout={bailout}
            setBailout={setBailout}
            cRe={cRe}
            setCRe={setCRe}
            cIm={cIm}
            setCIm={setCIm}
            onPresetSelect={selectPreset}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetView={resetView}
          />
          <JuliaCanvas
            maxIter={Math.max(2, currentDepth)}
            bailout={bailout}
            cRe={cRe}
            cIm={cIm}
            isMobile={isMobile}
            background={color.bgPage}
            insideColor={insideColor}
            accentColor={accentColor}
            cameraRef={cameraRef}
            controlsRef={controlsRef}
            canvasSizeRef={canvasSizeRef}
          />
        </>
      )}
    </ControlPanel>
  );
}
