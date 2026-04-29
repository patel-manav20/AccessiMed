import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import Section from '../components/ui/Section'
import GlassPanel from '../components/ui/GlassPanel'
import Button from '../components/ui/Button'
import PillBadge from '../components/ui/PillBadge'
import { CTASection, DiagramNode, FeatureCard } from '../components/site/MarketingBlocks'
import { getReportBlob, scanWebsite } from '../services/scanService'

const riskRows = [
  {
    key: 'critical',
    level: 'Critical',
    range: '9.0 - 10.0',
    description: 'High impact, low complexity; immediate fix recommended.',
    activeClass: 'border-red-500/55 bg-red-50 text-red-700',
  },
  {
    key: 'high',
    range: '7.0 - 8.9',
    level: 'High',
    description: 'Significant risk; usually grants unauthorized access or severe disruption.',
    activeClass: 'border-orange-500/55 bg-orange-50 text-orange-700',
  },
  {
    key: 'medium',
    level: 'Medium',
    range: '4.0 - 6.9',
    description: 'Some impact but requires specific conditions to exploit.',
    activeClass: 'border-blue-500/55 bg-blue-50 text-blue-700',
  },
  {
    key: 'low',
    level: 'Low',
    range: '0.0 - 3.9',
    description: 'Minimal impact or extremely difficult to exploit.',
    activeClass: 'border-emerald-500/55 bg-emerald-50 text-emerald-700',
  },
]

function ScanPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [url, setUrl] = useState(searchParams.get('url') || '')
  const [status, setStatus] = useState('idle')
  const [stageIndex, setStageIndex] = useState(0)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [maxPages, setMaxPages] = useState(5)
  const [notice, setNotice] = useState('')

  const scanStages = useMemo(
    () => [
      'Initializing',
      'Discovering pages',
      'Running accessibility audit',
      'Grouping results',
      'Preparing dashboard',
    ],
    [],
  )

  useEffect(() => {
    if (status !== 'scanning') return undefined
    const timer = setInterval(() => {
      setStageIndex((prev) => (prev < scanStages.length - 1 ? prev + 1 : prev))
    }, 1300)
    return () => clearInterval(timer)
  }, [status, scanStages.length])

  useEffect(() => {
    const incomingUrl = searchParams.get('url') || ''
    if (incomingUrl && incomingUrl !== url) {
      setUrl(incomingUrl)
    }
  }, [searchParams, url])

  const progressPercent = Math.round(((stageIndex + 1) / scanStages.length) * 100)

  const isValidUrl = (value) => {
    try {
      const parsed = new URL(value)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch (_err) {
      return false
    }
  }

  const handleStartScan = async () => {
    setError('')
    setNotice('')
    setResult(null)
    if (!isValidUrl(url)) {
      setError('Please enter a valid URL starting with http:// or https://')
      return
    }

    setStatus('scanning')
    setStageIndex(0)
    try {
      const scanResult = await scanWebsite({ url, maxPages })
      setResult(scanResult)
      setNotice(scanResult.notice || '')
      setStatus('success')
      localStorage.setItem('accessimed-latest-scan', JSON.stringify(scanResult))
    } catch (scanError) {
      setStatus('error')
      setError(scanError.message || 'Scan failed. Please try again.')
    }
  }

  const handleDownloadReport = async () => {
    if (!result?.scan_id || result?.source !== 'api') {
      setNotice('Report download is available when connected to live backend scans.')
      return
    }
    try {
      const blob = await getReportBlob(result.scan_id)
      const blobUrl = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', `wcag-report-${result.scan_id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (_err) {
      setNotice('Unable to download report right now. Please try again in a moment.')
    }
  }

  const handleReset = () => {
    setStatus('idle')
    setResult(null)
    setError('')
    setNotice('')
    setStageIndex(0)
  }

  const getLevelCount = (rowKey) => {
    if (!result?.severity_counts) return 0
    if (rowKey === 'critical') return result.severity_counts.critical ?? 0
    if (rowKey === 'high') return result.severity_counts.high ?? 0
    if (rowKey === 'medium') return result.severity_counts.medium ?? 0
    return result.severity_counts.low ?? 0
  }

  return (
    <div>
      <Section
        eyebrow="Website Accessibility Audit"
        title="Scan a healthcare website for WCAG issues in minutes"
        subtitle="Launch an AI-powered accessibility audit and move from findings to actionable remediation with confidence."
        className="rounded-3xl bg-light/70"
      >
        <div className="mb-8 flex flex-wrap gap-2">
          <PillBadge>AI-assisted remediation</PillBadge>
          <PillBadge>Developer-friendly workflow</PillBadge>
          <PillBadge>WCAG-focused review</PillBadge>
        </div>

        <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
          <GlassPanel className="section-ring p-6">
            <label htmlFor="scan-url" className="mb-2 block text-sm font-medium text-textPrimary">
              Website URL
            </label>
            <div className="rounded-2xl border border-deepSoft/25 bg-light/65 p-1">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="scan-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-clinic-site.com"
                  className="min-h-12 flex-1 rounded-xl border border-deepSoft/30 bg-light px-4 text-deep placeholder:text-deepSoft/75"
                />
                <button
                  type="button"
                  onClick={handleStartScan}
                  disabled={status === 'scanning'}
                  className="min-h-12 rounded-xl bg-primary px-5 text-sm font-semibold text-light shadow-glow transition hover:bg-deepSoft disabled:opacity-70"
                >
                  {status === 'scanning' ? 'Scanning...' : 'Start Scan'}
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
              <label htmlFor="max-pages" className="text-textSecondary">Max pages:</label>
              <select
                id="max-pages"
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="rounded-lg border border-deepSoft/25 bg-light px-2 py-2 text-deep"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <p className="mt-4 text-xs text-deepSoft">
              We scan key pages, group violations by severity, and prepare report-ready results.
            </p>

            {error && (
              <p className="mt-4 rounded-xl border border-danger/35 bg-danger/10 p-3 text-sm text-danger" role="alert">
                {error}
              </p>
            )}
            {notice && (
              <p className="mt-4 rounded-xl border border-deepSoft/35 bg-bgSecondary/25 p-3 text-sm text-deepSoft" role="status">
                {notice}
              </p>
            )}
          </GlassPanel>

          <GlassPanel className="p-5">
            <h3 className="text-sm font-semibold text-textPrimary">Scanner command flow</h3>
            <div className="mt-4 space-y-3">
              {[
                'Discover key website pages',
                'Audit WCAG issues with rule-based analysis',
                'Group findings by severity',
                'Generate AI-assisted remediation options',
                'Export report or move into dashboard',
              ].map((step, i) => (
                <div key={step} className="rounded-lg border border-secondary/15 bg-bg/50 px-3 py-3 text-sm text-textSecondary">
                  <span className="mr-2 text-xs text-secondary">{i + 1}</span>
                  {step}
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </Section>

      {(status === 'scanning' || (status === 'success' && result)) && (
      <Section className="rounded-3xl bg-bgSecondary/35 pt-6">
        {status === 'scanning' && (
          <GlassPanel className="p-5">
            <p className="text-sm font-semibold text-textPrimary">Live scan in progress</p>
            <div className="mt-3 h-2 rounded-full bg-surface">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
                aria-hidden
              />
            </div>
            <p className="mt-2 text-xs text-textSecondary">{progressPercent}% complete · {scanStages[stageIndex]}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-5">
              {scanStages.map((stage, index) => (
                <div
                  key={stage}
                  className={`rounded-lg border px-3 py-2 text-xs ${
                    index <= stageIndex
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : 'border-secondary/15 bg-bg/45 text-textSecondary'
                  }`}
                >
                  {stage}
                </div>
              ))}
            </div>
          </GlassPanel>
        )}

        {status === 'success' && result && (
          <GlassPanel className="p-5">
            <p className="text-sm font-semibold text-textPrimary">Scan summary</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-lg border border-secondary/15 bg-bg/55 p-3">
                <p className="text-xs text-textSecondary">Pages scanned</p>
                <p className="mt-1 font-display text-lg font-semibold text-textPrimary">{result.pages_scanned}</p>
              </div>
              <div className="rounded-lg border border-secondary/15 bg-bg/55 p-3">
                <p className="text-xs text-textSecondary">Total issues</p>
                <p className="mt-1 font-display text-lg font-semibold text-textPrimary">{result.total_violations}</p>
              </div>
            </div>

            <div className="mt-4 overflow-auto rounded-xl border border-secondary/20">
              <table className="w-full min-w-[740px] border-collapse">
                <thead className="bg-bgSecondary/28">
                  <tr className="text-left text-xs uppercase tracking-wider text-textSecondary">
                    <th className="px-4 py-3">Level</th>
                    <th className="px-4 py-3">Score Range</th>
                    <th className="px-4 py-3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {riskRows.map((row) => {
                    const count = getLevelCount(row.key)
                    const active = count > 0
                    return (
                      <tr
                        key={row.key}
                        className={`border-t ${active ? row.activeClass : 'border-secondary/15 bg-light/75 text-textPrimary'}`}
                      >
                        <td className="px-4 py-3 text-sm font-semibold">
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-current' : 'bg-textSecondary/55'}`}
                              aria-hidden
                            />
                            {row.level}
                            <span className="rounded-full border border-current/25 px-2 py-0.5 text-xs">
                              {count}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{row.range}</td>
                        <td className="px-4 py-3 text-sm">{row.description}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-warning">Report status: ready</p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="min-h-11 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-light shadow-glow"
              >
                Open Dashboard
              </button>
              <button
                type="button"
                onClick={handleDownloadReport}
                className="min-h-11 rounded-xl border border-secondary/30 bg-surface/70 px-4 py-2 text-sm font-semibold text-textPrimary"
              >
                Download Report
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="min-h-11 rounded-xl border border-secondary/30 bg-surface/70 px-4 py-2 text-sm font-semibold text-textPrimary"
              >
                Run Another Scan
              </button>
            </div>
          </GlassPanel>
        )}

      </Section>
      )}

      <Section
        eyebrow="What happens during a scan"
        title="Structured stages built for fast, reviewable outcomes"
        className="rounded-3xl bg-surface/25 pt-10"
      >
        <div className="grid gap-4 md:grid-cols-5">
          {[
            ['Intake', 'Validate URL and initialize scan context'],
            ['Discovery', 'Identify key pages and navigation paths'],
            ['Audit', 'Evaluate page content for WCAG issues'],
            ['Prioritization', 'Classify findings by severity and score'],
            ['Output', 'Prepare dashboard and report outputs'],
          ].map(([title, caption], idx) => (
            <div key={title} className="relative">
              <DiagramNode title={title} caption={caption} />
              {idx < 4 && <span className="absolute -right-2 top-1/2 hidden h-0.5 w-4 bg-secondary/35 md:block" aria-hidden />}
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="What you'll get" title="Everything needed to move from findings to implementation" className="rounded-3xl bg-light/70 pt-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ['▣', 'Severity-grouped violations', 'Clear prioritization for critical and high-risk accessibility issues.'],
            ['✦', 'AI fix previews', 'Before/after remediation suggestions with implementation context.'],
            ['⬚', 'PDF report', 'Exportable compliance summary for stakeholders and documentation.'],
            ['⇄', 'AI Ready workflow', 'Natural handoff into developer review and merge flow.'],
          ].map(([icon, title, copy]) => (
            <FeatureCard key={title} icon={icon} title={title} description={copy} />
          ))}
        </div>
      </Section>

      <CTASection />
    </div>
  )
}

export default ScanPage
