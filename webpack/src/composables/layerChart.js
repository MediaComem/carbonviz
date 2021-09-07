import { isGloballyWhitelisted } from '@vue/shared';
import { formatSize, formatCo2} from '../utils/format';

const colorLabel = '#fff';
const colorDataLabel = '#8B7B52';
const colorBars = '#fff';
const fontFamily = 'Roboto, sans-serif';
const fontWeight = 900;

export default function (type, periods) {
  const length = periods.length;
  const max = periods.reduce((max, period) => Math.max(period.amount, max), 0);
  const options =  {
    fill: {opacity: 1},
    tooltip: {enabled: false},
    colors: Array(length).fill(colorBars),
    dataLabels: {
      enabled: true,
      textAnchor: 'start', offsetY: 7, offsetX: 3,
      style: {
        fontSize: '9px',
        fontFamily, fontWeight,
        colors: Array(length).fill(colorDataLabel)
      },
      formatter: val =>  {
        if (val < 0.2 * max) {
          return ''; // hide labels if bar too short to display it
        }
        return type === 'co2' ? formatCo2(val, 0) : formatSize(val, 0)
      }
    },
    xaxis: {
      axisTicks: {show: false},
      axisBorder: {show: true},
      categories: periods.map((period) => period.label)
    },
    yaxis: {
      labels:{
        show:true, align: 'left', offsetX: -7, offsetY: 2,
        style: {
          fontFamily, fontWeight,
          colors: Array(length).fill(colorLabel),
        }
      },
      axisTicks: {show: false},
      axisBorder: {show: false}
    },
    grid: {show: false},
    chart: {
      toolbar: {show: false},
      redrawOnParentResize: false
    },
    plotOptions: {bar: {
      horizontal: true,
      dataLabels: {position: 'bottom'},
    }}
  };
  const series = [{data: periods.map( period => period.amount)}];
  return {options, series};
}