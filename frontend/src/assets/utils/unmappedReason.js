export function slotLabel(fund, series) {
  const typeOrQuarter = fund?.quarter || 'this file type'
  if (series === 'Curio' && fund?.period) {
    return `${typeOrQuarter} (${fund.period})`
  }
  return typeOrQuarter
}

export function manualUnmapReason(fund, series) {
  const fundName = fund?.fundname || 'this fund'
  return `This file was removed from the ${fundName} (${slotLabel(fund, series)}) mapping. Select it again to map the file.`
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
