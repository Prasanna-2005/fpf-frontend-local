<template>
  <div class="form-card">
    <div class="brand-wrap" aria-hidden="true">
      <div class="dot-grid"></div>
    </div>
    <div class="brand">Quantrium</div>

    <div class="welcome">
      <h1>Reset password</h1>
      <p v-if="accountChange">Choose a new password for your account.</p>
      <p v-else>Enter the email and the code an admin sent you.</p>
    </div>

    <form class="login-form" novalidate @submit.prevent="handleSubmit">
      <div v-if="!accountChange" class="field">
        <label for="resetEmail">Email</label>
        <div class="input-wrap">
          <font-awesome-icon icon="envelope" class="field-icon" />
          <input
            id="resetEmail"
            v-model.trim="email"
            type="email"
            placeholder="Enter email address"
            autocomplete="email"
            required
          />
        </div>
      </div>

      <div class="field">
        <label for="passwordInput">New password</label>
        <div class="input-wrap">
          <font-awesome-icon icon="lock" class="field-icon" />
          <input
            id="passwordInput"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter new password"
            autocomplete="new-password"
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
      </div>

      <div class="field">
        <label for="confirmPasswordInput">Confirm password</label>
        <div class="input-wrap">
          <font-awesome-icon icon="lock" class="field-icon" />
          <input
            id="confirmPasswordInput"
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Confirm new password"
            autocomplete="new-password"
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
      </div>

      <div v-if="!accountChange" class="field">
        <label for="resetOtp">Code</label>
        <div class="input-wrap">
          <font-awesome-icon icon="lock" class="field-icon" />
          <input
            id="resetOtp"
            v-model.trim="otp"
            type="text"
            inputmode="numeric"
            placeholder="Enter the code from the email"
            autocomplete="one-time-code"
            required
          />
        </div>
      </div>

      <button type="submit" class="btn-login" :disabled="isLoading">
        <span v-if="isLoading" class="ui-spinner" aria-hidden="true"></span>
        {{ isLoading ? 'Changing password…' : 'Change password' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { useUserStore } from '@/stores/userStore'
import api_call_methods from '@/assets/api_calls/api_calls'

const toast = useToast()
const route = useRoute()
const userStore = useUserStore()

function emailFromRoute() {
  const value = route.query.email
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' ? raw : ''
}

const email = ref(emailFromRoute())
const otp = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const accountChange = computed(
  () => route.query.account === '1' && userStore.isAuthenticated,
)

async function handleSubmit() {
  if (password.value !== confirmPassword.value) {
    toast.error('Passwords do not match.')
    return
  }
  if (!accountChange.value && password.value.length < 8) {
    toast.error('Use at least 8 characters.')
    return
  }
  if (!accountChange.value && (!email.value || !otp.value)) {
    toast.error('Enter the email and the code from the email.')
    return
  }

  try {
    isLoading.value = true
    const result = accountChange.value
      ? await api_call_methods.reset_password(
          { new_password: password.value },
          userStore.userID,
        )
      : await api_call_methods.complete_reset({
          email: email.value.trim(),
          otp: otp.value.trim(),
          new_password: password.value,
        })
    if (result.status == '200') {
      toast.success('Password change successful!')
      if (accountChange.value) {
        userStore.logout()
      }
      location.replace('/')
      return
    }
    toast.error('Password change unsuccessful. Please try again.')
  } catch (error) {
    console.error(error)
    toast.error('Password change unsuccessful. Please try again.')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.form-card {
  position: relative;
  width: 100%;
  max-width: 400px;
  font-family: 'Inter', system-ui, sans-serif;
}

.brand-wrap {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  width: 220px;
  height: 90px;
  pointer-events: none;
  z-index: 0;
}

.dot-grid {
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle, #d1d5db 1.2px, transparent 1.2px);
  background-size: 12px 12px;
  opacity: 0.7;
  mask-image: radial-gradient(ellipse 70% 65% at 50% 45%, #000 20%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 70% 65% at 50% 45%, #000 20%, transparent 70%);
}

.brand {
  position: relative;
  z-index: 1;
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  color: #21409b;
  letter-spacing: -0.02em;
  margin-bottom: 36px;
}

.welcome {
  text-align: center;
  margin-bottom: 28px;
}

.welcome h1 {
  font-size: 1.85rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}

.welcome p {
  margin: 0;
  font-size: 0.95rem;
  color: #6b7280;
  line-height: 1.45;
}

.field {
  margin-bottom: 18px;
}

.field label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
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
  border: 1px solid transparent;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 13px 44px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #111827;
  outline: none;
  box-sizing: border-box;
}

.input-wrap input::placeholder {
  color: #9ca3af;
}

.input-wrap input:focus {
  background: #fff;
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(33, 64, 155, 0.12);
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

.btn-login {
  width: 100%;
  border: none;
  border-radius: 10px;
  background: #21409b;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  padding: 14px 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 6px;
}

.btn-login:hover:not(:disabled) {
  background: #1a3480;
}

.btn-login:disabled {
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
</style>
