<template>
  <div class="filing-panel" :class="{ wide }">
    <h1 class="page-title">Create a new filing</h1>
    <p class="page-subtitle">Upload Files and Configure Mappings</p>

    <div class="stepper" aria-label="Filing setup progress">
      <div class="step" :class="{ active: step === 1, done: step > 1 }">
        <div class="step-circle">
          <font-awesome-icon v-if="step > 1" icon="check" />
          <template v-else>1</template>
        </div>
        <span>Upload Files</span>
      </div>
      <div class="step-line" :class="{ done: step > 1 }"></div>
      <div class="step" :class="{ active: step === 2 }">
        <div class="step-circle">2</div>
        <span>Map Files</span>
      </div>
    </div>

    <div class="step-body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="footer-actions">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  step: {
    type: Number,
    required: true,
    validator: (value) => value === 1 || value === 2,
  },
  wide: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.filing-panel {
  width: 100%;
  max-width: 960px;
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 28px 32px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  box-sizing: border-box;
}

.filing-panel.wide {
  max-width: 1100px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0 0 28px;
}

.page-title,
.page-subtitle,
.stepper,
.footer-actions {
  flex-shrink: 0;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.step {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #9ca3af;
}

.step.active,
.step.done {
  color: #1e3a8a;
}

.step.active {
  font-weight: 600;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  background: #fff;
  color: #9ca3af;
  flex-shrink: 0;
}

.step.active .step-circle,
.step.done .step-circle {
  background: #1e3a8a;
  border-color: #1e3a8a;
  color: #fff;
  font-size: 0.75rem;
}

.step-line {
  flex: 0 0 64px;
  height: 2px;
  background: #d1d5db;
}

.step-line.done {
  background: #1e3a8a;
}

.step-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.footer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .filing-panel {
    padding: 20px;
  }
}
</style>
