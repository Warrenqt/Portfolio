import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MotionConfig } from 'framer-motion'
import { readFileSync, existsSync } from 'node:fs'
import { createMailto, getFormEndpoint, submitContact } from '../src/lib/contact'
import { INTRO_DURATION, INTRO_KEY, LETTER_DURATION, markIntroSeen, shouldPlayIntro } from '../src/lib/intro'
import { portfolio } from '../src/data/portfolio'
import Projects from '../src/components/Projects'
import Nav from '../src/components/Nav'
import Contact, { ContactForm } from '../src/components/Contact'
import App from '../src/App'

vi.mock('../src/components/Intro3DLetters', () => ({ default: () => <div data-testid="intro-scene" /> }))
vi.mock('framer-motion', async importOriginal => ({ ...(await importOriginal()), useReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches }))

function enableIntro() {
  window.sessionStorage.clear()
  vi.spyOn(window, 'matchMedia').mockImplementation(query => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() }))
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
}

describe('first-visit intro policy', () => {
  it('plays once and skips for reduced motion, deep links, or unavailable storage', () => {
    const storage = new Map()
    const adapter = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) }
    expect(shouldPlayIntro(adapter, false)).toBe(true)
    expect(shouldPlayIntro(adapter, true)).toBe(false)
    expect(shouldPlayIntro(adapter, false, '#projects')).toBe(false)
    markIntroSeen(adapter)
    expect(storage.get(INTRO_KEY)).toBe('seen')
    expect(shouldPlayIntro(adapter, false)).toBe(false)
    expect(shouldPlayIntro({ getItem() { throw new Error('blocked') } }, false)).toBe(false)
  })
  it('shows the finished portfolio immediately with reduced motion', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    render(<App />)
    expect(screen.queryByRole('button', { name: /click or press any key/i })).toBeNull()
    expect(screen.getByRole('heading', { name: portfolio.name })).toBeTruthy()
    expect(document.querySelector('.site').hasAttribute('inert')).toBe(false)
    expect([...document.querySelectorAll('main > section')].map(section => section.id)).toEqual(['home', 'about', 'projects', 'stack', 'log', 'contact'])
  })
  it('skips on a keypress, restores scrolling, and does not replay after remounting', async () => {
    enableIntro()
    const { unmount } = render(<App />)
    expect(document.querySelector('.intro-overlay')).toBeTruthy()
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(document.querySelector('.intro-overlay')).toBeNull()
    expect(document.body.style.overflow).not.toBe('hidden')
    unmount()
    render(<App />)
    expect(document.querySelector('.intro-overlay')).toBeNull()
  })
  it('skips on pointer input', () => {
    enableIntro()
    render(<App />)
    fireEvent.pointerDown(document.querySelector('.intro-overlay'))
    expect(document.querySelector('.intro-overlay')).toBeNull()
    expect(document.querySelector('.phase-done')).toBeTruthy()
  })
  it('allows the outward burst and inward assembly to finish', async () => {
    enableIntro()
    vi.useFakeTimers()
    try {
      render(<App />)
      await act(async () => { await vi.advanceTimersByTimeAsync(LETTER_DURATION) })
      expect(document.querySelector('.intro-overlay')).toBeNull()
      expect(document.querySelector('.phase-reveal')).toBeTruthy()
      await act(async () => { await vi.advanceTimersByTimeAsync(INTRO_DURATION - LETTER_DURATION) })
      expect(document.querySelector('.phase-done')).toBeTruthy()
    } finally { vi.useRealTimers() }
  })
  it('also skips while the portrait is gathering', async () => {
    enableIntro()
    vi.useFakeTimers()
    try {
      render(<App />)
      await act(async () => { await vi.advanceTimersByTimeAsync(LETTER_DURATION) })
      fireEvent.keyDown(window, { key: 'Escape' })
      expect(document.querySelector('.phase-done')).toBeTruthy()
      expect(document.querySelector('.is-assembling')).toBeNull()
    } finally { vi.useRealTimers() }
  })
})

describe('project case files', () => {
  it('opens and closes by keyboard, exposes the repository, and collapses the previous case', async () => {
    const user = userEvent.setup()
    render(<MotionConfig reducedMotion="always"><Projects /></MotionConfig>)
    const first = screen.getByRole('button', { name: /StreetSmart/ })
    first.focus()
    await user.keyboard('{Enter}')
    expect(first.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText(/Department of Public Works and Highways, developed/)).toBeTruthy()
    const second = screen.getByRole('button', { name: /RepSynk/ })
    await user.click(second)
    expect(first.getAttribute('aria-expanded')).toBe('false')
    expect(second.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('link', { name: /View repository/ }).href).toBe('https://github.com/Warrenqt/RepSynk')
    await user.click(second)
    expect(second.getAttribute('aria-expanded')).toBe('false')
  })
})

