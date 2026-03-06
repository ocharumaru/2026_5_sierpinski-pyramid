import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Suspense } from 'react'
import { fractals } from './fractals'

/**
 * トップページ。フラクタル一覧へのリンクを表示する。
 */
function Home() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "sans-serif",
      color: "white",
      gap: 16,
    }}>
      <h1>フラクタル図形ビューア</h1>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {fractals.map((f) => (
          <Link
            key={f.path}
            to={`/${f.path}`}
            style={{
              padding: "12px 24px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 8,
              color: "white",
              textDecoration: "none",
              fontSize: 16,
            }}
          >
            {f.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ color: "white", padding: 40 }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          {fractals.map((f) => (
            <Route key={f.path} path={`/${f.path}`} element={<f.component />} />
          ))}
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
