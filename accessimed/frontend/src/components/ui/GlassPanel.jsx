import PropTypes from 'prop-types'

function GlassPanel({ children, className = '' }) {
  return <div className={`glass-panel rounded-2xl border border-deepSoft/20 shadow-panel ${className}`}>{children}</div>
}

GlassPanel.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

GlassPanel.defaultProps = {
  className: '',
}

export default GlassPanel