describe('mobile navigation', () => {
  it('moves focus into the menu, traps it, and restores focus on Escape', async () => {
    const user = userEvent.setup()
    render(<Nav />)
    const toggle = screen.getByRole('button', { name: 'Open navigation' })
    await user.click(toggle)
    const mobile = screen.getByRole('navigation', { name: 'Mobile navigation' })
    expect(document.activeElement).toBe(mobile.querySelector('a'))
    expect(document.body.style.overflow).toBe('hidden')
    mobile.querySelectorAll('a')[5].focus()
    await user.tab()
    expect(document.activeElement).toBe(toggle)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).toBeNull()
    expect(document.activeElement).toBe(toggle)
    expect(document.body.style.overflow).not.toBe('hidden')
  })
})

describe('contact form', () => {
  it('keeps contact content visible before an intersection callback', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(query => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    render(<Contact />)
    expect(document.querySelector('.contact-grid').style.opacity).not.toBe('0')
    expect(document.querySelector('.contact-headline').closest('div').style.opacity).not.toBe('0')
  })
  it('rejects placeholder and non-Formspree endpoints', () => {
    expect(getFormEndpoint(undefined)).toBeNull()
    expect(getFormEndpoint('https://formspree.io/f/YOUR_FORM_ID')).toBeNull()
    expect(getFormEndpoint('http://formspree.io/f/abc')).toBeNull()
    expect(getFormEndpoint('https://example.com/f/abc')).toBeNull()
    expect(getFormEndpoint('https://formspree.io/f/abcdefgh')).toBe('https://formspree.io/f/abcdefgh')
  })
  it('encodes names and multiline messages safely in an email draft', () => {
    const uri = createMailto('owner@example.com', { name: 'Ana & Ben', email: 'ana@example.com', message: 'Hello?\nA & B #1' })
    expect(uri).toContain('Ana%20%26%20Ben')
    expect(uri).toContain('Hello%3F%0AA%20%26%20B%20%231')
  })
  it('prepares a real draft without reporting delivery when no service is configured', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.type(screen.getByLabelText(/^name:/i), 'Portfolio visitor')
    await user.type(screen.getByLabelText(/^email:/i), 'visitor@example.com')
    await user.type(screen.getByLabelText(/^message:/i), 'I would like to discuss a project.')
    await user.click(screen.getByRole('button', { name: /SEND/ }))
    expect(screen.getByRole('link', { name: /OPEN EMAIL DRAFT/ }).getAttribute('href')).toContain('mailto:warrenpanergayo@gmail.com?subject=')
    expect(screen.queryByText(portfolio.contact.sent)).toBeNull()
  })
  it('only treats a successful service response as delivery, and passes the visitor email', async () => {
    const fields = { name: 'Visitor', email: 'visitor@example.com', message: 'Project enquiry' }
    const ok = vi.fn().mockResolvedValue({ ok: true })
    await submitContact('https://formspree.io/f/abcdefgh', fields, ok)
    expect(JSON.parse(ok.mock.calls[0][1].body).email).toBe(fields.email)
    expect(ok.mock.calls[0][1].headers.Accept).toBe('application/json')
    await expect(submitContact('https://formspree.io/f/abcdefgh', fields, vi.fn().mockResolvedValue({ ok: false }))).rejects.toThrow()
    await expect(submitContact('https://formspree.io/f/abcdefgh', fields, vi.fn().mockRejectedValue(new Error('offline')))).rejects.toThrow('offline')
  })
})

describe('content and asset integrity', () => {
  it('keeps all project previews local and preserves the supplied project order', () => {
    expect(portfolio.projects.map(project => project.name)).toEqual(['StreetSmart', 'RepSynk', 'BOOKET', 'Tandaverse'])
    for (const project of portfolio.projects) expect(existsSync(`public${project.preview}`)).toBe(true)
    expect(existsSync(`public${portfolio.portrait}`)).toBe(true)
    expect(readFileSync(`public${portfolio.portraitFallback}`, 'utf8')).toContain('<circle')
    expect(readFileSync(`public${portfolio.resume}`).subarray(0, 4).toString()).toBe('%PDF')
    expect(portfolio.log.certificates).toHaveLength(11)
    expect(portfolio.log.certificates.find(certificate => certificate.name.startsWith('Visual Graphic Design')).issuer).toBe('TESDA')
  })
})
