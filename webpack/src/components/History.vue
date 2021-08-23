<script>
import { setup as setupHistoryLayers } from '../composables/history';
import Stratum from './HistoryStratum.vue';
import { computed, provide, watch, toRefs, ref } from 'vue';

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


    // for DATA we need "move up" the animation by the height of the stratums
    if (isData.value) {
      const anim = window.document.querySelector('.animation');
      anim.style.transition = 'top 0.5s ease';
      watch(show, val => anim.style.top = val ? `${-scroll.value}px` : '0px');
      watch(scroll, val => scrollDataComponent.value = scroll.value);
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

    const layerExpanded = (height) => {
      if (isData.value) {
        scrollDataComponent.value = scroll.value + height;
      }
    }

    const layerCollapsed = (height) => {
      if (isData.value) {
        scrollDataComponent.value = scroll.value;
      }
    }

    return {isCo2, isData, layers, scroll, scrollDataComponent, show, stage, maxStage, nextStage, previousStage, layerExpanded, layerCollapsed};
  }

}
</script>

<template>
  <div v-if="show" :style="`--top: ${isCo2 ? -scroll : 0}px`" class="history-wrapper">
    <stratum v-for="(layer, index) in layers" :key="index"
      :type="type" :index="index" :stage="stage"
      :layer="layer"
      :amount="layer.amount" :label="layer.label" :details="layer.details" :level="layer.level"
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
