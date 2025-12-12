<template>
    <div class="loader-container" v-if="visible">
      <div class="spinner">
        <svg class="progress-ring" width="120" height="120">
          <circle
            class="progress-ring__circle"
            stroke="currentColor"
            stroke-width="10"
            fill="transparent"
            r="50"
            cx="60"
            cy="60"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
          />
        </svg>
        <div class="percentage">{{ percentage }}%</div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    percentage: {
      type: Number,
      required: true
    },
    visible: {
      type: Boolean,
      default: true
    }
  })
  
  const radius = 50
  const circumference = 2 * Math.PI * radius
  
  const dashOffset = computed(() => {
    return circumference - (props.percentage / 100) * circumference
  })
  </script>
  
  <style scoped>
  .loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    width: 200px;
    position: relative;
  }
  .spinner {
    position: relative;
    width: 120px;
    height: 120px;
  }
  .progress-ring__circle {
    transition: stroke-dashoffset 0.3s;
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
    stroke: #3498db;
  }
  .percentage {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 20px;
    font-weight: bold;
    color: #333;
  }
  </style>
  