import { color } from '../styles/pageStyles'

/**
 * 進捗バー（全ページ共通）
 *
 * 4分割のセグメントバーで現在地を示す。
 * 各ページでの step 対応:
 *   1 = FrontPage
 *   2 = ModelSelectionPage
 *   3 = ModelIntroPage
 *   4 = 3D 描画ページ（/sierpinski, /menger など）
 *
 * @param {number} step - 現在のステップ（1〜4）
 */
export default function ProgressBar({ step }) {
  return (
    <div style={trackStyle}>
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          style={{
            ...segStyle,
            background: n <= step ? color.purple : 'rgba(255, 255, 255, 0.10)',
          }}
        />
      ))}
    </div>
  )
}

const trackStyle = {
  display: 'flex',
  gap: 3,
}

const segStyle = {
  flex: 1,
  height: 3,
  borderRadius: 2,
}