<script>
import weekChart from '../composables/weekChart';
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
    label: {type: String},
    stage: {type: Number}
  },
  emits: ['willExpand', 'willCollapse'],
  setup(props, { emit }) {

    const active_index = inject('active_index');

    const fullHeight = 200;
    const { index, stage } = toRefs(props);
    const expanded = ref(false);
    const shouldAnimate = ref(false);
    const height = computed(() => props.amount); //formula to find ! borne entre min max(200px) (easing linear ?)
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

    // TODO: replace with some real DATA from the indexedDB
    const showGraph = props.type == 'co2' ? props.index < 4 : props.index > 3;
    const {options, series} = weekChart(props.type, [30, 36.34, 70, 23, 34, 23, 46]);

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
    <div class="label">{{ label }}</div><img :src="`assets/${type}.svg`" :style="`--amount: ${amount - 10}px;`">
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
    height: var(--amount);
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
