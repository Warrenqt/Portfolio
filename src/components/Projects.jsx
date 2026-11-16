import { useEffect, useRef, useState } from 'react'
import { portfolio } from '../data/portfolio'
import { Arrow, Heading, Reveal, SectionLabel } from './Shared'
import ProjectDrawer, { liveUrl } from './ProjectDrawer'

const projectFromHash = () => portfolio.projects.find(project => window.location.hash === `#project/${project.slug}`) || null

function Project({ project, index, onRead }) {
  const visualRef = useRef(null)
  const [imageFailed, setImageFailed] = useState(false)
  const [inView, setInView] = useState(false)
  const hasImage = Boolean(project.image && !imageFailed)
  const demoUrl = liveUrl(project)
  useEffect(() => {
    const node = visualRef.current
    if (!hasImage || !node) return undefined
    const hoverNone = window.matchMedia('(hover: none)')
    let observer
    const connect = () => {
      observer?.disconnect()
      observer = undefined
      if (!hoverNone.matches) { setInView(false); return }
      if (!('IntersectionObserver' in window)) { setInView(true); return }
      observer = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio >= 0.6), { threshold: [0, 0.6, 1] })
      observer.observe(node)
    }
    connect()
    hoverNone.addEventListener('change', connect)
    return () => { hoverNone.removeEventListener('change', connect); observer?.disconnect() }
  }, [hasImage])
  return <article id={`project-${project.slug}`} className={`project ${demoUrl ? 'project-has-live' : ''} ${hasImage ? 'project-has-image' : 'project-no-image'} ${inView ? 'project-image-developed' : ''}`}>
    <div className="project-row">
      <div ref={visualRef} className={`project-visual ${hasImage ? 'project-visual-image' : ''}`} data-tone={project.tone}>
        {hasImage ? <img src={project.image} alt={project.imageAlt || `${project.name} screenshot`} loading="lazy" decoding="async" width={project.imageWidth || 1600} height={project.imageHeight || 1000} onError={() => setImageFailed(true)} /> : <span className="project-initials display" aria-hidden="true">{project.initials}</span>}
      </div>
      <span className="project-mobile-index display" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <div className="project-overview">
        <span className="project-desktop-index display" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <span className="project-category micro">{project.category.split(' / ')[1]} / {project.role}</span>
        <h3 className="project-title display">{project.name}</h3>
        <p className="project-description">{project.description}</p>
        <div className="project-tags">{project.tags.map(tag => <span key={tag} className="chip">{tag}</span>)}</div>
        <div className="project-actions">
          {demoUrl && <a className="project-action project-live-link" href={demoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Live ${project.name} demo`}>LIVE <Arrow /></a>}
          <button className="project-action" aria-haspopup="dialog" aria-label={`Read ${project.name} case study`} onClick={() => onRead(project)}>READ <Arrow /></button>
        </div>
      </div>
    </div>
  </article>
}

export default function Projects() {
  const [active, setActive] = useState(projectFromHash)
  const copy = portfolio.projectsHeading
  useEffect(() => {
    const sync = () => setActive(projectFromHash())
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => { window.removeEventListener('popstate', sync); window.removeEventListener('hashchange', sync) }
  }, [])
  const open = project => {
    window.history.pushState({ ...window.history.state, portfolioProject: true }, '', `#project/${project.slug}`)
    setActive(project)
  }
  const close = () => {
    if (window.history.state?.portfolioProject) window.history.back()
    else { window.history.replaceState(null, '', '#projects'); setActive(null) }
  }
  return <section id="projects" className="section-shell content-section" tabIndex={-1}>
    <SectionLabel label={copy.label} />
    <Reveal className="section-heading-row"><Heading dot>{copy.title}</Heading></Reveal>
    <Reveal className="project-list">{portfolio.projects.map((project, i) => <Project key={project.slug} project={project} index={i} onRead={open} />)}</Reveal>
    {active && <ProjectDrawer key={active.slug} project={active} onClose={close} />}
  </section>
}
