import { isEmptyValue, normalizeValue } from './formatValue'

const HIDDEN_TABLE_KEYS = new Set(['s.name', 's.computationType'])

export function diffValue(valA, valB, meta = {}) {
  const forceStatus = meta.forceStatus
  if (forceStatus === 'added' || forceStatus === 'removed') {
    return { status: forceStatus, valueA: valA ?? '', valueB: valB ?? '' }
  }

  const aEmpty = isEmptyValue(valA)
  const bEmpty = isEmptyValue(valB)
  if (aEmpty && bEmpty) {
    return { status: 'unchanged', valueA: valA ?? '', valueB: valB ?? '' }
  }
  if (aEmpty && !bEmpty) {
    return { status: 'added', valueA: valA ?? '', valueB: valB }
  }
  if (!aEmpty && bEmpty) {
    return { status: 'removed', valueA: valA, valueB: valB ?? '' }
  }

  const same = normalizeValue(valA) === normalizeValue(valB)
  return {
    status: same ? 'unchanged' : 'changed',
    valueA: valA,
    valueB: valB,
  }
}

export function matchFunds(fundsA, fundsB) {
  const listA = Array.isArray(fundsA) ? fundsA : []
  const listB = Array.isArray(fundsB) ? fundsB : []
  const usedB = new Set()
  const matched = []
  const onlyInA = []

  for (const fundA of listA) {
    let idx = -1
    if (fundA?.fund_id) {
      idx = listB.findIndex(
        (fundB, i) => !usedB.has(i) && fundB?.fund_id && fundB.fund_id === fundA.fund_id
      )
    }
    if (idx < 0 && fundA?.fund_name) {
      idx = listB.findIndex(
        (fundB, i) => !usedB.has(i) && fundB?.fund_name === fundA.fund_name
      )
    }
    if (idx >= 0) {
      usedB.add(idx)
      matched.push({ a: fundA, b: listB[idx] })
    } else {
      onlyInA.push(fundA)
    }
  }

  return {
    matched,
    onlyInA,
    onlyInB: listB.filter((_, i) => !usedB.has(i)),
  }
}

export function matchFields(fieldDataA, fieldDataB) {
  return matchByKey(fieldDataA, fieldDataB, (item) => item?.field_no)
}

export function matchSubItems(fieldDataAItem, fieldDataBItem) {
  const listA = fieldDataAItem?.field_data || []
  const listB = fieldDataBItem?.field_data || []
  return matchByKey(listA, listB, (item) => item?.line_item_no)
}

export function matchTableRows(tableDataA, tableDataB) {
  const listA = Array.isArray(tableDataA) ? tableDataA : []
  const listB = Array.isArray(tableDataB) ? tableDataB : []
  const usedB = new Set()
  const matched = []
  const onlyInA = []

  for (const rowA of listA) {
    const nameA = rowA?.['s.name']
    let idx = -1
    if (!isEmptyValue(nameA)) {
      idx = listB.findIndex(
        (rowB, i) => !usedB.has(i) && !isEmptyValue(rowB?.['s.name']) && rowB['s.name'] === nameA
      )
    }
    if (idx >= 0) {
      usedB.add(idx)
      matched.push({ a: rowA, b: listB[idx], lowConfidence: false })
    } else {
      onlyInA.push(rowA)
    }
  }

  const leftoverA = []
  const leftoverBIndexes = listB.map((_, i) => i).filter((i) => !usedB.has(i))
  let leftoverCursor = 0
  for (const rowA of onlyInA) {
    if (leftoverCursor < leftoverBIndexes.length) {
      const idx = leftoverBIndexes[leftoverCursor]
      usedB.add(idx)
      leftoverCursor += 1
      matched.push({ a: rowA, b: listB[idx], lowConfidence: true })
    } else {
      leftoverA.push(rowA)
    }
  }

  return {
    matched,
    onlyInA: leftoverA,
    onlyInB: listB.filter((_, i) => !usedB.has(i)),
  }
}

export function diffFilings(fundsA, fundsB) {
  const { matched, onlyInA, onlyInB } = matchFunds(fundsA, fundsB)
  const funds = []

  for (const pair of matched) {
    funds.push(diffFund(pair.a, pair.b, 'matched'))
  }
  for (const fund of onlyInA) {
    funds.push(diffFund(fund, null, 'onlyInA'))
  }
  for (const fund of onlyInB) {
    funds.push(diffFund(null, fund, 'onlyInB'))
  }

  return { funds }
}

