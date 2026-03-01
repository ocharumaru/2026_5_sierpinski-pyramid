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
├── App.jsx                     # 表示するフラクタルを選ぶだけ
├── App.css
├── index.css
├── hooks/
│   └── useCreateGeometry.js    # 共通ユーティリティフック
└── fractals/
    └── SierpinskiPyramid.jsx   # シェルピンスキー四面体
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

### 各フラクタルファイルの責務

各 `src/fractals/XxxFractal.jsx` は以下をすべて含む自己完結したモジュール:

1. **生成ロジック** — 頂点座標を計算する純粋関数
2. **Mesh コンポーネント** — ジオメトリにマテリアルを当てて描画
3. **シーン全体（デフォルトエクスポート）** — Canvas、ライト、カメラ操作、UIを含む完全なコンポーネント

各関数にはJSDoc形式のコメントを記述すること。

```jsx
// src/fractals/SierpinskiPyramid.jsx の構造例

/** 頂点座標を生成する純粋関数 */
function generateVertices(depth) { ... }          // 1. 生成ロジック

/** ジオメトリにマテリアルを当てて描画 */
function SierpinskiMesh({ depth }) { ... }        // 2. Mesh

/** Canvas + UI を含む完全なシーン */
export default function SierpinskiPyramid() { ... } // 3. シーン全体
```

### App.jsx

使いたいフラクタルをインポートして返すだけ。

```jsx
import SierpinskiPyramid from './fractals/SierpinskiPyramid'

export default function App() {
  return <SierpinskiPyramid />
}
```

## 新しいフラクタル図形の追加手順

1. `src/fractals/NewFractal.jsx` を作成
2. 上記の3層構造（生成ロジック・Mesh・シーン）で実装し、各関数にJSDocを記述
3. `App.jsx` でインポートして使う

```jsx
// src/fractals/MengerSponge.jsx
import { useCreateGeometry } from '../hooks/useCreateGeometry'

/** @param {number} depth - 再帰の深さ */
function generateVertices(depth) { /* ... */ }

function MengerMesh({ depth }) {
  const geometry = useCreateGeometry(generateVertices, depth)
  return <mesh geometry={geometry}>...</mesh>
}

export default function MengerSponge() {
  // Canvas + UI + MengerMesh を自由に構成
}
```
