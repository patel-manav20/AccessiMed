import PropTypes from 'prop-types'
import GlassPanel from '../ui/GlassPanel'

function UtilityPanel({ metadata, onDownloadReport }) {
  return (
    <div className="space-y-4">
      <GlassPanel className="p-4">
        <h3 className="text-sm font-semibold text-textPrimary">Scan metadata</h3>
        <dl className="mt-3 space-y-2 text-xs">
          <div className="flex justify-between gap-2">
            <dt className="text-textSecondary">Scanned site</dt>
            <dd className="max-w-[180px] truncate text-textPrimary">{metadata.siteUrl}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-textSecondary">Last scan</dt>
            <dd className="text-textPrimary">{metadata.scannedAt}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-textSecondary">Status</dt>
            <dd className="text-warning">{metadata.status}</dd>
          </div>
        </dl>
      </GlassPanel>

      <GlassPanel className="p-4">
        <h3 className="text-sm font-semibold text-textPrimary">Actions</h3>
        <div className="mt-3 space-y-2">
          <button type="button" onClick={onDownloadReport} className="min-h-10 w-full rounded-lg border border-secondary/25 bg-bg/55 px-3 text-sm text-textPrimary">
            Download Report
          </button>
        </div>
      </GlassPanel>

      <GlassPanel className="p-4">
        <h3 className="text-sm font-semibold text-textPrimary">Compliance notes</h3>
        <p className="mt-2 text-xs text-textSecondary">
          Focus on unresolved critical and high issues first, then rerun the scan before report export.
        </p>
      </GlassPanel>
    </div>
  )
}

UtilityPanel.propTypes = {
  metadata: PropTypes.shape({
    siteUrl: PropTypes.string.isRequired,
    scannedAt: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onDownloadReport: PropTypes.func.isRequired,
}

export default UtilityPanel
