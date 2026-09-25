import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('vue-toast-notification', () => ({
  useToast: () => ({ error: vi.fn(), success: vi.fn(), open: vi.fn() }),
}))

import MapperComponent from '../Home/MapperComponent.vue'

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

describe('MapperComponent unmapped reason', () => {
  it('shows an info indicator only for files that are not mapped', async () => {
    const wrapper = mountMapper()
    const infoButtons = wrapper.findAll('.unmap-info')

    expect(infoButtons).toHaveLength(1)
    expect(wrapper.text()).toContain('alpha-q1.xlsx')
    expect(wrapper.find('.mapped-cell').find('.unmap-info').exists()).toBe(false)

    await infoButtons[0].trigger('mouseenter')

    expect(document.body.textContent).toContain('alpha-misc.xlsx was not mapped to Fund Alpha (Q2).')
    expect(document.body.textContent).toContain(quarterReason)

    wrapper.unmount()
  })

  it('explains leftover files when every expected slot is already mapped', async () => {
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

    const info = wrapper.get('.section-title .unmap-info')
    await info.trigger('mouseenter')
    expect(document.body.textContent).toContain('notes.xlsx')
    expect(document.body.textContent).toContain('recognized fund short code')
    wrapper.unmount()
  })
})
