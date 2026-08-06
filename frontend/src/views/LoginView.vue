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
  height: 100vh;
  height: 100dvh;
  max-height: 100vh;
  max-height: 100dvh;
  padding: 28px;
  box-sizing: border-box;
  overflow: hidden;
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
  min-height: 0;
  height: 100%;
  padding: 44px 40px 0;
}

.promo-copy {
  position: relative;
  z-index: 1;
  max-width: 520px;
  flex-shrink: 0;
}

.promo-copy h2 {
  font-size: clamp(1.45rem, 2.2vw, 2.05rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
  margin: 0 0 14px;
}

.promo-copy p {
  margin: 0;
  font-size: clamp(0.9rem, 1.1vw, 1rem);
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.88);
  max-width: 460px;
}

.promo-art {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.hero-illustration {
  display: block;
  width: min(100%, 640px);
  max-height: 100%;
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
  min-height: 0;
  height: 100%;
  padding: 24px;
  overflow: hidden;
  background: #fff;
}

@media (max-width: 960px) {
  .login-shell {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) auto;
    padding: 16px;
    gap: 16px;
    overflow: auto;
  }

  .promo-pane {
    height: auto;
    max-height: 46vh;
    padding: 28px 24px 0;
    border-radius: 22px;
    order: -1;
  }

  .promo-copy h2 {
    font-size: 1.35rem;
  }

  .promo-copy p {
    font-size: 0.9rem;
  }

  .form-pane {
    height: auto;
    overflow: visible;
    padding: 12px 16px 20px;
  }
}

@media (max-width: 480px) {
  .login-shell {
    padding: 12px;
  }

  .promo-pane {
    padding: 24px 18px 0;
    border-radius: 18px;
    max-height: 40vh;
  }

  .form-pane {
    padding: 16px 8px 24px;
  }
}
</style>
