import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeSwitch, { THEME_KEY } from '../src/components/ThemeSwitch'

function mockSystem(dark = false) {
  let onChange
  const media = { matches: dark, addEventListener: vi.fn((_, listener) => { onChange = listener }), removeEventListener: vi.fn() }
  vi.spyOn(window, 'matchMedia').mockReturnValue(media)
  return value => { media.matches = value; act(() => onChange?.({ matches: value })) }
}

beforeEach(() => { localStorage.clear(); delete document.documentElement.dataset.theme })
afterEach(() => { localStorage.clear(); delete document.documentElement.dataset.theme; document.documentElement.style.colorScheme = '' })

describe('light and dark mode', () => {
  it('defaults to light even on a dark system and remembers an explicit toggle', async () => {
    const changeSystem = mockSystem(true)
    const user = userEvent.setup()
    render(<ThemeSwitch />)
    const control = screen.getByRole('switch', { name: 'Dark mode' })
    expect(control.getAttribute('aria-checked')).toBe('false')
    changeSystem(true)
    expect(document.documentElement.dataset.theme).toBe('light')
    await user.click(control)
    expect(localStorage.getItem(THEME_KEY)).toBe('dark')
    changeSystem(true)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('supports keyboard switching and restores the choice on remount', async () => {
    mockSystem(false)
    const user = userEvent.setup()
    const { unmount } = render(<ThemeSwitch />)
    screen.getByRole('switch').focus()
    await user.keyboard(' ')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true')
    unmount()
    render(<ThemeSwitch />)
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true')
    screen.getByRole('switch').focus()
    await user.keyboard('{Enter}')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('still switches when browser storage is unavailable', async () => {
    mockSystem(false)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    render(<ThemeSwitch />)
    await userEvent.setup().click(screen.getByRole('switch'))
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('syncs another tab and returns to light when the preference is cleared', () => {
    mockSystem(false)
    render(<ThemeSwitch />)
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: THEME_KEY, newValue: 'dark' })))
    expect(document.documentElement.dataset.theme).toBe('dark')
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: THEME_KEY, newValue: null })))
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
