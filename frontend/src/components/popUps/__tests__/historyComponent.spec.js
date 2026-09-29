import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HistoryComponent from '../historyComponent.vue'

const stubs = { 'font-awesome-icon': true }

function entry(value, lineText) {
  return {
    value,
    line_text: lineText,
    is_current_value: true,
    created_by: 'John',
    created_at: '2026-06-10T13:07:00Z',
  }
}

describe('historyComponent selectors', () => {
  it('uses a question dropdown for non-table questions', async () => {
    const wrapper = mount(HistoryComponent, {
      props: {
        fieldNo: '5',
        fieldType: 'text',
        hasTableData: false,
        fieldData: {
          '5_b': [entry('123', 'Fund id')],
          '5_a': [entry('Alpha Fund', 'Fund name')],
          '5_c_i': [entry('Yes', 'CFTC fund')],
        },
      },
      global: { stubs },
    })

    expect(wrapper.text()).not.toContain('Row')
    const select = wrapper.get('select')
    const labels = select.findAll('option').map((option) => option.text())
    expect(labels[0]).toContain('Q5(a)')
    expect(labels[0]).toContain('Fund Name')
    expect(wrapper.text()).toContain('Alpha Fund')

    await select.setValue('5_b')
    expect(wrapper.text()).toContain('123')
    expect(wrapper.text()).toContain('Fund Id')
  })

  it('uses row and column dropdowns for table questions', async () => {
    const netKey = '17_(a)_Net_of_management_fees_and_incentive_fees_and_allocation'
    const wrapper = mount(HistoryComponent, {
      props: {
        fieldNo: '17',
        fieldType: 'text',
        hasTableData: true,
        fieldData: {
          '17_(a)_last_day_of_fiscal_period': [entry('2026-01-31', "1st month of reporting fund's fiscal year")],
          '17_(a)_gross_performance': [entry('1.2', "1st month of reporting fund's fiscal year")],
          [netKey]: [entry('NA', "1st month of reporting fund's fiscal year")],
          '17_(b)_Net_of_management_fees_and_incentive_fees_and_allocation': [entry('2.0', '2nd month')],
        },
      },
      global: { stubs },
    })

    const selects = wrapper.findAll('select')
    expect(selects).toHaveLength(2)
    expect(wrapper.text()).toContain('Row')
    expect(wrapper.text()).toContain('Column')

    const rows = selects[0].findAll('option').map((option) => option.text())
    expect(rows).toEqual(['A', 'B'])

    await selects[1].setValue('Net_of_management_fees_and_incentive_fees_and_allocation')
    expect(wrapper.text()).toContain(
      'A · Net Of Management Fees And Incentive Fees And Allocation · Question 17'
    )
    expect(wrapper.text()).toContain('NA')
    expect(wrapper.text()).toContain("1st Month Of Reporting Fund's Fiscal Year")

    await selects[0].setValue('(b)')
    expect(wrapper.text()).toContain('B · Net Of Management Fees And Incentive Fees And Allocation · Question 17')
    expect(wrapper.text()).toContain('2.0')
  })
})
