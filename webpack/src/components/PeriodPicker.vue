<template>
  <div id="time">
    <button type="button" name="days" :class="{activeButton: timePeriod ==='days'}" @click="changePeriod('days')"> {{ t('global.period.days') }}</button>
    <button type="button" name="weeks" :class="{activeButton: timePeriod ==='weeks'}" @click="changePeriod('weeks')"> {{ t('global.period.weeks') }}</button>
    <button type="button" name="months" :class="{activeButton: timePeriod ==='months'}" @click="changePeriod('months')"> {{ t('global.period.months') }}</button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref } from 'vue';

const { t } = useI18n({});

const emit = defineEmits<{
  (e: 'change', value: 'days' | 'weeks' | 'months'): void
}>()

const timePeriod = ref("days");

const changePeriod = (period) => {
  timePeriod.value = period;
  emit('change', period);
}

</script>

<style scoped lang="scss">
  #time {
    display: flex;
    width: 100%;
    border: 1px solid #D8D8D8;
    border-radius: 5px;
  }

  #time button {
    flex-grow: 1;
    cursor: pointer;
    background-color: var(--activeBackground);
    color: var(--activeColor);
    font-weight: var(--activeWeight);
    margin: 0.5px;
    &:not(:first-child) {
      border-left: 1px solid var(--grey);
    }
  }

</style>