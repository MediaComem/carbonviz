<template>
  <div id="type">
    <button type="button" name="co2" :class="{activeButton: isCo2}" @click="changeType('co2')"> {{ t('global.co2') }}</button>
    <button type="button" name="data" :class="{activeButton: isData}" @click="changeType('data')"> {{ t('global.data') }}</button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
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

<style scoped>
  #type {
    display: flex;
    width: 100%;
  }

  #type button {
    flex-grow: 1;
    cursor: pointer;
    border: 2px solid var(--grey);
    background-color: var(--activeBackground);
    color: var(--activeColor);
    font-weight: var(--activeWeight);
    margin: 0.5px;
  }
  #type button:first-child {
    border-radius: 5px 0px 0px 5px;
  }
  #type button:last-child {
    border-radius: 0px 5px 5px 0px;
  }
</style>