import { motion, useReducedMotion } from 'framer-motion'
import professionalPortrait from '../../Profile pictures/professional picture.jpg'
import { portfolio } from '../data/portfolio'
import { Heading, Reveal, SectionLabel } from './Shared'

function InterestIcon({ type }) {
  const paths = {
    gym: <><path d="m8 18 4-4m16 16 4-4M13 12l15 15M9 13l6-6 5 5-6 6zm13 13 6-6 5 5-6 6zM5 16l11-11m8 30 11-11" /></>,
    gaming: <><path d="M12 12h16c5 0 8 14 6 17-3 3-7-4-9-4H15c-2 0-6 7-9 4-2-3 1-17 6-17Z" /><path d="M14 16v8m-4-4h8m8-3h.1M30 21h.1M16 12l2-5h5" /></>,
    coding: <><path d="m13 10-9 10 9 10m14-20 9 10-9 10M23 6l-6 28" /></>,
  }
  return <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" aria-hidden="true">{paths[type]}</svg>
}

export default function About() {
  const { about } = portfolio
  const reduced = useReducedMotion()
  return <section id="about" className="section-shell content-section" tabIndex={-1}>
    <SectionLabel label={about.label} />
    <Reveal className="about-grid">
      <div className="about-intro">
        <Heading>{about.title}</Heading>
        <p className="about-statement">{about.statement}</p>
        <figure className="about-portrait">
          <img src={professionalPortrait} alt="Warren Panergayo wearing a black suit and tie" width="1254" height="1254" loading="lazy" decoding="async" />
        </figure>
      </div>
      <div className="terminal about-terminal"><div className="terminal-bar"><span className="terminal-lights" aria-hidden="true"><i /><i /><i /></span><span>{about.terminalTitle}</span><span aria-hidden="true">↗</span></div>
        <motion.div className="terminal-content" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} transition={{ staggerChildren: reduced ? 0 : 0.22 }}>
          {about.story.map(line => <motion.div className="terminal-entry" key={line.command} variants={{ hidden: { opacity: reduced ? 1 : 0, clipPath: reduced ? 'inset(0)' : 'inset(0 100% 0 0)' }, visible: { opacity: 1, clipPath: 'inset(0)' } }} transition={{ duration: reduced ? 0 : 0.5, ease: 'linear' }}><p className="terminal-command">{line.command}</p><p>{line.text}</p></motion.div>)}
          <span className="terminal-prompt" aria-hidden="true">$ <span className="cursor-block" /></span>
        </motion.div>
      </div>
    </Reveal>
    <Reveal className="interests">{about.interests.map((interest, i) => <div className="interest-tile" key={interest.id}><InterestIcon type={interest.id} /><div><span className="interest-name">{interest.name}</span><p>{interest.caption}</p></div><span className="interest-index">0{i + 1}</span></div>)}</Reveal>
  </section>
}
