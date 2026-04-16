/**
 * フロント導線で使うモデル定義。
 * path と name は描画ルートでも共有する。
 */
export const fractalCatalog = [
  {
    path: 'sierpinski',
    name: 'シェルピンスキー四面体',
    stats: [
      { label: '自己相似', value: '∞'},
      { label: '次元数', value: '≈1.85'},
    ],
    intro: {
      beginner: {
        overview: '正四面体が再帰的に分割されてできる自己相似構造。',
        feature: '軽い計算で変化が分かりやすく、初学者の導入に向いています。',
        application: '再帰や自己相似の説明、図形分割の教材として使えます。',
        howTo: 'depthを1ずつ増やして、空洞の生まれ方を観察します。',
      },
      advanced: {
        overview: '分岐数4、縮尺1/2の反復で作られるフラクタル。',
        feature: 'depth増加で面数が急増し、計算量と描画負荷の関係を確認できます。',
        application: '再帰アルゴリズム設計、計算量比較、LOD制御の題材になります。',
        howTo: 'ワイヤーフレーム表示で面構成を確認しながらstep間隔を調整します。',
      },
    },
  },
  {
    path: 'menger',
    name: 'メンガースポンジ',
    intro: {
      beginner: {
        overview: '立方体を分割して中央部を抜く操作を繰り返す3Dフラクタル。',
        feature: '立体の穴あき構造が視覚的に分かりやすいのが特徴です。',
        application: '空間分割や多孔質構造のイメージ教材として使えます。',
        howTo: 'まずdepth 1-2で構造を理解し、徐々にdepthを上げて比較します。',
      },
      advanced: {
        overview: '27分割から7個を除外し20個を残す反復構造。',
        feature: 'depthごとに立方体数が20^nで増え、描画負荷の増大を観測できます。',
        application: '空間データ構造、最適化、可視化パイプライン評価に活用できます。',
        howTo: 'step間隔を長めにし、生成段階ごとの形状密度変化を分析します。',
      },
    },
  },
  {
    path: 'mandelbulb',
    name: 'マンデルバルブ',
    intro: {
      beginner: {
        overview: '2次元の「マンデルブロ集合」を3次元空間に拡張したフラクタル図形。（バルブは「球」の意味）',
        feature: '球のような塊に花びらや突起が現れ、拡大すると表面にさらに細かい凹凸が現れます。',
        application: 'CG・映像（SFや映画の異世界表現など）に使われたり、アート作品で「無限構造の表現」に活用されたりします。',
        howTo: '各点に対して「繰り返し計算（反復）」を行い、発散するかを判定します。n(べき乗の指数)が大きいほど複雑な形状になり、目標深さ(depth)が大きいほど細部が見えるようになります。',
      },
      advanced: {
        overview: '距離推定関数を用いたレイマーチングで描画する暗黙曲面フラクタル。',
        feature: '指数power、bailout(発散判定値)、反復回数で形状ディテールと計算負荷が変化します。',
        application: 'GPUシェーダー最適化、法線推定、ステップ制御の検証対象に適しています。',
        howTo: 'depthを上げつつfps低下点を計測し、パラメータごとの負荷特性を比較します。',
      },
    },
  },
]

/**
 * path からモデル定義を取得する。
 *
 * @param {string | undefined} path
 */
export function getFractalCatalogByPath(path) {
  return fractalCatalog.find((model) => model.path === path)
}