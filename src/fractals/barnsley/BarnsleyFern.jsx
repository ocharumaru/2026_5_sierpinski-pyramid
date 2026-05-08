import { useMemo, useState } from "react";
import * as THREE from "three";
import FractalScene from "../../components/FractalScene";
import ControlPanel from "../../components/ControlPanel";
import { useIsMobile } from "../../hooks/useIsMobile";
import { color, shape } from "../../styles/pageStyles";

/* =========================
   バーンズリーのシダ 生成ロジック (IFS / カオスゲーム)
   ========================= */

/**
 * バーンズリーのシダを構成する4つのアフィン変換と各々の選択確率の標準値。
 * x' = a*x + b*y + e,  y' = c*x + d*y + f
 *
 * - f1 (1%):  茎
 * - f2 (85%): 連続して伸びていく小葉
 * - f3 (7%):  左側の大きな小葉
 * - f4 (7%):  右側の大きな小葉
 */
const DEFAULT_TRANSFORMS = [
  { label: "f1 (茎)",       p: 0.01, a:  0.00, b:  0.00, c:  0.00, d: 0.16, e: 0, f: 0.00 },
  { label: "f2 (連続小葉)", p: 0.85, a:  0.85, b:  0.04, c: -0.04, d: 0.85, e: 0, f: 1.60 },
  { label: "f3 (左大葉)",   p: 0.07, a:  0.20, b: -0.26, c:  0.23, d: 0.22, e: 0, f: 1.60 },
  { label: "f4 (右大葉)",   p: 0.07, a: -0.15, b:  0.28, c:  0.26, d: 0.24, e: 0, f: 0.44 },
];

// 標準の Barnsley fern は x ≈ [-2.2, 2.7], y ≈ [0, 10] に分布する。
// シーンの [-1, 1] 程度に収まるよう中央寄せ＋スケーリングする係数。
const SCALE = 0.18;
const Y_OFFSET = -0.9;

/**
 * カオスゲームによりバーンズリーのシダの点群を生成する。
 * 反復回数は depth から指数的に決まる（100 × 4^depth 点）。
 * 確率の合計が1でない場合は内部で正規化する。
 *
 * @param {number} depth - フラクタルの深さ（反復回数の指数）
 * @param {{p:number,a:number,b:number,c:number,d:number,e:number,f:number}[]} transforms - アフィン変換の配列
 * @returns {Float32Array} [x,y,z, x,y,z, ...] 形式のポジション配列
 */
function generatePositions(depth, transforms) {
  const totalP = transforms.reduce((sum, t) => sum + Math.max(0, t.p), 0) || 1;

  const pointCount = Math.floor(100 * Math.pow(4, depth));
  const positions = new Float32Array(pointCount * 3);

  let x = 0;
  let y = 0;

  for (let i = 0; i < pointCount; i++) {
    const r = Math.random() * totalP;
    let cum = 0;
    let chosen = transforms[transforms.length - 1];
    for (const tr of transforms) {
      cum += Math.max(0, tr.p);
      if (r < cum) {
        chosen = tr;
        break;
      }
    }

    const nx = chosen.a * x + chosen.b * y + chosen.e;
    const ny = chosen.c * x + chosen.d * y + chosen.f;
    x = nx;
    y = ny;

    positions[i * 3]     = x * SCALE;
    positions[i * 3 + 1] = y * SCALE + Y_OFFSET;
    positions[i * 3 + 2] = 0;
  }

  return positions;
}

/* =========================
   描画コンポーネント
   ========================= */

/**
 * バーンズリーのシダの点群コンポーネント。
 * depth が 0 の場合は描画をスキップする。
 *
 * @param {{ depth: number, transforms: object[] }} props
 */
function BarnsleyFernPoints({ depth, transforms }) {
  const geometry = useMemo(() => {
    const positions = generatePositions(depth, transforms);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [depth, transforms]);

  if (depth <= 0) return null;

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#22c55e" size={0.012} sizeAttenuation />
    </points>
  );
}

/* =========================
   アフィン変換 編集パネル
   ========================= */

const basePanel = {
  position: "absolute",
  background: color.bgOverlay,
  color: color.textPrimary,
  border: `1px solid ${color.borderDefault}`,
  borderRadius: shape.radiusMd,
  fontFamily: "sans-serif",
  zIndex: 10,
};

