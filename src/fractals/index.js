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
  sierpinski: lazy(() => import('./sierpinski/SierpinskiPyramid')),
  menger: lazy(() => import('./menger/MengerSponge')),
  mandelbrot: lazy(() => import('./mandelbrot/MandelbrotSet')),
  lorenz: lazy(() => import('./lorenz/LorenzAttractor')),
  julia: lazy(() => import('./julia/JuliaSet')),
  mandelbulb: lazy(() => import('./mandelbulb/Mandelbulb')),
  koch: lazy(() => import('./koch/KochCurve')),
  dragon: lazy(() => import('./dragon/DragonCurve')),
  pythagoras: lazy(() => import('./pythagoras/PythagorasTree')),
  hilbert: lazy(() => import('./hilbert/HilbertCurve')),
  barnsley: lazy(() => import('./barnsley/BarnsleyFern')),
}

export const fractals = fractalCatalog
  .map(({ path, name }) => ({
    path,
    name,
    component: componentsByPath[path],
  }))
  .filter((fractal) => fractal.component)
