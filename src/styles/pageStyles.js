/**
 * ページ共通スタイル定数
 *
 * コンセプト：「数学の美しさへの入口」
 * - 暗背景＋パープル系で 3D フラクタルの視覚的魅力を最大化
 * - ティールのアクセントで「自然を模倣した規則」という学術テーマを補強
 * - アンバーの選択・CTA で、待ち時間ユーザーが迷わず次へ進める導線を確保
 * - 初心者／上級者の二層構造で、子供〜技術者まで同じ画面に共存
 */

// ── カラートークン ──────────────────────────────────────────
const color = {
  // 背景
  bgPage:        '#0a0a12',
  bgPanel:       'rgba(255, 255, 255, 0.04)',
  bgPanelHover:  'rgba(255, 255, 255, 0.07)',
  bgOverlay:     'rgba(0, 0, 0, 0.55)',

  // ボーダー
  borderSubtle:  'rgba(255, 255, 255, 0.10)',
  borderDefault: 'rgba(255, 255, 255, 0.18)',

  // テキスト
  textPrimary:   'rgba(240, 240, 255, 0.92)',
  textSecondary: 'rgba(200, 200, 255, 0.60)',
  textMuted:     'rgba(200, 200, 255, 0.35)',

  // ブランドカラー
  purple:        '#7F77DD',   // メインアクセント
  purpleLight:   '#AFA9EC',
  purpleDim:     'rgba(127, 119, 221, 0.20)',
  teal:          '#1D9E75',   // 自然・学術アクセント
  tealDim:       'rgba(29, 158, 117, 0.20)',
  amber:         '#f0c040',   // 選択状態・CTA
  amberDim:      'rgba(240, 192, 64, 0.15)',
}

// ── 共通スペーシング・シェイプ ────────────────────────────────
const shape = {
  radiusSm:  8,
  radiusMd:  12,
  radiusLg:  16,
}

// ── エクスポート ──────────────────────────────────────────────
export const pageStyles = {

  // ── レイアウト ──────────────────────────────────────────────

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

  // ── タイポグラフィ ───────────────────────────────────────────

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

  // ── ボタン・リンク ───────────────────────────────────────────

  /** 緑→パープルに変更。メインCTA */
  primaryButton: {
    border: 'none',
    background: color.purple,
    color: '#ffffff',
    borderRadius: shape.radiusSm,
    fontWeight: 600,
    fontSize: 14,
    padding: '11px 18px',
    cursor: 'pointer',
  },

  /** アウトライン（戻るボタンなど） */
  outlineButton: {
    border: `1px solid ${color.borderDefault}`,
    background: 'transparent',
    color: color.textSecondary,
    borderRadius: shape.radiusSm,
    fontSize: 14,
    padding: '11px 18px',
    cursor: 'pointer',
  },

  /** テキストリンク（下線あり） */
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

  /** カードのリンク（モデル選択ページなど） */
  secondaryLink: {
    textDecoration: 'none',
    color: color.textSecondary,
    border: `1px solid ${color.borderDefault}`,
    borderRadius: shape.radiusSm,
    padding: '8px 12px',
    textAlign: 'center',
    display: 'block',
  },

  // ── カード ───────────────────────────────────────────────────

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

  /** カード選択状態（ModelSelectionPage でタップ後） */
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

  /** サムネイル領域（Three.js プレビューや仮プレースホルダー） */
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

  // ── フォルダータブ（初心者向け / 上級者向け）────────────────
  //
  // ファイルフォルダーの見出し部分のように、タブが紙の束の縁として
  // パネルの上端に並ぶ。選択中のタブが手前（zIndex高・top:0）、
  // 非選択タブは 3px 下に沈んで奥に重なって見える。

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
    color: '#1a1200',
    borderColor: color.amber,
    fontWeight: 700,
    top: 0,
    zIndex: 3,
  },

  // ── 情報ボックス（フォルダータブと接続するパネル）────────────

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

  // ── アクション行 ─────────────────────────────────────────────

  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
  },

  // ── バッジ ───────────────────────────────────────────────────

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