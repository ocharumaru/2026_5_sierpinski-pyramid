/**
 * ページ共通スタイル定数 + テーマ切り替え
 *
 * 2テーマを管理する:
 *   dark/light 
 *
 * ## 使い方
 *
 * ### 1. アプリのルートを ThemeProvider で包む（main.jsx や App.jsx）
 * ```jsx
 * import { ThemeProvider } from '../styles/pageStyles'
 *
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * ### 2. 各ページで useTheme フックを使う
 * ```jsx
 * import { useTheme } from '../styles/pageStyles'
 *
 * export default function SomePage() {
 *   const { pageStyles, color, shape, theme, toggleTheme } = useTheme()
 *   return (
 *     <main style={pageStyles.page}>
 *       <button onClick={toggleTheme}>
 *         {theme === 'dark' ? 'ライトモードへ' : 'ダークモードへ'}
 *       </button>
 *     </main>
 *   )
 * }
 * ```
 */

import { createContext, useContext, useState, useMemo } from 'react'

// ── カラートークン定義 ────────────────────────────────────────

const colorDark = {
  bgPage:        '#01011e',
  bgPanel:       'rgba(0, 255, 200, 0.04)',
  bgPanelHover:  'rgba(0, 255, 200, 0.08)',
  bgOverlay:     'rgba(0, 0, 0, 0.65)',

  borderSubtle:  'rgba(0, 255, 200, 0.12)',
  borderDefault: 'rgba(0, 255, 200, 0.25)',

  textPrimary:   'rgba(220, 255, 250, 0.92)',
  textSecondary: 'rgba(160, 240, 220, 0.65)',
  textMuted:     'rgba(160, 240, 220, 0.35)',
  textBar:       'rgba(3, 4, 32, 0.81)',

  cpInput:       'rgba(30, 29, 33, 0.6)',
  cpOverlay:     'rgba(0, 0, 0, 0.8)',
  cpText:        'rgba(217, 230, 240, 0.82)',
  cpTextin:      'rgb(255, 255, 255)',
  cpBorder:      'rgba(6, 108, 67, 0.24)',
  cpSubtle:      'rgba(228, 230, 251, 0.8)',
  cpResume:      '#facc15',
  cpResumeText:  '#1a1500',
  cpReset:       '#ef4444',
  cpResetText:   '#ffffff',
  cpInbg:        'rgba(137, 146, 161, 0.84)',

  accent1:       '#00ffe0',
  accent1Light:  '#80fff0',
  accent1Dim:    'rgba(0, 255, 200, 0.15)',
  accent1Text:   '#001a14',
  accent2:       '#0cf7c8',
  accent2Dim:    'rgba(255, 106, 213, 0.15)',

  bgPanelStrong: 'rgba(0, 255, 200, 0.04)',
  bgPanelWide:   'rgba(0, 255, 200, 0.04)',
  bgInfo:        'rgba(0, 255, 200, 0.04)',
  bgCard:        'rgba(0, 255, 200, 0.04)',
}

const colorLight = {
  bgPage:        '#fdf6f0',
  bgPanel:       'rgba(180, 100, 60, 0.05)',
  bgPanelHover:  'rgba(180, 100, 60, 0.09)',
  bgOverlay:     'rgba(60, 30, 10, 0.45)',

  borderSubtle:  'rgba(160, 80, 40, 0.12)',
  borderDefault: 'rgba(160, 80, 40, 0.22)',

  textPrimary:   'rgba(40, 20, 10, 0.88)',
  textSecondary: 'rgba(80, 45, 25, 0.65)',
  textMuted:     'rgba(80, 45, 25, 0.38)',
  textBar:       'rgba(250, 242, 212, 0.92)',

  cpInput:       'rgba(234, 230, 195, 0.9)',
  cpOverlay:     'rgba(241, 234, 211, 0.8)',
  cpText:        'rgba(44, 36, 30, 0.86)',
  cpTextin:      '#ffffff',
  cpBorder:      'rgba(241, 234, 211, 0.68)',
  cpSubtle:      'rgba(44, 36, 30, 0.8)',
  cpResume:      '#edd732',
  cpResumeText:  '#ffffff',
  cpReset:       '#f5032c',
  cpResetText:   '#ffffff',

  accent1:       '#d74b25',
  accent1Light:  '#d98060',
  accent1Dim:    'rgba(192, 88, 58, 0.12)',
  accent1Text:   '#ffffff',
  accent2:       '#0fca41',
  accent2Dim:    'rgba(58, 125, 140, 0.12)',

  bgPanelStrong: '#fff9f4',
  bgPanelWide:   '#f8f7e9d2',
  bgInfo:        '#fcecdf',
  bgCard:        '#f5efda',
}

