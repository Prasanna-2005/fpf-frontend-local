<template>
  <div class="reset-card">
    <div class="card-header">
      <div class="icon-wrap" aria-hidden="true">
        <font-awesome-icon icon="lock" />
      </div>
      <h1>Reset Password</h1>
      <p>Choose a new password for your account. You’ll be signed out after it updates.</p>
    </div>

    <form class="reset-form" novalidate :class="{ 'was-validated': showedValidation }" @submit.prevent="handleSubmit">
      <div class="field" :class="{ invalid: showedValidation && !passwordValid }">
        <label for="newPassword">New password</label>
        <div class="input-wrap">
          <font-awesome-icon icon="lock" class="field-icon" />
          <input
            id="newPassword"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Enter new password"
            required
          />
          <button
            type="button"
            class="toggle-pass"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <font-awesome-icon :icon="showPassword ? 'eye-slash' : 'eye'" />
          </button>
        </div>
        <div class="error">Please enter a new password</div>
      </div>

      <div class="field" :class="{ invalid: showedValidation && !confirmValid }">
        <label for="confirmPassword">Confirm password</label>
        <div class="input-wrap">
          <font-awesome-icon icon="lock" class="field-icon" />
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Re-enter new password"
            required
          />
          <button
            type="button"
            class="toggle-pass"
            :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <font-awesome-icon :icon="showConfirmPassword ? 'eye-slash' : 'eye'" />
          </button>
        </div>
        <div class="error">
          {{
            !confirmPassword.trim()
              ? 'Please confirm your password'
              : 'Passwords do not match'
          }}
        </div>
      </div>

      <button type="submit" class="btn-primary" :disabled="isLoading">
        <span v-if="isLoading" class="ui-spinner" aria-hidden="true"></span>
        {{ isLoading ? 'Updating…' : 'Update Password' }}
      </button>
    </form>

    <div class="card-footer">
      <a href="/home" class="back-link" @click.prevent="goBack">
        <font-awesome-icon icon="arrow-left" />
        Back to Dashboard
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { useUserStore } from '@/stores/userStore'
import api_call_methods from '@/assets/api_calls/api_calls'

const toast = useToast()
const router = useRouter()
const userStore = useUserStore()

const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showedValidation = ref(false)

const passwordValid = computed(() => Boolean(password.value.trim()))
const confirmValid = computed(
  () => Boolean(confirmPassword.value.trim()) && confirmPassword.value === password.value
)

function goBack() {
  const role = String(userStore.role || '').toLowerCase()
  router.push(role === 'admin' ? '/admin' : '/home')
}

async function handleSubmit() {
  showedValidation.value = true
  if (!passwordValid.value || !confirmValid.value) return

  try {
    isLoading.value = true
    const result = await api_call_methods.reset_password(
      { new_password: password.value },
      userStore.userID
    )

    if (result.status === 200) {
      toast.success('Password updated successfully')
      userStore.logout()
      window.location.replace('/')
    } else {
      toast.error('Password update unsuccessful. Please try again.')
    }
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.reset-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
  padding: 32px 28px 24px;
  font-family: 'Inter', system-ui, sans-serif;
}

.card-header {
  text-align: center;
  margin-bottom: 28px;
}

.icon-wrap {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: #eff6ff;
  color: #1e3a8a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.card-header h1 {
  margin: 0 0 8px;
  font-size: 1.35rem;
  font-weight: 700;
  color: #111827;
}

.card-header p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #6b7280;
}

.field {
  margin-bottom: 18px;
}

.field label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.input-wrap {
  position: relative;
}

.field-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.9rem;
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 10px;
  padding: 13px 44px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #111827;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.input-wrap input::placeholder {
  color: #9ca3af;
}

.input-wrap input:focus {
  background: #fff;
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.toggle-pass {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  display: inline-flex;
}

.toggle-pass:hover {
  color: #6b7280;
}

.error {
  display: none;
  margin-top: 6px;
  font-size: 0.8rem;
  color: #dc2626;
}

.field.invalid .error {
  display: block;
}

.field.invalid .input-wrap input {
  border-color: #fca5a5;
  background: #fff;
}

.btn-primary {
  width: 100%;
  margin-top: 8px;
  border: none;
  border-radius: 10px;
  background: #1e3a8a;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  padding: 13px 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: #1e40af;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.ui-spinner {
  width: 16px;
  height: 16px;
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

.card-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e3a8a;
  text-decoration: none;
}

.back-link:hover {
  color: #1e40af;
  background: transparent;
}
</style>
