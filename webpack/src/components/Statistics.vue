<script lang="ts">
import { ApexOptions } from 'apexcharts';
import VueApexCharts from "vue3-apexcharts";
import { ref, computed, watchEffect, toRefs, ComputedRef } from 'vue';
import { getLastDaysSummary, getComputerCo2Series, getTopWebsitesSeries, computerDailyEmbodiedCo2 } from '../../../storage/storage';
import { useI18n } from 'vue-i18n';
import { ElNotification } from 'element-plus'
import { Indicator, Granularity } from '../utils/types';
import { formatCo2, formatSize } from '../../../utils/format';
import { tips } from '../../../utils/tips';

export interface Props {
  type: Indicator,
  subtype: 'computer' | 'web' // computer means emboddied energy
  granularity: Granularity,
  height: Number
}

export default {
  components: {
    apexchart: VueApexCharts,
    ElNotification
  },
  props: {
    type: String,
    subtype: String,
    granularity: String,
    height: Number
  },
  setup(props) {
    const { t, locale } = useI18n({});

    const { type, subtype, granularity } = toRefs(props);

    // Summary for the last 7 or 30 days
    const summary = ref({ data: 0, energy: 0, co2: 0, computer: { energy: 0, co2: 0}});
    // Trends compared to the previous 7 or 30 days
    const trend =ref(0);

    // Number of active days for weekly stats or month for yearly stats
    const nbActivePeriods = ref(1);
    // Total number of period (7 days or 12 months)
    const nbPeriods = ref(1);
    const nbDays = ref(1);
    // Average per day or month
    const averagePerPeriod = ref(0);

    const chart = ref(null);

    const colors = ['#7D76DE', '#AC84FA', '#8EA3F5', '#76A6DE', '#84DBFA'];
    const series = ref([]);
    const average = ref(0);
    const annotation = computed(() => {
      return {
        y: average.value,
        borderColor: '#616161',
        strokeDashArray: 0,
        opacity: 1,
        label: {
          borderWidth: 0,
          offsetX: 10,
          offsetY: 8,
          style: {
            background: '#f8f8f8',
            color: '#616161',
            fontFamily: 'Roboto, Arial, sans-serif'
          },
          text: 'Moy'
        }
      }
    });
    const categories = computed(() => {
      switch(granularity.value) {
        case 'day':
          return [
            t('components.statistics.days.Mon'),
            t('components.statistics.days.Tue'),
            t('components.statistics.days.Wed'),
            t('components.statistics.days.Thu'),
            t('components.statistics.days.Fri'),
            t('components.statistics.days.Sat'),
            t('components.statistics.days.Sun'),
          ];
        case 'month':
          return [
            t('components.statistics.months.Jan'),
            t('components.statistics.months.Feb'),
            t('components.statistics.months.Mar'),
            t('components.statistics.months.Apr'),
            t('components.statistics.months.May'),
            t('components.statistics.months.Jun'),
            t('components.statistics.months.Jul'),
            t('components.statistics.months.Aug'),
            t('components.statistics.months.Sep'),
            t('components.statistics.months.Oct'),
            t('components.statistics.months.Nov'),
            t('components.statistics.months.Dec'),
          ];
      }
    });

    // Should it be dynamic depending on value range?
    const yAxisCo2 = {
      tickAmount: 3,
      labels: {
        maxWidth: 40,
        offsetX: 5,
        offsetY: 2,
        formatter: (value) => {
          if (value === 0) {
            return '';
          }
          return formatCo2(value, 0);
        }
      }
    };
    const yAxisData = {
      tickAmount: 4,
      labels: {
        maxWidth: 40,
        offsetX: 5,
        offsetY: 2,
        formatter: (value) => {
          if (value === 0) {
            return '';
          }
          return formatSize(value, 0);
        }
      }
    };
    const yAxis = computed(() => type.value === 'co2' ? yAxisCo2 : yAxisData);
    const tooltipFormatter = (value) => {
      if (type.value === 'co2') {
        return formatCo2(value, 0);
      } else {
        return formatSize(value, 0);
      }
    }
    const chartOptions: ComputedRef<ApexOptions> = computed(() => {
      return {
        chart: {
          type: 'bar',
          stacked: true,
          fontFamily: 'Roboto, Arial, sans-serif',
          toolbar: {
            show: false
          },
          id: 'chart'
        },
        xaxis: {
          categories: categories.value,
        },
        yaxis: yAxis.value,
        annotations: {
          yaxis: [annotation.value]
        },
        colors: colors,
        dataLabels: {
          enabled: false
        },
        legend: {
          onItemClick: {
            toggleDataSeries: true
          },
          onItemHover: {
            highlightDataSeries: true
          }
        },
        tooltip: {
          x: { show: false },
          y: {
            formatter: tooltipFormatter
          }
        },
        states: {
          normal: {
              filter: {
                  type: 'none',
                  value: 0,
              }
          },
          hover: {
              filter: {
                  type: 'darken',
                  value: 0.75,
              }
          }
        }
      }
    });

    const checkTips = (domains) => {
      let tipsShown = false;
      const tipsRelatedToDomains = tips.filter(tip => tip.domains);
      const tipsGeneric = tips.filter(tip => !tip.domains);
      const tipsValid = [...tipsGeneric];
      for (const tip of tipsRelatedToDomains) {
        for (const domain of domains) {
          const relevantDomains = [];
          if (tip.domains && tip.domains.includes(domain.toLowerCase())){
            relevantDomains.push(domain);
          }
          if (relevantDomains.length > 0) {
            // more relevant, x2 chance to display it
            tipsValid.push({ ...tip, context: relevantDomains.join(',')});
            tipsValid.push({ ...tip, context: relevantDomains.join(',')});
          }
        }
      }
      // display random tip among relevant domain or generic tips
      const tip = tipsValid[Math.floor(Math.random() * tipsValid.length)];
      const messageHTML = `${tip.summaryHTML[locale.value]}`;
          ElNotification({
            title: tip.context ? `${t('components.statistics.tip')} ${tip.context}` : t('components.statistics.tip'),
            dangerouslyUseHTMLString: true, // safe string from inside extension
            message: messageHTML,
            type: 'warning',
            duration: 30000,
            offset: 40
          })
    }

    watchEffect(async () => {
      let currentValue;
      let previousPeriod;
      let previousPeriodValue;
      switch(granularity.value) {
        case 'day':
          summary.value = await getLastDaysSummary([-7, 0]);
          previousPeriod = await getLastDaysSummary([-14, -7]);
          nbPeriods.value = 7;
          nbDays.value = 7;
        break;
        case 'month':
          summary.value = await getLastDaysSummary([-30, 0]);
          previousPeriod = await getLastDaysSummary([-60, -30]);
          nbPeriods.value = 12;
          nbDays.value = 30 * 12;
        break;
      }
      switch(type.value) {
        case 'co2':
          currentValue = summary.value.co2;
          previousPeriodValue = previousPeriod.co2;
        break;
        case 'data':
          currentValue = summary.value.data;
          previousPeriodValue = previousPeriod.data;
        break;
      }
      if (previousPeriodValue) {
        trend.value = (currentValue - previousPeriodValue) / previousPeriodValue
      } else {
        trend.value = 0;
      }
      switch(subtype.value) {
        case 'web':
          getTopWebsitesSeries(type.value, 4, granularity.value).then(async (seriesData: {name: String, data: [number]}[]) => {
              series.value = seriesData;
              // update annotation with mean value
              // get number of active periods
              const activePeriods = Array(seriesData[0].data.length).fill(false);
              for (const serie of seriesData) {
                for (let idx = 0; idx < activePeriods.length; idx++) {
                  activePeriods[idx] = activePeriods[idx] || serie.data[idx]!==0;
                }
              }
              nbActivePeriods.value = activePeriods.filter(e => e).length;
              const totalWeb = seriesData.reduce((acc, website) => acc + website.data.reduce((acc, amount) => amount + acc, 0), 0);
              average.value = nbActivePeriods.value ? totalWeb / nbActivePeriods.value : 0;
              const domains = seriesData.map(serie => serie.name);
              switch(type.value) {
                case 'co2':
                  // for co2 we have to consider embodied energy in addition to web
                  // and the fact that exist also for inactive period
                  const computerDailyCo2 = await computerDailyEmbodiedCo2();
                  averagePerPeriod.value = ( totalWeb + nbDays.value * computerDailyCo2 ) / nbPeriods.value;
                  if (granularity.value === 'day') {
                    checkTips(domains); // no need to display tips for co2 and data. Only display for week trends
                  }
                  break;
                case 'data':
                  // for Data average per period is the same as the average per active period
                  averagePerPeriod.value = average.value;
                  break;
              }
            });
          break;
        case 'computer':
          getComputerCo2Series(granularity.value).then((seriesData: {name: String, data: number[]}[]) => {
              series.value = seriesData;
              const computer = seriesData[0];
              // update annotation with mean value
              // get number of active period
              nbActivePeriods.value = computer.data?.filter(e => e > 0).length;
              const total = computer.data.reduce((acc, amount) => amount + acc, 0);
              average.value = total / nbActivePeriods.value;
            });
        break;
        default:
          throw('Invalid trends type')
      }
    })
    return { summary, averagePerPeriod, trend, nbActivePeriods, type, granularity, chart, chartOptions, series, t, formatCo2, formatSize };
  }
}
</script>

