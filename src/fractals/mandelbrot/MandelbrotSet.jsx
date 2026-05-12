import { useRef, useState } from "react";
import ControlPanel from "../../components/ControlPanel";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTheme } from "../../styles/pageStyles";
import { getFractalCatalogByPath } from "../../models/fractalCatalog";
import MandelbrotCanvas from "./MandelbrotCanvas";
import MandelbrotControls from "./MandelbrotControls";
import { INITIAL_MANDELBROT_VIEW } from "./mandelbrotMath";

const MODEL = getFractalCatalogByPath("mandelbrot");
const ZOOM_STEP = 1.333;
const MAX_VIEW_WIDTH = 8;
const MIN_VIEW_WIDTH = 0.0008;

export default function MandelbrotSet() {
  const { color, theme } = useTheme();
  const isMobile = useIsMobile();
  const [bailout, setBailout] = useState(2);
  const insideColor = MODEL.meshColor[theme];
  const accentColor = MODEL.meshAccentColor[theme];

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
      INITIAL_MANDELBROT_VIEW.centerX,
      INITIAL_MANDELBROT_VIEW.centerY,
      10
    );
    cam.zoom = widthPx / INITIAL_MANDELBROT_VIEW.width;
    cam.updateProjectionMatrix();
    ctrl.target.set(
      INITIAL_MANDELBROT_VIEW.centerX,
      INITIAL_MANDELBROT_VIEW.centerY,
      0
    );
    ctrl.update();
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
          <MandelbrotControls
            bailout={bailout}
            setBailout={setBailout}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetView={resetView}
          />
          <MandelbrotCanvas
            maxIter={Math.max(2, currentDepth)}
            bailout={bailout}
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
