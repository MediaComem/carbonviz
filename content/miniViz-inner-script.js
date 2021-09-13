import '../bundle/miniviz.js';
import animationInit from '../unplug/js/miniviz.mjs';
import PubSub from '../unplug/js/modules/pubsub.mjs';
import {genVariation} from '../unplug/js/modules/utils.mjs';

const pubSub = new PubSub();


function createminivizAnimation() {
  const container = document.createElement('div');
  container.style.all = 'initial';
  container.style.position = 'fixed';
  container.style.top = '50%';
  container.style['margin-top'] = '-150px';
  container.style.right = '0px';
  container.style.width = '50px';
  container.style.height = '300px';
  container.style.borderRadius = '25px';
  container.style['z-index'] = '10000';
  container.style['font-family'] = 'Roboto, Arial, sans-serif' ;

  container.id = 'miniViz_container';
  document.body.appendChild(container);
  if (CarbonVue) {
    CarbonVue.co2DataCounter.large = true;
  }
}

const handleMessage = (request) => {
  if (request.statistics) {
    const stats = request.statistics;
    if (CarbonVue) {
      CarbonVue.co2DataCounter.data = stats.data - 0;
      CarbonVue.co2DataCounter.co2 = stats.co2 - 0;
    }
  }
  if (request.data) {
    const packet = request.data;
    if (packet.initiator === 'computer') {
      // directly publish co2 computer info
      setTimeout(() => {
        pubSub.publish('input-data', packet);
      }, genVariation(1000));
      return;
    }
    if(packet.contentLength < 1 || !packet.extraInfo.tabIcon ||packet.extraInfo.tabIcon.startsWith('chrome-extension:')) return true;
    debounce(packet, 1500 + genVariation(500));
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

export function main() {
  const MiniViz = window.document.getElementById("miniViz_container");
  if (MiniViz) {
    MiniViz.addEventListener('click', toggleMiniVizPopup)
  }

  function toggleMiniVizPopup () {
    let minivizPopup = document.getElementById('miniViz_popup_container');
    if(minivizPopup.style.display === 'block') {
      minivizPopup.style.display = 'none';
    } else {
      minivizPopup.style.display = 'block';
    }
  }

  animationInit();
}

export function configure() {
  createminivizAnimation();
  chrome.runtime.onMessage.addListener(handleMessage);
}

let debounceId;
let packetsBuffer = [];
function debounce(packet, waitMs) {
  const now = new Date();
  packetsBuffer.push(packet);
  if (debounceId) return;
  debounceId = setTimeout( () => sendToAnimation(), waitMs);
}

function sendToAnimation() {
  const packets = packetsBuffer;
  const animations = {};
  clearTimeout(debounceId);
  debounceId = null;
  packetsBuffer = [];
  for (let packet of packets) {
    // merge by tab + type
    const id = `${packet.extraInfo.tabUrl}_${packet.extraInfo.type}`;
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
    CarbonVue.co2DataCounter.data += animations[id].contentLength - 0;
    CarbonVue.co2DataCounter.co2 += animations[id].co2 - 0;
  }
}