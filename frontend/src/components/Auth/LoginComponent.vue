<template>
  <div class="form-card">
    <div class="brand-wrap" aria-hidden="true">
      <div class="dot-grid"></div>
    </div>
    <div class="brand">Quantrium</div>

    <div class="welcome">
      <h1>{{ loginSuccess ? 'Verify your email' : 'Welcome Back!' }}</h1>
      <p>
        {{
          loginSuccess
            ? `Enter the verification code sent to ${email}`
            : 'Please login to your account'
        }}
      </p>
    </div>

    <form
      v-if="!loginSuccess"
      class="login-form"
      novalidate
      :class="{ 'was-validated': showedValidation }"
      @submit.prevent="handleSubmit"
    >
      <div class="field" :class="{ invalid: showedValidation && !emailValid }">
        <label for="emailInput">Email</label>
        <div class="input-wrap">
          <font-awesome-icon icon="envelope" class="field-icon" />
          <input
            id="emailInput"
            v-model.trim="email"
            type="email"
            name="email"
            placeholder="Enter email address"
            autocomplete="email"
            required
          />
        </div>
        <div class="error">Please enter a valid email address</div>
      </div>

      <div class="field" :class="{ invalid: showedValidation && !passwordValid }">
        <label for="passwordInput">Password</label>
        <div class="input-wrap">
          <font-awesome-icon icon="lock" class="field-icon" />
          <input
            id="passwordInput"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            placeholder="Enter password"
            autocomplete="current-password"
            required
          />
          <button
            type="button"
            class="toggle-pass"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="togglePassword"
          >
            <font-awesome-icon :icon="showPassword ? 'eye-slash' : 'eye'" />
          </button>
        </div>
        <div class="error">Please enter your password</div>
      </div>

      <div class="form-meta">
        <label class="remember">
          <input v-model="rememberMe" type="checkbox" />
          <span>Remember me</span>
        </label>
        <a href="#" class="forgot" @click.prevent>Forgot password?</a>
      </div>

      <button type="submit" class="btn-login" :disabled="isLoading">
        <span v-if="isLoading" class="ui-spinner" aria-hidden="true"></span>
        {{ isLoading ? 'Logging in…' : 'Login' }}
      </button>
    </form>

    <OtpComponent v-else :user_id="userId" :email="email" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import OtpComponent from './OtpComponent.vue'
import { useUserStore } from '@/stores/userStore'
import api_call_methods from '@/assets/api_calls/api_calls'

const toast = useToast()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loginSuccess = ref(false)
const userId = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const showedValidation = ref(false)

const emailValid = computed(() => {
  const value = email.value.trim()
  return Boolean(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
})

const passwordValid = computed(() => Boolean(password.value.trim()))

function togglePassword() {
  showPassword.value = !showPassword.value
}

async function handleSubmit() {
  showedValidation.value = true
  if (!emailValid.value || !passwordValid.value) return

  try {
    isLoading.value = true
    const result = await api_call_methods.login({
      username: email.value,
      password: password.value,
    })

    if (result.status === 200) {
      userId.value = result.data.user_id
      loginSuccess.value = true
      toast.success('Verification code sent!')
      userStore.login({
        email: email.value,
        role: 'Contributor',
        userID: userId.value,
      })
    } else {
      toast.error('Login failed!')
    }
  } catch (error) {
    const status = error.response?.status
    if (status === 404) {
      toast.error('Wrong username or password')
    } else {
      toast.error('We’re having trouble processing your request. Please try again later')
    }
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
  word-break: break-word;
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

.form-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 4px 0 18px;
}

.remember {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #4b5563;
  cursor: pointer;
  user-select: none;
}

.remember input {
  width: 15px;
  height: 15px;
  accent-color: #21409b;
  cursor: pointer;
}

.forgot {
  font-size: 0.875rem;
  font-weight: 500;
  color: #2563eb;
  text-decoration: none;
  white-space: nowrap;
}

.forgot:hover {
  text-decoration: underline;
  background: transparent;
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
  transition: background 0.15s ease;
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

.signup {
  text-align: center;
  margin-top: 28px;
  font-size: 0.9rem;
  color: #6b7280;
}

.signup a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.signup a:hover {
  text-decoration: underline;
  background: transparent;
}

@media (max-width: 480px) {
  .welcome h1 {
    font-size: 1.5rem;
  }

  .brand {
    margin-bottom: 28px;
  }
}
</style>
