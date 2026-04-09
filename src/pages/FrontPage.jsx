import { Link } from 'react-router-dom'
import { pageStyles } from '../styles/pageStyles'

export default function FrontPage() {
  return (
    <main style={pageStyles.page}>
      <section style={pageStyles.panel}>
        <h1 style={pageStyles.title}>フラクタル図形ビューア</h1>
        <p style={pageStyles.lead}>来てくれてありがとうございます。まずはモデルを選んで見比べてみましょう。</p>
        <Link to="/models" style={pageStyles.primaryLink}>
          選んでみよう
        </Link>
      </section>
    </main>
  )
}