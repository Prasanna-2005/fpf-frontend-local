/**
 * Shared helpers for themed toast notifications.
 */
import { useToast } from 'vue-toast-notification'

const VARIANT_CLASS = {
  primary: 'pf-toast-btn--primary',
  secondary: 'pf-toast-btn--secondary',
  danger: 'pf-toast-btn--danger',
  success: 'pf-toast-btn--success',
}

export function buildActionToastHtml({ title, message, actions = [] }) {
  const buttons = actions
    .map(
      (action) =>
        `<button type="button" id="${action.id}" class="pf-toast-btn ${VARIANT_CLASS[action.variant] || VARIANT_CLASS.secondary}">${action.label}</button>`
    )
    .join('')

  return `
    <div class="pf-toast-content">
      <strong class="pf-toast-title">${title}</strong>
      ${message ? `<p class="pf-toast-message">${message}</p>` : ''}
      <div class="pf-toast-actions">${buttons}</div>
    </div>
  `
}

export function bindToastActions(actions, delay = 50) {
  setTimeout(() => {
    actions.forEach(({ id, onClick }) => {
      const el = document.getElementById(id)
      if (el && onClick) {
        el.addEventListener('click', onClick)
      }
    })
  }, delay)
}

export function openActionToast(
  toast,
  { title, message, actions = [], type = 'default', duration = 0, dismissible = true }
) {
  const toastInstance = toast.open({
    message: buildActionToastHtml({ title, message, actions }),
    type,
    duration,
    dismissible,
  })

  bindToastActions(
    actions.map((action) => ({
      id: action.id,
      onClick: () => action.onClick?.(toastInstance),
    }))
  )

  return toastInstance
}

const STATUS_MESSAGES = {
  400: 'The request could not be processed. Please check your input and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested item could not be found.',
  408: 'The request timed out. Please try again.',
  409: 'This action conflicts with the current data. Please refresh and try again.',
  413: 'The uploaded file is too large. Please try a smaller file.',
  415: 'Unsupported file type. Please upload a valid file.',
  422: 'Some of the information provided is invalid. Please review and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our side. Please try again later.',
  502: 'The server is temporarily unavailable. Please try again later.',
  503: 'The service is temporarily unavailable. Please try again later.',
  504: 'The server took too long to respond. Please try again.',
}

const ACTION_MESSAGES = [
  { test: /\/auth\/login/i, message: 'Unable to sign in. Please check your credentials and try again.' },
  { test: /\/auth\/verify_otp/i, message: 'Unable to verify the code. Please try again.' },
  { test: /\/auth\/resend_otp/i, message: 'Unable to resend the login code. Please try again.' },
  { test: /\/auth\/logout/i, message: 'Unable to complete logout. Please try again.' },
  { test: /\/profile\/reset_password/i, message: 'Unable to update your password. Please try again.' },
  { test: /\/filings_list/i, message: 'Unable to load filings. Please refresh and try again.' },
  { test: /\/admin\/create_user/i, message: 'Unable to create the user. Please try again.' },
  { test: /\/admin\/edit_user/i, message: 'Unable to update the user. Please try again.' },
  { test: /\/admin\/delete_user/i, message: 'Unable to delete the user. Please try again.' },
  { test: /\/admin\/users/i, message: 'Unable to load users. Please refresh and try again.' },
  { test: /\/files\/upload/i, message: 'File upload failed. Please try again.' },
  { test: /\/files\/mapper/i, message: 'Unable to process file mappings. Please try again.' },
  { test: /\/files\/submit/i, message: 'Unable to submit the filing. Please try again.' },
  { test: /\/files\/cancel/i, message: 'Unable to cancel the filing. Please try again.' },
  { test: /\/files\/download_input/i, message: 'Unable to download input files. Please try again.' },
  { test: /\/edit\/response/i, message: 'Unable to load the filing. Please refresh and try again.' },
  { test: /\/edit\/computation/i, message: 'Unable to load computation logs. Please try again.' },
  { test: /\/edit\/approved/i, message: 'Unable to load the approved filing data. Please try again.' },
  { test: /\/edit\/update_status/i, message: 'Unable to update the filing status. Please try again.' },
  { test: /\/submissions\/revert/i, message: 'Unable to revert this question. Please try again.' },
  { test: /\/submissions\/history/i, message: 'Unable to load change history. Please try again.' },
  { test: /\/submissions\//i, message: 'Unable to save your changes. Please try again.' },
]

function extractRawApiMessage(data) {
  if (!data) return ''
  if (typeof data === 'string') return data.trim()
  if (typeof data !== 'object') return ''

  const candidates = [data.message, data.error, data.detail, data.msg, data.title]
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
  }

  if (Array.isArray(data.detail) && data.detail.length) {
    const first = data.detail[0]
    if (typeof first === 'string' && first.trim()) return first.trim()
    if (typeof first?.msg === 'string' && first.msg.trim()) return first.msg.trim()
  }

  return ''
}

function isUserFriendlyMessage(message) {
  if (!message) return false
  const text = message.trim()
  if (text.length < 3 || text.length > 180) return false
  if (/^<!doctype html|<html|<pre|<title/i.test(text)) return false
  if (/traceback|exception|stack trace|at\s+\w+\(|\.py:\d+|sqlalchemy|psycopg|null pointer/i.test(text)) {
    return false
  }
  if (/^error:\s*\d{3}\b/i.test(text)) return false
  if (/^internal server error$/i.test(text)) return false
  if (/^request failed/i.test(text)) return false
  if (/[{}\[\]]/.test(text) && /["']?\w+["']?\s*:/.test(text)) return false
  return true
}

function softenApiMessage(message) {
  const replacements = [
    [/unauthorized/i, 'Your session has expired. Please sign in again.'],
    [/forbidden/i, 'You do not have permission to perform this action.'],
    [/not found/i, 'The requested item could not be found.'],
    [/bad request/i, 'The request could not be processed. Please check your input and try again.'],
    [/timeout/i, 'The request timed out. Please try again.'],
    [/duplicate/i, 'This item already exists. Please use a different value.'],
    [/already exists/i, 'This item already exists. Please use a different value.'],
    [/invalid credentials|wrong password|incorrect password/i, 'Wrong username or password.'],
    [/invalid otp|incorrect otp|otp.*(invalid|incorrect|expired)/i, 'Incorrect login code. Please try again.'],
  ]

  for (const [pattern, friendly] of replacements) {
    if (pattern.test(message)) return friendly
  }
  return message
}

function getActionMessage(error) {
  const url = `${error?.config?.baseURL || ''}${error?.config?.url || ''}`
  const match = ACTION_MESSAGES.find((entry) => entry.test.test(url))
  return match?.message || ''
}

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback

  if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
    return 'Unable to connect to the server. Please check your connection.'
  }

  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again.'
  }

  const status = error.response?.status
  const rawMessage = extractRawApiMessage(error.response?.data)
  const actionMessage = getActionMessage(error)

  if (isUserFriendlyMessage(rawMessage)) {
    return softenApiMessage(rawMessage)
  }

  if (actionMessage) return actionMessage
  if (status && STATUS_MESSAGES[status]) return STATUS_MESSAGES[status]
  if (status >= 500) return STATUS_MESSAGES[500]
  if (status >= 400) return STATUS_MESSAGES[400]

  return fallback
}

/** Show an API error toast unless one was already shown by the axios interceptor. */
export function toastApiError(error, fallback) {
  if (error?.__toastShown) return
  const toast = useToast()
  toast.error(getApiErrorMessage(error, fallback))
  if (error && typeof error === 'object') {
    error.__toastShown = true
  }
}
