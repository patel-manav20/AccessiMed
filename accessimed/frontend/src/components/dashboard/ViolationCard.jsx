import PropTypes from 'prop-types'
import SeverityBadge from './SeverityBadge'

const accentMap = {
  critical: 'border-l-danger',
  high: 'border-l-warning',
  medium: 'border-l-secondary',
  low: 'border-l-success',
}

function ViolationCard({ violation, onViewDetails, onCopySelector, onGenerateFix }) {
  return (
    <article className={`rounded-xl border border-secondary/20 bg-bg/55 p-4 shadow-panel transition hover:-translate-y-0.5 ${accentMap[violation.severity] || accentMap.low} border-l-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={violation.severity} />
          <span className="font-mono text-xs text-textSecondary">{violation.ruleId}</span>
        </div>
        <div className="flex gap-2">
          <button type="button" className="rounded-md border border-secondary/25 px-2 py-1 text-xs text-textSecondary hover:text-textPrimary" onClick={() => onViewDetails(violation)}>
            View Details
          </button>
          <button type="button" className="rounded-md border border-secondary/25 px-2 py-1 text-xs text-textSecondary hover:text-textPrimary" onClick={() => onGenerateFix(violation)}>
            AI Fix Preview
          </button>
          <button type="button" className="rounded-md border border-secondary/25 px-2 py-1 text-xs text-textSecondary hover:text-textPrimary" onClick={() => onCopySelector(violation.target)}>
            Copy Selector
          </button>
        </div>
      </div>
      <h3 className="mt-3 text-base font-semibold text-textPrimary">{violation.title}</h3>
      <p className="mt-1 text-sm text-textSecondary">{violation.description}</p>
      <p className="mt-2 text-xs text-textSecondary">Page: {violation.pageUrl}</p>
      <p className="mt-1 font-mono text-xs text-textSecondary">{violation.target}</p>
      <pre className="mt-3 overflow-auto rounded-lg border border-secondary/20 bg-surface/85 p-3 font-mono text-xs text-textPrimary">
        {violation.snippet}
      </pre>
    </article>
  )
}

ViolationCard.propTypes = {
  violation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    severity: PropTypes.string.isRequired,
    ruleId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    pageUrl: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired,
    snippet: PropTypes.string.isRequired,
  }).isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onCopySelector: PropTypes.func.isRequired,
  onGenerateFix: PropTypes.func.isRequired,
}

export default ViolationCard
