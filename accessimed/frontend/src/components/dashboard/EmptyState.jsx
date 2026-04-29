import PropTypes from 'prop-types'
import GlassPanel from '../ui/GlassPanel'

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <GlassPanel className="p-8 text-center">
      <h3 className="font-display text-xl font-semibold text-textPrimary">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-textSecondary">{description}</p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="mt-5 min-h-11 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-light">
          {actionLabel}
        </button>
      )}
    </GlassPanel>
  )
}

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
}

EmptyState.defaultProps = {
  actionLabel: '',
  onAction: null,
}

export default EmptyState
