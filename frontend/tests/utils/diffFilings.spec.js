import { describe, expect, it } from 'vitest'
import { diffFilings, diffValue, matchFunds, matchTableRows } from '../../src/assets/utils/diffFilings'

describe('diffValue', () => {
  it('treats null, undefined, and blank as equivalent', () => {
    expect(diffValue(null, '').status).toBe('unchanged')
    expect(diffValue(undefined, '  ').status).toBe('unchanged')
  })

  it('coerces numeric strings', () => {
    expect(diffValue('10', 10).status).toBe('unchanged')
    expect(diffValue('10', '11').status).toBe('changed')
  })
})

describe('matchFunds', () => {
  it('matches by fund_id even when names differ', () => {
    const result = matchFunds(
      [{ fund_id: '1', fund_name: 'A' }],
      [{ fund_id: '1', fund_name: 'A renamed' }]
    )
    expect(result.matched).toHaveLength(1)
    expect(result.onlyInA).toHaveLength(0)
    expect(result.onlyInB).toHaveLength(0)
  })

  it('does not use fund count to relate filings', () => {
    const result = matchFunds(
      [{ fund_id: '1', fund_name: 'A' }],
      [{ fund_id: '2', fund_name: 'B' }, { fund_id: '3', fund_name: 'C' }]
    )
    expect(result.matched).toHaveLength(0)
    expect(result.onlyInA).toHaveLength(1)
    expect(result.onlyInB).toHaveLength(2)
  })
})

describe('matchTableRows', () => {
  it('matches by s.name and falls back to index', () => {
    const named = matchTableRows(
      [{ 's.name': 'cash', amount: '1' }],
      [{ 's.name': 'cash', amount: '2' }]
    )
    expect(named.matched[0].lowConfidence).toBe(false)

    const positional = matchTableRows(
      [{ amount: '1' }],
      [{ amount: '2' }]
    )
    expect(positional.matched[0].lowConfidence).toBe(true)
  })
})

describe('diffFilings', () => {
  it('flags added, removed, and changed funds/fields', () => {
    const result = diffFilings(
      [
        {
          fund_id: '1',
          fund_name: 'Fund A',
          fund_data: [
            { field_no: '5', field_text: 'Name', has_field_item_text: true, value: 'Alpha' },
            { field_no: '8', field_text: 'AUM', has_field_item_text: true, value: '100' },
          ],
        },
      ],
      [
        {
          fund_id: '1',
          fund_name: 'Fund A',
          fund_data: [
            { field_no: '5', field_text: 'Name', has_field_item_text: true, value: 'Alpha' },
            { field_no: '9', field_text: 'Investors', has_field_item_text: true, value: '3' },
          ],
        },
        {
          fund_id: '2',
          fund_name: 'Fund B',
          fund_data: [{ field_no: '5', field_text: 'Name', has_field_item_text: true, value: 'Beta' }],
        },
      ]
    )

    expect(result.funds).toHaveLength(2)
    const matched = result.funds.find((fund) => fund.presence === 'matched')
    expect(matched.fields.find((field) => field.field_no === '5').status).toBe('unchanged')
    expect(matched.fields.find((field) => field.field_no === '8').status).toBe('removed')
    expect(matched.fields.find((field) => field.field_no === '9').status).toBe('added')
    expect(result.funds.some((fund) => fund.presence === 'onlyInB')).toBe(true)
  })

  it('compares columns that appear on a later row or only on the other filing', () => {
    const result = diffFilings(
      [
        {
          fund_id: '1',
          fund_name: 'Fund A',
          fund_data: [
            {
              field_no: '1',
              has_table_data: true,
              table_data: [
                { 's.name': 'cash', amount: '100' },
                { 's.name': 'equity', amount: '50', cost: '40' },
              ],
            },
          ],
        },
      ],
      [
        {
          fund_id: '1',
          fund_name: 'Fund A',
          fund_data: [
            {
              field_no: '1',
              has_table_data: true,
              table_data: [
                { 's.name': 'cash', amount: '100', currency: 'USD' },
                { 's.name': 'equity', amount: '50', cost: '45' },
              ],
            },
          ],
        },
      ]
    )

    const table = result.funds[0].fields[0].table
    expect(table.columns).toEqual(['amount', 'cost', 'currency'])
    const cash = table.rows.find((row) => row.name === 'cash')
    const equity = table.rows.find((row) => row.name === 'equity')
    expect(cash.cells.currency.status).toBe('added')
    expect(equity.cells.cost.status).toBe('changed')
    expect(table.status).toBe('changed')
  })
})
