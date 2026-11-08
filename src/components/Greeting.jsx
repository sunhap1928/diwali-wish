import Diya from './Diya'

export default function Greeting() {
  return (
    <div className="card">
      <p className="eyebrow reveal">Introducing</p>
      <p className="logo reveal">
        <span className="sun">Sun</span>
        <span className="hap">Hap</span>
      </p>
      <p className="tagline reveal">Digital Solutions &amp; IT Services</p>

      <div className="divider reveal" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <p className="wish-label reveal">Wishes you a</p>
      <h1 className="headline reveal">Happy Diwali</h1>
      <p className="message reveal">
        May this festival of lights clear every roadmap, brighten every release, and bring a few
        well-earned fireworks for the wins of the year. From our dashboards to your diyas — may the
        year ahead shine as bright as tonight&rsquo;s sky.
      </p>
      <p className="signature reveal">— Team SunHap</p>

      <div className="diya-row reveal" aria-hidden="true">
        <Diya size="small" delay={0} />
        <Diya size="small" delay={0.3} />
        <Diya size="small" delay={0.6} />
        <Diya size="small" delay={0.9} />
        <Diya size="small" delay={1.2} />
      </div>
    </div>
  )
}
