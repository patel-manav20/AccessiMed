import PropTypes from 'prop-types'
import GlassPanel from '../ui/GlassPanel'

function DashboardSummaryCard({ label, value, tone = 'default' }) {
  const toneClasses = {
    default: 'text-textPrimary',
    critical: 'text-danger',
    high: 'text-warning',
    medium: 'text-secondary',
    low: 'text-success',
  }

  return (
    <GlassPanel className="p-4">
      <p className="text-xs uppercase tracking-wider text-textSecondary">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${toneClasses[tone] || toneClasses.default}`}>{value}</p>
    </GlassPanel>
  )
}

DashboardSummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tone: PropTypes.oneOf(['default', 'critical', 'high', 'medium', 'low']),
}

export default DashboardSummaryCard
