export const ALLOWED_UPLOAD_EXTENSIONS = new Set(['xlsx', 'xls', 'pdf', 'zip'])

export const UPLOAD_ACCEPT = '.xlsx,.xls,.pdf,.zip'

export const UPLOAD_FORMATS_LABEL = 'XLSX, XLS, PDF, ZIP'

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function fileExtension(name) {
  const ext = name?.split('.').pop()?.toUpperCase()
  return ext || 'FILE'
}

export function getFileExtension(name) {
  return name?.split('.').pop()?.toLowerCase() || ''
}

export function isAllowedUploadFile(name) {
  return ALLOWED_UPLOAD_EXTENSIONS.has(getFileExtension(name))
}

export function fundRowKey(fund, index) {
  return [fund?.shortcode, fund?.quarter, fund?.period, index]
    .filter((part) => part !== undefined && part !== null && part !== '')
    .join('-')
}
