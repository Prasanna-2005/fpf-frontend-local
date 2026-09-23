import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from '../toastUtils'

describe('getApiErrorMessage', () => {
  it('turns the 0.C backend validation error into a toast-friendly message', () => {
    const error = {
      response: {
        status: 400,
        data: { message: ['fieldno 0: 0_C (reporting period end date) is compulsory'] },
      },
      config: { url: '/api/v1/edit/approved/123' },
    }

    expect(getApiErrorMessage(error)).toBe(
      'Unable to download the XML file. Reporting period end date (0.C) is compulsory.'
    )
  })

  it('falls back to the XML download message when the API body is not usable', () => {
    const error = {
      response: {
        status: 500,
        data: '<html>Internal Server Error</html>',
      },
      config: { url: '/api/v1/edit/approved/123' },
    }

    expect(getApiErrorMessage(error)).toBe('Unable to download the XML file. Please try again.')
  })
})
