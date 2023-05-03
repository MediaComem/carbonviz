<script lang="ts">
import { ApexOptions } from 'apexcharts';
import { ref, computed, watchEffect } from 'vue';
import VueApexCharts from "vue3-apexcharts";
import { getTopWebsitesSeries } from '../composables/storage';
import { useI18n } from 'vue-i18n'

export default {
  components: {
    apexchart: VueApexCharts
  },
  setup() {
    const { t } = useI18n({});
    const period = ref('day');
    const colors = ['#d9d9d9', '#d9d9d9', '#d9d9d9', '#d9d9d9'];
    const colorsCo2 = ref(colors);
    const colorsData = ref(colors);
    const activeColorsCo2 = ['#906C0D', '#906C0D', '#A59366', '#958A70'];
    const activeColorsData = ['#384E50', '#719598', '#213C3F', '#0F2D30'];
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
        case 'day':
          return ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
        case 'month':
          return ['Jan.', 'Fev.', 'Mar.', 'Avr.', 'Mai', 'Jun.', 'Jul.', 'Aou.', 'Sep', 'Oct.', 'Nov.', 'Dec.'];
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
            toggleDataSeries: false
          },
          onItemHover: {
            highlightDataSeries: false
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
        console.log({
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
        });
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

    const highlightSource = (chartContext, seriesIndex, config) => {
      const id = config.config.chart.id;
      const colors = id === 'co2' ? colorsCo2 : colorsData;
      const activeColors = id === 'co2' ? activeColorsCo2 : activeColorsData;
      const chartColors = [...config.config.colors];
      const isActive = chartColors[seriesIndex] === activeColors[seriesIndex];
      chartColors[seriesIndex] = isActive ? '#d9d9d9' : activeColors[seriesIndex];
      colors.value = chartColors;
    }

    const switchPeriod = (newPeriod : 'day' | 'month') => {
      period.value = newPeriod;
    }

    watchEffect(async () => {
      getTopWebsitesSeries('co2', 4, period.value).then((series: [{name: String, data: [number]}]) => {
        seriesCo2.value = series;
        // update annotation with mean value
        const total = series.reduce((acc, website) => acc + website.data.reduce((acc, amount) => amount + acc, 0), 0);
        annotationCo2.value = {
          ...annotation,
          y: total / series[0].data.length
        };
      });
      getTopWebsitesSeries('data', 4, period.value).then((series: [{name: String, data: [number]}]) => {
        seriesData.value = series;
        // update annotation with mean value
        const total = series.reduce((acc, website) => acc + website.data.reduce((acc, amount) => amount + acc, 0), 0);
        annotationData.value = {
          ...annotation,
          y: total / series[0].data.length
        };
      });
    })
    return { chartOptionsCo2, chartOptionsData, seriesCo2, seriesData, highlightSource, switchPeriod, t };
  }
}
</script>

<template>
  <div id="type">
    <button type="button" class="activeButton" @click='switchPeriod("day")'> {{ t('global.period.days') }}</button>
    <button type="button"  @click='switchPeriod("month")'> {{ t('global.period.months') }}</button>
  </div>
  <div>
    Co2 (g)
    <apexchart
      width="450"
      height="175"
      id="co2"
      :options="chartOptionsCo2"
      :series="seriesCo2"
      @legendClick="highlightSource"
    ></apexchart>
    Data (Mo)
    <apexchart
      width="450"
      height="175"
      id="data"
      :options="chartOptionsData"
      :series="seriesData"
      @legendClick="highlightSource"
    ></apexchart>
  </div>
</template>

<style>
</style>