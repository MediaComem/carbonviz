<script>
import Statistics from './Statistics.vue'
import { inject, onMounted } from 'vue';
import { ElRow, ElCol } from 'element-plus';
import { useI18n } from 'vue-i18n';

const subNav = {
};

export default {
  components: {
    ElRow, ElCol, Statistics
  },
  setup() {

    const { t } = useI18n({});
    const setSubNav = inject('setSubNav');
    onMounted(() => setSubNav(subNav));
    return { t };
  }

}
</script>

<template>
  <el-scrollbar>
    <div>
      <statistics type="co2" subtype="web" granularity="day" :height="180">
        <template #title>{{ t('global.internet') }}</template>
      </statistics>
      <statistics type="co2" subtype="computer" granularity="day" :height="180" class="computer_trends">
        <template #title>{{ t('global.computerEnergy') }}</template>
        <template #info>
          {{ t('components.statistics.computerInfo') }}<br/>
          {{ t('components.statistics.computerTip') }} <span @click="$emit('showSettings')" style="text-decoration : underline; cursor: pointer;">{{ t('global.settings') }}</span>
        </template>
      </statistics>
    </div>
    <div>
      <statistics type="co2" subtype="web" granularity="day" :height="200"></statistics>
    </div>
    <div>
      <statistics type="data" subtype="web" granularity="month" :height="180">
        <template #title>{{ t('global.internet') }}</template>
      </statistics>
      <statistics type="data" subtype="computer" granularity="month" :height="180" class="computer_trends">
        <template #title>{{ t('global.computerEnergy') }}</template>
        <template #info>
          {{ t('components.statistics.computerInfo') }}<br/>
          {{ t('components.statistics.computerTip') }} <span @click="$emit('showSettings')" style="text-decoration : underline; cursor: pointer;">{{ t('global.settings') }}</span>
        </template>
      </statistics>
    </div>
    <div>
      <statistics type="data" subtype="web" granularity="month" :height="200"></statistics>
    </div>
  </el-scrollbar>
</template>

<style scoped lang="scss">
.content {
  max-width: 1000px;
}


</style>