<template>
  <div class="reset-page">
    <div class="reset-shell">
      <header class="reset-brand">
        <div class="brand-mark">Quantrium</div>
        <p class="brand-note">Account security</p>
      </header>

      <ResetComponent />
    </div>
  </div>
</template>

<script setup>
import ResetComponent from '@/components/Auth/ResetComponent.vue'
</script>

<style scoped>
.reset-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  background:
    radial-gradient(ellipse 70% 50% at 100% 0%, rgba(30, 58, 138, 0.1), transparent 55%),
    radial-gradient(ellipse 50% 40% at 0% 100%, rgba(37, 99, 235, 0.08), transparent 50%),
    #eef1f6;
  font-family: 'Inter', system-ui, sans-serif;
}

.reset-shell {
  width: 100%;
  max-width: 460px;
}

.reset-brand {
  text-align: center;
  margin-bottom: 20px;
}

.brand-mark {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e3a8a;
  letter-spacing: -0.02em;
}

.brand-note {
  margin: 6px 0 0;
  font-size: 0.875rem;
  color: #6b7280;
}
</style>
