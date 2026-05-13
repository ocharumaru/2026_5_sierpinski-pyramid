import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import ControlPanel from "../../components/ControlPanel";
import PanelCheckbox from "../../components/PanelCheckbox";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTheme } from "../../styles/pageStyles";
import { vertexShader, fragmentShader } from "./mandelbulbShader";

const POWER_PRESETS = [
  { label: "n=4 丸め", value: 4 },
  { label: "n=8 標準", value: 8 },
  { label: "n=10 鋭め", value: 10 },
];

const BAILOUT = 2;

function MandelbulbBackground({ power, bailout, maxIterCap, shadow }) {
  const matRef = useRef(null);
  const displayedIterRef = useRef(2);

  const uniforms = useMemo(
    () => ({
      uPower: { value: 8.0 },
      uBailout: { value: 4.0 },
      uMaxIterF: { value: 2.0 },
      uShadow: { value: 0.0 },
    }),
    []
  );

  useFrame(() => {
    const material = matRef.current;
    if (!material) return;

    displayedIterRef.current = THREE.MathUtils.lerp(displayedIterRef.current, maxIterCap, 0.08);

    material.uniforms.uPower.value = power;
    material.uniforms.uBailout.value = bailout;
    material.uniforms.uMaxIterF.value = displayedIterRef.current;
    material.uniforms.uShadow.value = shadow ? 1.0 : 0.0;
  });

  return (
    <mesh>
      <sphereGeometry args={[30, 16, 16]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

export default function Mandelbulb() {
  const { color, shape } = useTheme();
  const [power, setPower] = useState(8);
  const [shadow, setShadow] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const isMobile = useIsMobile();

  const basePanel = {
    position: "absolute",
    background: color.cpOverlay,
    color: color.cpText,
    border: `1px solid ${color.cpBorder}`,
    borderRadius: shape.radiusMd,
    fontFamily: "sans-serif",
    zIndex: 10,
  };

  const desktopPanel = {
    panel: { ...basePanel, top: 16, right: 16, padding: "12px 14px", width: 286, fontSize: 13 },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, paddingBottom: 8, borderBottom: `1px solid ${color.cpSubtle}` },
    title: { fontWeight: 700, fontSize: 13, color: color.cpText },
    field: { marginTop: 10 },
    label: { display: "flex", justifyContent: "space-between", gap: 10, color: color.cpText, fontSize: 12 },
    slider: { width: "100%", marginTop: 4, accentColor: color.accent1 },
    hint: { color: color.cpText, fontSize: 11, marginTop: 10, lineHeight: 1.5 },
    presetRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 7 },
  };

  const mobilePanel = {
    panel: { ...basePanel, bottom: 12, left: 12, right: 12, padding: "8px 10px", fontSize: 12 },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, paddingBottom: 6, borderBottom: `1px solid ${color.cpSubtle}` },
    title: { fontWeight: 700, fontSize: 12, color: color.cpText },
    field: { marginTop: 8 },
    label: { display: "flex", justifyContent: "space-between", gap: 8, color: color.cpText, fontSize: 11 },
    slider: { width: "100%", marginTop: 3, accentColor: color.accent1 },
    hint: { color: color.cpText, fontSize: 10, marginTop: 8, lineHeight: 1.45 },
    presetRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, marginTop: 6 },
  };

  const s = isMobile ? mobilePanel : desktopPanel;

  return (
    <ControlPanel
      maxDepth={24}
      defaultDepth={14}
      defaultInterval={250}
      extraControls={
        <PanelCheckbox label="影をつける" checked={shadow} onChange={setShadow} />
      }
    >
      {({ currentDepth }) => (
        <>
          <div style={s.panel}>
            <div style={s.header}>
              <span style={s.title}>マンデルバルブ</span>
              <button
                type="button"
                onClick={() => setIsMinimized((value) => !value)}
                aria-label={isMinimized ? "パネルを開く" : "パネルを閉じる"}
                style={{
                  background: "transparent",
                  border: `1px solid ${color.cpBorder}`,
                  borderRadius: shape.radiusSm,
                  color: color.cpText,
                  cursor: "pointer",
                  fontSize: 11,
                  padding: "2px 7px",
                  lineHeight: 1,
                }}
              >
                {isMinimized ? "+" : "-"}
              </button>
            </div>

            {!isMinimized && (
              <>
                <div style={s.field}>
                  <div style={s.label}>
                    <span>次数 n</span>
                    <strong>{power}</strong>
                  </div>
                  <div style={s.presetRow}>
                    {POWER_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setPower(preset.value)}
                        style={{
                          border: `1px solid ${power === preset.value ? color.accent1 : color.cpBorder}`,
                          borderRadius: shape.radiusSm,
                          background: power === preset.value ? color.accent1 : "transparent",
                          color: power === preset.value ? color.accent1Text : color.cpText,
                          cursor: "pointer",
                          fontSize: isMobile ? 10 : 11,
                          padding: isMobile ? "4px 3px" : "5px 4px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <input
                    style={s.slider}
                    type="range"
                    min="2"
                    max="12"
                    step="1"
                    value={power}
                    onChange={(event) => setPower(parseInt(event.target.value, 10))}
                  />
                </div>

                <div style={s.hint}>
                  {isMobile
                    ? "1本指: 回転 / 2本指: ピンチで拡大・ドラッグで移動"
                    : "左ドラッグ: 回転 / 右ドラッグ: 平行移動 / ホイール: ズーム"}
                </div>
              </>
            )}
          </div>

          <Canvas
            style={{ width: "100vw", height: "100dvh", background: color.bgPage }}
            gl={{ alpha: true }}
            camera={{ position: [0, 0, 4.8], fov: 50 }}
            dpr={[1, isMobile ? 1.25 : 2]}
          >
            <MandelbulbBackground
              power={power}
              bailout={BAILOUT}
              maxIterCap={Math.max(2, currentDepth)}
              shadow={shadow}
            />
            <OrbitControls
              enableDamping
              minDistance={1.5}
              maxDistance={4.8}
            />
          </Canvas>
        </>
      )}
    </ControlPanel>
  );
}
