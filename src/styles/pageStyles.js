/**
 * ページ共通スタイル定数
 */

// ── カラートークン ──────────────────────────────────────────

const color = {
  bgPage:        '#010d1a',
  bgPanel:       'rgba(103, 232, 249, 0.04)',
  bgPanelHover:  'rgba(103, 232, 249, 0.08)',
  bgOverlay:     'rgba(0, 0, 0, 0.65)',

  borderSubtle:  'rgba(103, 232, 249, 0.12)',
  borderDefault: 'rgba(103, 232, 249, 0.22)',

  textPrimary:   'rgba(220, 245, 255, 0.92)',
  textSecondary: 'rgba(160, 220, 240, 0.65)',
  textMuted:     'rgba(160, 220, 240, 0.35)',

  purple:        '#67e8f9',
  purpleLight:   '#a5f3fc',
  purpleDim:     'rgba(103, 232, 249, 0.15)',
  teal:          '#38bdf8',
  tealDim:       'rgba(56, 189, 248, 0.15)',
  amber:         '#4b9ff9',
  amberDim:      'rgba(240, 192, 64, 0.15)',
}

const shape = {
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
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
    fontFamily: 'sans-serif',
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
    fontWeight: 600,
    color: color.textPrimary,
    lineHeight: 1.3,
  },

  subtitle: {
    fontSize: 22,
    fontWeight: 500,
    color: color.textPrimary,
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
    color: '#001a1f',
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
    fontWeight: 600,
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
  },

  tabButtonActive: {
    background: color.amber,
    color: '#e4f4f5',
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
    color: color.purpleLight,
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