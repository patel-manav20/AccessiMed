import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Section from '../components/ui/Section'
import GlassPanel from '../components/ui/GlassPanel'
import PillBadge from '../components/ui/PillBadge'
import Button from '../components/ui/Button'
import FAQAccordion from '../components/site/FAQAccordion'
import { CTASection, DiagramNode, FeatureCard, StatCard } from '../components/site/MarketingBlocks'
import GovernmentNewsSection from '../components/site/GovernmentNewsSection'

const stats = [
  { title: 'Multi-page scanning', value: 'Up to 5 pages per run' },
  { title: 'Issue detection', value: 'WCAG severity grouping' },
  { title: 'AI remediation', value: 'Before/after code guidance' },
  { title: 'Workflow integration', value: 'AI-powered workflow integration' },
]

const featureCards = [
  ['◈', 'Multi-page scanning', 'Evaluate key healthcare pages quickly with a focused crawl strategy designed for practical remediation.'],
  ['⟁', 'Severity-grouped results', 'Prioritize what matters by sorting violations into critical, high, medium, and low categories.'],
  ['✦', 'AI single-fix remediation', 'Generate targeted, explainable HTML fixes for specific WCAG issues with minimal engineering friction.'],
  ['▦', 'PDF compliance reports', 'Export clear, shareable reports for compliance, legal, and delivery stakeholders.'],
  ['⇄', 'Developer workflow handoff', 'Move from findings into local code review with CLI-friendly remediation guidance and exact file changes.'],
  ['✓', 'Healthcare-ready trust posture', 'Built for high-accountability teams that require precision, traceability, and reviewability.'],
]

const faqItems = [
  { q: 'What does AccessiMed scan?', a: 'AccessiMed scans target pages for WCAG 2.1 A/AA issues using automated browser and rules-engine analysis.' },
  { q: 'How long does a scan take?', a: 'Most scans complete in under a minute for standard 5-page coverage, depending on website response time.' },
  { q: 'What types of issues are detected?', a: 'It detects common accessibility risks including contrast, labels, semantics, alt text, and interactive control problems.' },
  { q: 'Can users review fixes before applying them?', a: 'Yes. AccessiMed provides before/after code plus explanation so teams can validate changes before merging.' },
  { q: 'How do developers apply changes?', a: 'Developers can use the CLI on a local codebase, apply a single finding, and review the resulting Git diff before keeping or discarding it.' },
  { q: 'Is the interface itself accessibility-friendly?', a: 'Yes. The product UI uses semantic structure, strong contrast, keyboard support, and visible focus states.' },
]

