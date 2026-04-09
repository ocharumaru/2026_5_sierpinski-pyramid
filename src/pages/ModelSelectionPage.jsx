import { Link } from 'react-router-dom'
import { fractalCatalog } from '../models/fractalCatalog'
import { pageStyles } from '../styles/pageStyles'

export default function ModelSelectionPage() {
  return (
    <main style={pageStyles.page}>
      <section style={pageStyles.panelWide}>
        <h2 style={pageStyles.subtitle}>モデルを選択</h2>
        <div style={pageStyles.cardGrid}>
          {fractalCatalog.map((model) => (
            <article key={model.path} style={pageStyles.card}>
              <h3 style={pageStyles.cardTitle}>{model.name}</h3>
              <div style={pageStyles.thumbnail}>写真</div>
              <Link to={`/models/${model.path}`} style={pageStyles.secondaryLink}>
                内容を見る
              </Link>
            </article>
          ))}
        </div>
        <Link to="/" style={pageStyles.backLink}>戻る</Link>
      </section>
    </main>
  )
}