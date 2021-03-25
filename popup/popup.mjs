import PubSub from '../unplug/js/modules/pubsub.mjs';
import conf from '../unplug/js/conf.mjs';
import { engine, render, metaData } from '../unplug/js/main.mjs';

const pubSub = new PubSub();
const defaultOptions = { debounce: true};
let userOptions = defaultOptions;


// Utility function
const hide = (elt) => {
  if (Array.isArray(elt)) {
    for (let el of elt) {
      el.classList.add("hidden");
    }
  } else {
    elt.classList.add("hidden");
  }
}
const show = (elt) => {
  if (Array.isArray(elt)) {
    for (let el of elt) {
      el.classList.remove("hidden");
    }
  } else {
    elt.classList.remove("hidden");
  }
}
const time = (packet) => {
  const date = new Date(packet.timeStamp);
  return `${ date.getHours() }H${ date.getMinutes() }`;
}
const size = (packet) => {
  if (packet.contentLength / 1000 < 1) {
    return `${ Math.round(packet.contentLength) } B`;
  } else if (packet.contentLength / 1000 > 1024) {
    return `${ Math.round(packet.contentLength / 1024000) } MB`;
  }
  else {
    return `${ Math.round(packet.contentLength / 1000) } KB`;
  }
}
const domain = (packet) => {
  if (!packet.tabUrl) {
    return '';
  }
  const url = new URL(packet.tabUrl);
  const hostname = url.hostname;
  let domain = hostname;
  let match;
  if (match = hostname.match(/^[^\.]+\.(.+)\..+$/)) {
    domain = match[1]
  }
  const capitalized = domain.charAt(0).toUpperCase() + domain.slice(1)
  return capitalized;
}
const type = (packet) => {
  const type = packet.type;
  if (!type) {
    return '';
  }
  const capitalized = type.charAt(0).toUpperCase() + type.slice(1)
  return capitalized;
}
const co2 = (packet) => {
  return `${Math.floor(1000000*packet.co2)/1000} g Co2`;
}

// User interface
const embedButton = window.document.getElementById("embed");
const debounceCheckbox = window.document.getElementById("debounce");
// Navigation
const navCo2 = window.document.getElementById("navCo2");
const navFlux = window.document.getElementById("navFlux");
const navData = window.document.getElementById("navData");
// Menu
// Packet info
const packetIcon = window.document.getElementById("packet-icon");
const packetInitiator = window.document.getElementById("packet-initiator");
const packetType = window.document.getElementById("packet-type");
const packetTime = window.document.getElementById("packet-time");
const packetSize = window.document.getElementById("packet-size");
const packetCo2 = window.document.getElementById("packet-co2");

// History
const historyContainer = window.document.getElementById("history");

// Define UI Actions
const embedPlugin = () => {
  // if embed activated - send message to background script to embed view
  chrome.runtime.sendMessage({ query: 'embedPlugin' }, {},  () => {});
  // close popup
  window.close();
}

const toggleDebounce = () => {
  userOptions.debounce = debounceCheckbox.checked;
  localStorage.setItem('options', JSON.stringify(userOptions));
}

const goToCo2 = () => {
  navCo2.classList.add("selected");
  navFlux.classList.remove("selected");
  navData.classList.remove("selected");
  Matter.Bounds.shift(render.bounds, {x:0, y: -conf.pageHeight});
}
const goToFlux = () => {
  navFlux.classList.add("selected");
  navCo2.classList.remove("selected");
  navData.classList.remove("selected");
  Matter.Bounds.shift(render.bounds, {x:0, y: 0});
}
const goToData = () => {
  navData.classList.add("selected");
  navCo2.classList.remove("selected");
  navFlux.classList.remove("selected");
  Matter.Bounds.shift(render.bounds, {x:0, y: conf.pageHeight});
}

// Add user interface listener
navCo2.addEventListener('click', goToCo2)
navFlux.addEventListener('click', goToFlux)
navData.addEventListener('click', goToData)

