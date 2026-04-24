import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getFractalCatalogByPath } from '../models/fractalCatalog'
import BottomBar from '../components/BottomBar'
import { pageStyles, color, shape } from '../styles/pageStyles'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'


/**
 * モデル専用ページ（ステップ 3/4）
 *
 * レイアウト構成:
 *   - スクロールエリア: 画像 → stat → アコーディオン（概要・特徴・応用・作り方）
 *   - ボトムバー固定: 進捗バー（3/4塗り）＋「← 前へ」「生成する →」
 *
 * フォルダータブ（初心者向け / 上級者向け）でコンテンツを切り替える。
 * アコーディオン開閉状態はタブ切り替え時にリセットされる。
 *
 * ## Markdown / 数式の注意点
 * fractalCatalog.js のテキストフィールドは String.raw`...` で記述すること。
 * 通常のテンプレートリテラルでは \frac → \f（フォームフィード）のように
 * バックスラッシュがJSのエスケープシーケンスとして解釈され、KaTeXに渡る前に
 * 文字が化けてしまう。
 *
 * ```js
 * // NG
 * overview: `$\frac{1}{2}$`   // \f がフォームフィードになる
 *
 * // OK
 * overview: String.raw`$\frac{1}{2}$`
 * ```
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
    { key: 'overview',    label: '概要',   text: content.overview },
    { key: 'feature',     label: '特徴',   text: content.feature },
    { key: 'application', label: '応用',   text: content.application },
    { key: 'howTo',       label: '作り方', text: content.howTo },
  ]

  return (
    <main style={pageStyle}>
      <div style={scrollAreaStyle}>
        <section style={pageStyles.panelWide}>
          <h2 style={pageStyles.subtitle}>{model.name}</h2>

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
                    borderColor: level === lv ? color.amber : color.borderDefault,
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
                  <img src={model.image} alt={model.name} style={imgStyle} />
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

              {/* アコーディオン */}
              <div style={accListStyle}>
                {accordionItems.map(({ key, label, text }) => {
                  const buttonId = `accordion-button-${key}`
                  const contentId = `accordion-panel-${key}`
                  const isOpen = !!openItems[key]

                  return (
                    <div key={key} style={accItemStyle}>
                      <button
                        id={buttonId}
                        type="button"
                        style={accHeadStyle}
                        aria-expanded={isOpen}
                        aria-controls={contentId}
                        onClick={() => toggleItem(key)}
                      >
                        <span style={accLabelStyle}>{label}</span>
                        <span style={{
                          ...accArrowStyle,
                          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        }}>
                          ＋
                        </span>
                      </button>
                      {isOpen && (
                        <div
                          id={contentId}
                          role="region"
                          aria-labelledby={buttonId}
                          style={accBodyStyle}
                        >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={markdownComponents}
                          >
                            {text}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  )
                })}
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

// ── Markdownコンポーネントのスタイル上書き ────────────────────
//
// ReactMarkdown が生成する要素にインラインスタイルを当てる。
// テーブルは横幅が親要素を超えやすいため overflowX: auto の
// ラッパーで囲み、table-layout: fixed で列幅を制御する。

const markdownComponents = {
  table: ({ node, ...props }) => (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table
        style={{
          width: '100%',
          tableLayout: 'fixed',
          borderCollapse: 'collapse',
          fontSize: 12,
          color: color.textSecondary,
        }}
        {...props}
      />
    </div>
  ),
  th: ({ node, ...props }) => (
    <th
      style={{
        borderBottom: `1px solid ${color.borderSubtle}`,
        padding: '6px 8px',
        textAlign: 'left',
        fontWeight: 500,
        color: color.textPrimary,
        wordBreak: 'break-word',
      }}
      {...props}
    />
  ),
  td: ({ node, ...props }) => (
    <td
      style={{
        borderBottom: `1px solid ${color.borderSubtle}`,
        padding: '6px 8px',
        wordBreak: 'break-word',
      }}
      {...props}
    />
  ),
  h4: ({ node, ...props }) => (
    <h4
      style={{ fontSize: 13, fontWeight: 500, color: color.textPrimary, margin: '12px 0 4px' }}
      {...props}
    />
  ),
  p: ({ node, ...props }) => (
    <p style={{ margin: '4px 0', lineHeight: 1.75 }} {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul style={{ paddingLeft: 18, margin: '4px 0' }} {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol style={{ paddingLeft: 18, margin: '4px 0' }} {...props} />
  ),
  li: ({ node, ...props }) => (
    <li style={{ margin: '2px 0', lineHeight: 1.7 }} {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong style={{ color: color.textPrimary, fontWeight: 500 }} {...props} />
  ),
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
  objectFit: 'contain',
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
  flexShrink: 0,
}

const accBodyStyle = {
  fontSize: 13,
  color: color.textSecondary,
  lineHeight: 1.75,
  padding: '0 2px 12px',
  overflowX: 'auto',
  wordBreak: 'break-word',
  minWidth: 0,
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