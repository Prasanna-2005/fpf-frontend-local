import { describe, expect, it } from 'vitest'
import { dedupeStoredFiles, describeUnmappedSlot, displayFileName } from '../unmappedReason'

const quarterReason =
  'The file name matches Fund Alpha (FSAE), but it does not include a recognizable reporting quarter (use a year and month such as 2024-03).'

describe('displayFileName', () => {
  it('drops the storage uuid prefix and collapses copies of the same file', () => {
    const org = '1. FSAAEM-FSAAEM~^investors20251231 capital register_palbreakout~.xls'
    const first = `4259c335-fc4d-4e21-b28d-8d87250cdb05_quantrium_${org}`
    const second = `ee1fd554-cb6b-4201-b109-f4c9a0938d0f_quantrium_${org}`

    expect(displayFileName(first)).toBe(org)

    const files = dedupeStoredFiles([
      { filename: first, reason: 'older copy' },
      { filename: second, reason: 'newer copy' },
      { filename: 'notes.xlsx', reason: 'different file' },
    ])

    expect(files).toHaveLength(2)
    expect(files[0].filename).toBe(org)
    expect(files[0].reason).toBe('newer copy')
    expect(files[1].filename).toBe('notes.xlsx')
  })
})

describe('describeUnmappedSlot', () => {
  it('explains an empty slot when nothing was uploaded for that fund', () => {
    const text = describeUnmappedSlot(
      { fundname: 'Fund Alpha', shortcode: 'FSAE', quarter: 'Q2' },
      [],
      'Private Investors'
    )

    expect(text).toBe('No uploaded file matched Fund Alpha for Q2.')
    expect(text).not.toMatch(/file not mapped/i)
  })

  it('shows the backend reason for a file recognized as that fund', () => {
    const text = describeUnmappedSlot(
      { fundname: 'Fund Alpha', shortcode: 'FSAE', quarter: 'Q2' },
      [
        {
          filename: 'alpha-misc.xlsx',
          shortcode: 'FSAE',
          reason: quarterReason,
        },
      ],
      'Private Investors'
    )

    expect(text).toContain('alpha-misc.xlsx was not mapped to Fund Alpha (Q2).')
    expect(text).toContain(quarterReason)
  })

  it('keeps unrelated file reasons available from the same mapping status', () => {
    const text = describeUnmappedSlot(
      { fundname: 'Fund Alpha', shortcode: 'FSAE', quarter: 'Q1' },
      [
        {
          filename: 'notes.xlsx',
          reason:
            'The file name does not include a recognized fund short code or fund name, so it could not be matched to a fund.',
        },
      ],
      'Private Investors'
    )

    expect(text).toContain('No uploaded file matched Fund Alpha for Q1.')
    expect(text).toContain('notes.xlsx')
    expect(text).toContain('recognized fund short code')
  })

  it('includes the Curio period in the slot label', () => {
    const text = describeUnmappedSlot(
      { fundname: 'Curio One', shortcode: 'CUR', quarter: 'Capital Register', period: 'march' },
      [],
      'Curio'
    )

    expect(text).toBe('No uploaded file matched Curio One for Capital Register (march).')
  })

  it('limits a manually removed file to the slot it was removed from', () => {
    const removed = {
      filename: 'alpha-q1.xlsx',
      shortcode: 'FSAE',
      quarter: 'Q1',
      period: null,
      manuallyUnmapped: true,
      reason: quarterReason,
    }

    const removedSlot = describeUnmappedSlot(
      { fundname: 'Fund Alpha', shortcode: 'FSAE', quarter: 'Q1', period: null },
      [removed],
      'Private Investors'
    )
    const otherSlot = describeUnmappedSlot(
      { fundname: 'Fund Alpha', shortcode: 'FSAE', quarter: 'Q2', period: null },
      [removed],
      'Private Investors'
    )

    expect(removedSlot).toContain(quarterReason)
    expect(otherSlot).not.toContain('was not mapped to Fund Alpha (Q2)')
    expect(otherSlot).toContain('Other uploaded files were not mapped')
  })
})
