import PropTypes from 'prop-types'

const severityStyles = {
  critical: 'border-danger/45 bg-danger/15 text-danger',
  high: 'border-warning/45 bg-warning/14 text-warning',
  medium: 'border-secondary/40 bg-secondary/12 text-secondary',
  low: 'border-success/35 bg-success/10 text-success',
}

function SeverityBadge({ severity }) {
  const normalized = String(severity || 'low').toLowerCase()
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${severityStyles[normalized] || severityStyles.low}`}>
      {normalized}
    </span>
  )
}

SeverityBadge.propTypes = {
  severity: PropTypes.string.isRequired,
}

export default SeverityBadge
