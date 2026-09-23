export function isEmptyValue(value) {
  return value === null || value === undefined || String(value).trim() === ''
}

export function normalizeValue(value) {
  if (isEmptyValue(value)) return ''
  if (typeof value === 'number' && !Number.isNaN(value)) return String(value)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed !== '' && !Number.isNaN(Number(trimmed))) {
      return String(Number(trimmed))
    }
    return trimmed
  }
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export function formatValue(value, symbol, field = '') {
  if (field === 'Institution code') return value
  const num = Number(value)
  if (Number.isNaN(num)) return value
  if (num == 0) return value

  if (symbol === 'Dollar') {
    const absoluteNum = Math.abs(num)
    const formatted = absoluteNum.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
    return `$ ${formatted}`
  }

  if (symbol === 'Percentage') {
    return `${num} %`
  }
  return `${num}`
}
