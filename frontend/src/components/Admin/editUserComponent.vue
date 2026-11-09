<template>
  <div class="modal-backdrop" @click.self="handleCancel">
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="edit-user-title">
      <div class="modal-header">
        <div>
          <h2 id="edit-user-title">Edit User</h2>
          <p class="subtitle">Update account details and access role</p>
        </div>
        <button type="button" class="modal-close" aria-label="Close" @click="handleCancel">
          <font-awesome-icon icon="xmark" />
        </button>
      </div>

      <form class="modal-body" @submit.prevent="handleSubmit">
        <div class="field-row">
          <div class="field">
            <label class="field-label" for="edit-firstName">First Name</label>
            <input
              id="edit-firstName"
              v-model="firstname"
              type="text"
              class="text-input"
              placeholder="Alias"
            />
          </div>
          <div class="field">
            <label class="field-label" for="edit-lastName">Last Name</label>
            <input
              id="edit-lastName"
              v-model="lastname"
              type="text"
              class="text-input"
              placeholder="User"
            />
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="edit-Email">Email</label>
          <input id="edit-Email" v-model="email" type="email" class="text-input" />
        </div>

        <div class="field">
          <label class="field-label" for="edit-role">Role</label>
          <select id="edit-role" v-model="role" class="text-input">
            <option disabled value="">Select role</option>
            <option value="contributor">Contributor</option>
            <option value="approver">Approver</option>
          </select>
        </div>

        <div class="field">
          <label class="field-label" for="edit-Password">Password</label>
          <input
            id="edit-Password"
            v-model="password"
            type="password"
            class="text-input"
            placeholder="Leave blank to keep current password"
          />
        </div>

        <p v-if="error" class="error-text">{{ error }}</p>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" :disabled="saving" @click="handleCancel">
            Cancel
          </button>
          <button type="submit" class="btn-primary" :disabled="saving">
            <span v-if="saving" class="ui-spinner" aria-hidden="true"></span>
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['cancel-edit-user', 'submit-edit'])

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const names = props.data.username?.split('.') || []
const firstname = ref(names[0] || '')
const lastname = ref(names[1] || '')
const email = ref(props.data.email || '')
const role = ref((props.data.role || '').toLowerCase())
const password = ref('')
const error = ref('')

function handleSubmit() {
  if (props.saving) return
  error.value = ''
  if (!firstname.value.trim() || !lastname.value.trim() || !email.value.trim() || !role.value) {
    error.value = 'Please fill out all required fields.'
    return
  }

  emit('submit-edit', {
    previous: {
      user_id: props.data.user_id,
      username: props.data.username,
      email: props.data.email,
      role: props.data.role,
    },
    next: {
      user_id: props.data.user_id,
      username: `${firstname.value.trim()}.${lastname.value.trim()}`,
      email: email.value.trim(),
      role: role.value,
    },
    password: password.value,
  })
}

function handleCancel() {
  emit('cancel-edit-user')
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 24px;
}

.modal-card {
  background: #fff;
  width: min(520px, 100%);
  max-height: calc(100vh - 48px);
  overflow: auto;
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 22px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 20px 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.text-input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 11px 14px;
  font-size: 0.9rem;
  font-family: inherit;
  color: #111827;
  outline: none;
  background: #fff;
}

.text-input:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.error-text {
  margin: 0;
  color: #dc2626;
  font-size: 0.85rem;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  border-radius: 8px;
  padding: 11px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-secondary {
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
}

.btn-primary {
  background: #1e3a8a;
  border: 1px solid #1e3a8a;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #1e40af;
}

.btn-secondary:disabled,
.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.ui-spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  animation: ui-spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes ui-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 560px) {
  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>
