<template>
  <div class="page-state" role="status" aria-live="polite">
    <div v-if="loading" class="state-card">
      <div class="loader-ring" aria-hidden="true">
        <span class="loader-ring__spin"></span>
      </div>
      <h2>{{ title }}</h2>
      <p>{{ message }}</p>
    </div>

    <div v-else class="state-card">
      <div class="error-icon" aria-hidden="true">
        <font-awesome-icon icon="triangle-exclamation" />
      </div>
      <h2>{{ errorTitle }}</h2>
      <p>{{ errorMessage }}</p>
      <a href="/home" class="btn-primary">
        Back to Dashboard
        <font-awesome-icon icon="arrow-right" />
      </a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: 'Please wait while we prepare your data.',
  },
  errorTitle: {
    type: String,
    required: true,
  },
  errorMessage: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.page-state {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #eef1f6;
}

.state-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px 36px 32px;
  max-width: 440px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
  animation: fadeIn 0.35s ease;
}

.loader-ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.loader-ring__spin {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid rgba(30, 58, 138, 0.18);
  border-top-color: #1e3a8a;
  animation: spin 0.75s linear infinite;
}

.error-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 1.4rem;
}

.state-card h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 10px;
  color: #111827;
}

.state-card p {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 24px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  background: #1e3a8a;
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 12px 20px;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.15s ease;
}

.btn-primary:hover {
  background: #1e40af;
  color: #fff;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
