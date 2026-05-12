import { useEffect, useRef } from "react";
import { renderMandelbrot } from "./mandelbrotMath";

export default function MandelbrotCanvas({
  view,
  setView,
  maxIter,
  bailout,
  isMobile,
  background,
}) {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let raf = 0;

    function resizeAndRender() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);
      const rawWidth = Math.max(1, Math.floor(rect.width * dpr));
      const rawHeight = Math.max(1, Math.floor(rect.height * dpr));
      const pixelLimit = isMobile ? 520000 : 900000;
      const scale = Math.min(1, Math.sqrt(pixelLimit / (rawWidth * rawHeight)));
      const nextWidth = Math.max(1, Math.floor(rawWidth * scale));
      const nextHeight = Math.max(1, Math.floor(rawHeight * scale));

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }

      renderMandelbrot(canvas, view, maxIter, bailout);
    }

    function scheduleRender() {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(resizeAndRender);
    }

    scheduleRender();
    window.addEventListener("resize", scheduleRender);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", scheduleRender);
    };
  }, [bailout, isMobile, maxIter, view]);

  function handleWheel(event) {
    event.preventDefault();
    zoomAt(event.clientX, event.clientY, event.deltaY > 0 ? 1.18 : 0.84);
  }

  function zoomAt(clientX, clientY, zoom) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = (clientX - rect.left) / rect.width;
    const py = (clientY - rect.top) / rect.height;
    const viewHeight = view.width * rect.height / rect.width;
    const worldX = view.centerX + (px - 0.5) * view.width;
    const worldY = view.centerY + (py - 0.5) * viewHeight;
    const nextWidth = Math.min(8, Math.max(0.0008, view.width * zoom));
    const nextHeight = nextWidth * rect.height / rect.width;

    setView({
      centerX: worldX - (px - 0.5) * nextWidth,
      centerY: worldY - (py - 0.5) * nextHeight,
      width: nextWidth,
    });
  }

  function handlePointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      view,
    };
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas || drag.pointerId !== event.pointerId) return;

    const rect = canvas.getBoundingClientRect();
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    const viewHeight = drag.view.width * rect.height / rect.width;

    setView({
      centerX: drag.view.centerX - dx / rect.width * drag.view.width,
      centerY: drag.view.centerY - dy / rect.height * viewHeight,
      width: drag.view.width,
    });
  }

  function handlePointerUp(event) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }

  return (
    <canvas
      ref={canvasRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        background,
        cursor: "grab",
        touchAction: "none",
      }}
    />
  );
}
