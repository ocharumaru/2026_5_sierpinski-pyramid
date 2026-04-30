import { lazy } from 'react'
import { fractalCatalog } from '../models/fractalCatalog'

/**
 * フラクタル図形のレジストリ。
 * 描画コンポーネントのみを扱う。
 *
 * @property {string} path - URLパス（例: "/sierpinski"）
 * @property {string} name - 表示名
 * @property {React.LazyExoticComponent} component - lazy import されたコンポーネント
 */
const componentsByPath = {
  sierpinski: lazy(() => import('./SierpinskiPyramid')),
  menger: lazy(() => import('./MengerSponge')),
  mandelbulb: lazy(() => import('./mandelbulb/Mandelbulb')),
  koch: lazy(() => import('./koch/KochCurve')),
}

export const fractals = fractalCatalog
  .map(({ path, name }) => ({
    path,
    name,
    component: componentsByPath[path],
  }))
  .filter((fractal) => fractal.component)
