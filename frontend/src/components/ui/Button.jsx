import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

function Button({ to, children, variant = 'primary' }) {
  const base =
    'inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary'
  const styles =
    variant === 'primary'
      ? 'bg-primary text-light shadow-glow hover:bg-deepSoft'
      : 'border border-deep/30 bg-light/75 text-deep hover:border-deep/60 hover:bg-bgSecondary/70'
  return (
    <Link to={to} className={`${base} ${styles}`}>
      {children}
    </Link>
  )
}

Button.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary']),
}

export default Button
