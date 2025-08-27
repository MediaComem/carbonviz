<template>
  <div class="buttons">
   <period-picker :periods="['days', 'months']" @change="switchPeriod"></period-picker>
   <type-picker @change="switchType"></type-picker>
  </div>
  <el-scrollbar class="wrapper">
    <div v-if="type === 'co2'">
      <statistics :type="type" subtype="web" :granularity="granularity" :height="180">
        <template #title>{{ t('global.internet') }}</template>
      </statistics>
      <statistics :type="type" subtype="computer" :granularity="granularity" :height="180" class="computer_trends">
        <template #title>{{ t('global.computerEnergy') }} <span @click="$emit('showSettings')" style="font-weight: 400; text-decoration : underline; cursor: pointer;">{{ t('global.settings') }}</span></template>
        <template #info>
          <div>💡</div>
          <div>
            {{ t('components.statistics.computerInfo') }}
            {{ t('components.statistics.computerTip') }} <span @click="$emit('showSettings')" style="text-decoration : underline; cursor: pointer;">{{ t('global.settings') }}</span>
          </div>
        </template>
      </statistics>
    </div>
    <div v-if="type === 'data'">
      <statistics :type="type" subtype="web" :granularity="granularity" :height="200"></statistics>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Statistics from './Statistics.vue'
import PeriodPicker from './PeriodPicker.vue';
import TypePicker from './TypePicker.vue';
import { Indicator } from '../utils/types';
import { useI18n } from 'vue-i18n';

const { t } = useI18n({});

const emit = defineEmits<{
  (e: 'showSettings'): void
}>()

const type = ref('co2');
const period = ref('days');
const granularity = computed(() => {
  switch(period.value) {
    case 'days':
      return 'day';
    case 'months':
      return 'month';
    default:
      throw('Invalid period for trends');
  }
});

const switchPeriod = (newPeriod : 'days' | 'months') => {
      period.value = newPeriod;
    }

const switchType = (newType: Indicator) => {
  type.value = newType;
}
</script>

<style scoped>
  .buttons {
    height: 30px;
    display: flex;
    width: 100%;
    column-gap: 9px;
  }
  .wrapper {
    width: 100%;
    height: 426px;
    margin-top: 29px;
    position: relative;
    box-shadow: inset 0px 0px 8px rgba(0, 0, 0, 0.25);
    border-radius: 5px;
    background-color: var(--background-grey);
  }
  .computer_trends{
    margin-top: 20px;
    padding-bottom: 12px;
  }

  @media (prefers-color-scheme: dark) {
    .wrapper {
      background-color: var(--activeBackground);
    }
    :deep(.apexcharts-xaxis-label),
    :deep(.apexcharts-yaxis-label) {
      fill: white;
    }
    :deep(.apexcharts-yaxis-annotations line) {
      stroke: var(--green) !important;
    }

  }
</style>