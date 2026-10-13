import { isEmptyValue } from './formatValue'

const HIDDEN_TABLE_KEYS = new Set(['s.name', 's.computationType', 's.text'])

const MESSAGES = {
  q0ab: 'Either 0.A or 0.B must be completed.',
  q0c: 'Reporting period end date (0.C) is compulsory.',
  q1: 'Either 1.A or 1.B must be completely filled.',
  q2: 'Either 2.A or 2.B must be completely filled.',
}

function normalizeItemNo(value) {
  return String(value || '')
    .trim()
    .replace(/[.\-]/g, '_')
    .toUpperCase()
}

function prefixMessage(fundName, withFundPrefix, message) {
  if (withFundPrefix && fundName) return `${fundName}: ${message}`
  return message
}

function indexItems(fields) {
  const map = {}

  for (const field of fields || []) {
    const fieldNo = normalizeItemNo(field?.field_no)
    if (fieldNo) map[fieldNo] = field

    for (const item of field?.field_data || []) {
      const lineNo = normalizeItemNo(item?.line_item_no)
      if (!lineNo) continue
      map[lineNo] = item
      if (fieldNo && !lineNo.includes('_')) {
        map[`${fieldNo}_${lineNo}`] = item
      }
    }
  }

  return map
}

function hasSectionA(items) {
  return Boolean(
    items['0'] ||
      items['0_A'] ||
      items['0_B'] ||
      items['0_C'] ||
      items['1'] ||
      items['1_A'] ||
      items['1_B'] ||
      items['2'] ||
      items['2_A'] ||
      items['2_B']
  )
}

function isAnswerableType(type) {
  if (!type) return true
  return type !== 'NULL'
}

function isTableCompletelyFilled(table) {
  if (!Array.isArray(table) || table.length === 0) return false

  return table.every((row) => {
    if (!row || typeof row !== 'object') return false
    const keys = Object.keys(row).filter((key) => !HIDDEN_TABLE_KEYS.has(key))
    if (!keys.length) return false
    return keys.every((key) => !isEmptyValue(row[key]))
  })
}

function isExpTableCompletelyFilled(value) {
  if (!Array.isArray(value) || value.length === 0) return false
  return value.every((row) => {
    if (!Array.isArray(row) || row.length === 0) return false
    return row.every((cell) => !isEmptyValue(cell))
  })
}

function hasScalarValue(item) {
  return !isEmptyValue(item?.value)
}

/**
 * True when the user has provided any answer (selection or value).
 * Used for 0.A / 0.B, which only need to be selected/completed.
 */
export function isItemSelected(item) {
  if (!item) return false
  if (hasScalarValue(item)) return true
  if (Array.isArray(item.table_data) && item.table_data.length) {
    return item.table_data.some((row) =>
      Object.entries(row || {}).some(
        ([key, cell]) => !HIDDEN_TABLE_KEYS.has(key) && !isEmptyValue(cell)
      )
    )
  }
  if (Array.isArray(item.field_data) && item.field_data.length) {
    return item.field_data.some(isItemSelected)
  }
  return false
}

/**
 * True only when every answerable part of the item is filled.
 * Used for 1.A/1.B and 2.A/2.B.
 */
export function isItemCompletelyFilled(item) {
  if (!item) return false

  const type = item.field_item_type || item.line_item_type
  if (!isAnswerableType(type) && !item.has_table_data && !item.field_data?.length) {
    return true
  }

  if (Array.isArray(item.field_data) && item.field_data.length) {
    const answerable = item.field_data.filter((child) =>
      isAnswerableType(child.line_item_type)
    )
    if (answerable.length) return answerable.every(isItemCompletelyFilled)
  }

  if (item.has_table_data || (Array.isArray(item.table_data) && item.table_data.length)) {
    return isTableCompletelyFilled(item.table_data)
  }

  if (type === 'exp_table') {
    return isExpTableCompletelyFilled(item.value)
  }

  if (type === 'NULL' && !item.has_field_item_text) return true

  return hasScalarValue(item)
}

function normalizeFunds(data) {
  if (!data) return []

  if (Array.isArray(data)) {
    return data.map((fund) => ({
      name: fund?.fund_name || '',
      fields: fund?.fund_data || [],
    }))
  }

  if (Array.isArray(data.funds)) {
    return data.funds.map((fund) => ({
      name: fund?.fund_name || '',
      fields: fund?.fund_data || [],
    }))
  }

  if (typeof data === 'object') {
    return Object.entries(data).map(([name, fields]) => ({
      name,
      fields: Array.isArray(fields) ? fields : fields?.fund_data || [],
    }))
  }

  return []
}

function validateFundSectionA(fields, fundName, withFundPrefix) {
  const items = indexItems(fields)
  if (!hasSectionA(items)) return []

  const errors = []
  const msg = (message) => prefixMessage(fundName, withFundPrefix, message)

  if (!isItemSelected(items['0_A']) && !isItemSelected(items['0_B'])) {
    errors.push(msg(MESSAGES.q0ab))
  }

  if (!isItemSelected(items['0_C'])) {
    errors.push(msg(MESSAGES.q0c))
  }

  if (!isItemCompletelyFilled(items['1_A']) && !isItemCompletelyFilled(items['1_B'])) {
    errors.push(msg(MESSAGES.q1))
  }

  if (!isItemCompletelyFilled(items['2_A']) && !isItemCompletelyFilled(items['2_B'])) {
    errors.push(msg(MESSAGES.q2))
  }

  return errors
}

/**
 * Returns user-facing Section A validation errors.
 * Empty array means the filing may be sent to the approver.
 */
export function validateSectionA(data) {
  const funds = normalizeFunds(data).filter((fund) => (fund.fields || []).length)
  const sectionAFunds = funds.filter((fund) => hasSectionA(indexItems(fund.fields)))
  const withFundPrefix = sectionAFunds.length > 1

  return sectionAFunds.flatMap((fund) =>
    validateFundSectionA(fund.fields, fund.name, withFundPrefix)
  )
}

export const SECTION_A_MESSAGES = MESSAGES
