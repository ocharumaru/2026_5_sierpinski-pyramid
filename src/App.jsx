import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import { fractals } from './fractals'
import FrontPage from './pages/FrontPage'
import ModelSelectionPage from './pages/ModelSelectionPage'
import ModelIntroPage from './pages/ModelIntroPage'

/**
 * ルーティング定義。
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<FrontPage />} />
      <Route path="/models" element={<ModelSelectionPage />} />
      <Route path="/models/:modelId" element={<ModelIntroPage />} />
      {fractals.map((f) => (
        <Route key={f.path} path={`/${f.path}`} element={<f.component />} />
      ))}
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ color: 'white', padding: 40 }}>Loading...</div>}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  )
}
