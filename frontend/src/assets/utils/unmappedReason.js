const storagePrefix =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_quantrium_/i

export function displayFileName(name) {
  const base = String(name || '')
    .split(/[/\\]/)
    .pop()
  return base.replace(storagePrefix, '')
}

export function dedupeStoredFiles(files) {
  const seen = new Map()
  for (const file of files || []) {
    const record = typeof file === 'string' ? { filename: file } : { ...file }
    const filename = displayFileName(record.filename || record.volfilename || '')
    const key = filename.toLowerCase()
    if (!key) continue
    record.filename = filename
    seen.set(key, record)
  }
  return [...seen.values()]
}

export function dedupeMappings(files) {
  const seen = new Map()
  for (const file of files || []) {
    const filename = displayFileName(file.filename || file.volfilename || '')
    const key = [file.shortcode || '', file.quarter || '', file.period ?? '', filename.toLowerCase()].join('|')
    if (!filename) continue
    seen.set(key, { ...file, filename })
  }
  return [...seen.values()]
}

export function slotLabel(fund, series) {
  const typeOrQuarter = fund?.quarter || 'this file type'
  if (series === 'Curio' && fund?.period) {
    return `${typeOrQuarter} (${fund.period})`
  }
  return typeOrQuarter
}

function fileLabel(file) {
  return file?.filename || file?.volfilename || 'Uploaded file'
}

function isRelatedUnmappedFile(file, fund) {
  if (!file?.reason || !file?.shortcode || !fund?.shortcode) return false
  if (String(file.shortcode) !== String(fund.shortcode)) return false
  if (file.manuallyUnmapped) {
    return (
      String(file.quarter || '') === String(fund.quarter || '') &&
      String(file.period ?? '') === String(fund.period ?? '')
    )
  }
  return true
}

export function describeUnmappedSlot(fund, unmappedFiles, series) {
  const files = Array.isArray(unmappedFiles) ? unmappedFiles : []
  const fundName = fund?.fundname || 'this fund'
  const slot = slotLabel(fund, series)
  const related = files.filter((file) => isRelatedUnmappedFile(file, fund))
  const others = files.filter((file) => file?.reason && !related.includes(file))
  const lines = []

  if (related.length === 1) {
    lines.push(`${fileLabel(related[0])} was not mapped to ${fundName} (${slot}).`)
    lines.push(related[0].reason)
  } else if (related.length > 1) {
    lines.push(`These files were not mapped to ${fundName} (${slot}):`)
    for (const file of related) {
      lines.push(`${fileLabel(file)}: ${file.reason}`)
    }
  } else {
    lines.push(`No uploaded file matched ${fundName} for ${slot}.`)
  }

  if (others.length) {
    lines.push('Other uploaded files were not mapped:')
    for (const file of others) {
      lines.push(`${fileLabel(file)}: ${file.reason}`)
    }
  }

  return lines.join('\n')
}
