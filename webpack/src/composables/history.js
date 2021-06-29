import { ref, onMounted, watch, watchEffect } from 'vue';

const layerHeight = (layer) => {
  return layer.amount; // TODO create computation based on amount between minHeight and maxHeight
}

export default function (type) {
  // TODO How to pass the nb of stratums from history stage ? (calculate ? or nb strats (max 4 ( = 150*4)) ?)
  const maxHeight = 600;
  const stage = ref(0);
  const totalHeight = ref(0);
  const scroll = ref(0);
  const show = ref(false);
  const isData = type === 'data';
  const isCo2 = type === 'co2';
  const maxStage = ref(0);

  // get layers from history
  const fullHistoryCo2 = [
    { amount: 120, label: 'week 21' }, { amount: 75, label: 'week 22' },
    { amount: 120, label: 'week 23' },{ amount: 150, label: 'last week' },
    { amount: 120, label: 'Monday' },{ amount: 75, label: 'Tuesday' },
    { amount: 100, label: 'Yesterday' }, { amount: 50, label: 'Today' }
  ];

  const fullHistoryData = [
    { amount: 50, label: 'Today' }, { amount: 100, label: 'Yesterday' },
    { amount: 75, label: 'Tuesday' }, { amount: 120, label: 'Monday' },
    { amount: 75, label: 'week 22' }, { amount: 120, label: 'week 21' },
    { amount: 150, label: 'last week' }, { amount: 120, label: 'week 23' },
  ]

  let layers;
  if (isCo2) {
    layers = ref(fullHistoryCo2);
  }
  if(isData) {
    layers = ref(fullHistoryData);
  }

  totalHeight.value = layers.value.reduce((acc, layer) => acc + layerHeight(layer), 0);
  maxStage.value = layers.value.length === 1 ? 0 : Math.ceil(totalHeight.value / maxHeight);

  const updateScroll = () => {
    let layer;
    if (isCo2) {
      if (stage.value === 0) {
        layer = layers.value[layers.value.length-1];
        layer.visible = true;
        scroll.value = totalHeight.value - layer.amount;
      } else {
        scroll.value = Math.max(totalHeight.value - stage.value*maxHeight, 0);
      };
    }
    if (isData) {
      if (stage.value === 0) {
        layer = layers.value[0];
        layer.visible = true;
        scroll.value = layer.amount;
      } else {
        scroll.value = Math.min(stage.value*maxHeight, totalHeight.value);
      };
    }
  }

  onMounted(updateScroll);
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