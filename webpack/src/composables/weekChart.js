import {days, formatSize, formatCo2} from '../utils/format';

const colorLabel = '#fff';
const colorDataLabel = '#8B7B52';
const colorBars = '#fff';
const fontFamily = 'Roboto, sans-serif';
const fontWeight = 900;

export default function (type, weekData) {
  const options =  {
    fill: {opacity: 1},
    tooltip: {enabled: false},
    colors: Array(7).fill(colorBars),
    dataLabels: {
      enabled: true,
      textAnchor: 'start', offsetY: 7, offsetX: 3,
      style: {
        fontSize: '9px',
        fontFamily, fontWeight,
        colors: Array(7).fill(colorDataLabel)
      },
      formatter: val =>  {
        return type === 'co2' ? formatCo2(val) : formatSize(val)
      }
    },
    xaxis: {
      axisTicks: {show: false},
      axisBorder: {show: true},
      categories: [0, 1, 2, 3, 4, 5, 6],
    },
    yaxis: {
      labels:{
        show:true, align: 'left', offsetX: -7, offsetY: 2,
        style: {
          fontFamily, fontWeight,
          colors: Array(7).fill(colorLabel),
        },
        formatter: ind => days[ind]
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
      dataLabels: {position: 'bottom'}
    }}
  };
  const series = [{data: weekData}];

  return {options, series};
}