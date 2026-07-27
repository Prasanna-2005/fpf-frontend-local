/**
 * Shared helpers for themed interactive toast notifications.
 */

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
