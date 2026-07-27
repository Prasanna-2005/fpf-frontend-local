<template>
  <div class="login-shell">
    <section class="form-pane" aria-label="Login form">
      <LoginComponent />
    </section>

    <aside class="promo-pane" aria-label="Product highlight">
      <div class="promo-bg" aria-hidden="true"></div>

      <div class="floating-icons" aria-hidden="true">
        <div class="float-icon i1">
          <font-awesome-icon icon="folder-plus" />
        </div>
        <div class="float-icon i2">
          <font-awesome-icon icon="lock" />
        </div>
        <div class="float-icon i3">
          <font-awesome-icon icon="cloud-arrow-up" />
        </div>
        <div class="float-icon i4">
          <font-awesome-icon icon="file-lines" />
        </div>
        <div class="float-icon i5">
          <font-awesome-icon icon="paper-plane" />
        </div>
        <div class="float-icon i6">
          <font-awesome-icon icon="download" />
        </div>
      </div>

      <div class="promo-content">
        <div class="laptop" aria-hidden="true">
          <div class="laptop-frame">
            <div class="laptop-screen">
              <div class="mock-side">
                <div class="mock-dot active"></div>
                <div class="mock-dot"></div>
                <div class="mock-dot"></div>
                <div class="mock-dot"></div>
              </div>
              <div class="mock-main">
                <div class="mock-top"></div>
                <div class="mock-table">
                  <div class="mock-row head"></div>
                  <div class="mock-row"></div>
                  <div class="mock-row"></div>
                  <div class="mock-row"></div>
                  <div class="mock-row"></div>
                  <div class="mock-row"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="laptop-base"></div>
        </div>

        <div class="promo-copy">
          <h2>{{ currentSlide.title }}</h2>
          <p>{{ currentSlide.text }}</p>
        </div>

        <div class="dots" role="tablist" aria-label="Highlights">
          <button
            v-for="(slide, index) in slides"
            :key="index"
            type="button"
            class="dot"
            :class="{ active: index === slideIndex }"
            :aria-label="`Slide ${index + 1}`"
            :aria-selected="index === slideIndex"
            @click="setSlide(index)"
          ></button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import LoginComponent from '@/components/Auth/LoginComponent.vue'

const slides = [
  {
    title: 'Secure Filing Management',
    text: 'Automate compliance workflows and manage financial data with enterprise-grade security and accuracy.',
  },
  {
    title: 'Streamlined Approvals',
    text: 'Collaborate with contributors and approvers in one place, with clear status tracking at every step.',
  },
  {
    title: 'Audit-Ready Reporting',
    text: 'Generate consistent filings and exports with complete history, so reviews stay fast and reliable.',
  },
]

const slideIndex = ref(0)
const currentSlide = computed(() => slides[slideIndex.value])
let timerId = null

function setSlide(index) {
  slideIndex.value = index
}

onMounted(() => {
  timerId = setInterval(() => {
    slideIndex.value = (slideIndex.value + 1) % slides.length
  }, 5000)
})

onBeforeUnmount(() => {
  if (timerId) {
    clearInterval(timerId)
  }
})
</script>

<style scoped>
.login-shell {
  display: grid;
  grid-template-columns: minmax(360px, 1fr) minmax(420px, 1.05fr);
  min-height: 100vh;
  font-family: 'Inter', system-ui, sans-serif;
  background: #fff;
  color: #111827;
}

.form-pane {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  background: #fff;
}

.promo-pane {
  position: relative;
  background: #1e3a8a;
  color: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 48px 40px 36px;
  min-height: 100vh;
}

.promo-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 55% at 50% 18%, rgba(96, 165, 250, 0.35), transparent 60%),
    linear-gradient(180deg, #0f244f 0%, #1e3a8a 42%, #1e3a8a 100%);
}

.promo-bg::before {
  content: '';
  position: absolute;
  inset: 0 0 45% 0;
  background:
    radial-gradient(circle at 18% 30%, rgba(255, 255, 255, 0.12) 0 2px, transparent 3px),
    radial-gradient(circle at 72% 22%, rgba(255, 255, 255, 0.1) 0 1.5px, transparent 2.5px),
    radial-gradient(circle at 48% 48%, rgba(147, 197, 253, 0.2) 0 40%, transparent 65%);
}

.floating-icons {
  position: absolute;
  inset: 8% 8% 48% 8%;
  pointer-events: none;
}

.float-icon {
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  animation: float 5.5s ease-in-out infinite;
  color: #fff;
  font-size: 1rem;
}

.float-icon.i1 { left: 8%; top: 18%; }
.float-icon.i2 { left: 28%; top: 4%; animation-delay: 0.6s; }
.float-icon.i3 { right: 22%; top: 10%; animation-delay: 1.1s; }
.float-icon.i4 { right: 8%; top: 32%; animation-delay: 0.3s; }
.float-icon.i5 { left: 18%; top: 48%; animation-delay: 1.4s; }
.float-icon.i6 { right: 30%; top: 42%; animation-delay: 0.9s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.promo-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.laptop {
  width: min(420px, 100%);
  margin-bottom: 36px;
  filter: drop-shadow(0 28px 50px rgba(0, 0, 0, 0.35));
}

.laptop-frame {
  background: #111827;
  border-radius: 14px 14px 8px 8px;
  padding: 10px 10px 0;
  border: 2px solid #1f2937;
}

.laptop-screen {
  background: #f8fafc;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  min-height: 220px;
  display: grid;
  grid-template-columns: 56px 1fr;
}

.mock-side {
  background: #1e3a8a;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mock-dot {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.28);
}

.mock-dot.active { background: #fff; }

.mock-main { padding: 12px; }

.mock-top {
  height: 18px;
  border-radius: 6px;
  background: #e5e7eb;
  margin-bottom: 10px;
}

.mock-table {
  display: grid;
  gap: 6px;
}

.mock-row {
  height: 14px;
  border-radius: 4px;
  background: #eef2ff;
}

.mock-row:nth-child(odd) { background: #e5e7eb; width: 92%; }
.mock-row:nth-child(even) { width: 100%; }
.mock-row.head { background: #dbeafe; width: 100%; height: 16px; }

.laptop-base {
  height: 12px;
  background: #374151;
  border-radius: 0 0 10px 10px;
  margin: 0 24px;
  position: relative;
}

.laptop-base::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -8px;
  transform: translateX(-50%);
  width: 140%;
  height: 8px;
  background: #1f2937;
  border-radius: 0 0 16px 16px;
}

.promo-copy h2 {
  font-size: 1.65rem;
  font-weight: 700;
  margin: 0 0 12px;
  letter-spacing: -0.02em;
}

.promo-copy p {
  font-size: 0.95rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.85);
  max-width: 420px;
  margin: 0 auto 28px;
}

.dots {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.dot {
  width: 28px;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.35);
  border: none;
  cursor: pointer;
  padding: 0;
}

.dot.active { background: #fff; }

@media (max-width: 960px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .promo-pane {
    min-height: auto;
    padding: 56px 24px 40px;
    order: -1;
  }

  .floating-icons { display: none; }
  .laptop { width: min(320px, 100%); margin-bottom: 24px; }
  .promo-copy h2 { font-size: 1.35rem; }
  .promo-copy p { font-size: 0.9rem; margin-bottom: 20px; }
}

@media (max-width: 480px) {
  .form-pane { padding: 32px 20px; }
}
</style>
