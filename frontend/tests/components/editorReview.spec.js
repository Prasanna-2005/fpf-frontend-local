import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/components/Editor/subcomponent/InputItemComponent.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('../../src/components/Editor/subcomponent/BooleanItemComponent.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('../../src/components/Editor/subcomponent/DropdownItemComponent.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('../../src/components/Editor/subcomponent/TableItemComponent.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('../../src/components/Editor/subcomponent/DateItemComponent.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('../../src/components/Editor/subcomponent/McqItemComponent.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('../../src/components/Editor/subcomponent/ExpandingTableItemComp.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('../../src/components/popUps/ChangesPopUp.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('../../src/components/popUps/compareSelectorPopUp.vue', () => ({
  default: { template: '<div />' },
}))
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import VueToast from 'vue-toast-notification'
import Editor from '../../src/components/Editor/editorComponent.vue'
import { useEditableStore } from '../../src/stores/responseStore'
import { useUserStore } from '../../src/stores/userStore'
import { getApiErrorMessage } from '../../src/assets/utils/toastUtils'

const get_reviews = vi.fn()
const accept_review = vi.fn()
const undo_review = vi.fn()

vi.mock('@/assets/api_calls/api_calls', () => ({
  default: {
    get_reviews: (...args) => get_reviews(...args),
    accept_review: (...args) => accept_review(...args),
    undo_review: (...args) => undo_review(...args),
    get_history: vi.fn().mockResolvedValue({ data: {} }),
    latest_changes: vi.fn().mockResolvedValue({ data: { count: 0, changes: [] } }),
  },
}))

function question(fieldNo, childNo) {
  return {
    field_no: fieldNo,
    field_text: `Question ${fieldNo}`,
    field_item_type: 'text',
    value: '',
    display_affix: '',
    disclaimer_text: '',
    has_table_data: false,
    field_data: [
      {
        line_item_no: childNo,
        line_item_type: 'text',
        line_text: 'Sub question',
        value: '',
        display_affix: '',
      },
    ],
  }
}

function reviewer(userId, name) {
  return {
    user_id: userId,
    user_name: name,
    reviewed_at: '2026-10-07T10:04:00Z',
  }
}

async function mountEditor() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const responseStore = useEditableStore()
  responseStore.setResponse({
    funds: [
      {
        fund_id: 'fund-1',
        fund_name: 'Alpha Fund',
        fund_data: [question('5', '5_a'), question('6', '6_a')],
      },
    ],
  })
  responseStore.setComputations({
    funds: [{ fund_id: 'fund-1', fund_name: 'Alpha Fund', fund_computation: [] }],
  })
  useUserStore().login({ userID: '12', username: 'Jane' })

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }],
  })

  const wrapper = mount(Editor, {
    props: { fundName: 'Alpha Fund', filingId: 'filing-1' },
    global: {
      plugins: [pinia, router, [VueToast, { position: 'top-right' }]],
      stubs: { 'font-awesome-icon': true },
    },
  })
  await flushPromises()
  return wrapper
}

