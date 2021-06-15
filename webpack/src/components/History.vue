<script>
import history from '../composables/history';
import Stratum from './HistoryStratum.vue';
import { computed, provide, watch, toRefs, ref } from 'vue';

/*
interface HistoryLayerData {
  amount: number,
  visibility?: boolean,
  label: string
}
*/

export default {
  components: { Stratum },

  props: {
    type: {type: String}
  },

  setup(props, context) {
    const { type } = toRefs(props)
    const { layers, marginTop, scroll, show, stage, maxStage, nextStage, previousStage } = history(type.value);
    const isCo2 = computed(() => type.value === 'co2'); //formula to find ! borne entre min max(200px) (easing linear ?)
    const isData = computed(() => type.value === 'data'); //formula to find ! borne entre min max(200px) (easing linear ?)

		const active_index = ref(-1);

		provide('active_index', active_index);

    // for DATA we need "move up" the animation by the height of the stratums
    if (isData.value) {
      const anim = window.document.querySelector('.animation');
      anim.style.transition = 'top 0.5s ease';
      watch(show, val => anim.style.top = val ? `${-scroll.value}px` : '0px');
      watch(scroll, val => anim.style.top = show.value ? `${-val}px` : '0px');
      anim.style.top = 0;
    }

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
        scroll.value += height;
      }
    }

    const layerCollapsed = (height) => {
      if (isData.value) {
        scroll.value -= height;
      }
    }

    return {isCo2, isData, layers, marginTop, scroll, show, stage, maxStage, nextStage, previousStage, layerExpanded, layerCollapsed};
  }

}
</script>

<template>
  <div v-if="show" :style="`--top: ${isCo2 ? -scroll : 0}px`" class="history-wrapper">
    <stratum v-for="(layer, index) in layers" :key="index"
      :index="index" :amount="layer.amount" :label="layer.label" :type="type" :stage="stage"
      @expanded="layerExpanded" @collapsed="layerCollapsed"></stratum>
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
