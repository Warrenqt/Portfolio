import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Arrow } from './Shared'

export const liveUrl = project => project.live || (project.href && project.href !== '#' ? project.href : null)

export default function ProjectDrawer({ project, onClose }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const demoUrl = liveUrl(project)
  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    const previousPadding = document.body.style.paddingRight
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    closeRef.current.focus({ preventScroll: true })
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPadding
      const target = previousFocus !== document.body && previousFocus?.isConnected ? previousFocus : document.getElementById('projects')
      // Hash navigation restores its own anchor focus after popstate. Return to
      // READ on the next frame, without stealing focus during StrictMode replay.
      requestAnimationFrame(() => {
        if (!document.querySelector('.project-dialog[open]')) target?.focus({ preventScroll: true })
      })
    }
  }, [])
  const trapFocus = event => {
    if (event.key !== 'Tab') return
    const nodes = [...dialogRef.current.querySelectorAll('button, a[href]')]
    const first = nodes[0], last = nodes.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
  return createPortal(<dialog ref={dialogRef} className="project-dialog" aria-labelledby="case-title" onCancel={event => { event.preventDefault(); onClose() }} onClick={event => { if (event.target === event.currentTarget) onClose() }} onKeyDown={trapFocus}>
    <div className="project-drawer">
      <header className="drawer-header"><span>~/projects/{project.slug}.md</span><button ref={closeRef} className="drawer-close" onClick={onClose}>✕ CLOSE</button></header>
      <div className="drawer-content">
        <h2 id="case-title" className="display">{project.name}</h2>
        {project.image && <img className="drawer-screenshot" src={project.image} alt={project.imageAlt || `${project.name} screenshot`} width={project.imageWidth || 1600} height={project.imageHeight || 1000} decoding="async" />}
        <section><h3>## PROBLEM</h3><p>{project.problem}</p></section>
        <section><h3>## MY ROLE</h3><p>{project.role}</p><p>{project.built}</p></section>
        <section><h3>## KEY FEATURES</h3><ul>{project.features.slice(0, 3).map(feature => <li key={feature}>{feature}</li>)}</ul></section>
        <section><h3>## CHALLENGE</h3><p>{project.challenge}</p></section>
        <section><h3>## STACK</h3><div className="project-tags">{project.tags.map(tag => <span className="chip" key={tag}>{tag}</span>)}</div></section>
        {demoUrl && <a className="project-action" href={demoUrl} target="_blank" rel="noopener noreferrer" aria-label={`View live demo of ${project.name}`}>LIVE <Arrow /></a>}
      </div>
    </div>
  </dialog>, document.body)
}
