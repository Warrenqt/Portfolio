import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { portfolio } from '../data/portfolio'
import { Arrow, Heading, Reveal, SectionLabel } from './Shared'

function Project({ project, index, open, toggle }) {
  const reduced = useReducedMotion()
  const copy = portfolio.projectsHeading
  const hasDemo = project.href && project.href !== '#'
  return <article id={`project-${project.slug}`} className={`project ${open ? 'project-open' : ''}`}>
    <h3><button className="project-row" aria-expanded={open} aria-controls={`case-${project.slug}`} onClick={toggle}>
      <span className="project-visual" aria-hidden="true">
        {project.previewReady ? <img src={project.preview} alt="" loading="lazy" width="640" height="400" /> : <span className="project-initials display">{project.initials}</span>}
        <span className="project-tile-index micro">{String(index + 1).padStart(2, '0')}</span>
      </span>
      <span className="project-overview">
        <span className="project-category micro">{project.category.split(' / ')[1]} / {project.role}</span>
        <span className="project-title display">{project.name}</span>
        <span className="project-description">{project.description}</span>
        <span className="project-tags">{project.tags.map(tag => <span key={tag} className="chip">{tag}</span>)}</span>
      </span>
      <span className="project-view"><span>{open ? copy.close : copy.view}</span><span className={`project-arrow ${open ? 'rotate' : ''}`}><Arrow /></span></span>
    </button></h3>
    <AnimatePresence initial={false}>{open && <motion.div id={`case-${project.slug}`} className="case-study" initial={{ height: reduced ? 'auto' : 0, opacity: reduced ? 1 : 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.28 }}>
      <div className="case-content">
        <div><h4 className="micro case-label">01 / {copy.problem}</h4><p>{project.problem}</p></div>
        <div><h4 className="micro case-label">02 / {copy.built}</h4><ul>{project.features.slice(0, 3).map(feature => <li key={feature}>{feature}</li>)}</ul></div>
        {project.challenge && <div className="case-wide"><h4 className="micro case-label">03 / {copy.challenge}</h4><p>{project.challenge}</p></div>}
        {project.stack.length > 0 && <div className="case-wide"><h4 className="micro case-label">04 / {copy.stack}</h4><div className="case-stack">{project.stack.map(item => <span className="chip" key={item}>{item}</span>)}</div></div>}
        {(project.repo || hasDemo) && <div className="case-links">{project.repo && <a href={project.repo} target="_blank" rel="noreferrer">{copy.repo}<Arrow /></a>}{hasDemo && <a href={project.href} target="_blank" rel="noreferrer">{copy.live}<Arrow /></a>}</div>}
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
