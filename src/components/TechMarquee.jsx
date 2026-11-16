import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { portfolio } from '../data/portfolio'

export default function TechMarquee() {
  const rootRef = useRef(null)
  const paused = useRef({ hover: false, focus: false })
  const reduced = useReducedMotion()
  useEffect(() => {
    const tracks = [...rootRef.current.querySelectorAll('.marquee-track')]
    if (reduced) { tracks.forEach(track => { track.style.transform = '' }); return }
    let widths = [0, 0], offsets = [0, 0], frame, previousTime = 0
    let previousY = window.scrollY, lastScroll = 0, boost = 1
    const measure = () => { widths = tracks.map(track => track.firstElementChild.getBoundingClientRect().width) }
    // Read sizes only when content changes, never during the animation loop.
    const observer = new ResizeObserver(measure)
    tracks.forEach(track => observer.observe(track.firstElementChild))
    measure()
    const scroll = () => {
      const now = performance.now(), delta = window.scrollY - previousY
      if (delta) boost = Math.sign(delta) * (1 + Math.min(2, Math.abs(delta) / Math.max(16, now - lastScroll) * 0.5))
      previousY = window.scrollY
      lastScroll = now
    }
    const tick = now => {
      const elapsed = previousTime ? Math.min(now - previousTime, 64) / 1000 : 0
      previousTime = now
      const remaining = Math.max(0, 1 - (now - lastScroll) / 600)
      const speed = 1 + (boost - 1) * remaining * remaining
      if (!paused.current.hover && !paused.current.focus) {
        const base = widths[0] / 42
        tracks.forEach((track, i) => {
          if (!widths[i]) return
          offsets[i] = ((offsets[i] + elapsed * base * speed * (i ? -0.6 : 1)) % widths[i] + widths[i]) % widths[i]
          track.style.transform = `translate3d(${-offsets[i]}px, 0, 0)`
        })
      }
      frame = requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', scroll, { passive: true })
    frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('scroll', scroll) }
  }, [reduced])
  return <div ref={rootRef} className="tech-marquees" tabIndex={0} role="region" aria-label="Technology marquees. Pause on hover or keyboard focus."
    onPointerEnter={() => { paused.current.hover = true }} onPointerLeave={() => { paused.current.hover = false }}
    onFocus={() => { paused.current.focus = true }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) paused.current.focus = false }}>
    <div className="stack-marquee"><div className="marquee-track">{[0, 1, 2].map(repeat => <div className="marquee-copy" key={repeat} aria-hidden={repeat > 0 ? 'true' : undefined}>{portfolio.stack.marquee.map(name => <span key={name}><span className="marquee-word">{name}</span><b aria-hidden="true">✳</b></span>)}</div>)}</div></div>
    <div className="install-marquee"><div className="marquee-track">{[0, 1, 2].map(repeat => <div className="install-copy" key={repeat} aria-hidden={repeat > 0 ? 'true' : undefined}>{portfolio.stack.installMarquee}</div>)}</div></div>
  </div>
}
