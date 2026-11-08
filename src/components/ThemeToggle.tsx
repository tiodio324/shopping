import { useTheme } from '../hooks/useTheme.ts'
import { MoonIcon, SunIcon } from './Icons.tsx'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const nextIsDark = theme === 'light'
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-pressed={theme === 'dark'}
      aria-label={nextIsDark ? 'Включить тёмную тему' : 'Включить светлую тему'}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
