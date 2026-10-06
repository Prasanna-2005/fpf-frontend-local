import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('vue-toast-notification', () => ({
  useToast: () => ({ error: vi.fn(), success: vi.fn(), open: vi.fn() }),
}))

import MapperComponent from '../../src/components/Home/MapperComponent.vue'

const quarterReason =
  'The file name matches Fund Alpha (FSAE), but it does not include a recognizable reporting quarter (use a year and month such as 2024-03).'

function mountMapper() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(MapperComponent, {
    props: {
      data: {
        series: 'Private Investors',
        fund_details: [
          { fundname: 'Fund Alpha', shortcode: 'FSAE', quarter: 'Q1' },
          { fundname: 'Fund Alpha', shortcode: 'FSAE', quarter: 'Q2' },
        ],
        file_mappings: [
          {
            fundname: 'Fund Alpha',
            shortcode: 'FSAE',
            quarter: 'Q1',
            filename: 'alpha-q1.xlsx',
            filepath: '/alpha-q1.xlsx',
          },
        ],
        unmapped_files: [
          {
            filename: 'alpha-misc.xlsx',
            shortcode: 'FSAE',
            fundname: 'Fund Alpha',
            reason: quarterReason,
          },
        ],
      },
    },
    attachTo: document.body,
    global: {
      plugins: [pinia],
      stubs: {
        FontAwesomeIcon: { template: '<i />' },
      },
    },
  })
}

describe('MapperComponent unmapped files', () => {
  it('lists unmapped files and reasons beside the mapped files view', async () => {
    const wrapper = mountMapper()

    expect(wrapper.find('.unmap-info').exists()).toBe(false)
    expect(wrapper.text()).toContain('Mapped Files')
    expect(wrapper.text()).toContain('Unmapped Files')
    expect(wrapper.text()).toContain('alpha-q1.xlsx')
    expect(wrapper.text()).not.toContain(quarterReason)

    await wrapper.get('[data-testid="unmapped-tab"]').trigger('click')

    const panel = wrapper.get('[data-testid="unmapped-panel"]')
    expect(panel.text()).toContain('alpha-misc.xlsx')
    expect(panel.text()).toContain(quarterReason)
    expect(panel.text()).not.toContain('alpha-q1.xlsx')

    wrapper.unmount()
  })

  it('lists leftover files when every expected slot is already mapped', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(MapperComponent, {
      props: {
        data: {
          series: 'Private Investors',
          fund_details: [{ fundname: 'Fund Alpha', shortcode: 'FSAE', quarter: 'Q1' }],
          file_mappings: [
            {
              fundname: 'Fund Alpha',
              shortcode: 'FSAE',
              quarter: 'Q1',
              filename: 'alpha-q1.xlsx',
              filepath: '/alpha-q1.xlsx',
            },
          ],
          unmapped_files: [
            {
              filename: 'notes.xlsx',
              reason:
                'The file name does not include a recognized fund short code or fund name, so it could not be matched to a fund.',
            },
          ],
        },
      },
      attachTo: document.body,
      global: {
        plugins: [pinia],
        stubs: { FontAwesomeIcon: { template: '<i />' } },
      },
    })

    await wrapper.get('[data-testid="unmapped-tab"]').trigger('click')
    const panel = wrapper.get('[data-testid="unmapped-panel"]')
    expect(panel.text()).toContain('notes.xlsx')
    expect(panel.text()).toContain('recognized fund short code')
    wrapper.unmount()
  })

  it('lists one row when stored copies share an original filename', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const org = '1. FSAAEM-FSAAEM~^investors20251231 capital register_palbreakout~.xls'
    const wrapper = mount(MapperComponent, {
      props: {
        data: {
          series: 'Curio',
          fund_details: [],
          file_mappings: [],
          unmapped_files: [
            {
              filename: `ee1fd554-cb6b-4201-b109-f4c9a0938d0f_quantrium_${org}`,
              reason: 'It does not match an expected file type.',
            },
            {
              filename: `4259c335-fc4d-4e21-b28d-8d87250cdb05_quantrium_${org}`,
              reason: 'It does not match an expected file type.',
            },
          ],
        },
      },
      global: {
        plugins: [pinia],
        stubs: { FontAwesomeIcon: { template: '<i />' } },
      },
    })

    await wrapper.get('[data-testid="unmapped-tab"]').trigger('click')
    const panel = wrapper.get('[data-testid="unmapped-panel"]')
    expect(panel.text()).toContain(org)
    expect(panel.text()).not.toContain('4259c335')
    expect(panel.text()).not.toContain('_quantrium_')
    expect(panel.findAll('tbody tr')).toHaveLength(1)
    wrapper.unmount()
  })
})
