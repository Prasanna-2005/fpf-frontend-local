<template>
  <form
    class="otp-form"
    novalidate
    :class="{ 'was-validated': showedValidation }"
    @submit.prevent="submitOtp"
  >
    <div class="field" :class="{ invalid: showedValidation && !otpValid }">
      <label for="otpInput">Verification code</label>
      <div class="input-wrap">
        <font-awesome-icon icon="lock" class="field-icon" />
        <input
          id="otpInput"
          v-model.trim="otp"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          placeholder="Enter verification code"
          required
        />
      </div>
      <div class="error">Please enter a valid verification code</div>
    </div>

    <button type="submit" class="btn-login" :disabled="isLoading">
      <span v-if="isLoading" class="ui-spinner" aria-hidden="true"></span>
      {{ isLoading ? 'Verifying…' : 'Verify code' }}
    </button>

    <div class="resend">
      <span v-if="timer > 0">
        Resend verification code in <strong>{{ timer }}</strong> sec
      </span>
      <a v-else href="#" @click.prevent="resendOtp">Resend verification code</a>
    </div>
  </form>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import { useUserStore } from '@/stores/userStore'
import api_call_methods from '@/assets/api_calls/api_calls'

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
})

const toast = useToast()
const userStore = useUserStore()

const otp = ref('')
const isLoading = ref(false)
const timer = ref(60)
const showedValidation = ref(false)
let intervalId = null

const otpValid = computed(() => Boolean(otp.value.trim()))

onMounted(() => {
  startTimer()
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
})

function startTimer() {
  clearInterval(intervalId)
  timer.value = 60
  intervalId = setInterval(() => {
    if (timer.value > 0) {
      timer.value -= 1
    } else {
      clearInterval(intervalId)
    }
  }, 1000)
}

async function submitOtp() {
  showedValidation.value = true
  if (!otpValid.value) return

  try {
    isLoading.value = true
    const result = await api_call_methods.verify_otp({
      user_id: props.userId,
      otp: otp.value.toString(),
    })

    if (result.status === 200) {
      toast.success('Code verified successfully')
      const expiryHours = Number.parseInt(result.data.response.expiry_time[0], 10)
      const expiryTimestamp = Date.now() + expiryHours * 60 * 60 * 1000

      userStore.login({
        username: result.data.response.username,
        email: props.email,
        role: result.data.response.role,
        userID: props.userId,
        expiry: expiryTimestamp,
        clientCode: result.data.response.client_id,
      })
      window.location.replace('/home')
    } else {
      toast.error('Invalid verification code')
    }
  } catch (error) {
    const status = error.response?.status
    if (status === 401) {
      toast.error('Incorrect code. Please re-enter the correct verification code.')
    } else {
      toast.error('We’re having trouble processing your request. Please try again later')
    }
  } finally {
    isLoading.value = false
  }
}

async function resendOtp() {
  try {
    toast.info('Resending verification code...')
    await api_call_methods.resend_otp({ user_id: props.userId })
    toast.success('Verification code sent successfully')
    startTimer()
  } catch (error) {
    console.error(error)
    toast.error('Failed to resend verification code')
  }
}
</script>

<style scoped>
.otp-form {
  font-family: 'Inter', system-ui, sans-serif;
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
  padding: 13px 16px 13px 44px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #111827;
  outline: none;
}

.input-wrap input:focus {
  background: #fff;
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
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

.btn-login {
  width: 100%;
  border: none;
  border-radius: 10px;
  background: #1e3a8a;
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
}

.btn-login:hover:not(:disabled) {
  background: #1e40af;
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

.resend {
  margin-top: 20px;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.resend a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.resend a:hover {
  text-decoration: underline;
  background: transparent;
}
</style>
