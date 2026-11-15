import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { portfolio } from '../data/portfolio'
import { Arrow, Heading, Reveal, SectionLabel } from './Shared'

function Project({ project, index, open, toggle }) {
  const reduced = useReducedMotion()
  const copy = portfolio.projectsHeading
  const visualRef = useRef(null)
  const [imageFailed, setImageFailed] = useState(false)
  const [inView, setInView] = useState(false)
  const [touched, setTouched] = useState(false)
  const hasImage = Boolean(project.image && !imageFailed)
  const demoUrl = project.live || (project.href !== '#' ? project.href : null)
  useEffect(() => {
    if (!hasImage) return
    if (!('IntersectionObserver' in window)) { setInView(true); return }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio >= 0.35), { threshold: [0, 0.35] })
    observer.observe(visualRef.current)
    return () => observer.disconnect()
  }, [hasImage])
  return <article id={`project-${project.slug}`} className={`project ${open ? 'project-open' : ''} ${demoUrl ? 'project-has-live' : ''} ${hasImage ? 'project-has-image' : 'project-no-image'} ${inView || touched ? 'project-image-developed' : ''}`}>
    <h3><button className="project-row" aria-expanded={open} aria-controls={`case-${project.slug}`} onClick={() => { setTouched(true); toggle() }}>
      <span ref={visualRef} className={`project-visual ${hasImage ? 'project-visual-image' : ''}`}>
        {hasImage ? <img src={project.image} alt={project.imageAlt || `${project.name} screenshot`} loading="lazy" decoding="async" width={project.imageWidth || 1600} height={project.imageHeight || 1000} onError={() => setImageFailed(true)} /> : <span className="project-initials display" aria-hidden="true">{project.initials}</span>}
        <span className="project-tile-index micro" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      </span>
      <span className="project-mobile-index display" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <span className="project-overview">
        <span className="project-category micro">{project.category.split(' / ')[1]} / {project.role}</span>
        <span className="project-title display">{project.name}</span>
        <span className="project-description">{project.description}</span>
        <span className="project-tags">{project.tags.map(tag => <span key={tag} className="chip">{tag}</span>)}</span>
      </span>
    </button>{demoUrl && <a className="project-live-link" href={demoUrl} target="_blank" rel="noopener noreferrer" aria-label={`${copy.liveLabel} ${project.name} demo`}><span>{copy.liveLabel}</span><Arrow /></a>}</h3>
    <AnimatePresence initial={false}>{open && <motion.div id={`case-${project.slug}`} className="case-study" initial={{ height: reduced ? 'auto' : 0, opacity: reduced ? 1 : 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.28 }}>
      <div className="case-content">
        <div><h4 className="micro case-label">01 / {copy.problem}</h4><p>{project.problem}</p></div>
        <div><h4 className="micro case-label">02 / {copy.built}</h4><ul>{project.features.slice(0, 3).map(feature => <li key={feature}>{feature}</li>)}</ul></div>
        {project.challenge && <div className="case-wide"><h4 className="micro case-label">03 / {copy.challenge}</h4><p>{project.challenge}</p></div>}
        {project.stack.length > 0 && <div className="case-wide"><h4 className="micro case-label">04 / {copy.stack}</h4><div className="case-stack">{project.stack.map(item => <span className="chip" key={item}>{item}</span>)}</div></div>}
        {(project.repo || demoUrl) && <div className="case-links">{project.repo && <a href={project.repo} target="_blank" rel="noopener noreferrer">{copy.repo}<Arrow /></a>}{demoUrl && <a href={demoUrl} target="_blank" rel="noopener noreferrer">{copy.live}<Arrow /></a>}</div>}
      </div>
    </motion.div>}</AnimatePresence>
  </article>
}

export default function Projects() {
  const [open, setOpen] = useState(null)
  const copy = portfolio.projectsHeading
  return <section id="projects" className="section-shell content-section" tabIndex={-1}>
    <SectionLabel label={copy.label} />
    <Reveal className="section-heading-row"><Heading dot>{copy.title}</Heading></Reveal>
    <Reveal className="project-list">{portfolio.projects.map((project, i) => <Project key={project.slug} project={project} index={i} open={open === i} toggle={() => setOpen(open === i ? null : i)} />)}</Reveal>
  </section>
}
