<script>
import { useI18n } from 'vue-i18n'
import { setup as setupHistoryLayers } from '../composables/history';
import Stratum from './HistoryStratum.vue';
import { computed, provide, watch, ref } from 'vue';

export default {
  components: { Stratum },
  props: {
    dafaultDataType: {
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
    const dataType = ref(props.dafaultDataType);
    const hideTypeChange = ref(props.hideTypeChange);
    let scrollCount = ref(0);
    let scrollMore = ref(true);
    let initialHistoryCount = 0;
		const active_index = ref(-1);
		provide('active_index', active_index);

    const { layers, historyCount, scroll, show, stage, maxStage, nextStage, previousStage } = setupHistoryLayers(dataType, timePeriod, scrollCount);
    const isCo2 = computed(() => dataType.value === 'co2'); //formula to find ! borne entre min max(200px) (easing linear ?)
    const isData = computed(() => dataType.value === 'data'); //formula to find ! borne entre min max(200px) (easing linear ?)
    const scrollDataComponent = ref(0);
    const scrollCo2Component = ref(0);

    function resetDefaults() {
      window.scrollTo(0,0);
      const historyDiv = document.getElementById('history');
      historyDiv.scrollTop = 0;
      scrollCount.value = 0;
      initialHistoryCount = 0;
      scrollMore.value = true;
    }

    // Updating history setting, data period and type
    function periodChange(newPeriod) {
      timePeriod.value = newPeriod;
      resetDefaults();
    };
    function messureChange (newDataType) {
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

    // for Co2 we need to manage expansion / collapse of layers
    // in case close to the top or bottom of screen to avoid layer partially hidden
    if (isCo2.value) {
      watch(scroll, _val => scrollCo2Component.value = _val);
    }

    // for DATA we need "move up" the animation by the height of the stratums
    // in addition to manage expansion / collapse of layers
    if (isData.value) {
      const anim = window.document.querySelector('.animation');
      if (anim) {
        anim.style.transition = 'top 0.5s ease';
        watch(show, isShown => anim.style.top = isShown ? `${-scroll.value}px` : '0px');
        watch(scroll, _val => scrollDataComponent.value = _val);
        watch(scrollDataComponent, val => anim.style.top = show.value ? `${-val}px` : '0px');
        anim.style.top = 0;
      }
    }

    watch(stage, () => {
      // reset active index when moving to another stage
      active_index.value = -1;
    })

    watch(scrollCount, historyChange)

    // scroll event to load more history
    function handleScroll(e) {
      const { scrollTop, offsetHeight, scrollHeight } = e.target
      if ((scrollTop + offsetHeight + 5) >= scrollHeight) {
        if(scrollMore.value) {
          scrollCount.value += 1;
        }
      }
    }

    return {
      timePeriod, dataType, isCo2, isData, layers, stage, maxStage, scrollMore, historyCount, hideTypeChange,
      t, periodChange, messureChange, layerExpanded, layerCollapsed, handleScroll
    };
  }

}
</script>

<template>
  <div id="time">
    <button type="button" name="days" :class="{activeButton: timePeriod ==='days'}" @click='periodChange("days")'> {{ t('global.period.days') }}</button>
    <button type="button" name="weeks" :class="{activeButton: timePeriod ==='weeks'}" @click='periodChange("weeks")'> {{ t('global.period.weeks') }}</button>
    <button type="button" name="months" :class="{activeButton: timePeriod ==='months'}" @click='periodChange("months")'> {{ t('global.period.months') }}</button>
  </div>
  <div v-if="!hideTypeChange" id="type">
    <button type="button" name="co2" :class="{activeButton: isCo2}" @click='messureChange("co2")'> {{ t('global.co2') }}</button>
    <button type="button" name="data" :class="{activeButton: isData}" @click='messureChange("data")'> {{ t('global.data') }}</button>
  </div>
  <div class="dataArea">
    <div id="history" class="history-wrapper" @scroll="handleScroll">
      <stratum v-for="(layer, index) in layers" :key="layer.key"
        :type="dataType" :index="index" :stage="stage"
        :layer="layer"
        @willExpand="layerExpanded" @willCollapse="layerCollapsed">
      </stratum>
      <!-- infinite scroll check if more items to load -->
      <div class="scroll">
        <div v-if="scrollMore">
          <img src="../../../icons/loading.gif" alt="" width="50" height="50">
        </div>
        <div v-else class="noLoading">
          <img src="../../../icons/fullScroll.svg" alt="" width="50" height="50">
          <p>{{ t('components.history.scrollEnd') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  div {
    cursor: pointer;
  }
  #time, #type {
    display: flex;
    height: 5%;
    width: 100%;
  }
  #time button, #type button {
    flex-grow: 1;
    cursor: pointer;
    background-color: var(--activeBackground);
    color: var(--activeColor);
    margin: 0.5px;
  }
  #time button:first-child, #type button:first-child {
    border-radius: 5px 0px 0px 5px;
  }
  #time button:last-child, #type button:last-child {
    border-radius: 0px 5px 5px 0px;
  }
  .dataArea {
    display: flex;
    width: 100%;
    height: 70%;
  }
  .history-wrapper {
    margin-top: 20px;
    transition: margin-top 0.5s ease;
    flex-grow: 1;
    width: 90%;
    overflow-y: scroll;
    position: relative;
  }
  .history-wrapper:first-child:before {
    content:'';
    position:absolute;
    width:100%;
    height:5px;
    z-index: 1;
    background:linear-gradient(var(--white), #0000);
  }
  .scroll>div {
    padding-top: 40px;
  }
  .scroll:before {
    content:'';
    left: 0;
    position:absolute;
    width:100%;
    height:5px;
    margin-top: -5px;
    background:linear-gradient(#0000, var(--white));
  }
  .history-wrapper div:first-child {
    border-top: none;
  }
  /* Custom scrool */
  .history-wrapper::-webkit-scrollbar {
    width: 10px;
    height: 10px;
    position: absolute;
    left: 0;
    z-index: 100;
    scrollbar-width: thin;
  }
  .history-wrapper::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px grey;
    border-radius: 10px;
  }
  .history-wrapper::-webkit-scrollbar-thumb {
    height: 6px;
    border: 4px solid rgba(0, 0, 0, 0);
    border-radius: 10px;
    background-clip: padding-box;
    -webkit-border-radius: 10px;
    background: var(--grey);
  }
  .history-wrapper::-webkit-scrollbar-thumb:hover {
    background: var(--dark-grey);
  }
  .scroll {
    text-align: center;
  }
  .noLoading p {
    margin: auto;
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