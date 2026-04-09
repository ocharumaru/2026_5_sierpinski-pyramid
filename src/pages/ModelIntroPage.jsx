import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getFractalCatalogByPath } from '../models/fractalCatalog'
import { pageStyles } from '../styles/pageStyles'

export default function ModelIntroPage() {
  const { modelId } = useParams()
  const navigate = useNavigate()
  const [level, setLevel] = useState('beginner')

  const model = useMemo(
    () => getFractalCatalogByPath(modelId),
    [modelId]
  )

  if (!model) {
    return (
      <main style={pageStyles.page}>
        <section style={pageStyles.panel}>
          <h2 style={pageStyles.subtitle}>モデルが見つかりません</h2>
          <Link to="/models" style={pageStyles.primaryLink}>モデル選択へ戻る</Link>
        </section>
      </main>
    )
  }

  const content = model.intro[level]

  return (
    <main style={pageStyles.page}>
      <section style={pageStyles.panelWide}>
        <h2 style={pageStyles.subtitle}>{model.name} 専用ページ</h2>
        <div style={pageStyles.tabRow}>
          <button
            type="button"
            style={{ ...pageStyles.tabButton, ...(level === 'beginner' ? pageStyles.tabButtonActive : null) }}
            onClick={() => setLevel('beginner')}
          >
            初心者向け
          </button>
          <button
            type="button"
            style={{ ...pageStyles.tabButton, ...(level === 'advanced' ? pageStyles.tabButtonActive : null) }}
            onClick={() => setLevel('advanced')}
          >
            上級者向け
          </button>
        </div>

        <div style={pageStyles.infoBox}>
          <p><strong>概要:</strong> {content.overview}</p>
          <p><strong>特徴:</strong> {content.feature}</p>
          <p><strong>応用:</strong> {content.application}</p>
          <p><strong>作り方:</strong> {content.howTo}</p>
        </div>

        <div style={pageStyles.actionRow}>
          <button type="button" style={pageStyles.outlineButton} onClick={() => navigate('/models')}>
            前へ
          </button>
          <button type="button" style={pageStyles.primaryButton} onClick={() => navigate(`/${model.path}`)}>
            生成する
          </button>
        </div>
      </section>
    </main>
  )
}