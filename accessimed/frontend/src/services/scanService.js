import axios from 'axios'

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 45000,
})

const severityKeys = ['critical', 'high', 'medium', 'low']

const ruleTitles = {
  'image-alt': 'Image missing alt text',
  label: 'Form control missing label',
  'button-name': 'Button missing accessible name',
  'link-name': 'Link missing accessible name',
  'html-has-lang': '<html> missing lang attribute',
  'color-contrast': 'Text contrast fails WCAG AA',
  'duplicate-id': 'Duplicate id attribute',
  'duplicate-id-aria': 'Duplicate id used by ARIA or labels',
}

function normalizeSeverity(value, impact) {
  const raw = String(value || '').trim().toLowerCase()
  if (severityKeys.includes(raw)) return raw

  const impactValue = String(impact || '').trim().toLowerCase()
  if (impactValue === 'critical') return 'critical'
  if (impactValue === 'serious') return 'high'
  if (impactValue === 'moderate') return 'medium'
  return 'low'
}

function summarizeBySeverity(violations) {
  return violations.reduce(
    (acc, violation) => {
      const key = normalizeSeverity(violation.severity, violation.impact)
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    { critical: 0, high: 0, medium: 0, low: 0 },
  )
}

function toViolationModel(violation) {
  const severity = normalizeSeverity(violation.severity, violation.impact)
  const title = ruleTitles[violation.rule_id] || violation.description || violation.rule_id || 'Accessibility issue'

  return {
    id: String(violation.id),
    violationId: violation.id,
    ruleId: violation.rule_id,
    severity,
    severityLabel: String(violation.severity || severity).trim() || severity,
    severityScore: violation.severity_score ?? 0,
    impact: String(violation.impact || '').toLowerCase(),
    title,
    description: violation.description || 'Accessibility issue detected.',
    helpText: violation.help_text || 'Review WCAG guidance and apply an accessible markup fix.',
    helpUrl: violation.help_url || '',
    pageUrl: violation.page_url || 'Unknown page',
    target: Array.isArray(violation.target) ? violation.target.join(', ') : violation.target || 'unknown-selector',
    snippet: violation.html || '<div>Issue source unavailable</div>',
    rawHtml: violation.html || '',
    fixes: Array.isArray(violation.fixes) ? violation.fixes : [],
  }
}

function mapScanError(error) {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string' && detail.trim().length > 0) return detail
  if (error?.code === 'ECONNABORTED') return 'Scan timed out. Please retry with a reachable public URL.'
  if (!error?.response) return 'Unable to reach the scanning service. Check that the backend is running.'
  if (error?.response?.status >= 500) return 'The scanning service is temporarily unavailable. Please retry shortly.'
  return 'Unable to start this scan right now. Verify the URL and try again.'
}

async function scanWebsite({ url, maxPages = 5 }) {
  try {
    const { data } = await api.post('/scans', { url, max_pages: maxPages })
    const violations = Array.isArray(data?.violations) ? data.violations.map(toViolationModel) : []

    return {
      scan_id: data?.id || `scan-${Date.now()}`,
      site_url: data?.url || url,
      scanned_at: data?.updated_at || data?.created_at || new Date().toISOString(),
      status: data?.status || 'completed',
      pages_scanned: data?.pages_scanned ?? maxPages,
      total_violations: data?.total_violations ?? violations.length,
      severity_counts: summarizeBySeverity(data?.violations || []),
      violations,
      report_ready: Boolean(data?.report_url),
      report_url: data?.report_url || null,
      source: 'api',
    }
  } catch (error) {
    throw new Error(mapScanError(error))
  }
}

async function getReportBlob(scanId) {
  const response = await api.get(`/scans/${scanId}/report`, {
    responseType: 'blob',
    timeout: 30000,
  })
  return response.data
}

async function getSingleFix(violationId) {
  const { data } = await api.post('/fixes/single', { violation_id: violationId }, { timeout: 30000 })
  return data
}

export { API_URL, getReportBlob, getSingleFix, scanWebsite }
