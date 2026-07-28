import { formatSize, formatCo2 } from '../../../utils/format';

const colorCo2 = '#906C0D';
const colorData = '#4F6D70';
const gridColorLight = '#CECECE';
const gridColorDark = '#616161';
const labelColorLight = '#000000';
const labelColorDark = '#FFFFFF';
const TICK_AMOUNT = 4;
const X_TICK_AMOUNT = 5;

// Round a max value up to a "nice" step * TICK_AMOUNT (1/2/5/10 * 10^n), so that
// evenly spaced ticks from 0 to niceMax land on round numbers instead of raw fractions.
function niceMax(max) {
  if (!max || max <= 0) {
    return TICK_AMOUNT;
  }
  const rawStep = max / TICK_AMOUNT;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;
  let niceStep = 10 * magnitude;
  if (residual <= 1) niceStep = magnitude;
  else if (residual <= 2) niceStep = 2 * magnitude;
  else if (residual <= 5) niceStep = 5 * magnitude;
  return niceStep * TICK_AMOUNT;
}

export default function (type, points = []) {
  const color = type === 'co2' ? colorCo2 : colorData;
  const formatter = (val) => type === 'co2' ? formatCo2(val, 2) : formatSize(val, 2);
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const gridColor = isDark ? gridColorDark : gridColorLight;
  const labelColor = isDark ? labelColorDark : labelColorLight;
  const max = niceMax(points.reduce((acc, point) => Math.max(acc, point.y), 0));

  let minX, maxX;
  if (points.length) {
    minX = new Date(points[0].x).getTime();
    maxX = new Date(points[points.length - 1].x).getTime();
    if (minX === maxX) {
      maxX = minX + 1000; // avoid a zero-width axis for a single point
    }
  }

  const options = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      animations: { enabled: false },
      zoom: { enabled: false }
    },
    colors: [color],
    fill: {
      type: 'gradient',
      gradient: { opacityFrom: 0.6, opacityTo: 0.05 }
    },
    stroke: { curve: 'smooth', width: 2 },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { size: 5 } },
    // click is only used as a signal to toggle our own analogies panel below the
    // chart -- disable apexcharts' own "selected point" dimming so the line/area
    // doesn't visually change on click
    states: { active: { filter: { type: 'none' } } },
    xaxis: {
      type: 'datetime',
      min: minX,
      max: maxX,
      tickAmount: X_TICK_AMOUNT,
      // the floating axis label would just repeat the date/time already in the tooltip
      tooltip: { enabled: false },
      labels: { datetimeUTC: false, style: { colors: labelColor } },
      axisBorder: { color: gridColor },
      axisTicks: { color: gridColor }
    },
    yaxis: {
      min: 0,
      max,
      tickAmount: TICK_AMOUNT,
      labels: { formatter, style: { colors: labelColor } }
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      marker: { show: false },
      x: { format: 'dd MMM HH:mm:ss' },
      // only one series per chart -- drop the series-name prefix, just show the value
      y: { formatter, title: { formatter: () => '' } }
    },
    grid: { show: true, borderColor: gridColor },
    legend: { show: false }
  };

  return { options };
}
