import PropTypes from 'prop-types'

function Section({ id, eyebrow, title, subtitle, children, className = '' }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-[1600px] px-5 py-20 sm:px-8 lg:px-12 2xl:px-16 ${className}`}>
      {(eyebrow || title || subtitle) && (
        <header className="mb-10 max-w-none">
          {eyebrow && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">{eyebrow}</p>}
          {title && <h2 className="font-display text-[clamp(1.4rem,2.4vw,2.1rem)] font-bold leading-snug text-textPrimary">{title}</h2>}
          {subtitle && <p className="mt-3 text-textSecondary">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  )
}

Section.propTypes = {
  id: PropTypes.string,
  eyebrow: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

Section.defaultProps = {
  id: undefined,
  eyebrow: '',
  title: '',
  subtitle: '',
  className: '',
}

export default Section
