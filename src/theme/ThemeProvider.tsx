import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { THEME_STORAGE_KEY, ThemeContext, readStoredTheme, systemTheme, type ThemeChoice } from './theme-context.ts'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const storedTheme = readStoredTheme()
  const [theme, setTheme] = useState<ThemeChoice>(storedTheme ?? systemTheme())
  const [followsSystem, setFollowsSystem] = useState(storedTheme === null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (!followsSystem) return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => setTheme(media.matches ? 'dark' : 'light')
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [followsSystem])

  const toggleTheme = useCallback(() => {
    setFollowsSystem(false)
    setTheme((current) => {
      const next = current === 'light' ? 'dark' : 'light'
      localStorage.setItem(THEME_STORAGE_KEY, next)
      return next
    })
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext value={value}>{children}</ThemeContext>
}