embedButton.addEventListener('click', embedPlugin)
debounceCheckbox.addEventListener('click', toggleDebounce)

// Handle click on animation elements
// Mouse test
const mouse = Matter.Mouse.create(render.canvas);
const mouseConstraint = Matter.MouseConstraint.create(engine, {
  mouse,
  constraint: {stiffness: 0}
});
Matter.World.add(engine.world, mouseConstraint);

render.mouse = mouse; // keep the mouse in sync with rendering
Matter.Events.on(mouseConstraint, "startdrag", event => {
  let entity = mouseConstraint.body;
  if (!entity) return;
  let data = metaData.get(entity);
  if (!data) return;
  if (data.initiator === 'computer') {
    hide([packetIcon, packetType, packetTime, packetSize]);
    packetInitiator.innerHTML = 'Computer';
    packetCo2.innerHTML = co2(data);
  } else {
    if (data.tabIcon) {
      packetIcon.hidden = false;
      packetIcon.src = data.tabIcon;
    } else {
      packetIcon.hidden = true;
    }
    show([packetIcon, packetType, packetTime, packetSize]);
    packetInitiator.innerHTML = domain(data);
    packetType.innerHTML = type(data);
    packetTime.innerHTML = time(data);
    packetSize.innerHTML = size(data);
    packetCo2.innerHTML = co2(data);
  }

});

const sendToAnimation = () => {
  const packets = packetsBuffer;
  const animations = {};
  // reset debounce data
  debounceId = null;
  packetsBuffer = [];
  // merge small packets together
  for (let packet of packets) {
    // merge by tab + type
    const id = `${packet.tabUrl}_${packet.type}`;
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
    // skip too small packets
    if(packet.contentLength < 1) {
      return true;
    }
    if (debounceCheckbox.checked) {
      debounce(packet, 250, 1000)
    } else {
      // directly publish data for animation
      pubSub.publish('input-data', packet);
    }
    // update history
    shiftHistory();
    // update new favIcon + title
    if (packet.tabIcon) {
      history[0].icon.hidden = false;
      history[0].icon.src = packet.tabIcon;
    } else {
      history[0].icon.hidden = true;
    }
    history[0].title.innerText = domain(packet);
    history[0].date.innerText = time(packet);
    history[0].size.innerText = size(packet);
  }
  return true;
}

const shiftHistory = () => {
  for ( let i=history.length-1; i>0; i--) {
    history[i].icon.hidden = history[i-1].icon.hidden;
    history[i].icon.src = history[i-1].icon.src;
    history[i].title.innerText = history[i-1].title.innerText;
    history[i].date.innerText = history[i-1].date.innerText;
    history[i].size.innerText = history[i-1].size.innerText;
  }
}

const createHistoryPacket = () => {
  const block = document.createElement('div');
  block.className = 'data-info';
  const info = document.createElement('div');
  info.className = 'tab-info';
  const icon = document.createElement('img');
  icon.className = 'tab-icon';
  const title = document.createElement('div');
  title.className = 'tab-title';
  const date = document.createElement('div');
  date.className = 'packet-date';
  const size = document.createElement('div');
  size.className = 'packet-size';
  info.appendChild(icon);
  info.appendChild(title);
  block.appendChild(info);
  block.appendChild(date);
  block.appendChild(size);
  historyContainer.appendChild(block);
  return { icon, title, date, size };
}

let history = [{}, {}, {}, {}];
const initHistory = () => {
  for ( let i=0; i< history.length; i++) {
    history[i] = createHistoryPacket();
  }
}

const configure = () => {
  conf.uiElements = [];
  debounceCheckbox.checked = userOptions.debounce;
}

const init = () => {

  const options = localStorage.getItem('options');

  if (options !== null) {
    try {
      userOptions = JSON.parse(options);
    } catch(error) {
      console.log(`Invalid options stored: ${userOptions}`);
    }
  }

  configure();

  initHistory();

  // listen to nee packets
  chrome.runtime.onMessage.addListener(handleMessage);

}

init();
