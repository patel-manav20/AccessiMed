import { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'

function NewsCarousel({ items }) {
  const scrollerRef = useRef(null)
  const cardRefs = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocusWithin, setIsFocusWithin] = useState(false)
  const isAutoPlayEnabled = true
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const canAutoplay = useMemo(
    () => isAutoPlayEnabled && !isHovered && !isFocusWithin && !prefersReducedMotion,
    [isAutoPlayEnabled, isHovered, isFocusWithin, prefersReducedMotion],
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePref = () => setPrefersReducedMotion(media.matches)
    updatePref()
    media.addEventListener('change', updatePref)
    return () => media.removeEventListener('change', updatePref)
  }, [])

  const scrollToIndex = (index) => {
    const safeIndex = ((index % items.length) + items.length) % items.length
    const container = scrollerRef.current
    const target = cardRefs.current[safeIndex]
    if (!target || !container) return
    const left = target.offsetLeft - container.offsetLeft
    container.scrollTo({
      left,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
    setActiveIndex(safeIndex)
  }

  useEffect(() => {
    if (!canAutoplay) return undefined
    const timer = setInterval(() => scrollToIndex(activeIndex + 1), 60000)
    return () => clearInterval(timer)
  }, [canAutoplay, activeIndex, items.length])

  useEffect(() => {
    const container = scrollerRef.current
    if (!container) return undefined
    const onScroll = () => {
      const containerLeft = container.getBoundingClientRect().left
      let closest = 0
      let minDistance = Number.POSITIVE_INFINITY
      cardRefs.current.forEach((card, idx) => {
        if (!card) return
        const distance = Math.abs(card.getBoundingClientRect().left - containerLeft)
        if (distance < minDistance) {
          minDistance = distance
          closest = idx
        }
      })
      setActiveIndex(closest)
    }
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="relative"
      aria-roledescription="carousel"
      aria-label="Recent U.S. Government Updates"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocusWithin(true)}
      onBlurCapture={() => setIsFocusWithin(false)}
    >
      <div
        ref={scrollerRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3"
      >
        {items.map((item, idx) => (
          <article
            key={item.id}
            ref={(el) => {
              cardRefs.current[idx] = el
            }}
            className={`glass-panel section-ring w-full shrink-0 snap-start rounded-2xl p-6 transition lg:w-[88%] ${
              activeIndex === idx ? 'bg-light/85 shadow-glow' : 'bg-bgSecondary/55 shadow-panel'
            }`}
            aria-label={`Update ${idx + 1} of ${items.length}`}
          >
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-secondary/30 bg-secondary/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-textSecondary">
                {item.tag}
              </span>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                {item.agency}
              </span>
            </div>
            <p className="text-xs text-textSecondary">{item.date}</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-textPrimary">{item.title}</h3>
            <p className="mt-3 max-w-3xl text-sm text-textSecondary">{item.summary}</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="rounded-md border border-secondary/25 bg-bg/55 px-2 py-1 text-[11px] text-textSecondary">
                .gov source
              </span>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-light hover:bg-deepSoft"
              >
                {item.cta}
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <div className="flex gap-2">
          {items.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToIndex(idx)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                activeIndex === idx ? 'bg-primary' : 'bg-secondary/45'
              }`}
              aria-label={`Go to update ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

NewsCarousel.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      agency: PropTypes.string.isRequired,
      tag: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      summary: PropTypes.string.isRequired,
      cta: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
    }),
  ).isRequired,
}

export default NewsCarousel
