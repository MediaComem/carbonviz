<script>
import Statistics from '../components/Statistics.vue'
import { inject, onMounted, ref } from 'vue';
import { ElRow, ElCol } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { tips } from '../../../utils/tips';

export default {
  components: {
    ElRow, ElCol, Statistics
  },
  setup() {
    const { t, locale } = useI18n({});
    const scroll = ref(null);

    const subNav = {
      'Weekly trends': t('components.statistics.day.trend'),
      'Monthly trends': t('components.statistics.month.trend'),
      'Recommandations': t('components.statistics.recommandations')
    };
    const setSubNav = inject('setSubNav');
    onMounted(() => setSubNav(subNav, scroll));
    const activeTips = ['streaming_resolution'];
    const goToSettings = () => { window.location.href='#Settings' };
    return { t, locale, scroll, tips, activeTips, goToSettings };
  }

}
</script>

<template>
  <el-scrollbar ref="scroll">
    <h1 class="title" data-section="Weekly trends">{{ t(`components.statistics.day.trend`) }}</h1>
    <h3 class="subtitle">{{ t(`components.statistics.day.details`) }}</h3>
    <div class="weekly">
      <div class="stats">
        <statistics type="co2" subtype="web" granularity="day" :height="180">
          <template #title>{{ t('global.internet') }}</template>
        </statistics>
        <statistics type="co2" subtype="computer" granularity="day" :height="180" class="computer_trends">
          <template #title>{{ t('global.computerEnergy') }} <span @click="goToSettings" style="font-weight: 400; text-decoration : underline; cursor: pointer;">{{ t('global.settings') }}</span></template>
          <template #info>
            <div>💡</div>
            <div>
              {{ t('components.statistics.computerInfo') }}
              {{ t('components.statistics.computerTip') }} <span @click="goToSettings" style="text-decoration : underline; cursor: pointer;">{{ t('global.settings') }}</span>
            </div>
          </template>
        </statistics>
      </div>
      <div class="stats">
        <statistics type="data" subtype="web" granularity="day" :height="200"></statistics>
      </div>
    </div>
    <h1 class="title" data-section="Monthly trends">{{ t(`components.statistics.month.trend`) }}</h1>
    <h3 class="subtitle">{{ t(`components.statistics.month.details`) }}</h3>
    <div class="monthly">
      <div class="stats">
        <statistics type="co2" subtype="web" granularity="month" :height="180">
          <template #title>{{ t('global.internet') }}</template>
        </statistics>
        <statistics type="co2" subtype="computer" granularity="month" :height="180" class="computer_trends">
          <template #title>{{ t('global.computerEnergy') }} <span @click="goToSettings" style="font-weight: 400; text-decoration : underline; cursor: pointer;">{{ t('global.settings') }}</span></template>
          <template #info>
            <div>💡</div>
            <div>
              {{ t('components.statistics.computerInfo') }}
              {{ t('components.statistics.computerTip') }} <span @click="goToSettings" style="text-decoration : underline; cursor: pointer;">{{ t('global.settings') }}</span>
            </div>
          </template>
        </statistics>
      </div>
      <div class="stats">
        <statistics type="data" subtype="web" granularity="month" :height="200"></statistics>
      </div>
    </div>
    <h1 class="title" data-section="Recommandations">{{ t(`components.statistics.recommandations`) }}</h1>
    <h3 class="subtitle">{{ t(`components.statistics.tips`) }}</h3>
    <div class="line"></div>
    <div class="tips">
      <el-collapse v-model="activeTips">
      <el-collapse-item v-for="tip in tips" :key="tip.id" :title="tip.title[locale]" :name="tip.id">
        <div v-html="tip.detailsHTML[locale]"></div>
      </el-collapse-item>
      </el-collapse>
    </div>
  </el-scrollbar>
</template>

<style scoped lang="scss">

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

.stats {
  width: 470px;
}

.tips {
  max-width: 800px;
  margin-bottom: 20px;
  :deep(.el-collapse-item__header) {
    font-weight: 700;
  }
}

a, :deep(a) {
  color: black;
  font-style: italic;
}
a:visited, :deep(a:visited) {
  color: black;
}
</style>