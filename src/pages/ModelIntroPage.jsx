import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getFractalCatalogByPath } from '../models/fractalCatalog'
import BottomBar from '../components/BottomBar'
import { pageStyles, color, shape } from '../styles/pageStyles'

/**
 * モデル専用ページ（ステップ 3/4）
 *
 * レイアウト構成:
 *   - スクロールエリア: 画像 → stat → 概要 → アコーディオン（特徴・応用・作り方）
 *   - ボトムバー固定: 進捗バー（3/4塗り）＋「← 前へ」「3D で見る →」
 *
 * フォルダータブ（初心者向け / 上級者向け）でコンテンツを切り替える。
 * アコーディオン開閉状態はタブ切り替え時にリセットされる。
 */
export default function ModelIntroPage() {
  const { modelId } = useParams()
  const navigate = useNavigate()
  const [level, setLevel] = useState('beginner')
  const [openItems, setOpenItems] = useState({})

  const model = useMemo(() => getFractalCatalogByPath(modelId), [modelId])

  if (!model) {
    return (
      <main style={pageStyle}>
        <div style={scrollAreaStyle}>
          <section style={pageStyles.panel}>
            <h2 style={pageStyles.subtitle}>モデルが見つかりません</h2>
            <Link to="/models" style={pageStyles.primaryLink}>モデル選択へ戻る</Link>
          </section>
        </div>
      </main>
    )
  }

  const content = model.intro[level]

  function handleTabSwitch(nextLevel) {
    setLevel(nextLevel)
    setOpenItems({})
  }

  function toggleItem(key) {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const accordionItems = [
    { key: 'feature',     label: '特徴',   text: content.feature },
    { key: 'application', label: '応用',   text: content.application },
    { key: 'howTo',       label: '作り方', text: content.howTo },
  ]

  return (
    <main style={pageStyle}>
      <div style={scrollAreaStyle}>
        <section style={pageStyles.panelWide}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h2 style={pageStyles.subtitle}>{model.name}</h2>
          </div>

          {/* フォルダータブ＋パネル */}
          <div>
            <div style={pageStyles.tabRow}>
              {['beginner', 'advanced'].map((lv) => (
                <button
                  key={lv}
                  type="button"
                  style={{
                    ...pageStyles.tabButton,
                    ...(level === lv ? pageStyles.tabButtonActive : {}),
                  }}
                  onClick={() => handleTabSwitch(lv)}
                >
                  {lv === 'beginner' ? '初心者向け' : '上級者向け'}
                </button>
              ))}
            </div>

            <div style={pageStyles.infoBox}>
              {/* 画像エリア */}
              <div style={imgAreaStyle}>
                {model.image ? (
                  <img
                    src={model.image}
                    alt={model.name}
                    style={imgStyle}
                  />
                ) : (
                  <ImagePlaceholder />
                )}
              </div>

              {/* stat（自己相似・次元数） */}
              {model.stats && (
                <div style={statRowStyle}>
                  {model.stats.map(({ label, value }) => (
                    <div key={label} style={statStyle}>
                      <p style={statValStyle}>{value}</p>
                      <p style={statKeyStyle}>{label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 概要（常に表示） */}
              <p style={overviewStyle}>
                <strong style={{ color: color.textPrimary }}>概要：</strong><br />
                {content.overview}
              </p>

              {/* アコーディオン（特徴・応用・作り方） */}
              <div style={accListStyle}>
                {accordionItems.map(({ key, label, text }) => (
                  <div key={key} style={accItemStyle}>
                    <button
                      type="button"
                      style={accHeadStyle}
                      onClick={() => toggleItem(key)}
                    >
                      <span style={accLabelStyle}>{label}</span>
                      <span style={{
                        ...accArrowStyle,
                        transform: openItems[key] ? 'rotate(45deg)' : 'rotate(0deg)',
                      }}>
                        ＋
                      </span>
                    </button>
                    {openItems[key] && (
                      <p style={accBodyStyle}>{text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <BottomBar
        step={3}
        nextLabel="生成する →"
        onNext={() => navigate(`/${model.path}`)}
        backLabel="← 前へ"
        onBack={() => navigate('/models')}
      />
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

const scrollAreaStyle = {
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: 24,
}

const eyebrowStyle = {
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: color.purple,
}

const imgAreaStyle = {
  width: '100%',
  height: 200,
  borderRadius: shape.radiusSm,
  border: `1px dashed ${color.borderDefault}`,
  background: 'rgba(255, 255, 255, 0.02)',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const imgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}

const statRowStyle = {
  display: 'flex',
  gap: 8,
}

const statStyle = {
  flex: 1,
  background: 'rgba(255, 255, 255, 0.04)',
  border: `1px solid rgba(255, 255, 255, 0.08)`,
  borderRadius: shape.radiusSm,
  padding: '8px 6px',
  textAlign: 'center',
}

const statValStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: color.purple,
}

const statKeyStyle = {
  fontSize: 10,
  color: color.textMuted,
  marginTop: 3,
}

const overviewStyle = {
  fontSize: 14,
  color: color.textSecondary,
  lineHeight: 1.75,
}

const accListStyle = {
  borderTop: `1px solid ${color.borderSubtle}`,
  display: 'flex',
  flexDirection: 'column',
}

const accItemStyle = {
  borderBottom: `1px solid ${color.borderSubtle}`,
}

const accHeadStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '11px 2px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
}

const accLabelStyle = {
  fontSize: 13,
  fontWeight: 500,
  color: color.textSecondary,
}

const accArrowStyle = {
  fontSize: 14,
  color: color.textMuted,
  transition: 'transform 0.2s',
  display: 'inline-block',
}

const accBodyStyle = {
  fontSize: 13,
  color: color.textSecondary,
  lineHeight: 1.75,
  padding: '0 2px 12px',
}

// ── 画像プレースホルダー ──────────────────────────────────────

function ImagePlaceholder() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2"
          stroke={color.borderDefault} strokeWidth="1" strokeDasharray="3 3" />
        <path d="M8 15 l3-4 2 3 2-2 3 3" stroke={color.textMuted} strokeWidth="1" fill="none" />
        <circle cx="9" cy="9" r="1.5" fill={color.textMuted} />
      </svg>
      <span style={{ fontSize: 11, color: color.textMuted }}>画像エリア</span>
    </div>
  )
}