<script lang="ts">
import { ApexOptions } from 'apexcharts';
import VueApexCharts from "vue3-apexcharts";
import { ref, computed, watchEffect, onMounted, toRefs, ComputedRef } from 'vue';
import { getTopWebsitesSeries } from '../composables/storage';
import { useI18n } from 'vue-i18n'
import PeriodPicker from './PeriodPicker.vue';
import TypePicker from './PeriodPicker.vue';
import { Indicator, Granularity } from '../utils/types';

export interface Props {
  type: Indicator,
  granularity: Granularity,
  height: Number
}

export default {
  components: {
    PeriodPicker,
    TypePicker,
    apexchart: VueApexCharts
  },
  props: {
    type: String,
    granularity: String,
    height: Number
  },
  setup(props) {
    const { t } = useI18n({});

    const { type, granularity, height } = toRefs(props);

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
      labels: {
            maxWidth: 20,
            formatter: (value) => {
                return (1000 * value).toFixed().toString();
            }
          }
    };
    const yAxisData = {
      labels: {
            maxWidth: 20,
            formatter: (value) => {
              return (value / 1000000).toFixed().toString();
            }
          }
    };
    const yAxis = computed(() => type.value === 'co2' ? yAxisCo2 : yAxisData);
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

    watchEffect(async () => {
      getTopWebsitesSeries(type.value, 4, granularity.value).then((seriesData: {name: String, data: [number]}[]) => {
        series.value = seriesData;
        // update annotation with mean value
        // get number of active period (based on last serie aggregated domains)
        const nbActivePeriods = seriesData[3] ?
          seriesData[3].data?.filter(e => e > 0).length : seriesData[0].data?.filter(e => e > 0).length;
        const total = seriesData.reduce((acc, website) => acc + website.data.reduce((acc, amount) => amount + acc, 0), 0);
        average.value = total / nbActivePeriods;
      });
    })
    return { type, chart, chartOptions, series, t };
  }
}
</script>

<template>
  <div>
    Title
    <apexchart
      ref="chart"
      width="450"
      :height="height"
      id="chart"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>
