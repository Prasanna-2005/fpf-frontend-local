import { describe, expect, it } from 'vitest'
import { describeUnmappedSlot, manualUnmapReason } from '../unmappedReason'

const quarterReason =
  'The file name matches Fund Alpha (FSAE), but it does not include a recognizable reporting quarter (use a year and month such as 2024-03).'

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
      reason: manualUnmapReason(
        { fundname: 'Fund Alpha', shortcode: 'FSAE', quarter: 'Q1' },
        'Private Investors'
      ),
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

    expect(removedSlot).toContain('removed from the Fund Alpha (Q1) mapping')
    expect(otherSlot).not.toContain('was not mapped to Fund Alpha (Q2)')
    expect(otherSlot).toContain('Other uploaded files were not mapped')
  })
})
