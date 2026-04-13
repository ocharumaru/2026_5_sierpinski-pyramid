import { useNavigate } from 'react-router-dom'
import { pageStyles, color } from '../styles/pageStyles'

/**
 * フロントページ
 *
 * 役割：3D フラクタルの「視覚的な美しさ」を最初の一画面で印象づけ、
 * 来場者をモデル選択ページへ自然に誘導する。
 * 待ち時間という短い集中力を想定し、テキストは最小限に絞っている。
 */
export default function FrontPage() {
  const navigate = useNavigate()

  return (
    <main style={pageStyles.page}>
      <section style={{ ...pageStyles.panel, gap: 24, textAlign: 'center' }}>

        

        {/* キャッチコピー */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={eyebrowStyle}>3D Fractal Viewer</p>
          <h1 style={pageStyles.title}>
            フラクタルの世界へ<br />
            ようこそ
          </h1>
          <p style={pageStyles.lead}>
            フラクタル自体の説明文
          </p>
        </div>

        {/* CTA */}
        <button
          type="button"
          style={{ ...pageStyles.primaryButton, width: '100%', fontSize: 15, padding: '13px 0' }}
          onClick={() => navigate('/models')}
        >
          フラクタルを選択する 
        </button>

        {/* サブ情報 */}
        <p style={pageStyles.caption}>
          QR コードを読み取ってアクセス中
        </p>
      </section>
    </main>
  )
}

// ── スタイル定数 ─────────────────────────────────────────────

const eyebrowStyle = {
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: '0.1em',
  color: color.purple,
  textTransform: 'uppercase',
}
