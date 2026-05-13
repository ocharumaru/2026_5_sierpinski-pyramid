/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo } from 'react'
import { colorDark, colorLight, shapeDark, shapeLight, buildPageStyles } from './themeConfig'

const ThemeContext = createContext(null)

export function ThemeProvider({ children, defaultTheme = 'dark' }) {
  const [theme, setTheme] = useState(defaultTheme)
  const value = useMemo(() => {
    const isDark = theme === 'dark'
    const color = isDark ? colorDark : colorLight
    const shape = isDark ? shapeDark : shapeLight
    return {
      theme,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      setTheme,
      color,
      shape,
      pageStyles: buildPageStyles(color, shape, isDark),
    }
  }, [theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
  