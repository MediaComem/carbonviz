<template>
  <div id="time">
    <button v-for="period in periods" :key="period"
      type="button"
      :name="period"
      :class="{activeButton: (timePeriod === period) }"
      @click="changePeriod(period)"
      >
        {{ t(`global.period.${period}`) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, toRefs } from 'vue';

export type Period = 'days'|'weeks'|'months';

export interface Props {
  periods: Period[]
}

const { t } = useI18n({});

const props = withDefaults(defineProps<Props>(), {
  periods: () => ['days', 'weeks', 'months'],
})

const { periods } = toRefs(props);

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