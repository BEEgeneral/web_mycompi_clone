import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type ThemeMode = 'light' | 'dark'

export interface ThemeColors {
  dark: string; yellow: string; cream: string; pastel: string; muted: string
  white: string; red: string; green: string; blue: string; purple: string
  background: string; surface: string; border: string; text: string; textMuted: string
}

interface ThemeContextValue {
  mode: ThemeMode
  colors: ThemeColors
  toggle: () => void
}

export const LIGHT_COLORS: ThemeColors = {
  dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3',
  muted: '#9CA3AF', white: '#FFFFFF', red: '#DC2626', green: '#22C55E',
  blue: '#3B82F6', purple: '#7C3AED',
  background: '#F5F5F5', surface: '#FFFFFF', border: '#D1E0F3',
  text: '#2D3261', textMuted: '#9CA3AF',
}

export const DARK_COLORS: ThemeColors = {
  dark: '#FFD054', yellow: '#2D3261', cream: '#1A1F3A', pastel: '#2D3261',
  muted: '#6B7280', white: '#0F172A', red: '#F87171', green: '#4ADE80',
  blue: '#60A5FA', purple: '#A78BFA',
  background: '#0F172A', surface: '#1E293B', border: '#334155',
  text: '#F1F5F9', textMuted: '#94A3B8',
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  colors: LIGHT_COLORS,
  toggle: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    try { return (localStorage.getItem('theme') as ThemeMode) || 'light' } catch { return 'light' }
  })

  useEffect(() => {
    try {
      localStorage.setItem('theme', mode)
      document.documentElement.setAttribute('data-theme', mode)
      // Inject/update CSS variables on :root
      const root = document.documentElement
      const c = mode === 'dark' ? DARK_COLORS : LIGHT_COLORS
      root.style.setProperty('--color-dark', c.dark)
      root.style.setProperty('--color-yellow', c.yellow)
      root.style.setProperty('--color-cream', c.cream)
      root.style.setProperty('--color-pastel', c.pastel)
      root.style.setProperty('--color-muted', c.muted)
      root.style.setProperty('--color-white', c.white)
      root.style.setProperty('--color-red', c.red)
      root.style.setProperty('--color-green', c.green)
      root.style.setProperty('--color-blue', c.blue)
      root.style.setProperty('--color-purple', c.purple)
      root.style.setProperty('--color-background', c.background)
      root.style.setProperty('--color-surface', c.surface)
      root.style.setProperty('--color-border', c.border)
      root.style.setProperty('--color-text', c.text)
      root.style.setProperty('--color-text-muted', c.textMuted)
    } catch {}
  }, [mode])

  const toggle = () => setMode(m => m === 'light' ? 'dark' : 'light')
  const colors = mode === 'dark' ? DARK_COLORS : LIGHT_COLORS

  return (
    <ThemeContext.Provider value={{ mode, colors, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
