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
 * 意味付けされたメタパラメータの標準値（標準のシダ）。
 *
 * - leafTiltDeg     : 連続小葉(f2)の回転角度。0で真っ直ぐ伸び、正で右、負で左に傾く。
 * - leafScale       : 連続小葉(f2)のスケール。1に近いほど葉が長く伸びる。
 * - leftLeafletSize : 左側の大きな小葉(f3)のサイズ倍率（標準値=1.0）。
 * - rightLeafletSize: 右側の大きな小葉(f4)のサイズ倍率（標準値=1.0）。
 * - stemHeight      : 連続小葉(f2)の上方向への移動量。葉全体の縦の長さ。
 * - leafletRatio    : 大きな小葉が出現する割合（f3+f4の合計確率）。
 */
const DEFAULT_PARAMS = {
  leafTiltDeg: 2.7,
  leafScale: 0.85,
  leftLeafletSize: 1.0,
  rightLeafletSize: 1.0,
  stemHeight: 1.6,
  leafletRatio: 0.14,
};

/**
 * 名前付きプリセット。スライダー値もこの値にスナップする。
 */
const PRESETS = {
  standard: { label: "標準",       params: { ...DEFAULT_PARAMS } },
  tilted:   { label: "ねじれ",     params: { ...DEFAULT_PARAMS, leafTiltDeg: 8.0 } },
  wide:     { label: "大葉",       params: { ...DEFAULT_PARAMS, leftLeafletSize: 1.4, rightLeafletSize: 1.4 } },
  slim:     { label: "細身",       params: { ...DEFAULT_PARAMS, leftLeafletSize: 0.5, rightLeafletSize: 0.5 } },
  upright:  { label: "細長",       params: { ...DEFAULT_PARAMS, leafScale: 0.92, stemHeight: 2.0 } },
};

/**
 * 意味付けされたメタパラメータを4つのアフィン変換に展開する。
 *
 * - f1 (茎)        : 標準値固定。確率は 0.01。
 * - f2 (連続小葉)   : leafScale + leafTilt + stemHeight から構築。
 * - f3 (左大葉)    : 標準f3を leftLeafletSize で線形変倍。
 * - f4 (右大葉)    : 標準f4を rightLeafletSize で線形変倍。
 *
 * @param {typeof DEFAULT_PARAMS} params
 * @returns {{p:number,a:number,b:number,c:number,d:number,e:number,f:number}[]}
 */
function paramsToTransforms(params) {
  const theta = (params.leafTiltDeg * Math.PI) / 180;
  const s = params.leafScale;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  // 大きな小葉の確率配分。leafletRatio を f3, f4 で半分ずつにする。
  const halfLeafletP = params.leafletRatio / 2;
  const stemP = 0.01;
  const continuousP = Math.max(0, 1 - stemP - params.leafletRatio);

  // 標準のf3, f4のままサイズ倍率を掛ける（回転と平行移動も含めて単純線形）
  const lk = params.leftLeafletSize;
  const rk = params.rightLeafletSize;

  return [
    // f1: 茎（標準値固定）
    { p: stemP,        a:  0.00,         b:  0.00,         c:  0.00,         d:  0.16,         e: 0, f: 0.00 },
    // f2: 連続小葉 = scale * rotation + 上方向への平行移動
    { p: continuousP,  a:  s * cos,      b: -s * sin,      c:  s * sin,      d:  s * cos,      e: 0, f: params.stemHeight },
    // f3: 左大葉（標準値 × サイズ倍率）
    { p: halfLeafletP, a:  0.20 * lk,    b: -0.26 * lk,    c:  0.23 * lk,    d:  0.22 * lk,    e: 0, f: 1.60 * lk },
    // f4: 右大葉（標準値 × サイズ倍率）
    { p: halfLeafletP, a: -0.15 * rk,    b:  0.28 * rk,    c:  0.26 * rk,    d:  0.24 * rk,    e: 0, f: 0.44 * rk },
  ];
}

// 標準の Barnsley fern は x ≈ [-2.2, 2.7], y ≈ [0, 10] に分布する。
// シーンの [-1, 1] 程度に収まるよう中央寄せ＋スケーリングする係数。
const SCALE = 0.18;
const Y_OFFSET = -0.9;

// シード固定により depth が増えても先頭部分の点列が変わらないようにする
// （= 既存の点はそのままに、続きの点だけが追加される動作になる）。
const RNG_SEED = 0x9e3779b1;

/**
 * mulberry32 — 高速・軽量な決定論的 PRNG。返される関数は [0, 1) の乱数を返す。
 *
 * @param {number} seed
 * @returns {() => number}
 */
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * カオスゲームによりバーンズリーのシダの点群を生成する。
 * 反復回数は depth から指数的に決まる（100 × 4^depth 点）。
 * 乱数列はシード固定なので、depth を増やすと既存点はそのまま、続きが追加される。
 *
 * @param {number} depth - フラクタルの深さ（反復回数の指数）
 * @param {{p:number,a:number,b:number,c:number,d:number,e:number,f:number}[]} transforms
 * @returns {Float32Array} [x,y,z, x,y,z, ...] 形式のポジション配列
 */
