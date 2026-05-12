import ProgressBar from './ProgressBar'
import { useTheme } from '../styles/pageStyles'

/**
 * ボトムバー（全ページ共通）
 *
 * 画面下部に固定されるナビゲーションバー。
 * 進捗バーとページ遷移ボタンを含む。
 *
 * @param {number}   step        - 現在のステップ（1〜4）ProgressBar に渡す
 * @param {string}   nextLabel   - 次へボタンのラベル（例: "探索する →", "3D で見る →"）
 * @param {Function} onNext      - 次へボタンの押下ハンドラ
 * @param {string}   [backLabel] - 前へボタンのラベル。省略時は前へボタンを非表示
 * @param {Function} [onBack]    - 前へボタンの押下ハンドラ
 */
export default function BottomBar({ step, nextLabel, onNext, backLabel, onBack }) {
  const { color, shape } = useTheme()


  // ── スタイル定数(color参照) ─────────────────────────────────────────────

  const barStyle = {
    padding: '10px 24px 24px',
    background: color.bgPage,
    borderTop: `1px solid ${color.borderSubtle}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    flexShrink: 0,
    // 親ページが height:100vh + flex-direction:column のとき常に下端に留まる
  }

  const backBtnStyle = {
    flex: '0 0 auto',
    minWidth: 88,
    border: `1px solid ${color.borderDefault}`,
    background: 'transparent',
    color: color.textSecondary,
    borderRadius: shape.radiusSm,
    padding: '11px 0',
    fontSize: 14,
    cursor: 'pointer',
  }

  const primaryBtnStyle = {
    flex: 1,
    border: 'none',
    background: color.accent1,
    color: color.textBar,
    borderRadius: shape.radiusSm,
    padding: '11px 0',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  }


  return (
    <div style={barStyle}>
      <ProgressBar step={step} />
      <div style={btnRowStyle}>
        {backLabel && (
          <button type="button" style={backBtnStyle} onClick={onBack}>
            {backLabel}
          </button>
        )}
        <button type="button" style={primaryBtnStyle} onClick={onNext}>
          {nextLabel}
        </button>
      </div>
    </div>
  )
}

// ── スタイル定数 (color非参照)─────────────────────────────────────────────

const btnRowStyle = {
  display: 'flex',
  gap: 10,
}
