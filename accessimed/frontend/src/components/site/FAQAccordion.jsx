import { useState } from 'react'
import PropTypes from 'prop-types'
import GlassPanel from '../ui/GlassPanel'

function FAQAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(-1)

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <GlassPanel key={item.q}>
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-4 text-left"
            onClick={() => setOpenIndex((current) => (current === idx ? -1 : idx))}
            aria-expanded={openIndex === idx}
          >
            <span className="font-semibold text-textPrimary">{item.q}</span>
            <span className="text-secondary">{openIndex === idx ? '−' : '+'}</span>
          </button>
          {openIndex === idx && <p className="px-4 pb-4 text-sm text-textSecondary">{item.a}</p>}
        </GlassPanel>
      ))}
    </div>
  )
}

FAQAccordion.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      q: PropTypes.string.isRequired,
      a: PropTypes.string.isRequired,
    }),
  ).isRequired,
}

export default FAQAccordion
