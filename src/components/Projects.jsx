import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useRef, useState } from 'react'
import { portfolio } from '../data/portfolio'
import { Arrow, Heading, Reveal, SectionLabel } from './Shared'

function Project({ project, index, open, toggle }) {
  const rowRef = useRef(null)
  const reduced = useReducedMotion()
  const copy = portfolio.projectsHeading
  const follow = event => {
    if (reduced || event.pointerType === 'touch') return
    const bounds = rowRef.current.getBoundingClientRect()
    rowRef.current.style.setProperty('--preview-x', `${Math.max(-45, Math.min(45, (event.clientX - bounds.left - bounds.width * 0.7) * 0.08))}px`)
    rowRef.current.style.setProperty('--preview-y', `${(event.clientY - bounds.top - bounds.height / 2) * 0.16}px`)
  }
  return <article ref={rowRef} className={`project ${open ? 'project-open' : ''}`} onPointerMove={follow}>
    <h3><button className="project-row" aria-expanded={open} aria-controls={`case-${project.slug}`} onClick={toggle}>
      <span className="project-index display">{String(index + 1).padStart(2, '0')}</span>
      <span className="project-overview"><span className="project-category micro">{project.category.split(' / ')[1]} <span>/ {project.role}</span></span><span className="project-title display">{project.name}</span><span className="project-description">{project.description}</span></span>
      <span className="project-tags">{project.tags.map(tag => <span key={tag} className="chip">{tag}</span>)}</span>
      <span className="project-view">{open ? copy.close : copy.view}<span className={`project-arrow ${open ? 'rotate' : ''}`}><Arrow /></span></span>
    </button></h3>
    <div className="project-preview" aria-hidden="true"><img src={project.preview} alt="" loading="lazy" width="640" height="400" /><span>{copy.preview}</span></div>
    <AnimatePresence initial={false}>{open && <motion.div id={`case-${project.slug}`} className="case-study" initial={{ height: reduced ? 'auto' : 0, opacity: reduced ? 1 : 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.28 }}>
      <div className="case-content"><div><span className="micro case-label">01 / {copy.problem}</span><p>{project.problem}</p><span className="micro case-label">02 / {copy.built}</span><p>{project.built}</p></div><div><span className="micro case-label">03 / {copy.features}</span><ul>{project.features.map(feature => <li key={feature}>{feature}</li>)}</ul><span className="micro case-label">04 / {copy.stack}</span><div className="case-stack">{project.stack.map(item => <span className="chip" key={item}>{item}</span>)}</div></div><div className="case-links">{project.repo && <a href={project.repo} target="_blank" rel="noreferrer">{copy.repo}<Arrow /></a>}{project.href && project.href !== '#' ? <a href={project.href} target="_blank" rel="noreferrer">{copy.live}<Arrow /></a> : <span className="muted micro">{copy.demo}</span>}</div></div>
    </motion.div>}</AnimatePresence>
  </article>
}

export default function Projects() {
  const [open, setOpen] = useState(null)
  const copy = portfolio.projectsHeading
  return <section id="projects" className="section-shell content-section" tabIndex={-1}>
    <SectionLabel label={copy.label} right={copy.note} />
    <Reveal className="section-heading-row"><Heading>{copy.title}</Heading><span className="micro project-instruction">{copy.hint}<span aria-hidden="true">↓</span></span></Reveal>
    <Reveal className="project-list">{portfolio.projects.map((project, i) => <Project key={project.slug} project={project} index={i} open={open === i} toggle={() => setOpen(open === i ? null : i)} />)}</Reveal>
  </section>
}
