<script>
import { setup as setupHistoryLayers } from '../composables/history';
import Stratum from './HistoryStratum.vue';
import { computed, provide, watch, toRefs, ref } from 'vue';
import { layerHeightCo2, layerHeightData } from '../composables/history'

/*
interface HistoryLayerData {
  amount: number,
  label: string,
}
interface HistoryLayer extends HistoryLayerData{
  details?: HistoryLayerData[]
}
*/

export default {
  components: { Stratum },

  props: {
    type: {type: String}
  },

  setup(props, context) {
		const active_index = ref(-1);
		provide('active_index', active_index);

    const { type } = toRefs(props)
    const { layers, scroll, show, stage, maxStage, nextStage, previousStage } = setupHistoryLayers(type.value);
    const isCo2 = computed(() => type.value === 'co2'); //formula to find ! borne entre min max(200px) (easing linear ?)
    const isData = computed(() => type.value === 'data'); //formula to find ! borne entre min max(200px) (easing linear ?)
    const scrollDataComponent = ref(0);
    const scrollCo2Component = ref(0);

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

    watch(active_index, index => {
      const navigation = window.document.querySelector('.navigation-boxes');
      const menu = window.document.querySelector('.menu');
      const expanded = index !== -1;
      if (expanded) {
        navigation.classList.add('outside');
        menu.classList.add('outside');
      } else {
        navigation.classList.remove('outside');
        menu.classList.remove('outside');
      }
    });

    return {isCo2, isData, layers, layerHeightCo2, layerHeightData,
            scroll, scrollCo2Component, scrollDataComponent, show,
            stage, maxStage, nextStage, previousStage,
            layerExpanded, layerCollapsed };
  }

}
</script>

<template>
  <div v-if="show" :style="`--top: ${isCo2 ? -scrollCo2Component : 0}px`" class="history-wrapper">
    <stratum v-for="(layer, index) in layers" :key="index"
      :type="type" :index="index" :stage="stage"
      :layer="layer"
      @willExpand="layerExpanded" @willCollapse="layerCollapsed"></stratum>
  </div>
</template>

<style scoped>
  div {
    cursor: pointer;
  }
  .history-wrapper {
    margin-top: var(--top);
    transition: margin-top 0.5s ease;
  }
  @media (prefers-color-scheme: dark) {

  }
</style>
