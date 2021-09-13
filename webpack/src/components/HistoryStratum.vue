<script>
import { computed, inject, ref, toRefs, watch } from 'vue';
import VueApexCharts from "vue3-apexcharts";
import { ElCarousel, ElCarouselItem, ElRow, ElCol } from 'element-plus';
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
    ElCarouselItem,
    ElRow, ElCol
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
    <el-row justify="center" align="center" class="summary">
      <el-col :span="12">
        <div class="label bold">{{ layer.label }}</div><img class="icon" :src="`assets/${type}.svg`" :style="`--height: ${height - 4}px;`">
      </el-col>
    </el-row>
    <el-row class="details">
      <el-col :span="4">
        <div class="title bold">{{ layer.label }}</div><img class="icon" :src="`assets/${type}.svg`" :style="`--height: ${height - 4}px; --margin-icon: ${-(height - 4)/2}px;`">
      </el-col>
      <el-col :span="4" class="section info">
        <div class="amount">
          {{ amount }}
        </div>
        <div class="legend">
          {{ legend }}
        </div>
      </el-col>
      <el-col :span="showGraph ? 8 : 16" class="section">
        <div v-if="type === 'co2'" class="section-title bold">The same energy as</div>
        <div v-if="type === 'data'" class="section-title bold">The same as</div>
        <el-carousel v-if="expanded" arrow="never" class="analogies" trigger="click">
          <el-carousel-item v-for="(item, index) in [0, 1, 2, 3, 4, 5]" :key="index" label="." class="analogy">
            <analogy :type="type" :layer="layer" :index="item"></analogy>
          </el-carousel-item>
        </el-carousel>
      </el-col>
      <el-col :span="8" class="section graph">
        <div v-if="showGraph">
          <div v-if="layer.level === 'week'" class="section-title bold">Weekly consumption</div>
          <div v-if="layer.level === 'month'" class="section-title bold">Monthly consumption</div>
          <apexchart class="apexchart" type="bar" height="180" width="160" :options="options" :series="series"></apexchart>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
  .wrapper {
    height: var(--height);
    caret-color: transparent;
    color: white;
    position: relative;
  }
  .wrapper.animate {
    transition: height 0.5s ease;
  }
  .wrapper.expanded {
    height: 200px;
    margin-left: 0px;
  }

  .bold {
      font-weight: 700;
  }

  .summary {
    opacity: 1;
    height: 0px;
    .el-col {
      position: relative;
    }
    .label {
      position: absolute;
      top: 50%;
      margin-top: -8px;
      text-align: left;
    }
  }
  .details {
    opacity: 0;
  }
  .expanded {
    .details {
      opacity: 1;
      transition: opacity 0.1s ease 0.4s;
    }
    .summary {
      opacity: 0;
      transition: opacity 0.1s ease 0.4s;
      .label{
        transform: translate(-117px, calc(19px - var(--height)/2));
        transition: transform 0.5s ease;
      }
      img{
        transform: translate(-250px, calc((200px - var(--height))/2));
        transition: transform 0.5s ease;
      }
    }
  }

  .title {
    margin-top: 10px;
    margin-left: 10px;
    text-align: left;
  }

  .icon {
    display: block;
    margin-left: auto;
    margin-right: auto;
    margin-top: 2px;
  }

  .section {
    margin-top: 33px;
  }
  .section-title {
    margin-left: 10px;
    text-align: left;
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

  .expanded .graph {
    border-left: solid 1px white;
    padding-left: 6px;
  }

  .expanded .info {
    text-align: left;
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

 .details .icon{
    position: absolute;
    top: calc((200px - var(--height))/2);
    margin-left: var(--margin-icon);
  }

  img {
    display: inline-block;
    height: var(--height);
    transition: transform 0.5s ease;
    filter: brightness(0) saturate(100%) invert(100%);
  }

  .analogy {
    text-align:center;
  }

  .apexchart {
    position: absolute;
    top: 0;
    right: 0;
    display: block;
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
