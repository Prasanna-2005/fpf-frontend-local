<template>
  <div class="brand-logo" :class="variant">
    <img
      :src="logoSrc"
      alt="Quantrium"
      class="brand-logo-img"
    />
  </div>
</template>

<script setup>
import logoSrc from '@/assets/images/quantrium-logo.png'

defineProps({
  variant: {
    type: String,
    default: 'dark'
  }
})
</script>

<style scoped>
.brand-logo {
  display: inline-flex;
  align-items: center;
  line-height: 0;
}

.brand-logo-img {
  display: block;
  height: 28px;
  width: auto;
}

.brand-logo.light .brand-logo-img {
  /* Inverts dark text to white while making the white background black */
  filter: invert(1) grayscale(1) contrast(200%);
  /* Blends out the pure black background on dark sidebars */
  mix-blend-mode: screen;
}
</style>
