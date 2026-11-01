import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export const THEME_KEY = 'warren:theme'
const validTheme = value => value === 'light' || value === 'dark'
function storedTheme() {
  try { const value = localStorage.getItem(THEME_KEY); return validTheme(value) ? value : null } catch { return null }
}
function systemTheme() { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' }

export default function ThemeSwitch() {
  const preference = useRef(storedTheme())
  const [theme, setTheme] = useState(() => preference.current || systemTheme())
  const dark = theme === 'dark'

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#151614' : '#f2efe8')
  }, [theme, dark])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const followSystem = event => { if (!preference.current) setTheme(event.matches ? 'dark' : 'light') }
    const syncTabs = event => {
      if (event.key !== THEME_KEY && event.key !== null) return
      preference.current = validTheme(event.newValue) ? event.newValue : null
      setTheme(preference.current || systemTheme())
    }
    media.addEventListener('change', followSystem)
    window.addEventListener('storage', syncTabs)
    return () => { media.removeEventListener('change', followSystem); window.removeEventListener('storage', syncTabs) }
  }, [])

  const toggle = () => {
    const next = dark ? 'light' : 'dark'
    preference.current = next
    setTheme(next)
    try { localStorage.setItem(THEME_KEY, next) } catch { /* The switch still works when storage is disabled. */ }
  }

  return <button type="button" className="theme-switch" role="switch" aria-label="Dark mode" aria-checked={dark} title={`Switch to ${dark ? 'light' : 'dark'} mode`} onClick={toggle}>
    <span className="theme-switch-track" aria-hidden="true"><span className="theme-switch-thumb" /></span>
    <span className="theme-switch-label" aria-hidden="true">{dark ? 'DARK' : 'LIGHT'}</span>
  </button>
}
