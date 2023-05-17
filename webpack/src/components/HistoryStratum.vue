<script>
import { useI18n } from 'vue-i18n'
import { computed, inject, ref, toRefs, watch } from 'vue';
import VueApexCharts from "vue3-apexcharts";
import { ElCarousel, ElCarouselItem, ElRow, ElCol } from 'element-plus';
import 'element-plus/theme-chalk/index.css';
import Analogy from './Analogy.vue'
import layerChart from '../composables/layerChart';
import { layerHeightCo2, layerHeightData } from '../composables/history'
import { formatSize, formatCo2 } from '../utils/format'
import { analogyNames } from '../utils/analogies'

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
    const { t } = useI18n({});
    const active_index = inject('active_index');
    const stratum = ref(null);
    const fullHeight = 200;
    const barHeight = 37;
    const historyHeight = 600 - barHeight /* container - bottom bar*/;
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
    const layerName = computed(() => {
      return layerInfo.label.startsWith('current') ? t('global.'+layerInfo.label) : 
         layerInfo.level != 'day' ? t('global.period.'+layerInfo.level) + ' ' + layerInfo.label : layerInfo.label
    });
    const legend = computed(() => {
      switch(type.value) {
        case 'co2':
          return 'of Co2';
        case 'data':
          return 'downloaded';
        default:
          throw('Invalid layer type');
      }
    });
    const expand = () => {
      // When expanded, we may need to move up or down the outer container
      // to avoid hiding part of the expanded layer
      const isExpanded = expanded.value;
      active_index.value = isExpanded ? -1 : type.value+layerInfo.level+index.value;
      shouldAnimate.value = true;
      // check offset
      const layerPosition = stratum.value.getBoundingClientRect();
      let outerOffsetNeeded = 0;
      switch(type.value) {
        case 'co2': {
          // co2 history stratum are on top
          const availableHeight = historyHeight - layerPosition.top;
          if (layerPosition.top + fullHeight > historyHeight) { // layer will be hidden at bottom when expanding
            outerOffsetNeeded = fullHeight - availableHeight;
          } else if (layerPosition.top < barHeight){ // top of the layer is already partially outside
            outerOffsetNeeded = layerPosition.top - barHeight;
          }
        }
        break;
        case 'data': {
          // data layer are at bottom and the animation container is offseted while navigating them
          const availableHeight = historyHeight - layerPosition.top;
          if (layerPosition.top + fullHeight > historyHeight) { // layer will be hidden at bottom when expanding
            outerOffsetNeeded = fullHeight - availableHeight;
          } else if (layerPosition.top < barHeight){ // top of the layer is already partially outside
            outerOffsetNeeded = layerPosition.top - barHeight;
          }
        }
        break;
        default:
          throw('Invalid layer type');
      }
      if (!isExpanded) {
        emit('willExpand', outerOffsetNeeded);
      } else {
        emit('willCollapse', outerOffsetNeeded);
      }
    };
    watch(active_index, () => {
      const active = active_index.value===(type.value+layerInfo.level+index.value);
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
      t,
      stratum,
      active_index, height,
      amount, legend, layerName,
      expanded, expand, shouldAnimate,
      showGraph, options, series, analogyNames
    };
  }
}
</script>

<template>
  <div ref="stratum"
      class="wrapper"
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
    <el-row justify="center" align="middle" class="summary">
      <el-col :span="12">
        <div class="label bold"> {{ layerName }} </div><img class="icon" :src="`../icons/${type}.svg`" :style="`--height: ${height - 4}px;`">
      </el-col>
    </el-row>
    <el-row class="details">
      <el-col :span="4">
        <div class="title bold"> {{ layerName }}</div><img class="icon" :src="`../icons/${type}.svg`" :style="`--height: ${height - 4}px; --margin-icon: ${-(height - 4)/2}px;`">
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
        <el-carousel v-if="expanded" arrow="always" class="analogies" trigger="click" indicator-position="none">
          <el-carousel-item v-for="(item, index) in analogyNames[type]" :key="item" label="." class="analogy">
            <analogy :type="type" :layer="layer" :name="item"></analogy>
          </el-carousel-item>
        </el-carousel>
      </el-col>
      <el-col :span="8" class="section graph">
        <div v-if="showGraph">
          <div v-if="layer.level === 'week'" class="section-title bold"> {{ t('components.history.WeeklyConsumption') }}</div>
          <div v-if="layer.level === 'month'" class="section-title bold"> {{ t('components.history.MonthlyConsumption') }} </div>
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
    z-index: -1;
  }
  .expanded {
    .details {
      z-index: 1;
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
    &.today{
      background-color: #384E50;
      &:hover{
        background-color: darken(#384E50, 5);
      }
      &.expanded{
        background-color: darken(#384E50, 10);
      }
    }
    &.daily{
      background-color: #719598;
      &:hover{
        background-color: darken(#719598, 5);
      }
      &.expanded{
        background-color: darken(#719598, 10);
      }
    }
    &.weekly{
      background-color: #213C3F;
      &:hover{
        background-color: darken(#213C3F, 5);
      }
      &.expanded{
        background-color: darken(#213C3F, 10);
      }
    }
    &.monthly{
      background-color: #0F2D30;
      &:hover{
        background-color: darken(#0F2D30, 5);
      }
      &.expanded{
        background-color: darken(#0F2D30, 10);
      }
    }
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