function AboutPage() {
  const navigate = useNavigate()
  const [heroUrl, setHeroUrl] = useState('https://clinic-network.org')

  const handleHeroScan = () => {
    const trimmed = heroUrl.trim()
    if (!trimmed) {
      navigate('/scan')
      return
    }
    navigate(`/scan?url=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div>
      <Section id="about" className="site-grid pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 w-fit rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Healthcare Accessibility Compliance
            </p>
            <h1 className="font-display text-[clamp(1.8rem,3.2vw,3rem)] font-bold leading-snug text-textPrimary">
              Audit, understand, and remediate healthcare website accessibility in minutes.
            </h1>
            <p className="mt-4 max-w-xl text-textSecondary">
              AccessiMed is an AI-powered WCAG compliance platform that helps healthcare teams scan websites, prioritize issues, and generate reviewable code fixes with confidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/scan">Start Scan</Button>
              <Button to="/dashboard" variant="secondary">Explore Dashboard</Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {['AI Fixes', 'Severity-Based Results', 'PDF Reports', 'Developer CLI Workflow'].map((pill) => (
                <PillBadge key={pill}>{pill}</PillBadge>
              ))}
            </div>
          </div>

          <GlassPanel className="section-ring p-5">
            <div className="space-y-3">
              <GlassPanel className="bg-bgSecondary/65 p-4">
                <p className="text-xs text-textSecondary">Scan Target</p>
                <div className="mt-2 flex gap-2">
                  <input
                    value={heroUrl}
                    onChange={(event) => setHeroUrl(event.target.value)}
                    className="w-full rounded-lg border border-secondary/30 bg-bg/70 px-3 py-2 text-sm text-textPrimary"
                    aria-label="Scan target"
                  />
                  <button
                    type="button"
                    onClick={handleHeroScan}
                    className="inline-flex min-h-10 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-light animate-pulseGlow"
                  >
                    Scan
                  </button>
                </div>
              </GlassPanel>
              <GlassPanel className="bg-bgSecondary/60 p-4">
                <p className="text-xs text-textSecondary">Results Summary</p>
                <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                  {[
                    ['Critical', 'bg-red-600'],
                    ['High', 'bg-orange-500'],
                    ['Medium', 'bg-blue-500'],
                    ['Low', 'bg-emerald-600'],
                  ].map(([item, dotClass]) => (
                    <div key={item} className="rounded-md border border-secondary/25 bg-bg/60 px-2 py-2 text-center text-textPrimary">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${dotClass}`} aria-hidden />
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
              <GlassPanel className="bg-bgSecondary/60 p-4">
                <p className="text-xs text-textSecondary">AI Fix Preview</p>
                <pre className="mt-2 overflow-auto rounded-md border border-secondary/25 bg-bg/75 p-3 font-mono text-xs text-warning">{`<button class="btn-primary" aria-label="Book appointment">Book</button>`}</pre>
              </GlassPanel>
            </div>
          </GlassPanel>
        </div>
      </Section>

      <Section className="py-10 bg-soft/10 rounded-3xl">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} title={stat.title} value={stat.value} />
          ))}
        </div>
      </Section>

      <Section
        id="problem"
        eyebrow="Why This Matters"
        title="Healthcare accessibility gaps become patient access gaps."
        subtitle="Manual audits and fragmented remediation workflows slow compliance and delivery for teams under real regulatory pressure."
        className="bg-bgSecondary/42 rounded-3xl"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <GlassPanel className="p-6">
            <h3 className="text-lg font-semibold text-danger">Current friction</h3>
            <ul className="mt-4 space-y-2 text-sm text-textSecondary">
              <li>- Manual audits are expensive and slow to operationalize.</li>
              <li>- Findings are delivered as static reports with limited engineering guidance.</li>
              <li>- Patient-facing healthcare experiences remain at risk longer than necessary.</li>
            </ul>
          </GlassPanel>
          <GlassPanel className="p-6">
            <h3 className="text-lg font-semibold text-warning">AccessiMed advantage</h3>
            <ul className="mt-4 space-y-2 text-sm text-textSecondary">
              <li>- Detect, prioritize, and remediate in one connected platform.</li>
              <li>- Turn findings into explainable code changes for implementation teams.</li>
              <li>- Keep compliance, engineering, and leadership aligned with shared outputs.</li>
            </ul>
          </GlassPanel>
        </div>
      </Section>

      <GovernmentNewsSection />

      <Section id="workflow" eyebrow="How AccessiMed Works" title="End-to-end workflow from URL to remediation" className="bg-bg/35 rounded-3xl">
        <div className="grid gap-4 md:grid-cols-6">
          {[
            ['Enter URL', 'Provide your healthcare website URL'],
            ['Crawl Pages', 'Discover and load key internal pages'],
            ['Run WCAG Audit', 'Detect rule-level accessibility violations'],
            ['Group by Severity', 'Prioritize critical and high-risk issues'],
            ['Generate AI Fix', 'Produce before/after remediation code'],
            ['Report or CLI handoff', 'Download PDF output or move into local code remediation'],
          ].map(([title, caption], idx) => (
            <div key={title} className="relative">
              <DiagramNode title={title} caption={caption} />
              {idx < 5 && <span className="absolute -right-2 top-1/2 hidden h-0.5 w-4 bg-secondary/40 md:block" aria-hidden />}
            </div>
          ))}
        </div>
      </Section>

      <Section id="architecture" eyebrow="Platform Architecture" title="Structured for clarity, scalability, and trust" className="bg-soft/8 rounded-3xl">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[
            ['Frontend', 'React interface for scan, review, and fix workflows'],
            ['Backend API', 'FastAPI routes coordinate scan and remediation actions'],
            ['Scanner Layer', 'Playwright crawl plus axe-core accessibility analysis'],
            ['AI Fix Layer', 'Model-assisted remediation and explanation generation'],
            ['Outputs', 'PDF reporting plus local developer workflow actions'],
          ].map(([title, text]) => (
            <GlassPanel key={title} className="p-4">
              <p className="text-sm font-semibold text-textPrimary">{title}</p>
              <p className="mt-2 text-xs text-textSecondary">{text}</p>
            </GlassPanel>
          ))}
        </div>
      </Section>

      <Section id="features" eyebrow="Features" title="Built for practical enterprise accessibility remediation" className="bg-bgSecondary/45 rounded-3xl">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureCards.map(([icon, title, description]) => (
            <FeatureCard key={title} icon={icon} title={title} description={description} />
          ))}
        </div>
      </Section>

      <Section id="use-cases" eyebrow="Who It Is For" title="Designed for cross-functional healthcare teams" className="bg-bg/35 rounded-3xl">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ['Healthcare organizations', 'Build confidence before compliance reviews and patient-facing launches.'],
            ['Frontend teams', 'Translate accessibility findings into reviewable code changes faster.'],
            ['Engineering leads', 'Prioritize risk and route fixes into existing Git review workflows.'],
            ['Compliance stakeholders', 'Maintain traceable evidence with reports and documented remediation.'],
          ].map(([role, copy]) => (
            <GlassPanel key={role} className="p-5">
              <h3 className="text-base font-semibold text-textPrimary">{role}</h3>
              <p className="mt-2 text-sm text-textSecondary">{copy}</p>
            </GlassPanel>
          ))}
        </div>
      </Section>

      <Section id="faq" eyebrow="FAQ" title="Common questions from product, compliance, and engineering teams" className="bg-soft/8 rounded-3xl">
        <FAQAccordion items={faqItems} />
      </Section>

      <CTASection />

    </div>
  )
}

export default AboutPage
