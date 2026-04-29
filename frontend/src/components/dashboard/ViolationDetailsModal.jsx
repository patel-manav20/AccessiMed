import PropTypes from 'prop-types'
import SeverityBadge from './SeverityBadge'

function ViolationDetailsModal({ violation, onClose }) {
  if (!violation) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Violation details">
      <div className="glass-panel w-full max-w-3xl rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <SeverityBadge severity={violation.severity} />
              <span className="font-mono text-xs text-textSecondary">{violation.ruleId}</span>
              <span className="rounded-full border border-secondary/20 px-2 py-0.5 text-xs text-textSecondary">
                Score {violation.severityScore}
              </span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold text-textPrimary">{violation.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-secondary/25 px-3 py-2 text-sm text-textSecondary hover:text-textPrimary">
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-secondary/20 bg-bg/55 p-4">
            <p className="text-xs uppercase tracking-wider text-textSecondary">Description</p>
            <p className="mt-2 text-sm text-textPrimary">{violation.description}</p>
          </div>
          <div className="rounded-xl border border-secondary/20 bg-bg/55 p-4">
            <p className="text-xs uppercase tracking-wider text-textSecondary">Why it matters</p>
            <p className="mt-2 text-sm text-textPrimary">{violation.whyItMatters}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-secondary/20 bg-bg/55 p-4">
          <p className="text-xs uppercase tracking-wider text-textSecondary">Target and page</p>
          <p className="mt-2 font-mono text-xs text-textPrimary">{violation.target}</p>
          <p className="mt-1 text-xs text-textSecondary">{violation.pageUrl}</p>
          <p className="mt-3 text-sm text-textSecondary">{violation.helpText}</p>
          {violation.helpUrl && (
            <a
              href={violation.helpUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-sm font-medium text-primary underline decoration-primary/40 underline-offset-4"
            >
              Open rule guidance
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

ViolationDetailsModal.propTypes = {
  violation: PropTypes.shape({
    severity: PropTypes.string,
    severityScore: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ruleId: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    whyItMatters: PropTypes.string,
    target: PropTypes.string,
    pageUrl: PropTypes.string,
    helpText: PropTypes.string,
    helpUrl: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
}

ViolationDetailsModal.defaultProps = {
  violation: null,
}

export default ViolationDetailsModal
