<template>
  <div class="buttons">
   <period-picker :periods="['days', 'months']" @change="switchPeriod"></period-picker>
   <type-picker @change="switchType"></type-picker>
  </div>
  <div class="wrapper">
    <div v-if="type === 'co2'">
      <statistics :type="type" :granularity="granularity" :height="200"></statistics>
      <statistics :type="type" :granularity="granularity" :height="200"></statistics>
    </div>
    <div v-if="type === 'data'">
      <statistics :type="type" :granularity="granularity" :height="350"></statistics>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Statistics from './Statistics.vue'
import PeriodPicker from './PeriodPicker.vue';
import TypePicker from './TypePicker.vue';
import { Indicator } from '../utils/types';

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
    margin-top: 20px;
    position: relative;
    box-shadow: inset 0px 0px 8px rgba(0, 0, 0, 0.25);
    border-radius: 5px;
    background-color: var(--background-grey);
  }
</style>