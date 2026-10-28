import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HistoryComponent from '../../src/components/popUps/historyComponent.vue'

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
    expect(labels[0]).toContain('Fund name')
    expect(select.findAll('option')[0].attributes('title')).toBe('Q5(a)  Fund name')
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

    const rowOptions = selects[0].findAll('option')
    expect(rowOptions[0].text()).toContain('A')
    expect(rowOptions[0].text()).toContain("1st month of reporting fund's fiscal year")
    expect(rowOptions[0].attributes('title')).toContain("1st month of reporting fund's fiscal year")
    expect(rowOptions[1].text()).toContain('B')
    expect(rowOptions[1].text()).toContain('2nd month')

    await selects[1].setValue('Net_of_management_fees_and_incentive_fees_and_allocation')
    expect(wrapper.text()).toContain(
      'A · Net Of Management Fees And Incentive Fees And Allocation · Question 17'
    )
    expect(wrapper.text()).toContain('NA')
    expect(wrapper.text()).toContain("1st Month Of Reporting Fund'S Fiscal Year")

    await selects[0].setValue('(b)')
    expect(wrapper.text()).toContain('B · Net Of Management Fees And Incentive Fees And Allocation · Question 17')
    expect(wrapper.text()).toContain('2.0')
  })

  it('lists source files for extracted values and hides them for manual edits', async () => {
    const wrapper = mount(HistoryComponent, {
      props: {
        fieldNo: '8',
        fieldType: 'text',
        hasTableData: false,
        fieldData: {
          8: [
            {
              value: '100',
              line_text: 'Gross assets',
              is_current_value: true,
              created_by: 'Jane',
              created_at: '2026-06-10T13:07:00Z',
              source_files: ['tb.xlsx', 'unfunded.xlsx'],
              manually_edited: false,
            },
            {
              value: '90',
              line_text: 'Gross assets',
              is_current_value: false,
              created_by: 'Jane',
              created_at: '2026-06-09T13:07:00Z',
              source_files: [],
              manually_edited: true,
            },
          ],
        },
      },
      global: { stubs },
    })

    const filesBtn = wrapper.get('.files-btn')
    expect(filesBtn.text()).toContain('Files')
    await filesBtn.trigger('click')
    const names = wrapper.findAll('.files-popover li').map((li) => li.text())
    expect(names).toEqual(['tb.xlsx', 'unfunded.xlsx'])

    const items = wrapper.findAll('.timeline-item')
    expect(items[1].text()).toContain('(Edited)')
    expect(items[1].find('.files-btn').exists()).toBe(false)
  })
})
