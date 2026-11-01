import { portfolio } from '../data/portfolio'
import HalftonePortrait from './HalftonePortrait'
import { Arrow, Clock } from './Shared'

export function HeroName() {
  return <h1 className="hero-name display" aria-label={portfolio.name}><span className="hero-first">{portfolio.firstName}</span>{' '}<span className="hero-last">{portfolio.lastName.join('')}</span></h1>
}

export function BottomBar() {
  return <div className="bottom-bar"><span>{portfolio.locationShort}</span><span>{portfolio.hero.education}</span><span className="availability"><i />{portfolio.status}</span><Clock /></div>
}

export default function Hero({ phase }) {
  return <section id="home" className="hero section-shell" tabIndex={-1} aria-label="Introduction">
    <div className="hero-meta micro"><span>{portfolio.edition}</span><span className="coordinates">{portfolio.coordinates}</span></div>
    <div className="hero-stage">
      <span className="hero-side-label micro" aria-hidden="true">{portfolio.hero.label}</span>
      <div className="portrait-composition"><span className="registration reg-tl" /><span className="registration reg-br" /><HalftonePortrait active={phase !== 'intro'} animate={phase === 'reveal'} /><HeroName /></div>
      <span className="hero-stamp micro" aria-hidden="true">{portfolio.hero.stamp[0]}<br />{portfolio.hero.stamp[1]}<br />{portfolio.hero.stamp[2]}</span>
    </div>
    <div className="hero-under">
      <div><p className="role-line"><span className="orange">&gt;</span> {portfolio.role}<span className="cursor-block" aria-hidden="true" /></p><p className="micro muted hero-process">{portfolio.hero.process}</p></div>
      <a className="contact-button" href="#contact"><span className="solid-dot" />{portfolio.hero.contact}<Arrow /></a>
    </div>
    <BottomBar />
    <div className="hero-foot micro"><span>{portfolio.version}</span><a href="#about">{portfolio.hero.scroll}<Arrow direction="down" /></a></div>
  </section>
}
