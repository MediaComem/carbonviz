<script>
import { useI18n } from 'vue-i18n';
import { setup as setupHistoryLayers } from '../composables/history';
import Stratum from './HistoryStratum.vue';
import PeriodPicker from './PeriodPicker.vue';
import TypePicker from './TypePicker.vue';
import { onMounted, computed, provide, watch, ref, toRefs } from 'vue';

export default {
  components: { PeriodPicker, TypePicker, Stratum },
  props: {
    defaultDataType: {
      type: String,
      default: "co2"
    },
    hideTypeChange: {
      type: Boolean,
      default: false
    }
  },

  setup(props, context) {
    const { t } = useI18n({});
    let timePeriod = ref("days");
    const { defaultDataType , hideTypeChange } = toRefs(props);
    const dataType = ref(defaultDataType.value);
    const scrollContainer = ref(null);
    let scrollCount = ref(0);
    let scrollMore = ref(true);
    let initialHistoryCount = 0;
		const active_index = ref(-1);
		provide('active_index', active_index);

    const { layers, historyCount, scroll } = setupHistoryLayers(dataType, timePeriod, scrollCount);
    const isCo2 = computed(() => dataType.value === 'co2'); //formula to find ! borne entre min max(200px) (easing linear ?)
    const isData = computed(() => dataType.value === 'data'); //formula to find ! borne entre min max(200px) (easing linear ?)
    const scrollDataComponent = ref(0);
    const scrollCo2Component = ref(0);

    onMounted(() => resetDefaults());

    function resetDefaults() {
      scrollContainer.value.scrollTo(0,0);
      scrollCount.value = 0;
      initialHistoryCount = 0;
      scrollMore.value = scrollContainer.value.wrapRef.scrollHeight > scrollContainer.value.wrapRef.clientHeight;
    }

    // Updating history setting, data period and type
    function periodChange(newPeriod) {
      timePeriod.value = newPeriod;
      resetDefaults();
    };
    function measureChange (newDataType) {
      dataType.value = newDataType;
      resetDefaults();
    };

    function historyChange () {
      scrollMore.value = (initialHistoryCount != historyCount.value);
      initialHistoryCount = historyCount.value;
    }

    // Check expansion / collapse of layers
    const layerExpanded = (offset) => {
      if (isCo2.value) {
        scrollCo2Component.value = scroll.value + offset;
      }
      if (isData.value) {
        scrollDataComponent.value = scroll.value + offset;
      }
    }

    const layerCollapsed = (_offset) => {
      if (isCo2.value) {
        scrollCo2Component.value = scroll.value;
      }
      if (isData.value) {
        scrollDataComponent.value = scroll.value;
      }
    }

    watch(scrollCount, historyChange)

    // scroll event to load more history
    function handleScroll() {
      const { scrollTop, offsetHeight, scrollHeight } = scrollContainer.value.wrapRef;
      if ((scrollTop + offsetHeight + 5) >= scrollHeight) {
        if(scrollMore.value) {
          scrollCount.value += 1;
        }
      }
    }

    return {
      timePeriod, dataType, isCo2, isData, layers, scrollMore, historyCount, hideTypeChange,
      t, periodChange, measureChange, layerExpanded, layerCollapsed, handleScroll, scrollContainer
    };
  }

}
</script>

<template>
  <div class="buttons">
    <period-picker @change="periodChange"></period-picker>
    <type-picker v-if="!hideTypeChange" @change="measureChange"></type-picker>
  </div>
  <div class="dataArea">
    <el-scrollbar
      :noresize="true"
      id="history"
      class="history-wrapper"
      @scroll="handleScroll"
      ref="scrollContainer">
      <stratum v-for="(layer, index) in layers" :key="layer.key"
        :type="dataType" :index="index"
        :layer="layer"
        @willExpand="layerExpanded" @willCollapse="layerCollapsed">
      </stratum>
      <!-- infinite scroll check if more items to load -->
      <div class="scroll">
        <div v-if="scrollMore">
          <img :src="`../../../assets/icons/${dataType}.svg`" alt="" width="50" height="50">
          <p>{{ t('components.history.scrolling') }}</p>
        </div>
        <div v-else>
          <img class="iconEndScroll" :src="`../../../assets/icons/${dataType}.svg`" alt="" width="50" height="50">
          <p id="scrollEndText">{{ t('components.history.scrollEnd') }}</p>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>
  div {
    cursor: pointer;
  }
  .buttons {
    height: 30px;
    margin-bottom: 30px;
    display: flex;
    width: 100%;
    column-gap: 9px;
  }
  .dataArea {
    display: flex;
    width: 100%;
    height: 87%;
  }
  .history-wrapper {
    transition: margin-top 0.5s ease;
    flex-grow: 1;
    width: 90%;
    position: relative;
    box-shadow: inset 0px 0px 8px rgba(0, 0, 0, 0.25);
    border-radius: 5px;
  }
  .scroll>div {
    padding-top: 40px;
    padding-bottom: 40px;
  }
  .history-wrapper div:first-child {
    border-top: none;
  }

  .scroll {
    text-align: center;
  }
  .scroll div p {
    margin: auto;
  }
  .scroll #scrollEndText {
    font-size: 12px;
    width: 120px;
    font-weight: 600;
  }
  @media (prefers-color-scheme: dark) {

  }
</style>

<style>
  /* element plus overrides  */
  .history-wrapper .wrapper .el-col.el-col-12 {
    max-width: 60%;
    flex: 0 0 60%;
  }
  .history-wrapper .wrapper .label.bold {
    max-width: 70px;
  }
</style>