import { useContext } from 'react'
import { ThemeContext, type ThemeContextValue } from '../theme/theme-context.ts'

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('Тема доступна только внутри ThemeProvider')
  return value
}
