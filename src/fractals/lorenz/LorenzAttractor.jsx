import { useMemo, useState } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import FractalScene from "../../components/FractalScene";
import ControlPanel from "../../components/ControlPanel";
import PanelCheckbox from "../../components/PanelCheckbox";
import { useTheme } from "../../styles/pageStyles";
import { getFractalCatalogByPath } from "../../models/fractalCatalog";
import LorenzControls from "./LorenzControls";
import {
  DEFAULT_LORENZ,
  LORENZ_PRESETS,
  MAX_STEPS,
  POINTS_PER_STEP,
  generateTrajectory,
} from "./lorenzMath";

const MODEL = getFractalCatalogByPath("lorenz");
const TOTAL_POINTS = MAX_STEPS * POINTS_PER_STEP;
const LINE_WIDTH = 1.25;

function LorenzCurve({ visibleCount, params, color, accentColor, showHead }) {
  const positions = useMemo(
    () => generateTrajectory(TOTAL_POINTS, params),
    [params]
  );

  const colors = useMemo(() => {
    const arr = new Float32Array(TOTAL_POINTS * 3);
    const start = new THREE.Color(color);
    const end = new THREE.Color(accentColor);
    const mixed = new THREE.Color();

    for (let i = 0; i < TOTAL_POINTS; i++) {
      const index = i * 3;
      mixed.copy(start).lerp(end, i / (TOTAL_POINTS - 1));
      arr[index] = mixed.r;
      arr[index + 1] = mixed.g;
      arr[index + 2] = mixed.b;
    }

    return arr;
  }, [color, accentColor]);

  const clampedVisibleCount = Math.min(TOTAL_POINTS, Math.max(2, visibleCount));

  const { linePoints, lineColors } = useMemo(() => {
    const points = [];
    const vertexColors = [];

    for (let i = 0; i < clampedVisibleCount; i++) {
      const index = i * 3;
      points.push([positions[index], positions[index + 1], positions[index + 2]]);
      vertexColors.push([colors[index], colors[index + 1], colors[index + 2]]);
    }

    return { linePoints: points, lineColors: vertexColors };
  }, [positions, colors, clampedVisibleCount]);

  const headIndex = Math.min(clampedVisibleCount - 1, TOTAL_POINTS - 1);
  const headPos = [
    positions[headIndex * 3],
    positions[headIndex * 3 + 1],
    positions[headIndex * 3 + 2],
  ];

  return (
    <>
      <Line
        points={linePoints}
        vertexColors={lineColors}
        lineWidth={LINE_WIDTH}
        transparent
        opacity={0.9}
        depthWrite={false}
      />
      {showHead && (
        <mesh position={headPos}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.6}
          />
        </mesh>
      )}
    </>
  );
}

export default function LorenzAttractor() {
  const { theme } = useTheme();
  const [showHead, setShowHead] = useState(true);
  const [params, setParams] = useState(DEFAULT_LORENZ);
  const meshColor = MODEL.meshColor[theme];
  const accentColor = MODEL.meshAccentColor[theme];

  function applyPreset(preset) {
    setParams({ ...preset.params });
  }

  return (
    <ControlPanel
      maxDepth={MAX_STEPS}
      defaultDepth={80}
      defaultInterval={130}
      extraControls={
        <PanelCheckbox label="現在地マーカー" checked={showHead} onChange={setShowHead} />
      }
    >
      {({ currentDepth }) => (
        <>
          <LorenzControls
            params={params}
            setParams={setParams}
            onPresetSelect={applyPreset}
            defaultParams={DEFAULT_LORENZ}
            presets={LORENZ_PRESETS}
          />
          <FractalScene cameraPosition={[2.2, 1.6, 2.6]} showGrid={true}>
            <LorenzCurve
              visibleCount={Math.max(2, currentDepth * POINTS_PER_STEP)}
              params={params}
              color={meshColor}
              accentColor={accentColor}
              showHead={showHead}
            />
          </FractalScene>
        </>
      )}
    </ControlPanel>
  );
}