// ── shapeトークン定義 ─────────────────────────────────────────

const shapeDark = {
  radiusSm: 6,
  radiusMd: 8,
  radiusLg: 12,
}

const shapeLight = {
  radiusSm: 10,
  radiusMd: 14,
  radiusLg: 20,
}

// ── pageStylesファクトリ ──────────────────────────────────────
//
// color と shape を受け取り、pageStyles オブジェクトを生成する。
// テーマが変わるたびに再生成される。

function buildPageStyles(color, shape, isDark) {
  const panelBg     = color.bgPanelStrong
  const panelWideBg = color.bgPanelWide
  const infoBg      = color.bgInfo
  const cardBg      = color.bgCard
  const tabBg       = color.bgPanel
  const fontFamily  = isDark
    ? "'Courier New', monospace, sans-serif"
    : 'Georgia, serif'

  return {

    page: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      background: color.bgPage,
      color: color.textPrimary,
      fontFamily,
    },

    panel: {
      width: '100%',
      maxWidth: 520,
      background: panelBg,
      border: `1px solid ${color.borderDefault}`,
      borderRadius: shape.radiusMd,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      ...(isDark ? {} : { boxShadow: '0 2px 16px rgba(160,80,40,0.08)' }),
    },

    panelWide: {
      width: '100%',
      maxWidth: 860,
      background: panelWideBg,
      border: `1px solid ${color.borderDefault}`,
      borderRadius: shape.radiusMd,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      ...(isDark ? {} : { boxShadow: '0 2px 16px rgba(160,80,40,0.08)' }),
    },

    title: {
      fontSize: 28,
      fontWeight: 700,
      color: color.textPrimary,
      lineHeight: 1.35,
      ...(isDark ? { letterSpacing: '0.04em' } : {}),
    },

    subtitle: {
      fontSize: 22,
      fontWeight: 600,
      color: color.textPrimary,
      ...(isDark ? { letterSpacing: '0.03em' } : {}),
    },

    lead: {
      fontSize: 15,
      lineHeight: isDark ? 1.75 : 1.8,
      color: color.textSecondary,
    },

    caption: {
      fontSize: 12,
      color: color.textMuted,
    },

    primaryButton: {
      border: 'none',
      background: color.accent2,
      color: color.accent1Text,
      borderRadius: shape.radiusSm,
      fontWeight: 700,
      fontSize: 14,
      padding: '11px 18px',
      cursor: 'pointer',
      ...(isDark ? { letterSpacing: '0.05em' } : {}),
    },

    outlineButton: {
      border: `1px solid ${color.borderDefault}`,
      background: 'transparent',
      color: color.textSecondary,
      borderRadius: shape.radiusSm,
      fontSize: 14,
      padding: '11px 18px',
      cursor: 'pointer',
    },

    primaryLink: {
      display: 'inline-block',
      width: 'fit-content',
      textDecoration: 'none',
      color: color.accent1,
      fontWeight: 700,
      borderRadius: shape.radiusSm,
      padding: '10px 18px',
      border: `1px solid ${isDark ? color.accent1 : color.accent1Light}`,
    },

    backLink: {
      width: 'fit-content',
      color: color.textSecondary,
      textDecoration: 'underline',
      cursor: 'pointer',
    },

    secondaryLink: {
      textDecoration: 'none',
      color: color.textSecondary,
      border: `1px solid ${color.borderDefault}`,
      borderRadius: shape.radiusSm,
      padding: '8px 12px',
      textAlign: 'center',
      display: 'block',
    },

    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: 12,
    },

    card: {
      border: `1px solid ${color.borderSubtle}`,
      borderRadius: shape.radiusMd,
      padding: 14,
      background: cardBg,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      cursor: 'pointer',
      transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
      ...(isDark ? {} : { boxShadow: '0 1px 6px rgba(160,80,40,0.06)' }),
    },

    cardHover: {
      border: `1px solid ${color.accent1}`,
      ...(isDark
        ? { background: color.bgPanelHover }
        : { boxShadow: '0 3px 12px rgba(192,88,58,0.14)' }),
    },

    cardSelected: {
      border: `2px solid ${color.accent1}`,
      background: color.accent1Dim,
    },

    cardTitle: {
      fontSize: 15,
      fontWeight: 500,
      color: color.textPrimary,
      minHeight: 44,
    },

    thumbnail: {
      height: 196,
      border: `1px dashed ${color.borderDefault}`,
      borderRadius: shape.radiusSm,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: color.textMuted,
      background: color.accent1Dim,
    },

    tabRow: {
      display: 'flex',
      gap: 0,
      position: 'relative',
      zIndex: 1,
    },

    // ── タブボタン（バグ修正コメント）────────────────────────
    //
    // border ショートハンドに加えて borderColor を明示的に指定する。
    // ショートハンドのみだと、tabButtonActive をスプレッドした後に
    // 非アクティブタブへ戻る際、ブラウザのデフォルト（黒）が残留する
    // ことがある。borderColor を個別プロパティとして持たせることで
    // スプレッドのマージ順に関わらず常に意図した色が適用される。

    tabButton: {
      border: `1.5px solid ${color.borderDefault}`,
      borderBottom: 'none',
      borderColor: color.borderDefault,   // ← 明示指定（修正の核心）
      background: tabBg,
      color: color.textMuted,
      borderRadius: `${shape.radiusSm}px ${shape.radiusSm}px 0 0`,
      padding: '9px 20px',
      fontSize: 13,
      cursor: 'pointer',
      position: 'relative',
      top: 3,
      zIndex: 1,
      marginRight: 2,
      transition: 'background 0.12s, color 0.12s',
      ...(isDark ? { letterSpacing: '0.03em' } : {}),
    },

    tabButtonActive: {
      background: color.accent1,
      color: color.accent1Text,
      borderColor: color.accent1,           // ← active 側も borderColor で統一
      fontWeight: 700,
      top: 0,
      zIndex: 3,
    },

    infoBox: {
      background: infoBg,
      border: `1.5px solid ${color.borderDefault}`,
      borderRadius: `0 ${shape.radiusSm}px ${shape.radiusSm}px ${shape.radiusSm}px`,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      lineHeight: isDark ? 1.75 : 1.8,
      fontSize: 14,
      color: color.textSecondary,
      position: 'relative',
      zIndex: 2,
    },

    actionRow: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
    },

    badgeMath: {
      display: 'inline-block',
      fontSize: 11,
      padding: '3px 8px',
      borderRadius: 4,
      fontWeight: 500,
      background: color.accent1Dim,
      color: color.accent1,
    },

    badgeVisual: {
      display: 'inline-block',
      fontSize: 11,
      padding: '3px 8px',
      borderRadius: 4,
      fontWeight: 500,
      background: color.accent2Dim,
      color: color.accent2,
    },

    badgeSoon: {
      display: 'inline-block',
      fontSize: 11,
      padding: '3px 8px',
      borderRadius: 4,
      fontWeight: 500,
      background: isDark ? color.bgPanel : 'rgba(80,45,25,0.07)',
      color: color.textMuted,
    },
  }
}

// ── Reactコンテキスト ─────────────────────────────────────────

const ThemeContext = createContext(null)

/**
 * ThemeProvider
 * アプリのルートに配置してテーマ状態を提供する。
 *
 * @param {{ children: React.ReactNode, defaultTheme?: 'dark' | 'light' }} props
 */
export function ThemeProvider({ children, defaultTheme = 'dark' }) {
  const [theme, setTheme] = useState(defaultTheme)

  const value = useMemo(() => {
    const isDark = theme === 'dark'
    const color  = isDark ? colorDark  : colorLight
    const shape  = isDark ? shapeDark  : shapeLight
    return {
      theme,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      setTheme,
      color,
      shape,
      pageStyles: buildPageStyles(color, shape, isDark),
    }
  }, [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * useTheme
 * テーマに応じた pageStyles / color / shape と切り替え関数を返す。
 *
 * @returns {{
 *   theme: 'dark' | 'light',
 *   toggleTheme: () => void,
 *   setTheme: (theme: 'dark' | 'light') => void,
 *   pageStyles: object,
 *   color: object,
 *   shape: object,
 * }}
 */
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}