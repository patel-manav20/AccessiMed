import PropTypes from 'prop-types'
import GlassPanel from '../ui/GlassPanel'

function StatCard({ title, value }) {
  return (
    <GlassPanel className="bg-light/75 p-4">
      <p className="text-xs uppercase tracking-wider text-textSecondary">{title}</p>
      <p className="mt-2 font-display text-lg font-semibold text-textPrimary">{value}</p>
    </GlassPanel>
  )
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
}

function FeatureCard({ icon, title, description }) {
  return (
    <GlassPanel className="bg-bgSecondary/45 p-5 transition hover:-translate-y-1 hover:border-deepSoft/35">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-deepSoft/30 bg-light/70 text-lg text-deepSoft">
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-textPrimary">{title}</h3>
      <p className="mt-2 text-sm text-textSecondary">{description}</p>
    </GlassPanel>
  )
}

FeatureCard.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
}

function DiagramNode({ title, caption }) {
  return (
    <GlassPanel className="relative bg-surface/28 p-4 text-center">
      <p className="text-sm font-semibold text-textPrimary">{title}</p>
      <p className="mt-2 text-xs text-textSecondary">{caption}</p>
    </GlassPanel>
  )
}

DiagramNode.propTypes = {
  title: PropTypes.string.isRequired,
  caption: PropTypes.string.isRequired,
}

function CTASection() {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-5 pb-24 pt-12 sm:px-8 lg:px-12 2xl:px-16">
      <GlassPanel className="section-ring rounded-3xl bg-light/80 px-6 py-12 text-center sm:px-12">
        <h2 className="font-display text-[clamp(1.4rem,2.5vw,2.25rem)] font-bold leading-snug text-textPrimary">
          Bring accessible healthcare experiences to production faster.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-textSecondary">
          AccessiMed gives your team a single path from WCAG findings to reviewable remediation.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="/scan" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-light shadow-glow hover:bg-deepSoft">
            Start Scan
          </a>
          <a href="/dashboard" className="inline-flex min-h-11 items-center rounded-xl border border-secondary/30 bg-surface/70 px-4 py-2 text-sm font-semibold text-textPrimary hover:border-secondary/55">
            View Dashboard
          </a>
        </div>
      </GlassPanel>
    </section>
  )
}

export { StatCard, FeatureCard, DiagramNode, CTASection }
