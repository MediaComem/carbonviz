<script>
import { useI18n } from 'vue-i18n'
import { setup as setupHistoryLayers } from '../composables/history';
import Stratum from './HistoryStratum.vue';
import { computed, provide, watch, toRefs, ref } from 'vue';
import { layerHeightCo2, layerHeightData } from '../composables/history'

export default {
  components: { Stratum },

  setup(props, context) {
    const { t } = useI18n({});
    let timePeriod = ref("days");
    let dataType = ref("co2");
		const active_index = ref(-1);
		provide('active_index', active_index);

    const { layers, scroll, show, stage, maxStage, nextStage, previousStage } = setupHistoryLayers(dataType, timePeriod);
    const isCo2 = computed(() => dataType.value === 'co2'); //formula to find ! borne entre min max(200px) (easing linear ?)
    const isData = computed(() => dataType.value === 'data'); //formula to find ! borne entre min max(200px) (easing linear ?)
    const scrollDataComponent = ref(0);
    const scrollCo2Component = ref(0);

    // Updating history setting, data period and type
    function periodChange(newPeriod) {
      let btnList = document.getElementById("time").getElementsByTagName("Button");
      for (let button of btnList) {
        if (button.name === newPeriod) {
          button.classList.add("activeButton");
        }
        else {
          button.classList.remove("activeButton")
        }
      };
      timePeriod.value = newPeriod;
    };
    function messureChange (newDataType) {
      let btnList = document.getElementById("type").getElementsByTagName("Button");
      for (let button of btnList) {
        if (button.name === newDataType) {
          button.classList.add("activeButton");
        }
        else {
          button.classList.remove("activeButton")
        }
      };
      dataType.value = newDataType;
    };

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
      anim.style.transition = 'top 0.5s ease';
      watch(show, isShown => anim.style.top = isShown ? `${-scroll.value}px` : '0px');
      watch(scroll, _val => scrollDataComponent.value = _val);
      watch(scrollDataComponent, val => anim.style.top = show.value ? `${-val}px` : '0px');
      anim.style.top = 0;
    }

    watch(stage, () => {
      // reset active index when moving to another stage
      active_index.value = -1;
    })

    return {t, timePeriod, dataType, periodChange, messureChange,
            isCo2, isData, layers, layerHeightCo2, layerHeightData,
            scroll, scrollCo2Component, scrollDataComponent, show,
            stage, maxStage, nextStage, previousStage,
            layerExpanded, layerCollapsed };
  }

}
</script>

<template>
  <div id="time">
    <button type="button" name="days" class="activeButton" @click='periodChange("days")'> {{ t('components.history.days') }}</button>
    <button type="button" name="weeks" @click='periodChange("weeks")'> {{ t('components.history.weeks') }}</button>
    <button type="button" name="months" @click='periodChange("months")'> {{ t('components.history.months') }}</button>
  </div>
  <div id="type">
    <button type="button" name="co2" class="activeButton" @click='messureChange("co2")'> {{ t('global.co2') }}</button>
    <button type="button" name="data" @click='messureChange("data")'> {{ t('global.data') }}</button>
  </div>
  <div class="dataArea">
    <div class="history-wrapper">
    <stratum v-for="(layer, index) in layers" :key="layer.label"
      :type="dataType" :index="index" :stage="stage"
      :layer="layer"
      @willExpand="layerExpanded" @willCollapse="layerCollapsed"></stratum>
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
    border-radius: 5px;
    background-color: var(--activeBackground);
    color: var(--activeColor);
  }
  .dataArea {
    display: flex;
    width: 100%;
    height: 60%;
  }
  .history-wrapper {
    margin-top: 5px;
    transition: margin-top 0.5s ease;
    flex-grow: 1;
    width: 90%;
    overflow-y: scroll;
    position: relative;
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
  @media (prefers-color-scheme: dark) {

  }
</style>
