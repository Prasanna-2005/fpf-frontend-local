const AVATAR_COLORS = ['blue', 'teal', 'purple', 'pink', 'indigo', 'cyan', 'amber', 'rose']

export function normalizeStatus(status) {
  const s = String(status || '')
    .toLowerCase()
    .trim()
  if (s === 'in review') return 'review'
  return s
}

export function statusClass(status) {
  const s = normalizeStatus(status)
  if (s === 'approved') return 'approved'
  if (s === 'review') return 'review'
  if (s === 'archived') return 'archived'
  return 'draft'
}

export function statusLabel(status) {
  const s = normalizeStatus(status)
  if (s === 'review') return 'Review'
  if (!status) return 'Draft'
  return status
}

export function matchesStatusFilter(status, selected) {
  if (!selected || selected === 'all') return true
  return normalizeStatus(status) === normalizeStatus(selected)
}

export function getInitials(name) {
  if (!name) return '?'
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function avatarColor(name) {
  const str = String(name || '')
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.codePointAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function padCount(n) {
  return String(n).padStart(2, '0')
}

export function formatFilingDate(timestamp) {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function computeFilingStats(list = []) {
  return {
    total: list.length,
    approved: list.filter((i) => normalizeStatus(i.filingStatus) === 'approved').length,
    review: list.filter((i) => normalizeStatus(i.filingStatus) === 'review').length,
    draft: list.filter((i) => normalizeStatus(i.filingStatus) === 'draft').length,
    archived: list.filter((i) => normalizeStatus(i.filingStatus) === 'archived').length,
  }
}
