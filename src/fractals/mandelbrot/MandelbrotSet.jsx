import { useState } from "react";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTheme } from "../../styles/pageStyles";
import MandelbrotCanvas from "./MandelbrotCanvas";
import MandelbrotControls from "./MandelbrotControls";
import { INITIAL_MANDELBROT_VIEW } from "./mandelbrotMath";

export default function MandelbrotSet() {
  const { color, shape, pageStyles } = useTheme();
  const isMobile = useIsMobile();
  const [view, setView] = useState(INITIAL_MANDELBROT_VIEW);
  const [maxIter, setMaxIter] = useState(120);
  const [bailout, setBailout] = useState(2);

  return (
    <main style={{ width: "100vw", height: "100dvh", background: color.bgPage, overflow: "hidden" }}>
      <MandelbrotCanvas
        view={view}
        setView={setView}
        maxIter={maxIter}
        bailout={bailout}
        isMobile={isMobile}
        background={color.bgPage}
      />
      <MandelbrotControls
        color={color}
        shape={shape}
        pageStyles={pageStyles}
        isMobile={isMobile}
        maxIter={maxIter}
        setMaxIter={setMaxIter}
        bailout={bailout}
        setBailout={setBailout}
        setView={setView}
      />
    </main>
  );
}
