import PubSub from '../unplug/js/modules/pubsub.mjs';
import conf from '../unplug/js/conf.mjs';
import { render } from '../unplug/js/main.mjs';

const pubSub = new PubSub();
const defaultOptions = { debounce: true, showTabConfirmation: true, showOnBoarding: true };
let userOptions = defaultOptions;


const sendToAnimation = () => {
  const packets = packetsBuffer;
  const animations = {};
  // reset debounce data
  debounceId = null;
  packetsBuffer = [];
  // merge small packets together
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
  }

}

let debounceId;
let packetsBuffer = [];
let startDebounce = new Date();
const debounce = (packet, waitMs, maxWaitMs) => {
  const now = new Date();
  packetsBuffer.push(packet);
  if (debounceId) {
    if (now-startDebounce > maxWaitMs) {
      // launch pending animation anyway
    } else {
      // cancel last timer, start new timer
      clearTimeout(debounceId);
      debounceId = setTimeout( () => sendToAnimation(), waitMs);
    }
  } else {
    startDebounce = new Date();
    debounceId = setTimeout( () => sendToAnimation(), waitMs);
  }
}

const handleMessage = (request) => {
  if (request.data) {
    const packet = request.data;
    // skip too small packets or extension packets
    if(packet.contentLength < 1 ||
       !packet.extraInfo.tabIcon ||
       packet.extraInfo.tabIcon.startsWith('chrome-extension:')
      ) {
      return true;
    }
    if (userOptions.debounce) {
      // maximum one animation per second
      // minimum 1 per 2 seconds
      debounce(packet, 1000, 2000)
    } else {
      // directly publish data for animation
      pubSub.publish('input-data', packet);
    }

  }
  return true;
}

const configureDarkMode = (mode) => {
  if (mode.matches) {
    //dark mode
    conf.width = 50, // width of the canvas and ctx in [px]
    conf.height = 300, // height of the canvas and ctx in [px]
    render.options.background = '#none';
    conf.assets.data = chrome.extension.getURL('../unplug/assets/dataDark.png');
    conf.assets.dataHover = chrome.extension.getURL('../unplug/assets/dataDarkHover.png');
    conf.assets.dataActive = chrome.extension.getURL('../unplug/assets/dataDarkActive.png');
    conf.assets.co2 = chrome.extension.getURL('../unplug/assets/co2Dark.png');
    conf.assets.co2Hover = chrome.extension.getURL('../unplug/assets/co2DarkHover.png');
    conf.assets.co2Active = chrome.extension.getURL('../unplug/assets/co2DarkActive.png');
    conf.matterOpts =  {
      data: {
        render: {sprite: {texture: conf.assets.data}},
        label: 'data',
        collisionFilter: {category: conf.categories.data}
      },
      co2: {
        render: {sprite: {texture: conf.assets.co2}},
        label: 'co2',
        collisionFilter: {category: conf.categories.co2}
      }
    }
    conf.assets.selectLine = 'white';
    conf.assets.selectCircle = 'black';
  } else {
    //light mode
    conf.width = 50, // width of the canvas and ctx in [px]
    conf.height = 300, // height of the canvas and ctx in [px]
    render.options.background = 'none';
    conf.assets.data = chrome.extension.getURL('../unplug/assets/data.png');
    conf.assets.dataHover = chrome.extension.getURL('../unplug/assets/dataHover.png');
    conf.assets.dataActive = chrome.extension.getURL('../unplug/assets/dataActive.png');
    conf.assets.co2 = chrome.extension.getURL('../unplug/assets/co2.png');
    conf.assets.co2Hover = chrome.extension.getURL('../unplug/assets/co2Hover.png');
    conf.assets.co2Active = chrome.extension.getURL('../unplug/assets/co2Active.png');
    conf.matterOpts =  {
      data: {
        render: {sprite: {texture: conf.assets.data}},
        label: 'data',
        collisionFilter: {category: conf.categories.data}
      },
      co2: {
        render: {sprite: {texture: conf.assets.co2}},
        label: 'co2',
        collisionFilter: {category: conf.categories.co2}
      }
    }
    conf.assets.selectLine = 'black';
    conf.assets.selectCircle = 'white';
  }
}

// Handle dark mode change
window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', configureDarkMode);

export function configure() {
  conf.uiElements = [];
  conf.mouseManagement = false;
  conf.width = 50, // width of the canvas and ctx in [px]
  conf.height = 300, // height of the canvas and ctx in [px]
  configureDarkMode(window.matchMedia('(prefers-color-scheme: dark)'));
}

export function main() {

  const options = localStorage.getItem('options');

  if (options !== null) {
    try {
      userOptions = JSON.parse(options);
    } catch(error) {
      console.log(`Invalid options stored: ${userOptions}`);
    }
  }

  // check if tab extension opened
  const tabId = localStorage.getItem('extensionAnimationTabId');
  if (tabId) {
    chrome.tabs.get(parseInt(tabId), tab => {
      if(chrome.runtime.lastError) {
        // tab probably closed
      }
      if (tab) {
        // set button stlye as active
        openTabButton.classList.add('active');
        openTabButton.classList.remove('inactive');
      }
    });
  }

  // listen to nee packets
  chrome.runtime.onMessage.addListener(handleMessage);
}
