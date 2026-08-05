<template>
  <div class="login-shell">
    <aside class="promo-pane" aria-label="Product highlight">
      <div class="promo-copy">
        <h2>Securely manage your financial filings with complete confidence.</h2>
        <p>
          Streamline fund reporting, track edits, upload documents, and collaborate
          through a secure compliance platform.
        </p>
      </div>

      <div class="promo-art">
        <img
          src="@/assets/login-hero-illustration.png"
          alt=""
          class="hero-illustration"
        />
      </div>
    </aside>

    <section class="form-pane" aria-label="Login form">
      <LoginComponent />
    </section>
  </div>
</template>

<script setup>
import LoginComponent from '@/components/Auth/LoginComponent.vue'
</script>

<style scoped>
.login-shell {
  display: grid;
  grid-template-columns: minmax(420px, 1.05fr) minmax(360px, 1fr);
  gap: 28px;
  min-height: 100vh;
  padding: 28px;
  box-sizing: border-box;
  font-family: 'Inter', system-ui, sans-serif;
  background: #fff;
  color: #111827;
}

.promo-pane {
  position: relative;
  background: #21409b;
  color: #fff;
  border-radius: 28px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 44px 0;
  min-height: calc(100vh - 56px);
}

.promo-copy {
  position: relative;
  z-index: 1;
  max-width: 520px;
}

.promo-copy h2 {
  font-size: clamp(1.65rem, 2.4vw, 2.15rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
}

.promo-copy p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.88);
  max-width: 460px;
}

.promo-art {
  position: relative;
  margin-top: 32px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.hero-illustration {
  display: block;
  width: min(100%, 640px);
  height: auto;
  object-fit: contain;
  object-position: bottom center;
  user-select: none;
  pointer-events: none;
}

.form-pane {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background: #fff;
}

@media (max-width: 960px) {
  .login-shell {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 16px;
  }

  .promo-pane {
    min-height: auto;
    padding: 36px 28px 0;
    border-radius: 22px;
    order: -1;
  }

  .promo-copy h2 {
    font-size: 1.45rem;
  }

  .promo-copy p {
    font-size: 0.92rem;
  }

  .hero-illustration {
    width: min(100%, 420px);
  }
}

@media (max-width: 480px) {
  .login-shell {
    padding: 12px;
  }

  .promo-pane {
    padding: 28px 20px 0;
    border-radius: 18px;
  }

  .form-pane {
    padding: 24px 12px 32px;
  }
}
</style>
