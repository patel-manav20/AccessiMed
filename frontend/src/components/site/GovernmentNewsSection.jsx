import Section from '../ui/Section'
import NewsCarousel from './NewsCarousel'
import { newsItems } from '../../data/newsItems'

function GovernmentNewsSection() {
  return (
    <Section
      id="government-updates"
      eyebrow="Official U.S. Government Updates"
      title="The problem we solve is now backed by active federal accessibility rules"
      subtitle="AccessiMed helps healthcare teams respond faster to rising accessibility and compliance pressure."
      className="site-grid rounded-3xl bg-surface/22"
    >
      <NewsCarousel items={newsItems} />
    </Section>
  )
}

export default GovernmentNewsSection