<template>
  <div>
    <div class="header" :class="type" v-if="subtype==='web'">
      <div class="teaser">
        <span v-if="type==='co2'">{{ formatCo2(summary.co2, 0) }} {{ t('global.of_co2') }}</span>
        <span v-if="type==='data'">{{ formatSize(summary.data, 0) }} </span>
      </div>
      <div class="teaser-subtitle">
        <span v-if="granularity==='day'">{{ t('global.last.week') }}</span>
        <span v-if="granularity==='month'">{{ t('global.last.month') }}</span>
        <span class="computer" v-if="type==='co2'">&nbsp;incl. {{ formatCo2(summary.computer.co2, 0) }} {{ t('components.statistics.computerImpact') }}</span>
      </div>
      <div class="average">{{ t(`components.statistics.average`) }}:
        <span class="value">
          <span v-if="type==='co2'">{{ formatCo2(averagePerPeriod, 0) }} / {{ t(`global.${granularity}`) }} </span>
          <span v-if="type==='data'">{{ formatSize( averagePerPeriod, 0) }} / {{ t(`global.${granularity}`) }} </span>
        </span>
      </div>
      <div class="trend-title">{{ t(`components.statistics.trend`) }}:</div>
      <div class="trend-value">
        <div v-if="trend">
          <span v-if="trend >= 0.01">+</span>
          <span v-if="trend <= -0.01">-</span>
          {{ Math.round(Math.abs(100 * trend))}} %
          <svg v-if="Math.floor(100 * trend) !== 0" :class="trend > 0 ?'up' : 'down'"><use href="../../../icons/arrow.svg#arrow"></use></svg>
        </div>
        <div v-else>
          -
        </div>
      </div>
    </div>
    <div class="title"><slot name="title"></slot></div>
    <apexchart
      ref="chart"
      width="450"
      :height="height"
      id="chart"
      :options="chartOptions"
      :series="series"
    ></apexchart>
    <div class="info"><slot name="info"></slot></div>
  </div>
