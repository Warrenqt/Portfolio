import { useCallback, useEffect, useRef, useState } from 'react'

const DURATION = 550
const MAX_BURSTS = 6
const dots = [
  { count: 10, size: 12, distance: 34 },
  { count: 14, size: 8, distance: 68 },
  { count: 18, size: 4, distance: 100 },
].flatMap((ring, ringIndex) => Array.from({ length: ring.count }, (_, index) => {
  const angle = index / ring.count * Math.PI * 2 + ringIndex * 0.3
  return {
    size: ring.size,
    x: Math.cos(angle) * ring.distance,
    y: Math.sin(angle) * ring.distance,
    delay: ringIndex * 40,
  }
}))

export default function ClickBurst() {
  const [bursts, setBursts] = useState([])
  const timers = useRef(new Map())
  const sequence = useRef(0)
  const remove = useCallback(id => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setBursts(current => current.filter(burst => burst.id !== id))
  }, [])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const noHover = window.matchMedia('(hover: none)')
    const clear = () => {
      timers.current.forEach(clearTimeout)
      timers.current.clear()
    }
    const preferenceChanged = () => {
      if (reduced.matches || noHover.matches) { clear(); setBursts([]) }
    }
    const spawn = event => {
      if (reduced.matches || noHover.matches || event.pointerType !== 'mouse' || event.button !== 0) return
      const editing = event.composedPath().some(node => node instanceof Element && (
        node.matches('input, textarea, [contenteditable]:not([contenteditable="false"])') ||
        (node instanceof HTMLLabelElement && node.control?.matches('input, textarea'))
      ))
      if (editing) return
      if (timers.current.size >= MAX_BURSTS) remove(timers.current.keys().next().value)
      const id = sequence.current++
      setBursts(current => [...current, { id, x: event.clientX, y: event.clientY }].slice(-MAX_BURSTS))
      // Animation events do normal cleanup; the timeout covers interrupted animations.
      timers.current.set(id, setTimeout(() => remove(id), DURATION + 50))
    }
    window.addEventListener('pointerdown', spawn, { capture: true, passive: true })
    reduced.addEventListener('change', preferenceChanged)
    noHover.addEventListener('change', preferenceChanged)
    return () => {
      window.removeEventListener('pointerdown', spawn, true)
      reduced.removeEventListener('change', preferenceChanged)
      noHover.removeEventListener('change', preferenceChanged)
      clear()
    }
  }, [remove])

  return <div className="click-burst-overlay" aria-hidden="true">
    {bursts.map(burst => <div className="click-burst" key={burst.id} style={{ left: burst.x, top: burst.y }} onAnimationEnd={() => remove(burst.id)}>
      {dots.map((dot, index) => <span key={index} className={`click-burst-dot${index % 5 === 0 ? ' click-burst-ink' : ''}`} style={{
        width: dot.size, height: dot.size,
        '--burst-x': `${dot.x}px`, '--burst-y': `${dot.y}px`,
        animationDelay: `${dot.delay}ms`, animationDuration: `${DURATION - dot.delay}ms`,
      }} />)}
    </div>)}
  </div>
}
