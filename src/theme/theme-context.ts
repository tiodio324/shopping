import { createContext } from 'react'

export const THEME_STORAGE_KEY = 'homelinks-theme'

export type ThemeChoice = 'light' | 'dark'

export interface ThemeContextValue {
  theme: ThemeChoice
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function readStoredTheme(): ThemeChoice | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    if (value === 'light' || value === 'dark') return value
  } catch {
    return null
  }
  return null
}

export function systemTheme(): ThemeChoice {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
