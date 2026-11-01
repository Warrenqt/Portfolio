import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { portfolio } from '../data/portfolio'

export function Arrow({ direction = 'up', ...props }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" {...props}><path d={direction === 'down' ? 'M12 3v17m-7-7 7 7 7-7' : 'M5 19 19 5M5 5h14v14'} /></svg>
}

export function SectionLabel({ label, right }) {
  return <div className="section-label"><span>{label}</span><span className="section-label-right">{right}</span></div>
}

export function Heading({ children, className = '' }) {
  return <h2 className={`display section-title ${className}`}>{children}<span className="orange">.</span></h2>
}

export function Reveal({ children, className = '', delay = 0 }) {
  const reduced = useReducedMotion()
  return <motion.div className={className} initial={false} animate={reduced ? { opacity: 1, y: 0 } : undefined} whileInView={reduced ? undefined : { opacity: 1, y: [12, 0] }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
}

export function Clock() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return <time dateTime={time.toISOString()} className="local-time" aria-label={`Manila time ${time.toLocaleTimeString('en-GB', { timeZone: portfolio.timezone })}`} suppressHydrationWarning>{time.toLocaleTimeString('en-GB', { timeZone: portfolio.timezone })} <span>PHT</span></time>
}
