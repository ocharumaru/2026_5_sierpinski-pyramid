import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fractalCatalog } from '../models/fractalCatalog'
import { fractals } from '../fractals/index'
import ProgressBar from '../components/ProgressBar'
import { pageStyles, color, shape } from '../styles/pageStyles'

/**
 * モデル選択ページ（ステップ 2/4）
 *
 * レイアウト構成:
 *   - 上部固定ヘッダー: 「← トップへ」リンク + 進捗バー
 *   - スクロールエリア: カードグリッド
 *
 * カードをタップすると直接 /models/:modelId へ遷移する。
 * 未実装のモデルはグレーアウトしてタップ無効。
 *
 * ## サムネイル画像の追加方法
 * `src/models/fractalCatalog.js` の各エントリに `image` フィールドを追加する。
 *
 * ```js
 * {
 *   path: 'sierpinski',
 *   name: 'シェルピンスキー四面体',
 *   image: '/images/sierpinski.png',
 *   intro: { ... },
 * }
 * ```
 *
 * `image` が未設定のカードはプレースホルダー表示にフォールバックする。
 * 画像ファイルは `public/images/` フォルダに置くと Vite の設定なしで参照できる。
 */
export default function ModelSelectionPage() {
  const navigate = useNavigate()
  const [hoveredId, setHoveredId] = useState(null)

  const availablePaths = new Set(fractals.map((f) => f.path))

  return (
    <main style={pageStyle}>


      {/* スクロールエリア */}
      <div style={scrollAreaStyle}>
        <section style={pageStyles.panelWide}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h2 style={pageStyles.subtitle}>図形を選んでください</h2>
            <p style={pageStyles.lead}>タップすると説明ページに進めます。</p>
          </div>

          <div style={pageStyles.cardGrid}>
            {fractalCatalog.map((model) => {
              const isAvailable = availablePaths.has(model.path)
              const isHovered = hoveredId === model.path

              return (
                <div
                  key={model.path}
                  style={{
                    ...pageStyles.card,
                    ...(isHovered && isAvailable ? pageStyles.cardHover : {}),
                    ...(!isAvailable ? disabledCardStyle : {}),
                  }}
                  onClick={() => isAvailable && navigate(`/models/${model.path}`)}
                  onMouseEnter={() => isAvailable && setHoveredId(model.path)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div style={pageStyles.thumbnail}>
                    <FractalThumb image={model.image} name={model.name} />
                  </div>
                  <p style={pageStyles.cardTitle}>{model.name}</p>
                  <div>
                    {!isAvailable && (
                      <span style={pageStyles.badgeSoon}>近日公開</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* 下部固定フッダー */}
      <footer style={footerStyle}>
        <Link to="/" style={backLinkStyle}>← トップへ</Link>
        <div style={progressWrapStyle}>
          <ProgressBar step={2} />
        </div>
      </footer>
    </main>
  )
}

// ── スタイル定数 ─────────────────────────────────────────────

const pageStyle = {
  height: '100vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  background: color.bgPage,
  color: color.textPrimary,
  fontFamily: 'sans-serif',
}

const footerStyle = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '12px 24px 14px',
  borderBottom: `1px solid rgba(255, 255, 255, 0.07)`,
  background: color.bgPage,
}

const backLinkStyle = {
  fontSize: 13,
  color: color.textSecondary,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  flexShrink: 0,
}

const progressWrapStyle = {
  flex: 1,
}

const scrollAreaStyle = {
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: 24,
}

const disabledCardStyle = {
  opacity: 0.45,
  cursor: 'default',
}

// ── サムネイル（画像 or プレースホルダー）────────────────────

function FractalThumb({ image, name }) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}
      />
    )
  }
  return (
    <div style={placeholderStyle}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2"
          stroke={color.borderDefault} strokeWidth="1" strokeDasharray="3 3" />
        <path d="M8 15 l3-4 2 3 2-2 3 3" stroke={color.textMuted} strokeWidth="1" fill="none" />
        <circle cx="9" cy="9" r="1.5" fill={color.textMuted} />
      </svg>
      <span style={{ fontSize: 11, color: color.textMuted, marginTop: 4 }}>画像なし</span>
    </div>
  )
}

const placeholderStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
}