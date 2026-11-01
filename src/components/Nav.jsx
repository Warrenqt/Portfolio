import { useEffect, useRef, useState } from 'react'
import { portfolio } from '../data/portfolio'
import { Arrow } from './Shared'
import ThemeSwitch from './ThemeSwitch'

export default function Nav() {
  const [active, setActive] = useState('home')
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const toggleRef = useRef(null)

  useEffect(() => {
    const sections = portfolio.nav.map(({ id }) => document.getElementById(id)).filter(Boolean)
    let pending = false
    const update = () => {
      pending = false
      let current = 'home'
      for (const section of sections) if (section.getBoundingClientRect().top <= window.innerHeight * 0.36) current = section.id
      setActive(current)
    }
    const onScroll = () => {
      if (!pending) { pending = true; requestAnimationFrame(update) }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    menuRef.current?.querySelector('a')?.focus()
    const close = (event) => {
      if (event.key === 'Escape') { setOpen(false); toggleRef.current?.focus() }
      if (event.key === 'Tab') {
        const nodes = [...document.querySelectorAll('.header-actions button'), ...menuRef.current.querySelectorAll('a')].filter(Boolean)
        if (event.shiftKey && document.activeElement === nodes[0]) { event.preventDefault(); nodes.at(-1).focus() }
        if (!event.shiftKey && document.activeElement === nodes.at(-1)) { event.preventDefault(); nodes[0].focus() }
      }
    }
    const wide = window.matchMedia('(min-width: 801px)')
    const onWide = (event) => { if (event.matches) setOpen(false) }
    wide.addEventListener('change', onWide)
    document.addEventListener('keydown', close)
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', close); wide.removeEventListener('change', onWide) }
  }, [open])

  return <header className="site-header">
    <a className="wordmark" href="#home" aria-label={`${portfolio.shortName}, home`}>{portfolio.shortName.toUpperCase()}<span className="brand-square" /></a>
    <nav className="desktop-nav" aria-label="Main navigation">{portfolio.nav.map(item => <a className={active === item.id ? 'active' : ''} aria-current={active === item.id ? 'location' : undefined} key={item.id} href={`#${item.id}`}>{item.label}</a>)}</nav>
    <div className="header-actions">
    <button ref={toggleRef} className="menu-toggle" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)}>{open ? portfolio.ui.close : portfolio.ui.menu}</button>
    <ThemeSwitch />
    </div>
    {open && <nav id="mobile-menu" ref={menuRef} className="mobile-menu" aria-label="Mobile navigation">
      <span className="micro muted">{portfolio.ui.navigation}</span>
      {portfolio.nav.map((item, i) => <a key={item.id} className={active === item.id ? 'active' : ''} href={`#${item.id}`} onClick={() => { setOpen(false); requestAnimationFrame(() => document.getElementById(item.id)?.focus({ preventScroll: true })) }}><span className="micro">0{i + 1}</span>{item.label}<Arrow /></a>)}
      <span className="micro">{portfolio.locationShort}</span>
    </nav>}
  </header>
}
