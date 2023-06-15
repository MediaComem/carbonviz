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
    <h1 class="title">{{ t(`components.statistics.day.trend`) }}</h1>
    <h3 class="subtitle">{{ t(`components.statistics.day.details`) }}</h3>
    <div class="line"></div>
    <div class="weekly">
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
        <statistics type="data" subtype="web" granularity="day" :height="200"></statistics>
      </div>
    </div>
    <h1 class="title">{{ t(`components.statistics.month.trend`) }}</h1>
    <h3 class="subtitle">{{ t(`components.statistics.month.details`) }}</h3>
    <div class="line"></div>
    <div class="monthly">
      <div>
        <statistics type="co2" subtype="web" granularity="month" :height="180">
          <template #title>{{ t('global.internet') }}</template>
        </statistics>
        <statistics type="co2" subtype="computer" granularity="month" :height="180" class="computer_trends">
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
    </div>
  </el-scrollbar>
</template>

<style scoped lang="scss">
.content {
  max-width: 1000px;
}

h1.title {
  font-size: 32px;
  padding-bottom: 0px;
}

h3.subtitle {
  margin: 0px 0px 14px 0px;
  padding: 0px;
}


.line {
  width: 175px;
  height: 0px;
  border: 1px solid #000000;
}

.weekly, .monthly {
  display: flex;
  column-gap: 40px;
}

.monthly {
  padding-bottom: 20px;
}

</style>