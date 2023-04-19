import { formatSize, formatCo2} from '../utils/format';

const colorLabel = '#fff';
const colorDataLabelCo2 = '#8B7B52';
const colorDataLabelData = '#384E50';
const colorBars = '#fff';
const fontFamily = 'Roboto, Arial, sans-serif ';
const fontWeight = 900;

export default function (type, periods) {
  const length = periods.length;
  const max = periods.reduce((max, period) => Math.max(period.amount, max), 0);
  let barChartColors = Array(length).fill(colorBars);
  if(periods.length > 1) {
    const maxIndex = periods.findIndex(period => period.amount === Math.max(...periods.map(period => period.amount)));
    barChartColors[maxIndex] = '#e2786b';
  }
  const options =  {
    fill: {opacity: 1},
    tooltip: {enabled: false},
    colors: barChartColors,
    dataLabels: {
      enabled: true,
      textAnchor: type === 'co2' ? 'end' : 'start',
      offsetY: 2,
      offsetX: -10,
      style: {
        fontSize: '9px',
        fontFamily, fontWeight,
        colors: type === 'co2' ? Array(length).fill(colorDataLabelCo2) : Array(length).fill(colorDataLabelData)
      },
      formatter: val =>  {
        if (val < 0.3 * max) {
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
        show:true, align: 'left', offsetX: 6, offsetY: 2,
        style: {
          fontFamily, fontWeight,
          colors: Array(length).fill(colorBars),
        }
      },
      axisTicks: {show: false},
      axisBorder: {show: false}
    },
    grid: {
      show: false
    },
    chart: {
      toolbar: {show: false},
      redrawOnParentResize: false
    },
    plotOptions: {
      bar: {
        distributed: true,
        horizontal: true
      }
    },
    legend: {
      show: false,
    }
  };
  const series = [{data: periods.map( period => period.amount)}];
  return {options, series};
}