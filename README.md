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

### 共通フック: `useCreateGeometry(generateVertices, depth)`

`src/hooks/useCreateGeometry.js` に定義。
頂点配列を生成する関数と再帰の深さを受け取り、Three.js の `BufferGeometry` を返す。

```js
import { useCreateGeometry } from '../hooks/useCreateGeometry'

function generateVertices(depth) {
  // depth に応じてフラットな頂点座標配列 [x,y,z, x,y,z, ...] を返す
  return positions
}

function MyFractalMesh({ depth }) {
  const geometry = useCreateGeometry(generateVertices, depth)
  return <mesh geometry={geometry}>...</mesh>
}
```

図形によって `useCreateGeometry` が合わない場合（例: シェーダーベースのマンデルバルブなど）は、独自にジオメトリを生成しても構わない。

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
