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
    expect([...document.querySelectorAll('main > section')].map(section => section.id)).toEqual(['home', 'projects', 'about', 'stack', 'log', 'contact'])
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
  it('shows screenshot thumbnails and keeps case files usable', async () => {
    render(<Projects />)
    expect(document.querySelector('.project-preview')).toBeNull()
    expect([...document.querySelectorAll('.project-visual-image img')].map(image => [image.getAttribute('src'), image.getAttribute('loading'), image.getAttribute('decoding'), image.getAttribute('alt')])).toEqual([
      ['/projects/streetsmart.png', 'lazy', 'async', 'StreetSmart operations dashboard screenshot'],
      ['/projects/repsynk.png', 'lazy', 'async', 'RepSynk fitness dashboard screenshot'],
      ['/projects/booket.png', 'lazy', 'async', 'BOOKET library and bookstore dashboard screenshot'],
      ['/projects/tandaverse.png', 'lazy', 'async', 'Tandaverse social feed screenshot'],
      ['/projects/warrin.png', 'lazy', 'async', 'Warr-in Parfumerie storefront screenshot'],
    ])
    await userEvent.setup().click(screen.getByRole('button', { name: /StreetSmart/ }))
    expect(screen.queryByText(/coming soon/i)).toBeNull()
    expect(screen.queryByText(/TODO:/)).toBeNull()
    expect(screen.getByRole('link', { name: /View live demo/ }).getAttribute('href')).toBe('https://street-smart-web.vercel.app/login')
    expect(screen.getAllByText(/Solo developer/)).toHaveLength(6)
  })
  it('opens by keyboard, traps focus, and restores the opener when closed', async () => {
    const user = userEvent.setup()
    render(<MotionConfig reducedMotion="always"><Projects /></MotionConfig>)
    const first = screen.getByRole('button', { name: /StreetSmart/ })
    first.focus()
    await user.keyboard('{Enter}')
    expect(window.location.hash).toBe('#project/streetsmart')
    expect(screen.getByRole('dialog', { name: 'StreetSmart' })).toBeTruthy()
    expect(screen.getByText('Photo verification with a LiteRT road-defect model')).toBeTruthy()
    const close = screen.getByRole('button', { name: /CLOSE/ })
    expect(document.activeElement).toBe(close)
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(screen.getByRole('link', { name: /View live demo/ }))
    await user.tab()
    expect(document.activeElement).toBe(close)
    await user.click(close)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(first))
    const second = screen.getByRole('button', { name: /RepSynk/ })
    await user.click(second)
    expect(screen.getByRole('dialog', { name: 'RepSynk' })).toBeTruthy()
    expect(portfolio.projects.find(project => project.slug === 'repsynk').repo).toBe('https://github.com/Warrenqt/RepSynk')
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: true, cancelable: true }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
  it('opens the 2025 fragrance project and links to its live demo', async () => {
    render(<MotionConfig reducedMotion="always"><Projects /></MotionConfig>)
    await userEvent.setup().click(screen.getByRole('button', { name: /Warr-in Parfumerie/ }))
    expect(screen.getByText('Sort the catalog and view individual product pages')).toBeTruthy()
    expect(screen.getByRole('link', { name: /View live demo/ }).href).toBe('https://warr-in-parfumerie.vercel.app/')
  })
  it('keeps live demos primary, repository secondary, and project labels consistent', async () => {
    const user = userEvent.setup()
    render(<MotionConfig reducedMotion="always"><Projects /></MotionConfig>)
    expect([...document.querySelectorAll('.project-category')].map(label => label.textContent)).toEqual([
      'CAPSTONE / Solo developer', 'FITNESS PWA / Solo developer', 'WEB APPLICATION / Solo developer',
      'SOCIAL APPLICATION / Solo developer', 'E-COMMERCE / Solo developer',
    ])
    for (const [name, url] of [['StreetSmart', 'https://street-smart-web.vercel.app/login'], ['RepSynk', 'https://repsynk.pages.dev/'], ['Tandaverse', 'https://tandaverse.site.je/index.php'], ['Warr-in Parfumerie', 'https://warr-in-parfumerie.vercel.app/']]) {
      const link = screen.getByRole('link', { name: `Live ${name} demo` })
      expect(link.getAttribute('href')).toBe(url)
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    }
    expect(document.querySelector('#project-booket .project-live-link')).toBeNull()
    await user.click(screen.getByRole('button', { name: /RepSynk/ }))
    expect(portfolio.projects.find(project => project.slug === 'repsynk').repo).toBe('https://github.com/Warrenqt/RepSynk')
    expect(screen.getByRole('link', { name: /View live demo/ }).getAttribute('href')).toBe('https://repsynk.pages.dev/')
  })
  it('uses the monogram if a screenshot fails to load', () => {
    render(<Projects />)
    fireEvent.error(document.querySelector('#project-streetsmart img'))
    expect(document.querySelector('#project-streetsmart .project-initials').textContent).toBe('SS')
    expect(document.querySelector('#project-streetsmart img')).toBeNull()
  })
  it('opens deep links directly and closes a BOOKET case without leaving the site', async () => {
    window.history.replaceState(null, '', '#project/booket')
    render(<Projects />)
    const dialog = screen.getByRole('dialog', { name: 'BOOKET' })
    expect(dialog.querySelector('a')).toBeNull()
    expect(dialog.querySelectorAll('li')).toHaveLength(3)
    expect(document.querySelector('.project-tile-index')).toBeNull()
    await userEvent.setup().click(screen.getByRole('button', { name: /CLOSE/ }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(window.location.hash).toBe('#projects')
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
  it('shows the remaining direct links without a phone row', () => {
    render(<Contact />)
    expect([...document.querySelectorAll('.direct-links > a, .direct-links > button')].map(link => link.querySelector('.micro').textContent)).toEqual([
      'Email', 'GitHub', 'Facebook', 'Instagram',
    ])
    expect(document.querySelector('#contact').textContent).not.toContain('09063742673')
  })
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
    expect(portfolio.projects.map(project => project.name)).toEqual(['StreetSmart', 'RepSynk', 'BOOKET', 'Tandaverse', 'Warr-in Parfumerie'])
    for (const project of portfolio.projects) {
      if (project.preview) expect(existsSync(`public${project.preview}`)).toBe(true)
      if (project.image) expect(existsSync(`public${project.image}`)).toBe(true)
    }
    expect(existsSync(`public${portfolio.portrait}`)).toBe(true)
    expect(readFileSync(`public${portfolio.portraitFallback}`, 'utf8')).toContain('<circle')
    expect(readFileSync(`public${portfolio.resume}`).subarray(0, 4).toString()).toBe('%PDF')
    expect(portfolio.log.certificates).toHaveLength(12)
    expect(portfolio.log.certificates[0]).toEqual({ name: 'Software Development — IT Specialist', issuer: 'Certiport', date: 'NOV 12, 2026' })
    expect(portfolio.log.certificates.find(certificate => certificate.name.startsWith('Visual Graphic Design')).issuer).toBe('TESDA')
  })
})
