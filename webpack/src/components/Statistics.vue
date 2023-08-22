<script lang="ts">
import { ApexOptions } from 'apexcharts';
import VueApexCharts from "vue3-apexcharts";
import { ref, computed, watchEffect, toRefs, useSlots, ComputedRef } from 'vue';
import { getLastDaysSummary, getComputerCo2Series, getTopWebsitesSeries, computerDailyEmbodiedCo2 } from '../../../storage/storage';
import { useI18n } from 'vue-i18n';
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
    apexchart: VueApexCharts
  },
  props: {
    type: String,
    subtype: String,
    granularity: String,
    height: Number
  },
  setup(props) {
    const { t, locale } = useI18n({});

    const slots = useSlots();

    const { type, subtype, granularity } = toRefs(props);

    // Summary for the last 7 or 30 days
    const summary = ref({ data: 0, energy: 0, co2: 0, computer: { energy: 0, co2: 0}});
    // Trends compared to the previous 7 or 30 days
    const trend =ref(0);

    // Tips
    const tipHTML = ref(null);

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
            fontFamily: 'Roboto, system-ui, Arial, sans-serif'
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
          fontFamily: 'Roboto, system-ui, Arial, sans-serif',
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
      const tipTile = tip.context ? `${t('components.statistics.tip')} ${tip.context}` : t('components.statistics.tip');
      tipHTML.value = `<b>${tipTile}</b>&nbsp; ${tip.summaryHTML[locale.value]}`
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
    return { summary, averagePerPeriod, trend, tipHTML, nbActivePeriods, type, granularity, chart, chartOptions, series, t, formatCo2, formatSize, slots };
  }
}
</script>

<template>
  <div>
    <div class="header" :class="type" v-if="subtype==='web'">
      <div class="trend">
        <div class="trend-title">{{ t(`components.statistics.trend`) }}</div>
        <div class="trend-value">
          <div v-if="trend">
            <span v-if="trend >= 0.01">+</span>
            <span v-if="trend <= -0.01">-</span>{{ Math.round(Math.abs(100 * trend))}}%
            <svg v-if="Math.floor(100 * trend) !== 0" :class="trend > 0 ?'up' : 'down'"><use href="../../../assets/icons/arrow.svg#arrow"></use></svg>
          </div>
          <div v-else>
            -
          </div>
        </div>
      </div>
      <div class="vr"></div>
      <div class="summary">
        <div class="period">
          <span v-if="granularity==='day'">{{ t('global.last.week') }}</span>
          <span v-if="granularity==='month'">{{ t('global.last.month') }}</span>
        </div>
        <span v-if="type==='co2'"><span class="unit">CO<span class="subscript">2</span></span>&nbsp;<span class="summary-value">{{ formatCo2(summary.co2, 0) }}</span></span>
        <span v-if="type==='data'"><span class="summary-value">{{ formatSize(summary.data, 0) }}</span></span>
        <div class="web_vs_laptop" v-if="type==='co2'">
          <div class="web"><img src="../../../assets/icons/web.svg">{{ formatCo2(summary.co2 - summary.computer.co2, 0) }}</div>
          <div class="laptop"><img src="../../../assets/icons/laptop.svg">{{ formatCo2(summary.computer.co2, 0) }}</div>
        </div>
      </div>
      <div class="vr"></div>
      <div class="average">
        <div class="average-title">{{ t(`components.statistics.average`) }}</div>
        <span class="value">
          <span v-if="type==='co2'">{{ formatCo2(averagePerPeriod, 0) }} / {{ t(`global.${granularity}`) }} </span>
          <span v-if="type==='data'">{{ formatSize( averagePerPeriod, 0) }} / {{ t(`global.${granularity}`) }} </span>
        </span>
      </div>
    </div>
    <div class="hr" v-if="tipHTML"></div>
    <div v-if="tipHTML" class="tip" ><div>💡</div><div v-html="tipHTML" class="description"></div></div>
    <div class="title"><slot name="title"></slot></div>
    <apexchart
      ref="chart"
      width="450"
      :height="height"
      id="chart"
      :options="chartOptions"
      :series="series"
    ></apexchart>
    <div class="info" v-if="slots.info"><slot name="info"></slot></div>
  </div>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  color: var(--dark-grey);
  font-size: 13px;
  .trend {
    width: 150px;
    padding-left: 24px;
    padding-top: 14px;
    .trend-value {
      font-size: 32px;
      font-weight: 700;
      color: black;
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
  .summary {
    width: 160px;
    padding-left: 8px;
    padding-top: 14px;
    font-size: 13px;

    .period {
      margin-bottom: 1px;
    }
    .unit {
      font-weight: 700;
      color: var(--dark-grey);
    }
    .summary-value {
      color: black;
      font-weight: 700;
      font-size: 14px;
    }
    .web_vs_laptop {
      font-size: 12px;
      display: flex;
      column-gap: 10px;
      margin-top: 25px;
      img {
        margin-right: 2px;
      }
      .web img{
        margin-bottom: -1px;
      }
      .laptop img{
        margin-bottom: -2px;
      }
      }
    .subscript {
      vertical-align: sub;
      font-size: 10px;
    }

  }

  .average {
    padding-left: 8px;
    padding-top: 14px;
    .average-title {
      margin-bottom: 1px;
    }
    .value {
      font-weight: 700;
      color: black;
      font-size: 13px;
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
  display: flex;
  margin-top: -15px;
  margin-left: 15px;
  margin-right: 15px;
  color: var(--dark-grey);
  font-size: 12px;
  border-radius: 5px;
	background-color: var(--white);
	padding: 4px;
}

div.hr {
	width: 95%;
	height: 1px;
	background-color: var(--grey);
	margin-left: auto;
	margin-right: auto;
  margin-top: 8px;
  margin-bottom: 16px;
}

div.vr {
	width: 1px;
	height: 95px;
	background-color: var(--grey);
	margin-top: auto;
	margin-bottom: auto;
}

.tip {
  display: flex;
  border-radius: 17px;
  border: 1px solid var(--carbon-viz-ui-white-extra, #FFF);
  background: var(--green);
  height: 26px;
  width: 420px;
  line-height: 26px;
  margin: auto;
  padding-left: 4px;
  padding-right: 4px;
  .description {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &:hover {
    box-shadow: 0px 0px 16px 0px rgba(150, 228, 103, 0.50);
    background: var(--white);
    border-radius: 0px;
    line-height: initial;
    height: auto;
    padding-top: 4px;
    padding-bottom: 4px;
    .description {
      overflow: initial;
      white-space: initial;
    }
  }
}

</style>