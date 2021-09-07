<script>
import { computed, inject, ref, toRefs, watch } from 'vue';
import VueApexCharts from "vue3-apexcharts";
import { ElCarousel,ElCarouselItem } from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';
import Analogy from './Analogy.vue'
import layerChart from '../composables/layerChart';
import { layerHeightCo2, layerHeightData } from '../composables/history'
import { formatSize, formatCo2 } from '../utils/format'

export default {
  components: {
    Analogy,
    apexchart: VueApexCharts,
    ElCarousel,
    ElCarouselItem
  },
  props: {
    index: {type: Number},
    layer: {type: Object},
    type: {type: String},
    stage: {type: Number}
  },
  emits: ['willExpand', 'willCollapse'],
  setup(props, { emit }) {

    const active_index = inject('active_index');

    const fullHeight = 200;
    const { index, type, layer } = toRefs(props);
    const expanded = ref(false);
    const shouldAnimate = ref(false);
    const layerInfo = layer.value;

    const height = computed(() => {
      switch(type.value) {
        case 'co2':
          return layerHeightCo2(layerInfo.amount);
        case 'data':
          return layerHeightData(layerInfo.amount);
        default:
          throw('Invalid layer type');
      }
    });
    const amount = computed(() => {
      switch(type.value) {
        case 'co2':
          return formatCo2(layerInfo.amount, 0);
        case 'data':
          return formatSize(layerInfo.amount, 0);
        default:
          throw('Invalid layer type');
      }
    });
    const legend = computed(() => {
      switch(type.value) {
        case 'co2':
          return 'of Co2';
        case 'data':
          return 'donwloaded';
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
    if (layerInfo.details) {
      showGraph = layerInfo.details;
      const chart = layerChart(type.value, layerInfo.details);
      options = chart.options;
      series = chart.series;
    }

    return {
      active_index, height,
      amount, legend,
      expanded, expand, shouldAnimate,
      showGraph, options, series
    };
  }
}
</script>

<template>
  <div class="wrapper"
      :class="{
        expanded: expanded,
        animate: shouldAnimate,
        co2: type === 'co2',
        data: type === 'data',
        today: layer.level === 'today',
        daily: layer.level === 'day',
        weekly: layer.level === 'week',
        monthly: layer.level === 'month',
      }"
      :style="`--height: ${height}px`"
      @click="expand()"
  >
    <div class="label">{{ layer.label }}</div><img :src="`assets/${type}.svg`" :style="`--height: ${height - 4}px;`">
    <div v-if="expanded" class="info">
      <div class="amount">
        {{ amount }}
      </div>
      <div class="legend">
        {{ legend }}
      </div>
    </div>
    <div v-if="expanded && type === 'co2'" class="carousel-title">As much energy as</div>
    <el-carousel v-if="expanded" arrow="never" class="analogies" trigger="click">
      <el-carousel-item v-for="(item, index) in [0, 1, 2, 3, 4, 5]" :key="index" label="." class="analogy">
        <analogy :type="type" :layer="layer" :index="item"></analogy>
      </el-carousel-item>
    </el-carousel>
    <apexchart v-if="showGraph" class="graph" type="bar" height="200" width="130" :options="options" :series="series"></apexchart>
  </div>
</template>

<style scoped lang="scss">
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

  .carousel-title {
    position: absolute;
    top: 10px;
    margin-left: 10px;
    text-align: left;
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
  .expanded .analogies {
    :deep(.el-carousel__indicators--labels .el-carousel__indicator) {
      width: 5px;
    }
  }
  .expanded .analogies {
    :deep(.el-carousel__button) {
      color: white;
      background-color: initial;
      font-size: 24px;
    }
  }
  .expanded .analogies {
    :deep(.el-carousel__container) {
      height: 150px;
    }
  }
  .expanded .analogies {
    position: absolute;
    top: 20px;
    left: 200px;
    width: 180px;
    display: block;
  }
  .expanded .info {
    display: block;
    text-align: left;
    position: absolute;
    top: 0;
    left: 80px;
    width: 120px;
    margin-top: 40px;
    display: block;
    border-right: solid 1px white;
    .amount {
      margin-top: 40px;
      font-size: 2em;
      font-weight: 700;
    }
  }
  .co2 {
    background-color: #906C0D;
    border-top: solid 1px white;

    &.today{
      background-color: #906C0D;
      &:hover{
        background-color: darken(#906C0D, 5);
      }
      &.expanded{
        background-color: darken(#906C0D, 10);
      }
    }

    &.daily{
      background-color: #A59366;
      &:hover{
        background-color: darken(#A59366, 5);
      }
      &.expanded{
        background-color: darken(#A59366, 10);
      }
    }

    &.weekly{
      background-color: #958A70;
      &:hover{
        background-color: darken(#958A70, 5);
      }
      &.expanded{
        background-color: darken(#958A70, 10);
      }
    }

    &.monthly{
      background-color: #827E76;
      &:hover{
        background-color: darken(#827E76, 5);
      }
      &.expanded{
        background-color: darken(#827E76, 10);
      }
    }
  }

  .data {
    background-color: #384E50;
    border-bottom: solid 1px white;
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

  .analogy {
    text-align:center;
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
