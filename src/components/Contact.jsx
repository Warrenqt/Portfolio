import { useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { portfolio } from '../data/portfolio'
import { createMailto, getFormEndpoint, submitContact } from '../lib/contact'
import { Arrow, Reveal, SectionLabel } from './Shared'

const endpoint = getFormEndpoint(import.meta.env.VITE_FORMSPREE_ENDPOINT)

export function EmailCopy({ link }) {
  const [state, setState] = useState('idle')
  const copy = async () => {
    try { await navigator.clipboard.writeText(link.text); setState('copied') }
    catch { setState('error') }
  }
  return <><button type="button" className="email-copy" aria-label={portfolio.contact.copyEmail} onClick={copy}><span className="micro">{link.label}</span><span className="direct-link-text">{link.text}</span><span className="copy-icon" aria-hidden="true">{state === 'copied' ? '✓' : '⧉'}</span></button><span role="status" className="copy-status">{state === 'copied' ? portfolio.contact.copied : state === 'error' ? portfolio.contact.copyFailed : ''}</span></>
}

export function ContactForm() {
  const copy = portfolio.contact
  const [status, setStatus] = useState('idle')
  const [draft, setDraft] = useState('')
  const busy = useRef(false)
  const submit = async event => {
    event.preventDefault()
    if (busy.current) return
    const form = event.currentTarget
    const fields = Object.fromEntries(new FormData(form))
    if (fields.website) return
    if (!endpoint) {
      setDraft(createMailto(portfolio.email, fields)); setStatus('draft'); return
    }
    busy.current = true; setStatus('sending')
    try { await submitContact(endpoint, fields); setStatus('sent'); form.reset() }
    catch { setStatus('error') }
    finally { busy.current = false }
  }
  return <form className="terminal contact-form" onSubmit={submit} aria-label="Contact Warren">
    <div className="terminal-bar"><span>{copy.terminalTitle}</span><span aria-hidden="true">↗</span></div>
    <div className="form-body"><p className="form-intro">{copy.formIntro}</p>
      <div className="form-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {['name', 'email', 'message'].map(field => <div className="form-field" key={field}><label htmlFor={`contact-${field}`}>{copy.fields[field]}:</label>{field === 'message' ? <textarea id={`contact-${field}`} name={field} required minLength={10} maxLength={5000} rows={4} placeholder={copy.placeholders[field]} /> : <input id={`contact-${field}`} name={field} type={field === 'email' ? 'email' : 'text'} autoComplete={field} required minLength={field === 'name' ? 2 : undefined} maxLength={field === 'name' ? 100 : 254} placeholder={copy.placeholders[field]} />}</div>)}
      <div className="form-actions"><button className="send-button" type="submit" disabled={status === 'sending'}>{status === 'sending' ? copy.sending : copy.submit}</button></div>
      {!endpoint && status === 'idle' && <p className="form-note">{copy.fallbackNote}</p>}
      <div role="status" aria-live="polite" className={`form-status ${status === 'error' ? 'form-error' : ''}`}>
        {status === 'sent' && copy.sent}
        {status === 'error' && <>{copy.error} <a href={`mailto:${portfolio.email}`}>{portfolio.email}</a></>}
        {status === 'draft' && <>{copy.emailReady}<a className="draft-link" href={draft}>{copy.emailDraft}</a></>}
      </div>
    </div>
  </form>
}

export default function Contact() {
  const { contact, footer } = portfolio
  const headingRef = useRef(null)
  const reduced = useReducedMotion()
  const move = event => {
    if (reduced || event.pointerType === 'touch') return
    const box = headingRef.current.getBoundingClientRect()
    headingRef.current.style.setProperty('--heading-x', `${(event.clientX - box.left - box.width / 2) / box.width * 8}px`)
  }
  return <section id="contact" className="contact-section" tabIndex={-1}>
    <div className="section-shell"><SectionLabel label={contact.label} />
      <Reveal><h2 className="contact-headline display" ref={headingRef} onPointerMove={move} onPointerLeave={() => headingRef.current.style.setProperty('--heading-x', '0px')}>{contact.headline.map((line, i) => <span className={i ? 'orange' : ''} key={line}>{line}</span>)}</h2></Reveal>
      <Reveal className="contact-grid"><ContactForm /><div className="direct-contact"><p className="direct-label micro">{contact.directLabel}</p><div className="direct-links">{contact.links.map(link => link.href.startsWith('mailto:') ? <EmailCopy key={link.label} link={link} /> : <a href={link.href} key={link.label} target="_blank" rel="noopener noreferrer"><span className="micro">{link.label}</span><span className="direct-link-text">{link.text}</span><Arrow /></a>)}</div><a className="resume-link" href={portfolio.resume} target="_blank" rel="noopener noreferrer">{contact.resumeLabel}</a></div></Reveal>
      <footer className="footer"><div><span>{footer.copyright}</span><span className="footer-location">{footer.location}</span></div><a href="#home">{footer.back}</a></footer>
    </div>
  </section>
}