const desktopPanel = {
  panel:        { ...basePanel, top: 16, right: 16, padding: "12px 14px", width: 280, fontSize: 12, maxHeight: "calc(100vh - 32px)", overflowY: "auto" },
  header:       { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: `1px solid ${color.borderSubtle}`, marginBottom: 8 },
  title:        { fontWeight: 700, fontSize: 12, color: color.textPrimary },
  resetBtn:     { background: "rgba(220, 60, 80, 0.85)", color: "#fff", border: "none", borderRadius: shape.radiusSm, padding: "4px 9px", fontSize: 11, cursor: "pointer" },
  trGroup:      { marginBottom: 10, paddingBottom: 8, borderBottom: `1px dashed ${color.borderSubtle}` },
  trHeader:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  trLabel:      { color: color.textPrimary, fontSize: 12, fontWeight: 600 },
  pField:       { display: "flex", alignItems: "center", gap: 4 },
  pLabel:       { color: color.textSecondary, fontSize: 11 },
  grid:         { display: "grid", gridTemplateColumns: "auto 1fr auto 1fr", gap: "4px 6px", alignItems: "center" },
  fieldLabel:   { color: color.textSecondary, fontSize: 11, textAlign: "right" },
  input:        { background: color.bgPanel, border: `1px solid ${color.borderDefault}`, borderRadius: shape.radiusSm, color: color.textPrimary, fontSize: 11, padding: "2px 5px", textAlign: "right", width: "100%", boxSizing: "border-box" },
  hint:         { color: color.textMuted, fontSize: 10, marginTop: 4, lineHeight: 1.5 },
};

const mobilePanel = {
  ...desktopPanel,
  panel:        { ...basePanel, bottom: 12, left: 12, right: 12, padding: "8px 10px", fontSize: 11, maxHeight: "45vh", overflowY: "auto" },
  title:        { fontWeight: 700, fontSize: 11, color: color.textPrimary },
  trGroup:      { marginBottom: 8, paddingBottom: 6, borderBottom: `1px dashed ${color.borderSubtle}` },
  fieldLabel:   { color: color.textSecondary, fontSize: 10, textAlign: "right" },
  input:        { background: color.bgPanel, border: `1px solid ${color.borderDefault}`, borderRadius: shape.radiusSm, color: color.textPrimary, fontSize: 10, padding: "1px 4px", textAlign: "right", width: "100%", boxSizing: "border-box" },
};

/**
 * アフィン変換4つの全係数（a,b,c,d,e,f,p）を編集するパネル。
 *
 * @param {{ transforms: object[], onChange: (next: object[]) => void, onReset: () => void }} props
 */
function TransformsEditor({ transforms, onChange, onReset }) {
  const isMobile = useIsMobile();
  const s = isMobile ? mobilePanel : desktopPanel;

  function updateField(index, key, value) {
    const next = transforms.map((t, i) =>
      i === index ? { ...t, [key]: value } : t
    );
    onChange(next);
  }

  function parseNumber(str) {
    const n = parseFloat(str);
    return Number.isFinite(n) ? n : 0;
  }

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <span style={s.title}>アフィン変換</span>
        <button type="button" style={s.resetBtn} onClick={onReset}>
          リセット
        </button>
      </div>

      {transforms.map((t, i) => (
        <div key={i} style={s.trGroup}>
          <div style={s.trHeader}>
            <span style={s.trLabel}>{t.label}</span>
            <div style={s.pField}>
              <span style={s.pLabel}>p</span>
              <input
                type="number"
                step="0.01"
                value={t.p}
                onChange={(e) => updateField(i, "p", parseNumber(e.target.value))}
                style={{ ...s.input, width: 56 }}
              />
            </div>
          </div>
          <div style={s.grid}>
            {[
              ["a", t.a], ["b", t.b],
              ["c", t.c], ["d", t.d],
              ["e", t.e], ["f", t.f],
            ].map(([key, value]) => (
              <Cell
                key={key}
                label={key}
                value={value}
                styles={s}
                onChange={(v) => updateField(i, key, v)}
                parse={parseNumber}
              />
            ))}
          </div>
        </div>
      ))}

      <div style={s.hint}>
        x' = a·x + b·y + e<br />
        y' = c·x + d·y + f<br />
        確率 p は自動正規化されます。
      </div>
    </div>
  );
}

/**
 * グリッド内の「ラベル＋数値入力」1セル。
 * Cell は label と input の2要素を React.Fragment で並べて返す。
 */
function Cell({ label, value, styles, onChange, parse }) {
  return (
    <>
      <span style={styles.fieldLabel}>{label}</span>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parse(e.target.value))}
        style={styles.input}
      />
    </>
  );
}

/* =========================
   全体シーン
   ========================= */

/**
 * バーンズリーのシダの完全なシーン。
 */
export default function BarnsleyFern() {
  const [transforms, setTransforms] = useState(DEFAULT_TRANSFORMS);

  return (
    <ControlPanel maxDepth={5} defaultDepth={3} defaultInterval={500} enableWireframe={false}>
      {({ currentDepth }) => (
        <>
          <TransformsEditor
            transforms={transforms}
            onChange={setTransforms}
            onReset={() => setTransforms(DEFAULT_TRANSFORMS)}
          />
          <FractalScene>
            <BarnsleyFernPoints depth={currentDepth} transforms={transforms} />
          </FractalScene>
        </>
      )}
    </ControlPanel>
  );
}
