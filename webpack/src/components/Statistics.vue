<script>
import { ref } from 'vue';
import VueApexCharts from "vue3-apexcharts";

export default {
  components: {
    apexchart: VueApexCharts
  },
  setup() {
    const colors = ['#d9d9d9', '#d9d9d9', '#d9d9d9', '#d9d9d9'];
    const activeColorsCo2 = ['#906C0D', '#906C0D', '#A59366', '#958A70'];
    const activeColorsData = ['#384E50', '#719598', '#213C3F', '#0F2D30'];
    const chartOptions = {
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
        xaxis: {
          categories: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
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
      const chartOptionsCo2 = ref ({
        ...chartOptions,
        chart: {
          ...chartOptions.chart,
          id: 'co2'
        },
        colors: [...colors]
      });
      const chartOptionsData = ref ({
        ...chartOptions,
        chart: {
          ...chartOptions.chart,
          id: 'data'
        },
        colors: [...colors]
      });
      const series = ref([
        {
          name: 'Netflix',
          data: [300, 250, 0, 600, 0, 800, 2000],
        },
        {
          name: 'YouTube',
          data: [100, 50, 500, 200, 0, 100, 0],
        },
        {
          name: 'Drive',
          data: [1300, 50, 200, 100, 1500, 0, 0],
        },    
        {
          name: 'Divers',
          data: [1300, 50, 200, 100, 1500, 0, 0],
        }   
      ]);
    const highlightSource = (chartContext, seriesIndex, config) => {
      const id = config.config.chart.id;
      const chartOptions = id === 'co2' ? chartOptionsCo2 : chartOptionsData;
      const activeColors = id === 'co2' ? activeColorsCo2 : activeColorsData;
      const colors = config.config.colors;
      const isActive = colors[seriesIndex] === activeColors[seriesIndex];
      colors[seriesIndex] = isActive ? '#d9d9d9' : activeColors[seriesIndex];
      chartOptions.value = {
        ...chartOptions.value,
        colors: colors
      }
    }
    return { chartOptionsCo2, chartOptionsData, series, highlightSource };
  }
}
</script>

<template>
  <h1>Statistics</h1>
  <div>
    Co2
    <apexchart
      width="450"
      height="175"
      id="co2"
      :options="chartOptionsCo2"
      :series="series"
      @legendClick="highlightSource"
    ></apexchart>
    Data  
    <apexchart
      width="450"
      height="175"
      id="data"
      :options="chartOptionsData"
      :series="series"
      @legendClick="highlightSource"
    ></apexchart>
  </div>
</template>

<style>
</style>