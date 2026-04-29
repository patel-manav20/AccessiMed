import PropTypes from 'prop-types'

function PillBadge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-deepSoft/25 bg-light/85 px-3 py-1 text-xs font-medium text-deepSoft">
      {children}
    </span>
  )
}

PillBadge.propTypes = {
  children: PropTypes.node.isRequired,
}

export default PillBadge
