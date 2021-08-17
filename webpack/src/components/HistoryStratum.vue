<script>
import layerChart from '../composables/layerChart';
import { layerHeightCo2, layerHeightData } from '../composables/history'
import { computed, inject, ref, toRefs, watch } from 'vue';
import VueApexCharts from "vue3-apexcharts";

export default {
  components: {
    apexchart: VueApexCharts,
  },
  props: {
    index: {type: Number},
    amount: {type: Number},
    type: {type: String},
    details: {type: Array},
    label: {type: String},
    stage: {type: Number}
  },
  emits: ['willExpand', 'willCollapse'],
  setup(props, { emit }) {

    const active_index = inject('active_index');

    const fullHeight = 200;
    const { index, type, amount } = toRefs(props);
    const expanded = ref(false);
    const shouldAnimate = ref(false);
    const height = computed(() => {
      switch(type.value) {
        case 'co2':
          return layerHeightCo2(amount.value);
        case 'data':
          return layerHeightData(amount.value);
        default:
          throw('Invalid layer type');
      }
    });
    const expand = () => {
      const isExpanded = expanded.value;
      active_index.value = isExpanded ? -1 : index.value;
      shouldAnimate.value = true;
      if (!isExpanded) {
        emit('willExpand', fullHeight-height.value);
      } else {
        emit('willCollapse', fullHeight-height.value);
      }
    };
    watch(active_index, () => {
      const active = active_index.value===index.value;
      if(!expanded.value && !active) {
        return;
      }
      expanded.value = active;
    });

    let showGraph = false;
    let options, series;
    if (props.details) {
      showGraph = props.details;
      const chart = layerChart(props.type, props.details);
      options = chart.options;
      series = chart.series;
    }

    return {active_index, height, expanded, expand, shouldAnimate, showGraph, options, series};
}

}
</script>

<template>
  <div class="wrapper"
      :class="{expanded: expanded, animate: shouldAnimate, co2: type == 'co2', data: type == 'data'}"
      :style="`--height: ${height}px`"
      @click="expand()"
  >
    <div class="label">{{ label }}</div><img :src="`assets/${type}.svg`" :style="`--height: ${height - 4}px;`">
    <apexchart v-if="showGraph" class="graph" type="bar" height="200" width="130" :options="options" :series="series"></apexchart>
  </div>
</template>

<style scoped>
  .wrapper {
    height: var(--height);
    caret-color: transparent;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin-left: -100px;
  }
  .wrapper.animate {
    transition: height 0.5s ease;
  }
  .wrapper.expanded {
    height: 200px;
    margin-left: 0px;
  }

  .label {
    font-weight: 700;
    margin-right: 10px;
    width: 100px;
    text-align: right;
  }

  .expanded .label {
    position: absolute;
    top: 10px;
    left: 10px;
  }
  .graph {
    display: none;
  }
  .expanded .graph {
    position: absolute;
    top: 0;
    right: 0;
    display: block;
  }

  .co2 {
    background-color: #906C0D;
  }
  .data {
    background-color: #384E50;
  }

  img {
    display: inline-block;
    height: var(--height);
    transition: transform 0.5s ease;
    filter: brightness(0) saturate(100%) invert(100%);
  }
  .expanded img{
    transform: translateX(-250px);
    transition: transform 0.5s ease;
  }

  @media (prefers-color-scheme: dark) {

  }

</style>
<style>
  .apexcharts-yaxis-inversed {
    display: none;
  }
  .apexcharts-yaxis-label title {
    display: none;
  }
</style>
