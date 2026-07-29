import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { retrieveHistorySeries } from '../../../storage/storage.js';
import buildAreaChart from './historyChart.js';

const setup = (type, period) => {
  const points = ref([]);

  const options = computed(() => buildAreaChart(type.value, points.value).options);
  const series = computed(() => [{ name: type.value, data: points.value.map(point => ({ x: point.x, y: point.y })) }]);

  const retrieveData = async () => {
    const { co2, data } = await retrieveHistorySeries(period.value);
    points.value = type.value === 'co2' ? co2 : data;
  }

  let refreshInterval = null;

  onMounted(async () => {
    await retrieveData();
    refreshInterval = setInterval(retrieveData, 5000);
  });

  onUnmounted(() => {
    clearInterval(refreshInterval);
  });

  watch(period, retrieveData);
  watch(type, retrieveData);

  return { options, series, points };
}

export { setup };
