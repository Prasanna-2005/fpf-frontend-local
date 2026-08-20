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
  filter: brightness(0) invert(1);
}
</style>
