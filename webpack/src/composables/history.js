import { ref, onMounted, watch, computed } from 'vue';
import { retrieveHistoryLayers } from './storage';

const MAX_HEIGHT = 120;

const layerHeightCo2 = (amount) => {
  const height = 15 + (amount / 0.9) * MAX_HEIGHT; // min 15px, max 120 px for 900g CO2eq ( 8h laptop consumption no activities ~ 200g)
  return Math.min(height, MAX_HEIGHT);
}

const layerHeightData = (amount) => {
  const height = 15 + (amount / (1*750000000)) * MAX_HEIGHT; // min 15px, max 120 px for 750MB
  return Math.min(height, MAX_HEIGHT);
}

const setup = (type, period, scrollCount) => {
  const layers = ref([]);
  const historyCount = ref(0);
  const scroll = ref(0);
  const isData = computed(() => type.value === 'data');
  const isCo2 = computed(() => type.value === 'co2');

  const totalHeight = ref(0);

  const retrieveData = async () => {
    // get layers from history
    const { co2, data, count } = await retrieveHistoryLayers(period.value, scrollCount.value);

    historyCount.value = count;

    if (isCo2.value) {
      layers.value = co2.reverse();
      // layer height (+1px border)
      totalHeight.value = layers.value.reduce((acc, layer) => acc + layerHeightCo2(layer.amount) + 1, 0);
    }
    if (isData.value) {
      layers.value = data.reverse();
      // layer height (+1px border)
      totalHeight.value = layers.value.reduce((acc, layer) => acc + layerHeightData(layer.amount) + 1, 0);
    }

  }

  onMounted(async () => {
    await retrieveData();
  });


  watch(period, retrieveData)
  watch(type, retrieveData)
  watch(scrollCount, retrieveData)


  return { layers, historyCount, scroll, totalHeight };
}

export { setup, layerHeightCo2, layerHeightData };