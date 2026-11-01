import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { portfolio } from '../data/portfolio'
import { createPortraitPoints, drawPortraitFrame, layoutPortraitPoints, PARTICLE_DURATION, PORTRAIT_SIZE } from '../lib/portraitParticles'

export default function HalftonePortrait({ active, animate }) {
  const canvasRef = useRef(null)
  const wrapperRef = useRef(null)
  const engineRef = useRef(null)
  const playbackRef = useRef({ active, animate })
  playbackRef.current = { active, animate }
  const [ready, setReady] = useState(false)
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark')
  const darkRef = useRef(dark)
  darkRef.current = dark
  const reduced = useReducedMotion()

  useEffect(() => {
    const syncTheme = () => setDark(document.documentElement.dataset.theme === 'dark')
    syncTheme()
    const observer = new MutationObserver(syncTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    let frame = 0
    let observer
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', { alpha: true })
    if (!ctx) return
    const photo = new Image()
    // Prepare while the letters play, so the photo never flashes before the dust.
    photo.onload = () => {
      if (cancelled) return
      const source = document.createElement('canvas')
      source.width = source.height = PORTRAIT_SIZE
      const read = source.getContext('2d', { willReadFrequently: true })
      if (!read) return
      read.drawImage(photo, 0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE)
      const pixels = read.getImageData(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE).data
      const points = { light: createPortraitPoints(pixels), dark: createPortraitPoints(pixels, PORTRAIT_SIZE, 3, 'dark') }
      const stage = wrapperRef.current.closest('.hero-stage')
      let layout, arranged, ink, start = null, pointer = null
      const draw = now => {
        frame = 0
        const playback = playbackRef.current
        if (!playback.active) { ctx.clearRect(0, 0, layout.width, layout.height); return }
        if (start === null) start = now
        const elapsed = !playback.animate || reduced ? PARTICLE_DURATION : now - start
        drawPortraitFrame(ctx, arranged, elapsed, layout, reduced ? null : pointer, ink)
        if (elapsed < PARTICLE_DURATION) frame = requestAnimationFrame(draw)
      }
      const schedule = () => { if (!frame) frame = requestAnimationFrame(draw) }
      const measure = () => {
        const bounds = stage.getBoundingClientRect()
        const portrait = wrapperRef.current.getBoundingClientRect()
        layout = { width: bounds.width, height: bounds.height, portrait: { x: portrait.left - bounds.left, y: portrait.top - bounds.top, width: portrait.width, height: portrait.height } }
        arranged = layoutPortraitPoints(points[darkRef.current ? 'dark' : 'light'], layout)
        ink = getComputedStyle(document.documentElement).getPropertyValue('--color-ink').trim() || '#111111'
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = Math.round(bounds.width * dpr)
        canvas.height = Math.round(bounds.height * dpr)
        Object.assign(canvas.style, { left: `${-layout.portrait.x}px`, top: `${-layout.portrait.y}px`, width: `${bounds.width}px`, height: `${bounds.height}px` })
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        schedule()
      }
      engineRef.current = {
        schedule,
        refreshTheme: measure,
        move(event) {
          const bounds = stage.getBoundingClientRect()
          pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
          schedule()
        },
        leave() { pointer = null; schedule() },
      }
      measure()
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(measure)
        observer.observe(stage)
        observer.observe(wrapperRef.current)
      }
      setReady(true)
    }
    photo.src = portfolio.portrait
    return () => { cancelled = true; cancelAnimationFrame(frame); observer?.disconnect(); engineRef.current = null }
  }, [reduced])

  useEffect(() => { engineRef.current?.schedule() }, [active, animate])
  useEffect(() => { engineRef.current?.refreshTheme() }, [dark])

  return <div className={`halftone-portrait ${ready ? 'is-ready' : ''} ${animate ? 'is-assembling' : ''}`} ref={wrapperRef} onPointerMove={event => engineRef.current?.move(event)} onPointerLeave={() => engineRef.current?.leave()}>
    <img className="halftone-fallback" src={dark ? portfolio.portraitFallbackDark : portfolio.portraitFallback} alt={portfolio.portraitAlt} width="560" height="560" fetchPriority="high" />
    <canvas ref={canvasRef} className="halftone-canvas" aria-hidden="true" />
    <img className="warm-portrait" src={portfolio.portrait} alt="" aria-hidden="true" width="560" height="560" />
    <span className="portrait-hint micro" aria-hidden="true">{portfolio.hero.portraitHint} ↗</span>
  </div>
}
