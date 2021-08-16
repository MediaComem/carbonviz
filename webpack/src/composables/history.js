import { ref, onMounted, watch } from 'vue';
import { retrieveHistoryLayers } from './storage';

const MAX_HEIGHT = 150;

const layerHeightCo2 = (amount) => {
  const height = 11 + (amount / 0.1) * MAX_HEIGHT; // min 11px, max 150 px for 100g CO2eq (~1h 720p video)
  return Math.min(height, MAX_HEIGHT);
}

const layerHeightData = (amount) => {
  const height = 11 + (amount / (2*8*1000000000)) * MAX_HEIGHT; // min 11px, max 150 px for 15GB (~1h 720p video)
  return Math.min(height, MAX_HEIGHT);
}

const setup = (type) => {
  const maxHeight = 600;
  const layers = ref([]);
  const scroll = ref(0);
  const show = ref(false);

  const stage = ref(0);
  const maxStage = ref(0);

  const totalHeight = ref(0);
  const isData = type === 'data';
  const isCo2 = type === 'co2';


  const updateScroll = () => {
    let layer;
    if (isCo2) {
      if (stage.value === 0) {
        layer = layers.value[layers.value.length-1];
        if (!layer) {
          scroll.value = totalHeight.value;
        } else {
          layer.visible = true;
          scroll.value = totalHeight.value - layerHeightCo2(layer.amount);
        }
      } else {
        scroll.value = Math.max(totalHeight.value - stage.value*maxHeight, 0);
      };
    }
    if (isData) {
      if (stage.value === 0) {
        layer = layers.value[0];
        if (!layer) {
          scroll.value = 0;
        } else {
          layer.visible = true;
          scroll.value = layerHeightData(layer.amount);
        }
      } else {
        scroll.value = Math.min(stage.value*maxHeight, totalHeight.value);
      };
    }
  }

  const retrieveData = async () => {
    // get layers from history
    const { co2, data } = await retrieveHistoryLayers();

    if (isCo2) {
      layers.value = co2.reverse();
      totalHeight.value = layers.value.reduce((acc, layer) => acc + layerHeightCo2(layer.amount), 0);
    }
    if(isData) {
      layers.value = data;
      totalHeight.value = layers.value.reduce((acc, layer) => acc + layerHeightData(layer.amount), 0);
    }

    maxStage.value = layers.value.length === 1 ? 0 : Math.ceil(totalHeight.value / maxHeight);
  }

  onMounted(async () => {
    await retrieveData();
    updateScroll();
  });


  watch(stage, updateScroll)
  watch(show, value => {
    if(!value) {
      stage.value = 0;
    }
  });

  const nextStage = () => {
    stage.value++;
  }

  const previousStage = () => {
    stage.value--;
  }

  return {layers, scroll, totalHeight, show, stage, maxStage, nextStage, previousStage};
}

export { setup, layerHeightCo2, layerHeightData };