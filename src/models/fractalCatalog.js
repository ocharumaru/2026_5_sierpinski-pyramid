/**
 * フロント導線で使うモデル定義。
 * path と name は描画ルートでも共有する。
 *
 * ## テキストフィールドの記述ルール
 * 数式（KaTeX）を含むフィールドは必ず String.raw`...` で記述すること。
 * 通常のテンプレートリテラルでは \frac の \f がフォームフィード文字に
 * 変換されてしまい、KaTeX がパースできなくなる。
 */
const mdModules = import.meta.glob('../intros/**/*.md', {
        eager: true,
        query: '?raw',
        import: 'default',
})

/**
 * パス・レベル・フィールド名から MD の内容を取得するヘルパー。
 *
 * @param {string} path    - フラクタルのパス（例: 'sierpinski'）
 * @param {string} level   - 'beginner' | 'advanced'
 * @param {string} field   - 'overview' | 'feature' | 'application' | 'howTo'
 * @returns {string}
 */
console.log(Object.keys(mdModules))
function md(path, level, field) {
        const key = `../intros/${path}/${level}/${field}.md`
        const content = mdModules[key]
        if(content === undefined) {
                console.warn(`[fractalCatalog] MD not found: ${key}`)
                return ''
        }
        return content
}

export const fractalCatalog = [
  {
    path: 'sierpinski',
    name: 'シェルピンスキー四面体',
    image: '/images/sierpinski.png',
    meshColor: { dark: '#69cce7', light: '#51e5ff' },
    intro: {
      beginner: {
        overview:    md('sierpinski', 'beginner', 'overview'),
        feature:     md('sierpinski', 'beginner', 'feature'),
        application: md('sierpinski', 'beginner', 'application'),
        howTo:       md('sierpinski', 'beginner', 'howTo'),
      },
      advanced: {
        overview:    md('sierpinski', 'advanced', 'overview'),
        feature:     md('sierpinski', 'advanced', 'feature'),
        application: md('sierpinski', 'advanced', 'application'),
        howTo:       md('sierpinski', 'advanced', 'howTo'),
      },
    },
  },
  {
    path: 'menger',
    name: 'メンガースポンジ',
    image: '/images/menger.png',
    meshColor: { dark: '#efb147', light: '#fd8a0e' },
    intro: {
      beginner: {
        overview:    md('menger', 'beginner', 'overview'),
        feature:     md('menger', 'beginner', 'feature'),
        application: md('menger', 'beginner', 'application'),
        howTo:       md('menger', 'beginner', 'howTo'),
      },
      advanced: {
        overview:    md('menger', 'advanced', 'overview'),
        feature:     md('menger', 'advanced', 'feature'),
        application: md('menger', 'advanced', 'application'),
        howTo:       md('menger', 'advanced', 'howTo'),
      },
    },
  },
  {
    path: 'mandelbrot',
    name: 'マンデルブロ集合',
    image: '/images/mandelbrot.png',  
    meshColor: { dark: '#9ad0e6', light: '#3a7a9e' },
    intro: {
      beginner: {
        overview:    md('mandelbrot', 'beginner', 'overview'),
        feature:     md('mandelbrot', 'beginner', 'feature'),
        application: md('mandelbrot', 'beginner', 'application'),
        howTo:       md('mandelbrot', 'beginner', 'howTo'),
      },
      advanced: {
        overview:    md('mandelbrot', 'advanced', 'overview'),
        feature:     md('mandelbrot', 'advanced', 'feature'),
        application: md('mandelbrot', 'advanced', 'application'),
        howTo:       md('mandelbrot', 'advanced', 'howTo'),
      },
    },
  },
  {
    path: 'mandelbulb',
    name: 'マンデルバルブ',
    image: '/images/mandelbulb.png',
    intro: {
      beginner: {
        overview:    md('mandelbulb', 'beginner', 'overview'),
        feature:     md('mandelbulb', 'beginner', 'feature'),
        application: md('mandelbulb', 'beginner', 'application'),
        howTo:       md('mandelbulb', 'beginner', 'howTo'),
      },
      advanced: {
        overview:    md('mandelbulb', 'advanced', 'overview'),
        feature:     md('mandelbulb', 'advanced', 'feature'),
        application: md('mandelbulb', 'advanced', 'application'),
        howTo:       md('mandelbulb', 'advanced', 'howTo'),
      },
    },
  },
  {
    path: 'hilbert',
    name: '3次元ヒルベルト曲線',
    image: '/images/hilbert.png',
    meshColor:       { dark: '#a76bec', light: '#551c87' },
    meshAccentColor: { dark: '#e6e328', light: '#db3b13' },
    intro: {
      beginner: {
        overview:    md('hilbert', 'beginner', 'overview'),
        feature:     md('hilbert', 'beginner', 'feature'),
        application: md('hilbert', 'beginner', 'application'),
        howTo:       md('hilbert', 'beginner', 'howTo'),
      },
      advanced: {
        overview:    md('hilbert', 'advanced', 'overview'),
        feature:     md('hilbert', 'advanced', 'feature'),
        application: md('hilbert', 'advanced', 'application'),
        howTo:       md('hilbert', 'advanced', 'howTo'),
      },
    },
  },
  {
    path: 'koch',
    name: 'コッホ曲線',
    image: '/images/koch.png',
    meshColor: { dark: '#00ffea', light: '#059dab' },
    intro: {
      beginner: {
        overview:    md('koch', 'beginner', 'overview'),
        feature:     md('koch', 'beginner', 'feature'),
        application: md('koch', 'beginner', 'application'),
        howTo:       md('koch', 'beginner', 'howTo'),
      },
      advanced: {
        overview:    md('koch', 'advanced', 'overview'),
        feature:     md('koch', 'advanced', 'feature'),
        application: md('koch', 'advanced', 'application'),
        howTo:       md('koch', 'advanced', 'howTo'),
      },
    },
  },
  {
    path: 'barnsley',
    name: 'バーンズリーのシダ',
    image: '/images/barnsley.png',
    meshColor:       { dark: '#22c55e', light: '#1f7a44' },
    meshAccentColor: { dark: '#fde047', light: '#a98712' },
    intro: {
      beginner: {
        overview:    md('barnsley', 'beginner', 'overview'),
        feature:     md('barnsley', 'beginner', 'feature'),
        application: md('barnsley', 'beginner', 'application'),
        howTo:       md('barnsley', 'beginner', 'howTo'),
      },
      advanced: {
        overview:    md('barnsley', 'advanced', 'overview'),
        feature:     md('barnsley', 'advanced', 'feature'),
        application: md('barnsley', 'advanced', 'application'),
        howTo:       md('barnsley', 'advanced', 'howTo'),
      },
    },
  },
]

/**
 * path からモデル定義を取得する。
 *
 * @param {string | undefined} path
 */
export function getFractalCatalogByPath(path) {
  return fractalCatalog.find((model) => model.path === path)
}