function matchByKey(listA, listB, keyFn) {
  const a = Array.isArray(listA) ? listA : []
  const b = Array.isArray(listB) ? listB : []
  const usedB = new Set()
  const matched = []
  const onlyInA = []

  for (const itemA of a) {
    const key = keyFn(itemA)
    const idx = key
      ? b.findIndex((itemB, i) => !usedB.has(i) && keyFn(itemB) === key)
      : -1
    if (idx >= 0) {
      usedB.add(idx)
      matched.push({ a: itemA, b: b[idx] })
    } else {
      onlyInA.push(itemA)
    }
  }

  return {
    matched,
    onlyInA,
    onlyInB: b.filter((_, i) => !usedB.has(i)),
  }
}

function forceStatusForSide(presence) {
  if (presence === 'onlyInA') return 'removed'
  if (presence === 'onlyInB') return 'added'
  return null
}

function diffFund(fundA, fundB, presence) {
  const source = fundA || fundB
  const fieldsA = fundA?.fund_data || []
  const fieldsB = fundB?.fund_data || []
  const forceStatus = forceStatusForSide(presence)
  const { matched, onlyInA, onlyInB } = matchFields(fieldsA, fieldsB)
  const fields = []

  for (const pair of matched) {
    fields.push(diffField(pair.a, pair.b, forceStatus))
  }
  for (const field of onlyInA) {
    fields.push(diffField(field, null, forceStatus || 'removed'))
  }
  for (const field of onlyInB) {
    fields.push(diffField(null, field, forceStatus || 'added'))
  }

  return {
    fund_id: source?.fund_id || '',
    fund_name: source?.fund_name || '',
    presence,
    fields,
  }
}

function diffField(fieldA, fieldB, forceStatus) {
  const source = fieldA || fieldB
  const expTableField = isExpTable(fieldA, fieldB)
  const valueDiff = expTableField
    ? { status: forceStatus || 'unchanged', valueA: fieldA?.value ?? '', valueB: fieldB?.value ?? '' }
    : diffValue(fieldA?.value, fieldB?.value, { forceStatus })
  const subItems = diffSubItems(fieldA, fieldB, forceStatus)
  const table = diffTable(
    fieldA?.table_data,
    fieldB?.table_data,
    fieldA?.table_metadata || fieldB?.table_metadata,
    forceStatus
  )
  const expTable = isExpTable(fieldA, fieldB)
    ? diffExpTable(
        fieldA?.value,
        fieldB?.value,
        fieldA?.table_headers || fieldB?.table_headers || [],
        forceStatus
      )
    : null

  return {
    field_no: source?.field_no || '',
    field_text: source?.field_text || '',
    field_heading: source?.field_heading || 'Other',
    field_item_type: source?.field_item_type || '',
    has_field_item_text: Boolean(source?.has_field_item_text),
    has_table_data: Boolean(source?.has_table_data || table.rows.length),
    display_affix: source?.display_affix || '',
    table_metadata: source?.table_metadata || {},
    status: rollupStatus([
      expTableField ? null : valueDiff.status,
      ...subItems.map((item) => item.status),
      table.status,
      expTable?.status,
    ]),
    value: valueDiff,
    subItems,
    table,
    expTable,
  }
}

function diffSubItems(fieldA, fieldB, forceStatus) {
  const { matched, onlyInA, onlyInB } = matchSubItems(fieldA || {}, fieldB || {})
  const items = []

  for (const pair of matched) {
    items.push(diffLineItem(pair.a, pair.b, forceStatus))
  }
  for (const item of onlyInA) {
    items.push(diffLineItem(item, null, forceStatus || 'removed'))
  }
  for (const item of onlyInB) {
    items.push(diffLineItem(null, item, forceStatus || 'added'))
  }
  return items
}

function diffLineItem(itemA, itemB, forceStatus) {
  const source = itemA || itemB
  const expTableItem = isExpTable(itemA, itemB)
  const valueDiff = expTableItem
    ? { status: forceStatus || 'unchanged', valueA: itemA?.value ?? '', valueB: itemB?.value ?? '' }
    : diffValue(itemA?.value, itemB?.value, { forceStatus })
  const table = diffTable(
    itemA?.table_data,
    itemB?.table_data,
    itemA?.table_metadata || itemB?.table_metadata,
    forceStatus
  )
  const expTable = isExpTable(itemA, itemB)
    ? diffExpTable(
        itemA?.value,
        itemB?.value,
        itemA?.table_headers || itemB?.table_headers || [],
        forceStatus
      )
    : null

  return {
    line_item_no: source?.line_item_no || '',
    line_text: source?.line_text || '',
    line_item_type: source?.line_item_type || '',
    display_affix: source?.display_affix || '',
    status: rollupStatus([expTableItem ? null : valueDiff.status, table.status, expTable?.status]),
    value: valueDiff,
    table,
    expTable,
  }
}

