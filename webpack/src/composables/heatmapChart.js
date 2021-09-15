import {formatSize, formatCo2, days} from '../utils/format';
import {computed, watch} from 'vue';


// TODO: dark mode colors
const colorEmptyHeat = '#FFFFFF';
const colorCo2Heat = '#906C0D';
const colorDataHeat = '#384E50';

export default function (data, mode) {
  // Ceate categories (7 categ day from today)
  const categories = [];
  const date = new Date();
  for (let i=0; i < 7; i++) {
    categories.push(days[date.getDay()]);
    date.setDate(date.getDate() - 1);
  }
  categories.reverse();

  const options =  computed(() => {
    // Get the highest value from the data to set it as the max heat
    let max = 0;
    for (const hour of  data.value) {
      for (const value of hour) {
        if (value>max) max = value;
      }
    }

    return {
      chart: {
        type: 'heatmap',
        toolbar: {show: true},
        redrawOnParentResize: false
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      tooltip: {
        y: {
          show: true,
          formatter: val => mode == 'co2' ? formatCo2(val) : formatSize(val),
        }
      },
      plotOptions: {
        heatmap: {
          shadeIntensity: 1,
          radius: 0,
          useFillColorAsStroke: true,
          colorScale: {
            ranges: [
              { from: 0, to: 0, color: colorEmptyHeat },
              { from: 0.001, to: max ? max : 2, color: mode == 'co2' ? colorCo2Heat : colorDataHeat},
            ]
          }
        }
      },
      xaxis: {
        type: 'category',
        labels: { show: true },
        categories
      }
    }
  });

  const series = computed(() => Array.from({length: 24}, (v, i) => {
    let hStart = 23 - i;
    let hEnd = 24 - i;
    if (hStart < 10) hStart = '0' + hStart;
    if (hEnd < 10) hEnd = '0' + hEnd;
    if (!data.value.length) return {
      name: `${hStart}h - ${hEnd}h`,
      data: Array(7).fill(0)
    };
    return {
      name: `${hStart}h - ${hEnd}h`,
      data: data.value[23 - i]
    }
  }));

  return {options, series};
}