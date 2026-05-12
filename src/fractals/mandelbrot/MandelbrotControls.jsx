import { Link } from "react-router-dom";
import { INITIAL_MANDELBROT_VIEW } from "./mandelbrotMath";

export default function MandelbrotControls({
  color,
  shape,
  pageStyles,
  isMobile,
  maxIter,
  setMaxIter,
  bailout,
  setBailout,
  setView,
}) {
  const panelStyle = {
    position: "absolute",
    top: isMobile ? 12 : 16,
    right: isMobile ? 12 : 16,
    width: isMobile ? "calc(100vw - 24px)" : 280,
    maxWidth: "calc(100vw - 24px)",
    padding: isMobile ? "9px 10px" : "12px 14px",
    background: color.cpOverlay,
    color: color.cpText,
    border: `1px solid ${color.cpBorder}`,
    borderRadius: shape.radiusMd,
    fontFamily: "sans-serif",
    zIndex: 10,
  };

  const labelStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    color: color.cpText,
    fontSize: isMobile ? 11 : 12,
  };

  const sliderStyle = {
    width: "100%",
    marginTop: 4,
    accentColor: color.accent1,
  };

  const compactButton = {
    padding: "6px 10px",
    fontSize: 11,
    textDecoration: "none",
  };

  return (
    <section style={panelStyle}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        paddingBottom: 8,
        borderBottom: `1px solid ${color.cpSubtle}`,
      }}>
        <strong style={{ fontSize: isMobile ? 12 : 13 }}>マンデルブロ集合</strong>
        <Link to="/models" style={{ ...pageStyles.outlineButton, padding: "4px 8px", fontSize: 11 }}>
          一覧へ
        </Link>
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={labelStyle}>
          <span>反復上限</span>
          <strong>{maxIter}</strong>
        </div>
        <input
          type="range"
          min="40"
          max="360"
          step="10"
          value={maxIter}
          onChange={(event) => setMaxIter(Number(event.target.value))}
          style={sliderStyle}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={labelStyle}>
          <span>発散判定半径</span>
          <strong>{bailout.toFixed(1)}</strong>
        </div>
        <input
          type="range"
          min="1.2"
          max="2"
          step="0.1"
          value={bailout}
          onChange={(event) => setBailout(Number(event.target.value))}
          style={sliderStyle}
        />
        <p style={{ margin: "4px 0 0", color: color.cpText, fontSize: isMobile ? 10 : 11, lineHeight: 1.45 }}>
          標準は2です。小さくすると、判定が厳しくなり形も変わります。
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <button
          type="button"
          onClick={() => setView((view) => ({ ...view, width: Math.max(0.0008, view.width * 0.75) }))}
          style={{ ...pageStyles.primaryButton, ...compactButton }}
        >
          拡大
        </button>
        <button
          type="button"
          onClick={() => setView((view) => ({ ...view, width: Math.min(8, view.width * 1.3) }))}
          style={{ ...pageStyles.outlineButton, ...compactButton }}
        >
          縮小
        </button>
        <button
          type="button"
          onClick={() => setView(INITIAL_MANDELBROT_VIEW)}
          style={{ ...pageStyles.outlineButton, ...compactButton }}
        >
          リセット
        </button>
      </div>

      <p style={{ margin: "10px 0 0", color: color.cpText, fontSize: isMobile ? 10 : 11, lineHeight: 1.5 }}>
        ドラッグで移動、ホイールで拡大縮小。黒い部分は最後まで発散しなかった点です。
      </p>
    </section>
  );
}