</template>

<style lang="scss" scoped>
.header {
  padding-top: 15px;
  padding-left: 15px;

  color: var(--dark-grey);

  .teaser {
    font-size: 40px;
    font-weight: 700;
    line-height: 40px;
  }
  .teaser-subtitle {
    font-size: 14px;
    text-transform: lowercase;
    .computer {
      font-weight: 700;
    }
  }

  .average {
    margin-top: 18px;
  }
  .average, .trend-title {
    font-size: 12px;
    line-height: 16px;
  }
  .average .value {
    font-weight: 700;
  }
  .trend-value {
    margin-top: 15px;
    font-size: 32px;
    font-weight: 700;
    svg {
      width: 23px;
      height: 23px;
      &.up {
        color: red;
      }
      &.down {
        color: var(--green);
        transform: rotate(90deg);
      }
    }
  }
}

.title {
  position: relative;
  z-index: 200;
  text-align: center;
  margin-top: 8px;
  margin-bottom: -20px;
  color: var(--dark-grey);
  font-size: 14px;
  font-weight: 700;
  font-style: italic;
}
.info {
  margin-top: -15px;
  margin-left: 15px;
  color: var(--dark-grey);
  font-size: 11px;
  font-style: italic;
}

</style>

<style>
.el-notification__content {
  text-align: left;
}
</style>