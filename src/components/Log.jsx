import { useState } from 'react'
import { portfolio } from '../data/portfolio'
import { Heading, Reveal, SectionLabel } from './Shared'

export default function Log() {
  const { log } = portfolio
  const [expanded, setExpanded] = useState(false)
  const certificates = expanded ? log.certificates : log.certificates.slice(0, 5)
  const internships = log.entries.filter(entry => entry.type.startsWith('EXPERIENCE')).length
  return <section id="log" className="section-shell content-section" tabIndex={-1}>
    <SectionLabel label={log.label} />
    <Reveal className="section-heading-row"><Heading>{log.title}</Heading><p className="stack-command">{log.command}</p></Reveal>
    <div className="log-layout"><div className="log-aside"><span className="micro">{log.branch}</span><p>{log.stats.since} {log.startedYear}.<br />{log.certificates.length} {log.stats.certificates}<br />{internships} {internships === 1 ? log.stats.internship : log.stats.internships}</p><span className="micro muted">{log.period}</span></div>
      <ol className="timeline">{log.entries.map(entry => <li key={entry.hash}><Reveal className="log-entry"><span className="timeline-node" aria-hidden="true" /><div className="log-entry-top micro"><span className="commit-hash">{entry.hash}</span><span>{entry.type}</span><span className="commit-date">{entry.date}</span></div><h3>{entry.title}</h3><p className="log-subtitle">{entry.subtitle}</p><p className="log-details">{entry.details}</p></Reveal></li>)}</ol>
    </div>
    <Reveal className="certificates"><div className="certifications-heading micro"><h3>{log.certTitle}</h3><span>{certificates.length} / {log.certificates.length} {log.entriesLabel}</span></div>
      <div id="certificate-list" className="certificate-scroll"><table aria-label={log.tableLabel}><thead><tr><th scope="col">{log.certificate}</th><th scope="col">{log.issuer}</th><th scope="col">{log.date}</th></tr></thead><tbody>{certificates.map(cert => <tr key={cert.name}><th scope="row">{cert.name}</th><td data-label={log.issuer}>{cert.issuer}</td><td data-label={log.date}>{cert.date}</td></tr>)}</tbody></table></div>
      {log.certificates.length > 5 && <button className="cert-toggle micro" aria-expanded={expanded} aria-controls="certificate-list" onClick={() => setExpanded(!expanded)}>[ {expanded ? log.showLess : `${log.showAll} ${log.certificates.length}`} ]</button>}
    </Reveal>
  </section>
}
