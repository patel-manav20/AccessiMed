import PropTypes from 'prop-types'
import GlassPanel from '../ui/GlassPanel'

const levels = ['critical', 'high', 'medium', 'low']

function FilterPanel({
  search,
  onSearchChange,
  selectedSeverities,
  onToggleSeverity,
  pages,
  selectedPage,
  onPageChange,
  unresolvedOnly,
  onToggleUnresolved,
}) {
  return (
    <GlassPanel className="p-4">
      <h3 className="text-sm font-semibold text-textPrimary">Filters</h3>

      <div className="mt-4">
        <label htmlFor="dashboard-search" className="mb-1 block text-xs font-medium text-textSecondary">
          Search
        </label>
        <input
          id="dashboard-search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search rule, selector, or issue"
          className="min-h-11 w-full rounded-lg border border-secondary/20 bg-bg/55 px-3 text-sm text-textPrimary placeholder:text-textSecondary"
        />
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-textSecondary">Severity</p>
        <div className="flex flex-wrap gap-2">
          {levels.map((level) => {
            const active = selectedSeverities.includes(level)
            return (
              <button
                key={level}
                type="button"
                onClick={() => onToggleSeverity(level)}
                className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
                  active
                    ? 'border-secondary/50 bg-secondary/20 text-textPrimary'
                    : 'border-secondary/20 bg-bg/45 text-textSecondary hover:text-textPrimary'
                }`}
              >
                {level}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="page-filter" className="mb-1 block text-xs font-medium text-textSecondary">
          Page
        </label>
        <select
          id="page-filter"
          value={selectedPage}
          onChange={(e) => onPageChange(e.target.value)}
          className="min-h-11 w-full rounded-lg border border-secondary/20 bg-bg/55 px-3 text-sm text-textPrimary"
        >
          <option value="all">All pages</option>
          {pages.map((page) => (
            <option key={page} value={page}>{page}</option>
          ))}
        </select>
      </div>

      <label className="mt-4 flex cursor-pointer items-center justify-between rounded-lg border border-secondary/20 bg-bg/45 px-3 py-2 text-sm text-textSecondary">
        Unresolved only
        <input
          type="checkbox"
          checked={unresolvedOnly}
          onChange={(e) => onToggleUnresolved(e.target.checked)}
          className="h-4 w-4 rounded border-secondary/30 bg-bg"
        />
      </label>
    </GlassPanel>
  )
}

FilterPanel.propTypes = {
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  selectedSeverities: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggleSeverity: PropTypes.func.isRequired,
  pages: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedPage: PropTypes.string.isRequired,
  onPageChange: PropTypes.func.isRequired,
  unresolvedOnly: PropTypes.bool.isRequired,
  onToggleUnresolved: PropTypes.func.isRequired,
}

export default FilterPanel