function generatePositions(depth, transforms) {
  const totalP = transforms.reduce((sum, t) => sum + Math.max(0, t.p), 0) || 1;

  const pointCount = Math.floor(100 * Math.pow(4, depth));
  const positions = new Float32Array(pointCount * 3);
  const rand = mulberry32(RNG_SEED);

  let x = 0;
  let y = 0;

  for (let i = 0; i < pointCount; i++) {
    const r = rand() * totalP;
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
   調整パネル（プリセット + スライダー）
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
  panel:        { ...basePanel, top: 16, right: 16, padding: "12px 14px", width: 240, fontSize: 12 },
  header:       { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: `1px solid ${color.borderSubtle}`, marginBottom: 10 },
  title:        { fontWeight: 700, fontSize: 12, color: color.textPrimary },
  resetBtn:     { background: "rgba(220, 60, 80, 0.85)", color: "#fff", border: "none", borderRadius: shape.radiusSm, padding: "4px 9px", fontSize: 11, cursor: "pointer" },
  presetRow:    { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 },
  presetBtn:    { background: color.bgPanel, color: color.textSecondary, border: `1px solid ${color.borderDefault}`, borderRadius: shape.radiusSm, padding: "3px 8px", fontSize: 11, cursor: "pointer" },
  presetBtnOn:  { background: color.purple, color: "#fff", border: "none" },
  field:        { marginBottom: 9 },
  labelRow:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
  label:        { color: color.textSecondary, fontSize: 11 },
  value:        { color: color.textPrimary, fontSize: 11 },
  slider:       { width: "100%", accentColor: color.purple },
};

const mobilePanel = {
  ...desktopPanel,
  panel:        { ...basePanel, bottom: 12, left: 12, right: 12, padding: "8px 10px", fontSize: 11, maxHeight: "45vh", overflowY: "auto" },
  title:        { fontWeight: 700, fontSize: 11, color: color.textPrimary },
  field:        { marginBottom: 6 },
};

/**
 * 1スライダー入力。ラベル・値表示・range をひとまとめにする。
 */
function Slider({ label, value, min, max, step, format, onChange, styles }) {
  return (
    <div style={styles.field}>
      <div style={styles.labelRow}>
        <span style={styles.label}>{label}</span>
        <span style={styles.value}>{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={styles.slider}
      />
    </div>
  );
}

/**
 * 意味付けされたパラメータを編集するパネル。
 * プリセットでスナップ → スライダーで微調整、という流れを想定。
 *
 * @param {{ params: typeof DEFAULT_PARAMS, onChange: (next: typeof DEFAULT_PARAMS) => void }} props
 */
function FernEditor({ params, onChange }) {
  const isMobile = useIsMobile();
  const s = isMobile ? mobilePanel : desktopPanel;

  const activePreset = Object.entries(PRESETS).find(([, preset]) =>
    Object.keys(preset.params).every((k) => preset.params[k] === params[k])
  )?.[0];

  function update(key, value) {
    onChange({ ...params, [key]: value });
  }

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <span style={s.title}>シダの形</span>
        <button
          type="button"
          style={s.resetBtn}
          onClick={() => onChange({ ...DEFAULT_PARAMS })}
        >
          リセット
        </button>
      </div>

      <div style={s.presetRow}>
        {Object.entries(PRESETS).map(([key, preset]) => (
          <button
            key={key}
            type="button"
            style={{
              ...s.presetBtn,
              ...(activePreset === key ? s.presetBtnOn : {}),
            }}
            onClick={() => onChange({ ...preset.params })}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <Slider
        label="葉の傾き"
        value={params.leafTiltDeg}
        min={-15} max={20} step={0.5}
        format={(v) => `${v.toFixed(1)}°`}
        onChange={(v) => update("leafTiltDeg", v)}
        styles={s}
      />
      <Slider
        label="葉の大きさ"
        value={params.leafScale}
        min={0.6} max={0.95} step={0.01}
        format={(v) => v.toFixed(2)}
        onChange={(v) => update("leafScale", v)}
        styles={s}
      />
      <Slider
        label="左小葉の大きさ"
        value={params.leftLeafletSize}
        min={0} max={1.6} step={0.05}
        format={(v) => v.toFixed(2)}
        onChange={(v) => update("leftLeafletSize", v)}
        styles={s}
      />
      <Slider
        label="右小葉の大きさ"
        value={params.rightLeafletSize}
        min={0} max={1.6} step={0.05}
        format={(v) => v.toFixed(2)}
        onChange={(v) => update("rightLeafletSize", v)}
        styles={s}
      />
      <Slider
        label="茎の長さ"
        value={params.stemHeight}
        min={0.8} max={2.4} step={0.05}
        format={(v) => v.toFixed(2)}
        onChange={(v) => update("stemHeight", v)}
        styles={s}
      />
      <Slider
        label="小葉の出現比率"
        value={params.leafletRatio}
        min={0} max={0.5} step={0.01}
        format={(v) => `${(v * 100).toFixed(0)}%`}
        onChange={(v) => update("leafletRatio", v)}
        styles={s}
      />
    </div>
  );
}

/* =========================
   全体シーン
   ========================= */

/**
 * バーンズリーのシダの完全なシーン。
 */
export default function BarnsleyFern() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const transforms = useMemo(() => paramsToTransforms(params), [params]);

  return (
    <ControlPanel maxDepth={5} defaultDepth={3} defaultInterval={500} enableWireframe={false}>
      {({ currentDepth }) => (
        <>
          <FernEditor params={params} onChange={setParams} />
          <FractalScene>
            <BarnsleyFernPoints depth={currentDepth} transforms={transforms} />
          </FractalScene>
        </>
      )}
    </ControlPanel>
  );
}
