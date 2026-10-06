<template>
  <div class="modal-backdrop" @click.self="handleCancel">
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="add-fund-title">
      <div class="modal-header">
        <div>
          <h2 id="add-fund-title">Add Fund</h2>
          <p class="subtitle">Provide reporting fund details for onboarding</p>
        </div>
        <button type="button" class="modal-close" aria-label="Close" @click="handleCancel">
          <font-awesome-icon icon="xmark" />
        </button>
      </div>

      <form class="modal-body" @submit.prevent="handleSubmit">
        <div class="field">
          <label class="field-label" for="NameOfReportingFund">Name of reporting fund</label>
          <input
            id="NameOfReportingFund"
            v-model="NameOfReportingFund"
            type="text"
            class="text-input"
            placeholder="Enter fund name"
          />
        </div>

        <div class="field">
          <label class="field-label" for="fundID">Private Fund ID of Reporting Fund</label>
          <input
            id="fundID"
            v-model="fundID"
            type="text"
            class="text-input"
            placeholder="Enter private fund ID"
          />
        </div>

        <div class="field">
          <label class="field-label" for="NfaID">NFA ID of Reporting Fund</label>
          <input
            id="NfaID"
            v-model="NfaID"
            type="text"
            class="text-input"
            placeholder="Enter NFA ID"
          />
        </div>

        <div class="field">
          <label class="field-label" for="Lei">LEI of Reporting Fund</label>
          <input
            id="Lei"
            v-model="Lei"
            type="text"
            class="text-input"
            placeholder="Enter LEI (optional)"
          />
        </div>

        <div class="toggle-row">
          <div class="toggle-copy">
            <label class="field-label" for="isMasterFund">Master Fund</label>
            <p class="toggle-hint">Is a Master Fund in a Master-Feeder structure?</p>
          </div>
          <button
            id="isMasterFund"
            type="button"
            class="toggle"
            :class="{ on: isMasterFund }"
            :aria-pressed="isMasterFund"
            @click="isMasterFund = !isMasterFund"
          >
            <span class="toggle-knob"></span>
            <span class="toggle-text">{{ isMasterFund ? 'Yes' : 'No' }}</span>
          </button>
        </div>

        <div class="toggle-row">
          <div class="toggle-copy">
            <label class="field-label" for="isParallelFund">Parallel Fund</label>
            <p class="toggle-hint">Is a Parallel Fund in a Parallel Fund structure?</p>
          </div>
          <button
            id="isParallelFund"
            type="button"
            class="toggle"
            :class="{ on: isParallelFund }"
            :aria-pressed="isParallelFund"
            @click="isParallelFund = !isParallelFund"
          >
            <span class="toggle-knob"></span>
            <span class="toggle-text">{{ isParallelFund ? 'Yes' : 'No' }}</span>
          </button>
        </div>

        <p v-if="error" class="error-text">{{ error }}</p>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="handleCancel">Cancel</button>
          <button type="submit" class="btn-primary">Submit</button>
        </div>

        <p class="disclaimer">
          Disclaimer: Our team will reach out to you about fund addition within the next 24 hours.
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const NameOfReportingFund = ref('')
const fundID = ref('')
const NfaID = ref('')
const Lei = ref('')
const isMasterFund = ref(false)
const isParallelFund = ref(false)
const error = ref('')

const emit = defineEmits(['cancel-add-fund'])

function handleSubmit() {
  if (!NameOfReportingFund.value.trim() || !fundID.value.trim() || !NfaID.value.trim()) {
    error.value = 'Please fill out all required fields.'
    return
  }
  error.value = ''
}

function handleCancel() {
  emit('cancel-add-fund')
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

.text-input::placeholder {
  color: #9ca3af;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f8fafc;
}

.toggle-copy {
  min-width: 0;
}

.toggle-hint {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.4;
}

.toggle {
  flex-shrink: 0;
  width: 72px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #e5e7eb;
  position: relative;
  cursor: pointer;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.toggle.on {
  background: #1e3a8a;
  border-color: #1e3a8a;
  justify-content: flex-start;
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  transition: transform 0.15s ease;
}

.toggle.on .toggle-knob {
  transform: translateX(38px);
}

.toggle-text {
  font-size: 0.7rem;
  font-weight: 700;
  color: #4b5563;
  z-index: 1;
}

.toggle.on .toggle-text {
  color: #fff;
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
}

.btn-secondary {
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.btn-primary {
  background: #1e3a8a;
  border: 1px solid #1e3a8a;
  color: #fff;
}

.btn-primary:hover {
  background: #1e40af;
}

.disclaimer {
  margin: 0;
  font-size: 0.78rem;
  color: #6b7280;
  line-height: 1.45;
  text-align: center;
}
</style>
