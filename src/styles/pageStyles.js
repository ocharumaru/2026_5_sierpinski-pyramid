/**
 * ページ共通スタイル定数
 *
 * コンセプト：「* テーマ：黒×シアン×グリーン
 * ターミナル・SF的な無機質さ。「計算する機械」感。
 * 3Dフラクタルの数理的・技術的な側面を前面に出す。
 */

// ── カラートークン ──────────────────────────────────────────

const color = {
  bgPage:        '#02022e',
  bgPanel:       'rgba(0, 255, 200, 0.04)',
  bgPanelHover:  'rgba(0, 255, 200, 0.08)',
  bgOverlay:     'rgba(0, 0, 0, 0.65)',

  borderSubtle:  'rgba(0, 255, 200, 0.12)',
  borderDefault: 'rgba(0, 255, 200, 0.25)',

  textPrimary:   'rgba(220, 255, 250, 0.92)',
  textSecondary: 'rgba(160, 240, 220, 0.65)',
  textMuted:     'rgba(160, 240, 220, 0.35)',

  purple:        '#00ffe0',
  purpleLight:   '#80fff0',
  purpleDim:     'rgba(0, 255, 200, 0.15)',
  teal:          '#00e5b0',
  tealDim:       'rgba(0, 229, 176, 0.15)',
  amber:         '#00ffe0',   // タブ選択はシアンで統一
  amberDim:      'rgba(0, 255, 200, 0.12)',
}

const shape = {
  radiusSm: 6,   // Cyber は角を立てて無機質感を出す
  radiusMd: 8,
  radiusLg: 12,
}

export const pageStyles = {

  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    background: color.bgPage,
    color: color.textPrimary,
    fontFamily: "'Courier New', monospace, sans-serif",
  },

  panel: {
    width: '100%',
    maxWidth: 520,
    background: color.bgPanel,
    border: `1px solid ${color.borderDefault}`,
    borderRadius: shape.radiusMd,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },

  panelWide: {
    width: '100%',
    maxWidth: 860,
    background: color.bgPanel,
    border: `1px solid ${color.borderDefault}`,
    borderRadius: shape.radiusMd,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: 700,
    color: color.textPrimary,
    lineHeight: 1.3,
    letterSpacing: '0.04em',
  },

  subtitle: {
    fontSize: 22,
    fontWeight: 600,
    color: color.textPrimary,
    letterSpacing: '0.03em',
  },

  lead: {
    fontSize: 15,
    lineHeight: 1.75,
    color: color.textSecondary,
  },

  caption: {
    fontSize: 12,
    color: color.textMuted,
  },

  primaryButton: {
    border: 'none',
    background: color.purple,
    color: '#001a14',
    borderRadius: shape.radiusSm,
    fontWeight: 700,
    fontSize: 14,
    padding: '11px 18px',
    cursor: 'pointer',
    letterSpacing: '0.05em',
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
    color: color.purple,
    fontWeight: 700,
    borderRadius: shape.radiusSm,
    padding: '10px 18px',
    border: `1px solid ${color.purple}`,
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
    background: color.bgPanel,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    cursor: 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
  },

  cardHover: {
    border: `1px solid ${color.purple}`,
    background: color.bgPanelHover,
  },

  cardSelected: {
    border: `2px solid ${color.purple}`,
    background: color.purpleDim,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: 500,
    color: color.textPrimary,
    minHeight: 44,
  },

  thumbnail: {
    height: 96,
    border: `1px dashed ${color.borderDefault}`,
    borderRadius: shape.radiusSm,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: color.textMuted,
    background: color.purpleDim,
  },

  tabRow: {
    display: 'flex',
    gap: 0,
    position: 'relative',
    zIndex: 1,
  },

  tabButton: {
    border: `1.5px solid ${color.borderDefault}`,
    borderBottom: 'none',
    background: color.bgPanel,
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
    letterSpacing: '0.03em',
  },

  tabButtonActive: {
    background: color.amber,
    color: '#001a14',
    borderColor: color.amber,
    fontWeight: 700,
    top: 0,
    zIndex: 3,
  },

  infoBox: {
    background: color.bgPanel,
    border: `1.5px solid ${color.borderDefault}`,
    borderRadius: `0 ${shape.radiusSm}px ${shape.radiusSm}px ${shape.radiusSm}px`,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    lineHeight: 1.75,
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
    background: color.purpleDim,
    color: color.purple,
  },

  badgeVisual: {
    display: 'inline-block',
    fontSize: 11,
    padding: '3px 8px',
    borderRadius: 4,
    fontWeight: 500,
    background: color.tealDim,
    color: color.teal,
  },

  badgeSoon: {
    display: 'inline-block',
    fontSize: 11,
    padding: '3px 8px',
    borderRadius: 4,
    fontWeight: 500,
    background: color.bgPanel,
    color: color.textMuted,
  },
}

export { color, shape }