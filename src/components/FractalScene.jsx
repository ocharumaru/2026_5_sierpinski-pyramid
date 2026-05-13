import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useTheme } from "../styles/pageStyles";

/**
 * 3Dフラクタル表示用の共通シーン。
 * Canvas、ライティング、OrbitControls をまとめたラッパー。
 * children に Mesh コンポーネントを渡して使う。
 * 背景色はテーマの bgGenPage に統一される（モデル別では持たない）。
 *
 * @param {{ children: React.ReactNode, cameraPosition: [number, number, number] }} props
 */
export default function FractalScene({ children, cameraPosition = [3, 3, 3] }) {
  const { color } = useTheme();
  return (
    <div style={{ width: "100vw", height: "100dvh", background: color.bgGenPage }}>
      <Canvas camera={{ position: cameraPosition, fov: 50 }} gl={{ alpha: true}}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        {children}
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}
