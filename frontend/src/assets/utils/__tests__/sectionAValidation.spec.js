import { describe, expect, it } from 'vitest'
import { validateSectionA } from '../sectionAValidation'

function sectionAFund(overrides = {}) {
  return {
    fund_name: 'Fund One',
    fund_data: [
      {
        field_no: '0',
        field_text: 'Reporting period',
        field_data: [
          { line_item_no: '0_A', line_item_type: 'mcq', value: overrides.a ?? 'Annual' },
          { line_item_no: '0_B', line_item_type: 'mcq', value: overrides.b ?? '' },
          { line_item_no: '0_C', line_item_type: 'date', line_text: 'Reporting period end date', value: overrides.c ?? '2024-12-31' },
        ],
      },
      {
        field_no: '1',
        field_text: 'Item 1',
        field_data: [
          { line_item_no: '1_A', line_item_type: 'text', value: overrides.oneA ?? 'Complete A' },
          { line_item_no: '1_B', line_item_type: 'text', value: overrides.oneB ?? '' },
        ],
      },
      {
        field_no: '2',
        field_text: 'Item 2',
        field_data: [
          { line_item_no: '2_A', line_item_type: 'text', value: overrides.twoA ?? 'Complete A' },
          { line_item_no: '2_B', line_item_type: 'text', value: overrides.twoB ?? '' },
        ],
      },
    ],
  }
}

describe('validateSectionA', () => {
  it('passes when 0.A, 0.C, 1.A, and 2.A are complete', () => {
    expect(validateSectionA({ funds: [sectionAFund()] })).toEqual([])
  })

  it('requires 0.A or 0.B', () => {
    const errors = validateSectionA({ funds: [sectionAFund({ a: '', b: '' })] })
    expect(errors).toContain('Either 0.A or 0.B must be completed.')
  })

  it('requires 0.C reporting period end date', () => {
    const errors = validateSectionA({ funds: [sectionAFund({ c: '' })] })
    expect(errors).toContain('Reporting period end date (0.C) is compulsory.')
  })

  it('rejects a partially filled item 1 alternative', () => {
    const errors = validateSectionA({
      funds: [
        sectionAFund({
          oneA: '',
          oneB: '',
        }),
      ],
    })
    expect(errors).toContain('Either 1.A or 1.B must be completely filled.')
  })

  it('rejects a table that is only partially filled for item 1', () => {
    const fund = sectionAFund({ oneA: '', oneB: '' })
    fund.fund_data[1].field_data[0] = {
      line_item_no: '1_A',
      line_item_type: 'table',
      has_table_data: true,
      table_data: [{ 's.text': 'Name', legal: 'Acme', city: '' }],
    }
    const errors = validateSectionA({ funds: [fund] })
    expect(errors).toContain('Either 1.A or 1.B must be completely filled.')
  })

  it('accepts a completely filled item 1 table even when 1.B is empty', () => {
    const fund = sectionAFund({ oneA: '', oneB: '' })
    fund.fund_data[1].field_data[0] = {
      line_item_no: '1_A',
      line_item_type: 'table',
      has_table_data: true,
      table_data: [{ 's.text': 'Name', legal: 'Acme', city: 'NY' }],
    }
    expect(validateSectionA({ funds: [fund] })).toEqual([])
  })

  it('requires either 2.A or 2.B to be completely filled', () => {
    const errors = validateSectionA({ funds: [sectionAFund({ twoA: '', twoB: '' })] })
    expect(errors).toContain('Either 2.A or 2.B must be completely filled.')
  })

  it('skips funds that do not include Section A', () => {
    const errors = validateSectionA({
      funds: [{ fund_name: 'Hedge', fund_data: [{ field_no: '18', value: 'x' }] }],
    })
    expect(errors).toEqual([])
  })
})