describe('question review controls', () => {
  beforeEach(() => {
    get_reviews.mockReset()
    accept_review.mockReset()
    undo_review.mockReset()
    get_reviews.mockResolvedValue({
      data: {
        reviews: [
          {
            field_no: '5',
            reviewed_by_me: true,
            reviewers: [reviewer('12', 'Jane'), reviewer('99', 'Alex')],
          },
          {
            field_no: '6',
            reviewed_by_me: false,
            reviewers: [reviewer('99', 'Alex')],
          },
        ],
      },
    })
  })

  it('shows Accept or Reviewed on questions only and lists reviewers', async () => {
    const wrapper = mountEditor()
    const view = await wrapper

    expect(get_reviews).toHaveBeenCalledWith('12', 'filing-1', 'fund-1')
    const blocks = view.findAll('.q-block')
    expect(blocks).toHaveLength(2)
    expect(blocks[0].find('.review-done').exists()).toBe(true)
    expect(blocks[0].text()).toContain('Reviewed')
    expect(blocks[1].find('.review-accept').text()).toBe('Accept')
    expect(view.findAll('.child-row .review-accept')).toHaveLength(0)
    expect(view.findAll('.child-row .review-done')).toHaveLength(0)

    await blocks[0].get('.review-count').trigger('click')
    expect(view.text()).toContain('You')
    expect(view.text()).toContain('Alex')
    expect(blocks[0].get('.review-undo').attributes('title')).toBe('Undo my review')
  })

  it('undo removes only the current user review', async () => {
    undo_review.mockResolvedValue({
      data: {
        field_no: '5',
        reviewed_by_me: false,
        reviewers: [reviewer('99', 'Alex')],
      },
    })
    const view = await mountEditor()

    await view.findAll('.q-block')[0].get('.review-undo').trigger('click')
    await flushPromises()

    expect(undo_review).toHaveBeenCalledWith('12', 'filing-1', 'fund-1', '5')
    const first = view.findAll('.q-block')[0]
    expect(first.find('.review-accept').text()).toBe('Accept')
    expect(first.find('.review-done').exists()).toBe(false)
  })

  it('shows Reviewed before the accept request finishes', async () => {
    let resolveAccept
    accept_review.mockReturnValue(new Promise((resolve) => {
      resolveAccept = resolve
    }))
    const view = await mountEditor()
    const question = view.findAll('.q-block')[1]

    await question.get('.review-accept').trigger('click')
    expect(question.text()).toContain('Reviewed')
    expect(accept_review).toHaveBeenCalledWith('12', 'filing-1', 'fund-1', '6')

    resolveAccept({
      data: {
        field_no: '6',
        reviewed_by_me: true,
        reviewers: [reviewer('99', 'Alex'), reviewer('12', 'Jane')],
      },
    })
    await flushPromises()
    expect(question.text()).toContain('Reviewed')
    expect(question.text()).toContain('2')
  })

  it('restores Accept when the review request fails', async () => {
    accept_review.mockRejectedValue({
      response: { status: 400, data: { message: 'you have not reviewed this question' } },
    })
    const view = await mountEditor()
    const question = view.findAll('.q-block')[1]

    await question.get('.review-accept').trigger('click')
    await flushPromises()

    expect(question.find('.review-accept').text()).toBe('Accept')
    expect(question.find('.review-done').exists()).toBe(false)
  })

  it('puts the button back to Reviewed when undo fails and the server still has the review', async () => {
    accept_review.mockResolvedValue({
      data: {
        field_no: '6',
        reviewed_by_me: true,
        reviewers: [reviewer('12', 'Jane')],
      },
    })
    undo_review.mockRejectedValue({
      response: { status: 400, data: { message: 'you have not reviewed this question' } },
    })
    get_reviews
      .mockResolvedValueOnce({
        data: {
          reviews: [
            {
              field_no: '6',
              reviewed_by_me: false,
              reviewers: [reviewer('99', 'Alex')],
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          reviews: [
            {
              field_no: '6',
              reviewed_by_me: true,
              reviewers: [reviewer('12', 'Jane')],
            },
          ],
        },
      })
    const view = await mountEditor()
    const question = view.findAll('.q-block')[1]

    await question.get('.review-accept').trigger('click')
    await flushPromises()
    expect(question.text()).toContain('Reviewed')

    await question.get('.review-undo').trigger('click')
    await flushPromises()

    expect(question.find('.review-done').exists()).toBe(true)
    expect(question.find('.review-accept').exists()).toBe(false)
  })

  it('maps review API failures separately from save errors', () => {
    const error = {
      response: { status: 500, data: { message: 'Internal Sever Error. Please reach out to your admin' } },
      config: { url: '/api/v1/submissions/filing-1/reviews' },
    }
    const message = getApiErrorMessage(error)
    expect(message).toContain('Unable to update the review.')
    expect(message).not.toContain('Unable to save your changes.')
  })
})
