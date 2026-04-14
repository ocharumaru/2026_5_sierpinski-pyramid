# Sierpinski 3D — フラクタル図形ビューア

3Dフラクタル図形をブラウザ上でインタラクティブに表示するアプリ。
React + Three.js (react-three-fiber) + Vite で構成。

## セットアップ

```bash
npm install
npm run dev
```

> Node.js 20.19 以上が必要です（Vite 7 の要件）

## ファイル構成

```text
src/
├── main.jsx                    # エントリーポイント
├── App.jsx                     # ルーティング定義
├── App.css
├── index.css
├── components/
│   ├── FractalScene.jsx        # 共通3Dシーン（Canvas + ライティング + カメラ操作）
│   └── ControlPanel.jsx        # 共通UIパネル（アニメーション制御 + ワイヤーフレーム）
├── hooks/
│   ├── useCreateGeometry.js    # ジオメトリ生成フック
│   └── useFractalAnimation.js  # ステップアニメーション制御フック
├── fractals/
│   ├── index.js                # フラクタル描画レジストリ
│   ├── SierpinskiPyramid.jsx   # シェルピンスキー四面体
│   ├── MengerSponge.jsx        # メンガースポンジ
│   └── mandelbulb/
│       ├── Mandelbulb.jsx      # マンデルバルブ（レイマーチング）
│       └── mandelbulbShader.js # マンデルバルブ用シェーダー
├── models/
│   └── fractalCatalog.js       # モデル説明データ（初心者向け / 上級者向け）
├── pages/
│   ├── FrontPage.jsx           # フロントページ
│   ├── ModelSelectionPage.jsx  # モデル選択ページ
│   └── ModelIntroPage.jsx      # モデル専用ページ（初心者向け / 上級者向け）
└── styles/
    └── pageStyles.js           # ページ共通スタイル
```

## アーキテクチャ

### 共通フック（`src/hooks/useCreateGeometry.js`）

`depth` と頂点生成関数を受け取り、Three.js の `BufferGeometry` を返す。描画方式に応じて2種類。

| フック | 用途 | 描画方式 | 使用例 |
|---|---|---|---|
| `useCreateGeometry` | ポリゴンメッシュ | 三角形の面 | シェルピンスキー四面体、メンガースポンジ |
| `useCreateLineGeometry` | ライン | 連続した線分 | コッホ雪片、ドラゴン曲線 |

```js
// ポリゴンメッシュの場合
import { useCreateGeometry } from '../hooks/useCreateGeometry'

function generateVertices(depth) {
  // 3頂点ごとに1つの三角形: [x,y,z, x,y,z, x,y,z, ...]
  return positions
}

function MyMesh({ depth }) {
  const geometry = useCreateGeometry(generateVertices, depth)
  return <mesh geometry={geometry}>...</mesh>
}
```

```js
// ライン描画の場合
import { useCreateLineGeometry } from '../hooks/useCreateGeometry'

function generatePoints(depth) {
  // 隣接する頂点が線分で結ばれる: [x,y,z, x,y,z, ...]
  return points
}

function MyLine({ depth }) {
  const geometry = useCreateLineGeometry(generatePoints, depth)
  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="white" />
    </line>
  )
}
```

図形によってどちらも合わない場合（例: シェーダーベースのマンデルバルブなど）は、独自にジオメトリを生成しても構わない。

### 共通コンポーネント（`src/components/`）

| コンポーネント | 役割 |
|---|---|
| `FractalScene` | Canvas + ライティング + OrbitControls のラッパー。children に Mesh を渡す |
| `ControlPanel` | UIパネル（パラメータ入力 + アニメーション制御 + ワイヤーフレーム）。render prop で currentDepth と wireframe を渡す |

### 各フラクタルファイルの責務

各 `src/fractals/<model>/Xxx.jsx` が持つのは図形固有のロジックだけ。

1. 生成ロジック（頂点座標を計算する純粋関数）
2. Mesh コンポーネント（ジオメトリにマテリアルを当てて描画）
3. デフォルトエクスポート（ControlPanel と FractalScene を組み合わせる）

各関数には JSDoc 形式のコメントを記述すること。

### ルーティング方式（`src/App.jsx`）

現在は react-router-dom によるクライアントサイドルーティング。
`BrowserRouter` + `Routes` + `Route` を使い、`Link` と `useNavigate` で画面遷移している。

| URL | 表示内容 |
|---|---|
| `/` | フロントページ |
| `/models` | モデル選択ページ |
| `/models/:modelId` | モデル専用ページ（初心者向け / 上級者向け） |
| `/sierpinski` | シェルピンスキー四面体 |
| `/menger` | メンガースポンジ |
| `/mandelbulb` | マンデルバルブ |

3D描画ページ（`/sierpinski`, `/menger`, `/mandelbulb`）は `React.lazy` + `Suspense` で遅延読み込みしている。

### フラクタルレジストリ（`src/fractals/index.js`）

描画コンポーネントの対応表。モデル説明データは `src/models/fractalCatalog.js` に分離している。

```js
const componentsByPath = {
  sierpinski: lazy(() => import('./SierpinskiPyramid')),
  menger: lazy(() => import('./MengerSponge')),
}

export const fractals = fractalCatalog
  .map(({ path, name }) => ({ path, name, component: componentsByPath[path] }))
  .filter((fractal) => fractal.component)
```

### チャンク分割（`vite.config.js`）

ビルド時のチャンクサイズ警告を抑えるために `manualChunks` を設定している。

- `three-vendor`: `three`, `@react-three/fiber`, `@react-three/drei`
- `router-vendor`: `react-router-dom`, `react-router`
- `react-vendor`: `react`, `react-dom`

トップ導線の画面と 3D 描画関連ライブラリの読み込みを分離し、キャッシュ効率と初期表示の体感改善を狙う構成。
ただし Three.js 系はライブラリ自体が大きいため、`three-vendor` が 500kB 警告を超えることがある。

## 新しいフラクタル図形の追加手順

1. `src/fractals/newFractal/` を作成
2. 生成ロジック・Mesh・シーンの3層構造で実装し、各関数に JSDoc を記述
3. `src/models/fractalCatalog.js` に `path`, `name`, `intro` を追加
4. `src/fractals/index.js` の `componentsByPath` に lazy import を追加

```js
// src/models/fractalCatalog.js に追加
{
  path: 'koch',
  name: 'コッホ雪片',
  intro: {
    beginner: { overview: '...', feature: '...', application: '...', howTo: '...' },
    advanced: { overview: '...', feature: '...', application: '...', howTo: '...' },
  },
}
```

```js
// src/fractals/index.js の componentsByPath に追加
koch: lazy(() => import('./koch/KochSnowflake')),
```

`App.jsx` の変更は不要。ルーティングとページ遷移は自動で反映される。
