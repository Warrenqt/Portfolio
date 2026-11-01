import { portfolio } from '../data/portfolio'
import { Heading, Reveal, SectionLabel } from './Shared'

export default function Log() {
  const { log } = portfolio
  return <section id="log" className="section-shell content-section" tabIndex={-1}>
    <SectionLabel label={log.label} right={log.note} />
    <Reveal className="section-heading-row"><Heading>{log.title}</Heading><p className="stack-command">{log.command}</p></Reveal>
    <div className="log-layout"><div className="log-aside"><span className="micro">{log.branch}</span><p>{log.aside[0]}<br />{log.aside[1]}<br />{log.aside[2]}</p><span className="micro muted">{log.period}</span></div>
      <ol className="timeline">{log.entries.map(entry => <li key={entry.hash}><Reveal className="log-entry"><span className="timeline-node" aria-hidden="true" /><div className="log-entry-top micro"><span className="commit-hash">{entry.hash}</span><span>{entry.type}</span><span className="commit-date">{entry.date}</span></div><h3>{entry.title}</h3><p className="log-subtitle">{entry.subtitle}</p><p className="log-details">{entry.details}</p></Reveal></li>)}</ol>
    </div>
    <Reveal className="certificates"><div className="certifications-heading micro"><h3>{log.certTitle}</h3><span>[ {log.certificates.length} ENTRIES ]</span></div><div className="certificate-scroll" role="region" aria-label="Certifications table, scroll horizontally on small screens" tabIndex={0}><table><thead><tr><th scope="col">{log.certificate}</th><th scope="col">{log.issuer}</th><th scope="col">{log.date}</th></tr></thead><tbody>{log.certificates.map(cert => <tr key={cert.name}><th scope="row">{cert.name}</th><td>{cert.issuer}</td><td>{cert.date}</td></tr>)}</tbody></table></div></Reveal>
  </section>
}
