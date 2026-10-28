<template>
  <section class="stats" aria-label="Filing summary">
    <div v-for="card in cards" :key="card.label" class="stat-card">
      <div>
        <div class="value">{{ padCount(card.value) }}</div>
        <div class="label">{{ card.label }}</div>
      </div>
      <div class="stat-icon" :class="card.tone">
        <img v-if="card.image" :src="card.image" alt="" class="stat-image" />
        <font-awesome-icon v-else :icon="card.icon" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { padCount } from '@/assets/utils/filingDashboardUtils'
import archiveIcon from '@/assets/images/archive.png'

const props = defineProps({
  stats: {
    type: Object,
    required: true,
  },
})

const cards = computed(() => [
  { label: 'Total Filings', value: props.stats.total, icon: 'file-lines', tone: 'blue' },
  { label: 'Approved', value: props.stats.approved, icon: 'check-circle', tone: 'green' },
  { label: 'Under Review', value: props.stats.review, icon: 'clock-rotate-left', tone: 'orange' },
  { label: 'Draft', value: props.stats.draft, icon: 'pen', tone: 'slate' },
  { label: 'Archived', value: props.stats.archived, image: archiveIcon, tone: 'red' },
])
</script>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  flex-shrink: 0;
}

.stat-card {
  background: var(--dash-card, #fff);
  border: 1px solid var(--dash-border, #e5e7eb);
  border-radius: 12px;
  padding: 20px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.stat-card .value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 4px;
}

.stat-card .label {
  font-size: 0.85rem;
  color: var(--dash-muted, #6b7280);
  font-weight: 500;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.1rem;
}

.stat-icon.blue {
  background: #dbeafe;
  color: #1e40af;
}
.stat-icon.green {
  background: #dcfce7;
  color: #166534;
}
.stat-icon.orange {
  background: #ffedd5;
  color: #9a3412;
}
.stat-icon.slate {
  background: #e2e8f0;
  color: #334155;
}
.stat-icon.red {
  background: #fee2e2;
  color: #b91c1c;
}

.stat-image {
  width: 22px;
  height: 22px;
  object-fit: contain;
  display: block;
}

@media (max-width: 1200px) {
  .stats {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
