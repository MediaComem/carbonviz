import { onMounted, Ref, ref } from 'vue';
import PubSub from '../../../unplug/js/modules/pubsub.mjs';
import { genVariation } from '../../../unplug/js/modules/utils.mjs';
import animationInit from '../../../unplug/js/miniviz.mjs';

const sendToAnimation = (pubSub, packetsBuffer, debounceId, counters: {data: Ref<number>, co2: Ref<number>}) => {
  const packets = packetsBuffer;
  const animations = {};
  clearTimeout(debounceId);
  debounceId = null;
  packetsBuffer = [];
  for (let packet of packets) {
    // merge by tab
    const id = `${packet.extraInfo.tabUrl}`;
    if (!animations[id]) {
      animations[id] = packet;
    } else {
      const aggregator = animations[id];
      aggregator.contentLength = parseInt(aggregator.contentLength) + parseInt(packet.contentLength);
      aggregator.co2 = aggregator.co2 + packet.co2;
      aggregator.energyNRE = aggregator.energyNRE + packet.energyNRE;
      aggregator.energyRE = aggregator.energyRE + packet.energyRE;
    }
  }
  for (let id of Object.keys(animations)) {
    pubSub.publish('input-data', animations[id]);
    counters.data.value += animations[id].contentLength - 0;
    counters.co2.value += animations[id].co2 - 0;
  }
}

const debounce = (packet, waitMs, packetsBuffer, debounceId, animate) => {
  const now = new Date();
  packetsBuffer.push(packet);
  if (debounceId) return;
  debounceId = setTimeout( () => animate(), waitMs);
}

const setup= () => {
  const pubSub = new PubSub();

  const counterData = ref(0);
  const counterCo2 = ref(0);

  let debounceId;
  let packetsBuffer = [];

  const handleMessage = (request) => {
    if (request.statistics) {
      const stats = request.statistics;
      counterData.value = stats.data - 0;
      counterCo2.value = stats.co2 - 0;
    }
    if (request.data) {
      const packet = request.data;
      if (packet.initiator === 'computer') {
        // directly publish co2 computer info
        setTimeout(() => {
          pubSub.publish('input-data', packet);
        }, genVariation(1000));
        return true;
      }
      if(packet.contentLength < 1 || !packet.extraInfo.tabIcon ||packet.extraInfo.tabIcon.startsWith('chrome-extension:')) return true;
        debounce(
          packet,
          1500 + genVariation(500),
          packetsBuffer,
          debounceId,
          () => sendToAnimation(pubSub, packetsBuffer, debounceId, {data: counterData, co2: counterCo2}));
      return true;
    }
    if (request.query) {
      switch (request.query) {
        case 'removeMiniviz':
          const minvizContainer = document.getElementById('miniViz_container');
          const minvizPopupContainer = document.getElementById('miniViz_popup_container');
          if(minvizContainer && minvizPopupContainer) {
            if (minvizContainer.style.display != 'none') {
              minvizContainer.style.display = 'none';
            }
            if(minvizPopupContainer.style.display != 'none') {
              minvizPopupContainer.style.display = 'none';
            }
          }
        default:
          break;
      }
    }
    return true;
  }

  onMounted(() => {
    chrome.runtime.onMessage.addListener(handleMessage);
    animationInit();
  })

  return { counterData, counterCo2 };
}

export { setup }