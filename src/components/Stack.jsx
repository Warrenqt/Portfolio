import { motion, useReducedMotion } from 'framer-motion'
import { portfolio } from '../data/portfolio'
import { Heading, Reveal, SectionLabel } from './Shared'
import TechMarquee from './TechMarquee'

export default function Stack() {
  const { stack } = portfolio
  const reduced = useReducedMotion()
  return <section id="stack" className="content-section stack-section" tabIndex={-1}>
    <div className="section-shell"><SectionLabel label={stack.label} />
      <Reveal className="section-heading-row"><Heading>{stack.title}</Heading><p className="stack-command">{stack.command}<span className="cursor-block" aria-hidden="true" /></p></Reveal>
      <Reveal className="stack-primary"><h3 className="micro">PRIMARY</h3><ul>{stack.primary.map(item => <li key={item}><span aria-hidden="true">▸</span>{item}</li>)}</ul></Reveal>
      <div className="stack-grid">{stack.groups.map((group, groupIndex) => <motion.div key={group.title} className={`stack-group stack-group-${groupIndex}`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} transition={{ staggerChildren: reduced ? 0 : 0.035 }}>
        <div className="stack-group-title micro"><h3>{group.title}</h3><span>{String(group.items.length).padStart(2, '0')}</span></div>
        <ul>{group.items.map((item, i) => <motion.li key={item} variants={{ hidden: { opacity: reduced ? 1 : 0, x: reduced ? 0 : -6 }, visible: { opacity: 1, x: 0 } }} transition={{ duration: 0.16 }}><span aria-hidden="true" className="tree-prefix">{i === group.items.length - 1 ? '└─' : '├─'}</span>{groupIndex === 0 ? <span className="skill-proof" tabIndex={0}>{item}<span className="skill-projects">{stack.proof[item]?.map(slug => portfolio.projects.find(project => project.slug === slug)?.name).filter(Boolean).join(' · ') || stack.unlinked}</span></span> : item}</motion.li>)}</ul>
      </motion.div>)}</div>
    </div>
    <TechMarquee />
  </section>
}
