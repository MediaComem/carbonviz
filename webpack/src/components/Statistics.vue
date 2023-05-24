<script lang="ts">
import { ApexOptions } from 'apexcharts';
import VueApexCharts from "vue3-apexcharts";
import { ref, computed, watchEffect, onMounted } from 'vue';
import { getTopWebsitesSeries } from '../composables/storage';
import { useI18n } from 'vue-i18n'
import PeriodPicker from './PeriodPicker.vue';
import TypePicker from './PeriodPicker.vue';

export default {
  components: {
    PeriodPicker,
    TypePicker,
    apexchart: VueApexCharts
  },
  setup() {
    const { t } = useI18n({});
    const chartCo2 = ref(null);
    const chartData = ref(null);
    const period = ref('days');
    const granularity = computed(() => {
      switch(period.value) {
        case 'days':
          return 'day';
        case 'months':
          return 'month';
        default:
          throw('Invalid period for trends');
      }
    });
    const type = ref('co2');
    const colors = ['#7D76DE', '#AC84FA', '#8EA3F5', '#76A6DE', '#84DBFA'];
    const colorsCo2 = ref(colors);
    const colorsData = ref(colors);
    const seriesCo2 = ref([]);
    const seriesData = ref([]);
    const annotation = {
      y: 0,
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
    };
    const annotationCo2 = ref(annotation);
    const annotationData = ref(annotation);
    const categories = computed(() => {
      switch(period.value) {
        case 'days':
          return [
            t('components.statistics.days.Mon'),
            t('components.statistics.days.Tue'),
            t('components.statistics.days.Wed'),
            t('components.statistics.days.Thu'),
            t('components.statistics.days.Fri'),
            t('components.statistics.days.Sat'),
            t('components.statistics.days.Sun'),
          ];
        case 'months':
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
    const chartOptions: ApexOptions = {
        chart: {
          type: 'bar',
          stacked: true,
          fontFamily: 'Roboto, Arial, sans-serif',
          toolbar: {
            show: false
          }
        },
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
      };
      const chartOptionsCo2 = computed(() => {
        return {
          ...chartOptions,
          chart: {
            ...chartOptions.chart,
            id: 'co2'
          },
          xaxis: {
            categories: categories.value,
          },
          yaxis: yAxisCo2,
          annotations: {
            yaxis: [annotationCo2.value]
          },
          colors: colorsCo2.value
        }
      });
      const chartOptionsData = computed(() => {
        return {
          ...chartOptions,
          chart: {
            ...chartOptions.chart,
            id: 'data'
          },
          xaxis: {
            categories: categories.value,
          },
          yaxis: yAxisData,
          annotations: {
            yaxis: [annotationData.value]
          },
          colors: colorsData.value
        }
      });


    const switchPeriod = (newPeriod : 'days' | 'months') => {
      period.value = newPeriod;
    }

    const switchType = (newType : 'co2' | 'data') => {
      type.value = newType;
    }

    onMounted(() => {
      setTimeout(() => {
        if (chartCo2.value) {
        chartCo2.value.hideSeries('computer');
        }
      }, 1000);
    });

    watchEffect(async () => {
      getTopWebsitesSeries('co2', 4, granularity.value).then((series: {name: String, data: [number]}[]) => {
        seriesCo2.value = series;
        // update annotation with mean value
        // get number of active period (based on computer activity which is last serie)
        const nbActivePeriods = series[4] ? series[4].data?.filter(e => e > 0).length : series[0].data?.filter(e => e > 0).length;
        const total = series.reduce((acc, website) => acc + website.data.reduce((acc, amount) => amount + acc, 0), 0);
        annotationCo2.value = {
          ...annotation,
          y: total / nbActivePeriods
        };
      });
      getTopWebsitesSeries('data', 4, granularity.value).then((series: {name: String, data: [number]}[]) => {
        seriesData.value = series;
        // update annotation with mean value
        // get number of active period (based on last serie aggregated domains - no computer activity for data)
        const nbActivePeriods = series[3] ? series[3].data?.filter(e => e > 0).length : series[0].data?.filter(e => e > 0).length;
        const total = series.reduce((acc, website) => acc + website.data.reduce((acc, amount) => amount + acc, 0), 0);
        annotationData.value = {
          ...annotation,
          y: total / nbActivePeriods
        };
      });
    })
    return { type, chartCo2, chartData, chartOptionsCo2, chartOptionsData, seriesCo2, seriesData, switchPeriod, switchType, t };
  }
}
</script>

<template>
  <div class="buttons">
   <period-picker @change="switchPeriod"></period-picker>
   <type-picker @change="switchType"></type-picker>
  </div>
  <div>
    <div v-if="type === 'co2'">
      Co2 (g)
      <apexchart
        ref="chartCo2"
        width="450"
        height="175"
        id="co2"
        :options="chartOptionsCo2"
        :series="seriesCo2"
      ></apexchart>
    </div>
    <div v-if="type === 'data'">
      Data (Mo)
    <apexchart
      ref="chartData"
      width="450"
      height="175"
      id="data"
      :options="chartOptionsData"
      :series="seriesData"
    ></apexchart>
    </div>
  </div>
</template>

<style scoped>
  .buttons {
    height: 5%;
    display: flex;
    width: 100%;
    column-gap: 9px;
  }
</style>