import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { MotionConfig, useReducedMotion } from 'framer-motion'
import { portfolio } from './data/portfolio'
import { INTRO_DURATION, LETTER_DURATION, markIntroSeen, shouldPlayIntro } from './lib/intro'
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Stack from './components/Stack'
import Log from './components/Log'
import Contact from './components/Contact'

const Intro3DLetters = lazy(() => import('./components/Intro3DLetters'))

const FlatIntro = () => <div className="intro-static display" aria-hidden="true">{portfolio.firstName}</div>
class IntroBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <FlatIntro /> : this.props.children }
}

function initialPhase() {
  try {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && new URLSearchParams(window.location.search).get('intro') === 'replay') return 'intro'
    return shouldPlayIntro(window.sessionStorage, window.matchMedia('(prefers-reduced-motion: reduce)').matches, window.location.hash) ? 'intro' : 'done'
  } catch { return 'done' }
}

export default function App() {
  const [phase, setPhase] = useState(initialPhase)
  const startedAt = useRef(performance.now())
  const reduced = useReducedMotion()
  const finish = useCallback(() => setPhase('done'), [])

  useEffect(() => {
    if (phase !== 'intro') return
    try { markIntroSeen(window.sessionStorage) } catch { /* Optional enhancement. */ }
    if (reduced) { finish(); return }
    const revealTimer = setTimeout(() => setPhase('reveal'), LETTER_DURATION)
    return () => clearTimeout(revealTimer)
  }, [phase, reduced, finish])

  useEffect(() => {
    if (phase === 'done') return
    const skip = (event) => {
      if (event.type === 'keydown' && ['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) return
      finish()
    }
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [phase, reduced, finish])

  useEffect(() => {
    if (phase !== 'reveal') return
    const timer = setTimeout(finish, INTRO_DURATION - LETTER_DURATION)
    return () => clearTimeout(timer)
  }, [phase, finish])

  useEffect(() => {
    if (phase !== 'intro') return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [phase])

  return <MotionConfig reducedMotion="user">
    {phase === 'intro' && <div className="intro-overlay" role="presentation" onPointerDown={finish}>
      <div className="intro-center-dot" />
      <IntroBoundary><Suspense fallback={<FlatIntro />}><Intro3DLetters startedAt={startedAt.current} /></Suspense></IntroBoundary>
      <div className="intro-meta"><span>{portfolio.edition}</span><span>{portfolio.intro.loading}<span className="blink">_</span></span></div>
      <button className="intro-skip" onClick={finish} autoFocus>{portfolio.intro.skip} <span aria-hidden="true">↗</span></button>
    </div>}
    <div className={`site phase-${phase}`} inert={phase === 'intro' ? true : undefined}>
      <a className="skip-link" href="#main">{portfolio.ui.skip}</a>
      <Nav />
      <main id="main">
        <Hero phase={phase} />
        <Projects />
        <About />
        <Stack />
        <Log />
        <Contact />
      </main>
    </div>
  </MotionConfig>
}
