import PubSub from '../unplug/js/modules/pubsub.mjs';
import conf from '../unplug/js/conf.mjs';
import { engine, render, mouseConstraint, metaData } from '../unplug/js/main.mjs';

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
  const date = new Date(packet.extraInfo.timeStamp);
  return `${ date.getHours() }H${ date.getMinutes() }`;
}
const size = (packet) => {
  const size = packet.chunkSizeData ? parseInt(packet.chunkSizeData) : parseInt(packet.contentLength);
  if (size / 1000 < 1) {
    return `${ Math.round(size) } B`;
  } else if (size / 1000 >= 1000) {
    return `${ Math.round(size / 1000000) } MB`;
  }
  else {
    return `${ Math.round(size / 1000) } KB`;
  }
}
const domain = (packet) => {
  if (!packet.extraInfo.tabUrl) {
    return '';
  }
  const url = new URL(packet.extraInfo.tabUrl);
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
  const type = packet.extraInfo.type;
  if (!type) {
    return '';
  }
  const capitalized = type.charAt(0).toUpperCase() + type.slice(1)
  return capitalized;
}
const co2 = (packet) => {
  return `${Math.floor(1000000*packet.chunkSizeCo2)/1000} g Co2`;
}

// User interface
const embedButton = window.document.getElementById("embed");
const debounceCheckbox = window.document.getElementById("debounce");
// Navigation
const navUp = window.document.getElementById("navUp");
const navCo2 = window.document.getElementById("navCo2");
const navFlux = window.document.getElementById("navFlux");
const navData = window.document.getElementById("navData");
const navDown = window.document.getElementById("navDown");
// Menu
// Packet info
const info = window.document.getElementById("packet-info");
const packetIcon = window.document.getElementById("packet-icon");
const packetInitiator = window.document.getElementById("packet-initiator");
const packetType = window.document.getElementById("packet-type");
const packetTime = window.document.getElementById("packet-time");
const packetSize = window.document.getElementById("packet-size");
const packetCo2 = window.document.getElementById("packet-co2");

// Legend
const legend = window.document.getElementById("legend");

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
  navUp.classList.add("disabled");
  navCo2.classList.add("selected");
  navFlux.classList.remove("selected");
  navData.classList.remove("selected");
  navDown.classList.remove("disabled");
  Matter.Bounds.shift(render.bounds, {x:0, y: -conf.pageHeight});
}
const goToFlux = () => {
  navFlux.classList.add("selected");
  navCo2.classList.remove("selected");
  navData.classList.remove("selected");
  navUp.classList.remove("disabled");
  navDown.classList.remove("disabled");
  Matter.Bounds.shift(render.bounds, {x:0, y: 0});
}
const goToData = () => {
  navDown.classList.add("disabled");
  navData.classList.add("selected");
  navCo2.classList.remove("selected");
  navFlux.classList.remove("selected");
  navCo2.classList.remove("disabled");
  navUp.classList.remove("disabled");
  Matter.Bounds.shift(render.bounds, {x:0, y: conf.pageHeight});
}

const goUp = () => {
  if (render.bounds.min.y === 0){
    goToCo2();
  } else if (render.bounds.min.y === conf.pageHeight) {
    goToFlux();
  }
}

const goDown = () => {
  if (render.bounds.min.y === 0){
    goToData();
  } else if (render.bounds.min.y === -conf.pageHeight){
    goToFlux();
  }
}

// Add user interface listener
navUp.addEventListener('click', goUp)
navCo2.addEventListener('click', goToCo2)
navFlux.addEventListener('click', goToFlux)
navData.addEventListener('click', goToData)
navDown.addEventListener('click', goDown)

// embedButton.addEventListener('click', embedPlugin)
// debounceCheckbox.addEventListener('click', toggleDebounce)

// Packet info display
const showLegend = () => {
  show(legend);
  hide(info);
}

const showPacketIcon = (data) => {
  if (data.extraInfo.tabIcon) {
    packetIcon.hidden = false;
    packetIcon.src = data.extraInfo.tabIcon;
  } else {
    packetIcon.hidden = true;
  }
}

