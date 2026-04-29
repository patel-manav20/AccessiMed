import PropTypes from 'prop-types'
import SeverityBadge from './SeverityBadge'

function FixModal({ violation, fix, loading, onClose, onRegenerate, onCopy }) {
  if (!violation) return null
  const confidencePercent = fix
    ? Math.round((Number(fix.confidence) > 1 ? Number(fix.confidence) : Number(fix.confidence || 0) * 100))
    : 0

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="AI fix preview">
      <div className="glass-panel w-full max-w-5xl rounded-2xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-secondary">AI Fix Preview</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <SeverityBadge severity={violation.severity} />
              <span className="font-mono text-xs text-textSecondary">{violation.ruleId}</span>
              <span className="rounded-full border border-secondary/20 px-2 py-0.5 text-xs text-textSecondary">
                Score {violation.severityScore}
              </span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold text-textPrimary">{violation.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-secondary/25 px-3 py-2 text-sm text-textSecondary">
            Close
          </button>
        </div>

        {loading ? (
          <div className="mt-6 rounded-xl border border-secondary/20 bg-bg/50 p-6 text-sm text-textSecondary">
            Generating remediation suggestion...
          </div>
        ) : fix ? (
          <>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-textSecondary">Original code</p>
                <pre className="min-h-44 overflow-auto rounded-xl border border-secondary/20 bg-bg/70 p-4 font-mono text-xs text-danger">{fix.original_html}</pre>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-textSecondary">Fixed code</p>
                <pre className="min-h-44 overflow-auto rounded-xl border border-secondary/20 bg-bg/70 p-4 font-mono text-xs text-warning">{fix.fixed_html}</pre>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <p className="rounded-lg border border-secondary/20 bg-surface/70 p-3 text-sm text-textSecondary">
                {fix.explanation}
              </p>
              <div className="rounded-lg border border-secondary/20 bg-surface/70 px-3 py-3 text-sm text-textSecondary">
                Provider
                <div className="mt-1 font-semibold text-textPrimary">{fix.provider}</div>
              </div>
              <div className="rounded-lg border border-secondary/20 bg-surface/70 px-3 py-3 text-sm text-textSecondary">
                Confidence
                <div className="mt-1 font-semibold text-textPrimary">{confidencePercent}%</div>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-secondary/20 bg-bg/50 p-6 text-sm text-textSecondary">
            No remediation preview is available for this finding yet.
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fix && onCopy(fix.fixed_html)}
            disabled={!fix}
            className="rounded-lg border border-secondary/30 px-3 py-2 text-sm text-textPrimary disabled:opacity-50"
          >
            Copy Fix
          </button>
          <button type="button" onClick={onRegenerate} className="rounded-lg border border-secondary/30 px-3 py-2 text-sm text-textPrimary">
            Regenerate
          </button>
          <span className="inline-flex items-center rounded-lg bg-bgSecondary/55 px-3 py-2 text-sm text-textSecondary">
            Apply directly in your codebase through the CLI or local-code API flow.
          </span>
        </div>
      </div>
    </div>
  )
}

FixModal.propTypes = {
  violation: PropTypes.shape({
    title: PropTypes.string,
    ruleId: PropTypes.string,
    severity: PropTypes.string,
    severityScore: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  fix: PropTypes.shape({
    provider: PropTypes.string,
    original_html: PropTypes.string,
    fixed_html: PropTypes.string,
    explanation: PropTypes.string,
    confidence: PropTypes.number,
  }),
  loading: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onRegenerate: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
}

FixModal.defaultProps = {
  violation: null,
  fix: null,
}

export default FixModal
