/**
 * フロント導線で使うモデル定義。
 * path と name は描画ルートでも共有する。
 */
export const fractalCatalog = [
  {
    path: 'sierpinski',
    name: 'シェルピンスキー四面体',
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
  {
    path: 'hilbert',
    name: '3次元ヒルベルト曲線',
    intro: {
      beginner: {
        overview: '空間を隙間なく埋め尽くすように折りたたまれた3次元の曲線。',
        feature: 'depthを増やすごとに曲線が空間全体を均一に満たす様子を3Dで観察できます。',
        application: '3Dプリンタの充填パスや体積データのインデックス構造として実用されています。',
        howTo: 'OrbitControlsでぐるぐる回しながら、曲線がどう空間を埋めるか確認しましょう。',
      },
      advanced: {
        overview: '各反復で8つのサブキューブを特定の順序・回転で接続する空間充填曲線。',
        feature: 'depthがnのとき頂点数は8^(n+1)、局所性保存特性により近い点が連続してアクセスされます。',
        application: 'オクツリー探索、GPUキャッシュ効率最適化、N体シミュレーションの粒子ソートに活用できます。',
        howTo: 'depth 3〜4でワイヤー密度と空間充填の程度を比較し、スケーリング則を観察します。',
      },
    },
  },
  {
    path: 'koch',
    name: 'コッホ曲線',
    intro: {
      beginner: {
        overview: '線分の中央1/3を正三角形の突起に置き換える操作を繰り返したフラクタル曲線。',
        feature: 'depthを増やすごとに曲線がギザギザになり、無限の長さに近づく様子が分かります。',
        application: '自然界の海岸線や雪の結晶の形状表現、CG・アートなど多様な分野で活用されます。',
        howTo: 'depthを1から順に増やして、線の複雑さがどう変わるかを観察してみましょう。',
      },
      advanced: {
        overview: '分岐数4・縮尺1/3の自己相似構造で、フラクタル次元は log4/log3 ≈ 1.26。',
        feature: 'depthがnのとき頂点数は4^n+1、線分の総長は(4/3)^nに増大し、無限大に発散します。',
        application: 'フラクタル次元の実測、曲線長の発散現象の教材、自然物の形状モデリングに利用できます。',
        howTo: 'ステップ間隔を変えながら各depthで生成される頂点数と計算時間の関係を分析します。',
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