const displayCo2Info = (data) => {
  hide([ legend, packetSize ]);
  show([info, packetTime, packetCo2 ]);

  packetTime.innerHTML = time(data);
  packetCo2.innerHTML = co2(data);

  if (data.initiator === 'computer') {
    hide([ packetIcon, packetType ]);
    packetInitiator.innerHTML = 'Computer';
  } else {
    show([ packetIcon, packetType]);
    showPacketIcon(data);
    packetInitiator.innerHTML = domain(data);
    packetType.innerHTML = type(data);
  }
}

const displayDataInfo = (data) => {
  hide([ legend, packetCo2]);
  show([info, packetIcon, packetType, packetTime, packetSize ]);
  showPacketIcon(data);
  packetTime.innerHTML = time(data);
  packetType.innerHTML = type(data);
  packetSize.innerHTML = size(data);
  packetInitiator.innerHTML = domain(data);
}

const resetSelection = () => {
  // Reset clicked state
  if (clickedChunk.texture) {
    clickedChunk.body.render.sprite.texture = clickedChunk.texture;
    clickedChunk = {};
    Matter.World.remove(
      engine.world,
      infoConstraint
    );
    showLegend();
  }
}

// Handle click on animation elements
// Clear animation event
Matter.Events.off(mouseConstraint, "mousemove");
Matter.Events.off(mouseConstraint, "mousedown");

let hoverChunk = {}; // storage for the entity in the "hover" state
let clickedChunk = {}; // storage for the entity in the "clicked" state
let infoConstraint; // line between selection and info

Matter.Events.on(mouseConstraint, "mousemove", event => {
  // Reset hover state
  if (hoverChunk.body && (clickedChunk.body != hoverChunk.body)) {
    hoverChunk.body.render.sprite.texture = hoverChunk.texture;
    hoverChunk = {};
  }
  // Find the body in collision with the mouse position
  const bodies = Matter.Composite.allBodies(engine.world);
  const foundBodies = Matter.Query.point(bodies, event.mouse.position);
  if (foundBodies.length < 1) return;
  let body = foundBodies[0];
  if (!metaData.has(body) || body == clickedChunk.body) return;
  // Change the asset of the body
  const asset = body.label == "data" || body.label == "fall" ? conf.assets.dataHover : conf.assets.co2Hover;
  hoverChunk = {body, texture: body.render.sprite.texture};
  body.render.sprite.texture = asset;
});

Matter.Events.on(mouseConstraint, "mousedown", event => {

  resetSelection();
  // Find the body in collision with the mouse position
  const bodies = Matter.Composite.allBodies(engine.world);
  const foundBodies = Matter.Query.point(bodies, event.mouse.position);
  if (foundBodies.length < 1) {
    return;
  }
  let body = foundBodies[0];
  if (!metaData.has(body)) {
    return;
  }

  let data = metaData.get(body);
  // Change the asset of the body
  const isData = body.label == "data" || body.label == "fall";
  const asset = isData ? conf.assets.dataActive : conf.assets.co2Active;
  const texture = hoverChunk.body == body ? hoverChunk.texture : body.render.sprite.texture;
  clickedChunk = {body, texture};
  body.render.sprite.texture = asset;

  // Link body to info box
  infoConstraint = Matter.Constraint.create({
    pointA: { x: render.options.width, y: render.options.height / 2 },
    bodyB: body,
    pointB: { x: (body.bounds.max.x-body.bounds.min.x)/2, y: 0 },
    stiffness: 1e-10,
    render: {
        strokeStyle: "#000",
        lineWidth: 1,
        anchors: false,
        type: 'line'
    }
  });
  Matter.World.add(
    engine.world,
    infoConstraint
  );
  // display block info
  show([packetIcon, packetType, packetTime, packetCo2, packetSize]);
  if (body.label == "data" || body.label == "fall") {
    displayDataInfo(data);
  } else {
    displayCo2Info(data);
  }
  // automatically reset selection after 2 seconds
  setTimeout( resetSelection, 3000 )
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
    // skip too small packets
    if(packet.contentLength < 1) {
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
    // update history
    shiftHistory();
    // update new favIcon + title
    if (packet.extraInfo.tabIcon) {
      history[0].icon.hidden = false;
      history[0].icon.src = packet.extraInfo.tabIcon;
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
  const separator = document.createElement('div');
  separator.className = 'separator';
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
  block.appendChild(separator);
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
  conf.mouseManagement = false;
  // debounceCheckbox.checked = userOptions.debounce;
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
