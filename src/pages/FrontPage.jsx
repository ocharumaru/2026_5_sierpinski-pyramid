import { useNavigate } from 'react-router-dom'
import BottomBar from '../components/BottomBar'
import { useTheme } from '../styles/pageStyles'
import LDtoggle from '../components/LDtoggleButton'


/**
 * フロントページ（ステップ 1/4）
 *
 * 3D フラクタルの視覚的な魅力を最初の一画面で印象づけ、
 * モデル選択ページへ誘導する。
 */
export default function FrontPage() {
  const navigate = useNavigate()
  const { pageStyles, color } = useTheme()

  // ── スタイル定数 (clor参照)─────────────────────────────────────────────

  const pageStyle = {
    height: '100dvh',      
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: color.bgPage,
    color: color.textPrimary,
    fontFamily: 'sans-serif',
  }

  const eyebrowStyle = {
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.1em',
    color: color.accent1,
    textTransform: 'uppercase',
  }


//──────────────────────────────────────────────────────────────────

  return (
    <main style={pageStyle}>
       {/* テーマトグルボタン */}
          { <LDtoggle /> }
      <div style={scrollAreaStyle}>
        <section style={pageStyles.panel}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
            <p style={eyebrowStyle}>issued by SDM</p>
            <h1 style={pageStyles.title}>
              3D Fractal Viwer
            </h1>
            <p style={pageStyles.lead}>
              フラクタルとはどれだけ細部を拡大しても複雑な形状が現れるような図形です。<br />
              生命や自然界に潜む美しくも不思議な構造を体感してみましょう。
            </p>
          </div>
        </section>
      </div>

      <BottomBar
        step={1}
        nextLabel="探索する →"
        onNext={() => navigate('/models')}
      />
    </main>
  )
}

// ── スタイル定数 (color非参照)─────────────────────────────────────────────

const scrollAreaStyle = {
  flex: 1,
  overflowY: 'auto',   // コンテンツが長い場合はここだけスクロール
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 24,
}
