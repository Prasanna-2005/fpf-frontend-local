<template>
  <div class="modal-backdrop" @click.self="handleCancel">
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="add-user-title">
      <div class="modal-header">
        <div>
          <h2 id="add-user-title">Add User</h2>
          <p class="subtitle">Create a new contributor or approver account</p>
        </div>
        <button type="button" class="modal-close" aria-label="Close" @click="handleCancel">
          <font-awesome-icon icon="xmark" />
        </button>
      </div>

      <form class="modal-body" @submit.prevent="handleSubmit">
        <div class="field-row">
          <div class="field">
            <label class="field-label" for="add-firstName">First Name</label>
            <input
              id="add-firstName"
              v-model="firstname"
              type="text"
              class="text-input"
              placeholder="Alias"
            />
          </div>
          <div class="field">
            <label class="field-label" for="add-lastName">Last Name</label>
            <input
              id="add-lastName"
              v-model="lastname"
              type="text"
              class="text-input"
              placeholder="User"
            />
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="add-Email">Email</label>
          <input
            id="add-Email"
            v-model="email"
            type="email"
            class="text-input"
            placeholder="aliasuser@quantrium.ai"
          />
        </div>

        <div class="field">
          <label class="field-label" for="add-role">Role</label>
          <select id="add-role" v-model="role" class="text-input">
            <option disabled value="">Select role</option>
            <option value="contributor">Contributor</option>
            <option value="approver">Approver</option>
          </select>
        </div>

        <div class="field">
          <label class="field-label" for="add-Password">Password</label>
          <input
            id="add-Password"
            v-model="password"
            type="password"
            class="text-input"
            placeholder="••••••••••"
          />
        </div>

        <div class="field">
          <label class="field-label" for="add-ConfirmPassword">Confirm Password</label>
          <input
            id="add-ConfirmPassword"
            v-model="confirmPassword"
            type="password"
            class="text-input"
            placeholder="••••••••••"
          />
        </div>

        <p v-if="error" class="error-text">{{ error }}</p>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" :disabled="isSubmitting" @click="handleCancel">
            Cancel
          </button>
          <button type="submit" class="btn-primary" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="ui-spinner light" aria-hidden="true"></span>
            {{ isSubmitting ? 'Submitting…' : 'Submit' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api_call_methods from '@/assets/api_calls/api_calls'
import { useUserStore } from '@/stores/userStore'
import { useToast } from 'vue-toast-notification'

const toast = useToast()
const userStore = useUserStore()
const emit = defineEmits(['cancel-add-user'])

const firstname = ref('')
const lastname = ref('')
const email = ref('')
const role = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const isSubmitting = ref(false)

const user_id = userStore.userID

async function handleSubmit() {
  error.value = ''
  if (
    !firstname.value.trim() ||
    !lastname.value.trim() ||
    !email.value.trim() ||
    !role.value ||
    !password.value ||
    !confirmPassword.value
  ) {
    error.value = 'Please fill out all fields.'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }

  try {
    isSubmitting.value = true
    const userData = {
      username: `${firstname.value.trim()}.${lastname.value.trim()}`,
      email: email.value.trim(),
      user_role: role.value,
      password: password.value,
    }
    const data = {
      client_code: userStore.clientCode,
      data: userData,
    }
    await api_call_methods.create_user(data, user_id)
    toast.success('User added successfully')
    location.reload()
  } catch (err) {
    console.log(err)
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  emit('cancel-add-user')
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
