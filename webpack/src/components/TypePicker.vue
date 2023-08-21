<template>
  <div id="type">
    <button type="button" name="co2" :class="{activeButton: isCo2}" @click="changeType('co2')"> {{ t('global.co2') }}</button>
    <button type="button" name="data" :class="{activeButton: isData}" @click="changeType('data')"> {{ t('global.data') }}</button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, ref, toRefs } from 'vue';

const { t } = useI18n({});

const emit = defineEmits<{
  (e: 'change', value: 'co2' | 'data'): void
}>()

const dataType = ref('co2');

const isCo2 = computed(() => dataType.value === 'co2'); //formula to find ! borne entre min max(200px) (easing linear ?)
const isData = computed(() => dataType.value === 'data'); //formula to find ! borne entre min max(200px) (easing linear ?)

const changeType = (type) => {
  dataType.value = type;
  emit('change', type);
}

</script>

<style scoped lang="scss">
  #type {
    display: flex;
    width: 100%;
    border: 1px solid #D8D8D8;
    border-radius: 5px;
  }

  #type button {
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