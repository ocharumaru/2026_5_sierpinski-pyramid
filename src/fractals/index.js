import { lazy } from 'react'

/**
 * フラクタル図形のレジストリ。
 * 新しい図形を追加するときはここに1エントリ追加するだけ。
 *
 * @property {string} path - URLパス（例: "/sierpinski"）
 * @property {string} name - 表示名
 * @property {React.LazyExoticComponent} component - lazy import されたコンポーネント
 */
export const fractals = [
  {
    path: "sierpinski",
    name: "シェルピンスキー四面体",
    component: lazy(() => import('./SierpinskiPyramid')),
  },
  {
    path: "menger",
    name: "メンガースポンジ",
    component: lazy(() => import('./MengerSponge')),
  },
]
