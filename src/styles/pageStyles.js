/**
 * ページ共通スタイル定数
 */

// ── カラートークン ──────────────────────────────────────────

const color = {
  bgPage:        '#fdf6f0',   // 温かみのあるクリーム
  bgPanel:       'rgba(180, 100, 60, 0.05)',
  bgPanelHover:  'rgba(180, 100, 60, 0.09)',
  bgOverlay:     'rgba(60, 30, 10, 0.45)',

  borderSubtle:  'rgba(160, 80, 40, 0.12)',
  borderDefault: 'rgba(160, 80, 40, 0.22)',

  textPrimary:   'rgba(40, 20, 10, 0.88)',
  textSecondary: 'rgba(80, 45, 25, 0.65)',
  textMuted:     'rgba(80, 45, 25, 0.38)',

  purple:        '#c0583a',   // テラコッタ（メインアクセント）
  purpleLight:   '#d98060',
  purpleDim:     'rgba(192, 88, 58, 0.12)',
  teal:          '#8b7355',   // ウォームブラウン（サブアクセント）
  tealDim:       'rgba(139, 115, 85, 0.12)',
  amber:         '#c0583a',   // タブ選択もテラコッタで統一
  amberDim:      'rgba(225, 91, 54, 0.1)',
}

const shape = {
  radiusSm: 10,   
  radiusMd: 14,
  radiusLg: 20,
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
    fontFamily: 'Georgia, serif',
  },

  panel: {
    width: '100%',
    maxWidth: 520,
    background: '#fff9f4',
    border: `1px solid ${color.borderDefault}`,
    borderRadius: shape.radiusMd,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxShadow: '0 2px 16px rgba(160,80,40,0.08)',
  },

  panelWide: {
    width: '100%',
    maxWidth: 860,
    background: '#f8f7e9d2',
    border: `1px solid ${color.borderDefault}`,
    borderRadius: shape.radiusMd,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxShadow: '0 2px 16px rgba(160,80,40,0.08)',
  },

  title: {
    fontSize: 28,
    fontWeight: 700,
    color: color.textPrimary,
    lineHeight: 1.35,
  },

  subtitle: {
    fontSize: 22,
    fontWeight: 600,
    color: color.textPrimary,
  },

  lead: {
    fontSize: 15,
    lineHeight: 1.8,
    color: color.textSecondary,
  },

  caption: {
    fontSize: 12,
    color: color.textMuted,
  },

  primaryButton: {
    border: 'none',
    background: color.purple,
    color: '#fff',
    borderRadius: shape.radiusSm,
    fontWeight: 700,
    fontSize: 14,
    padding: '11px 18px',
    cursor: 'pointer',
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
    border: `1px solid ${color.purpleLight}`,
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
    background: '#f5efda',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    cursor: 'pointer',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: '0 1px 6px rgba(160,80,40,0.06)',
  },

  cardHover: {
    border: `1px solid ${color.purple}`,
    boxShadow: '0 3px 12px rgba(192,88,58,0.14)',
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
    background: 'rgba(180, 100, 60, 0.04)',
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
  },

  tabButtonActive: {
    background: color.amber,
    color: '#fff',
    fontWeight: 700,
    top: 0,
    zIndex: 3,
  },

  infoBox: {
    background: '#fcecdf',
    border: `1.5px solid ${color.borderDefault}`,
    borderRadius: `0 ${shape.radiusSm}px ${shape.radiusSm}px ${shape.radiusSm}px`,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    lineHeight: 1.8,
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
    background: 'rgba(80,45,25,0.07)',
    color: color.textMuted,
  },
}

export { color, shape }