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

```
src/
├── main.jsx                    # エントリーポイント
├── App.jsx                     # ルーティング（URLパスで図形を切り替え）
├── App.css
├── index.css
├── components/
│   ├── FractalScene.jsx        # 共通3Dシーン（Canvas + ライティング + カメラ操作）
│   └── ControlPanel.jsx        # 共通UIパネル（アニメーション制御 + ワイヤーフレーム）
├── hooks/
│   ├── useCreateGeometry.js    # ジオメトリ生成フック
│   └── useFractalAnimation.js  # ステップアニメーション制御フック
└── fractals/
    ├── index.js                # フラクタルのレジストリ（図形の登録）
    ├── SierpinskiPyramid.jsx   # シェルピンスキー四面体
    └── MengerSponge.jsx        # メンガースポンジ
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

各 `src/fractals/XxxFractal.jsx` が持つのは **図形固有のロジックだけ**:

1. **生成ロジック** — 頂点座標を計算する純粋関数
2. **Mesh コンポーネント** — ジオメトリにマテリアルを当てて描画
3. **デフォルトエクスポート** — ControlPanel と FractalScene を組み合わせる

各関数にはJSDoc形式のコメントを記述すること。

```jsx
// src/fractals/SierpinskiPyramid.jsx の構造例

/** 頂点座標を生成する純粋関数 */
function generateVertices(depth) { ... }

/** ジオメトリにマテリアルを当てて描画 */
function SierpinskiMesh({ depth, wireframe }) { ... }

/** 共通コンポーネントを組み合わせるだけ */
export default function SierpinskiPyramid() {
  return (
    <ControlPanel maxDepth={8} defaultDepth={6} defaultInterval={450}>
      {({ currentDepth, wireframe }) => (
        <FractalScene>
          <SierpinskiMesh depth={currentDepth} wireframe={wireframe} />
        </FractalScene>
      )}
    </ControlPanel>
  );
}
```

### ルーティング（`src/App.jsx`）

URLパスで表示する図形を切り替える。react-router-dom を使用。

| URL | 表示内容 |
|---|---|
| `/` | トップページ（図形一覧のリンク） |
| `/sierpinski` | シェルピンスキー四面体 |
| `/menger` | メンガースポンジ |

### フラクタルレジストリ（`src/fractals/index.js`）

全図形の登録先。App.jsx はここを参照してルーティングを自動生成する。

```js
export const fractals = [
  {
    path: "sierpinski",
    name: "シェルピンスキー四面体",
    component: lazy(() => import('./SierpinskiPyramid')),
  },
  // 新しい図形はここに追加するだけ
]
```

## 新しいフラクタル図形の追加手順

1. `src/fractals/NewFractal.jsx` を作成
2. 上記の3層構造（生成ロジック・Mesh・シーン）で実装し、各関数にJSDocを記述
3. `src/fractals/index.js` にエントリを追加

```js
// src/fractals/index.js に追加
{
  path: "koch",
  name: "コッホ雪片",
  component: lazy(() => import('./KochSnowflake')),
},
```

`App.jsx` の変更は不要。ルーティングとトップページのリンクは自動で追加される。