function tableColumns(tableA, tableB) {
  const rows = [
    ...(Array.isArray(tableA) ? tableA : []),
    ...(Array.isArray(tableB) ? tableB : []),
  ]
  const columns = []
  const seen = new Set()
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    for (const key of Object.keys(row)) {
      if (HIDDEN_TABLE_KEYS.has(key) || seen.has(key)) continue
      seen.add(key)
      columns.push(key)
    }
  }
  return columns
}

function diffTable(tableA, tableB, metadata, forceStatus) {
  const { matched, onlyInA, onlyInB } = matchTableRows(tableA, tableB)
  const columns = tableColumns(tableA, tableB)
  const rows = []

  for (const pair of matched) {
    rows.push(diffTableRow(pair.a, pair.b, columns, metadata, forceStatus, pair.lowConfidence))
  }
  for (const row of onlyInA) {
    rows.push(diffTableRow(row, null, columns, metadata, forceStatus || 'removed', false))
  }
  for (const row of onlyInB) {
    rows.push(diffTableRow(null, row, columns, metadata, forceStatus || 'added', false))
  }

  return {
    columns,
    metadata: metadata || {},
    rows,
    status: rollupStatus(rows.map((row) => row.status)),
  }
}

function diffTableRow(rowA, rowB, columns, metadata, forceStatus, lowConfidence) {
  const source = rowA || rowB || {}
  const cells = {}
  for (const col of columns) {
    cells[col] = diffValue(rowA?.[col], rowB?.[col], { forceStatus })
  }
  return {
    name: source['s.name'] || '',
    lowConfidence: Boolean(lowConfidence),
    status: rollupStatus(Object.values(cells).map((cell) => cell.status)),
    cells,
  }
}

function parseExpTable(value) {
  if (Array.isArray(value)) return value
  try {
    const parsed = JSON.parse(value || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return null
  }
}

function isExpTable(itemA, itemB) {
  const type = itemA?.field_item_type || itemA?.line_item_type || itemB?.field_item_type || itemB?.line_item_type
  return type === 'exp_table'
}

function diffExpTable(valueA, valueB, headers, forceStatus) {
  const rowsA = parseExpTable(valueA)
  const rowsB = parseExpTable(valueB)

  if (rowsA === null || rowsB === null) {
    const scalar = diffValue(valueA, valueB, { forceStatus })
    return {
      headers: headers || [],
      rows: [],
      scalar,
      status: scalar.status,
    }
  }

  const maxLen = Math.max(rowsA.length, rowsB.length)
  const colCount = Math.max(
    headers?.length || 0,
    ...rowsA.map((row) => (Array.isArray(row) ? row.length : 0)),
    ...rowsB.map((row) => (Array.isArray(row) ? row.length : 0)),
    0
  )
  const rows = []
  for (let i = 0; i < maxLen; i += 1) {
    const rowA = rowsA[i]
    const rowB = rowsB[i]
    let rowForce = forceStatus
    if (!rowForce) {
      if (rowA == null && rowB != null) rowForce = 'added'
      if (rowA != null && rowB == null) rowForce = 'removed'
    }
    const cells = []
    for (let col = 0; col < colCount; col += 1) {
      cells.push(diffValue(rowA?.[col], rowB?.[col], { forceStatus: rowForce }))
    }
    rows.push({
      status: rollupStatus(cells.map((cell) => cell.status)),
      cells,
    })
  }

  return {
    headers: headers || [],
    rows,
    scalar: null,
    status: rollupStatus(rows.map((row) => row.status)),
  }
}

function rollupStatus(statuses) {
  const present = statuses.filter(Boolean)
  if (present.includes('changed')) return 'changed'
  if (present.includes('added') && present.includes('removed')) return 'changed'
  if (present.includes('added')) return 'added'
  if (present.includes('removed')) return 'removed'
  return 'unchanged'
}
