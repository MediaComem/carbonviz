import PubSub from '../unplug/js/modules/pubsub.mjs';
import conf from '../unplug/js/conf.mjs';
import { render } from '../unplug/js/main.mjs';

const isFirefox = typeof(browser) !== 'undefined';

const pubSub = new PubSub();
const defaultOptions = { debounce: true, showTabConfirmation: true, showOnBoarding: true };
let userOptions = defaultOptions;
let currentGotoPageBtn = null;

const manifest = chrome.runtime.getManifest();

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
  const hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
  const minute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  return `${ hour }H${ minute }`;
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
  return `${CarbonVue.co2DataCounter.formatCo2(packet.chunkSizeCo2)}`;
}

// User interface
const body = window.document.body;
const openTabDialog = window.document.getElementById("tabDialog");
const openTabButtons = window.document.querySelectorAll("[data-goto-page]");
const tabConfirmationCheckbox = window.document.getElementById("disableNewTabConfirmation");
const debounceCheckbox = window.document.getElementById("debounce");
// Navigation
const navigation = window.document.querySelector('.navigation-boxes');
const menu = window.document.querySelector('.menu');
const topBar = window.document.getElementById("topBar");
const bottomBar = window.document.getElementById("bottomBar");
const navUp = window.document.getElementById("navUp");
const navCo2 = window.document.getElementById("navCo2");
const navFlux = window.document.getElementById("navFlux");
const navData = window.document.getElementById("navData");
const navDown = window.document.getElementById("navDown");
const co2Older = window.document.getElementById("co2Older");
const co2Newer = window.document.getElementById("co2Newer");
const dataOlder = window.document.getElementById("dataOlder");
const dataNewer = window.document.getElementById("dataNewer");

// Menu
// Packet info
const info = window.document.getElementById("packet-info");
const packetType = window.document.getElementById("packet-type");
const packetTime = window.document.getElementById("packet-time");
const packetSize = window.document.getElementById("packet-size");
const packetSizeSubheader = window.document.getElementById("packet-size-subheader");
const packetCo2 = window.document.getElementById("packet-co2");
const packetCo2Subheader = window.document.getElementById("packet-co2-subheader");

// History
const historyContainer = window.document.getElementById("history");

// Define UI Actions
const openNewTabDialog = () => {
  // Open tab dialog (if tab not yet opened), else show tab
  const tabId = localStorage.getItem('extensionAnimationTabId');
  if (tabId) {
    chrome.tabs.get(parseInt(tabId), tab => {
      if(chrome.runtime.lastError) {
        // tab probably closed
      }
      if (tab && tab.title === manifest.name) {
        let page = currentGotoPageBtn?.dataset.gotoPage;
        let currentTab = tab.url.substring(tab.url.indexOf('#'));
        let url = tab.url.replace(currentTab, `#${page}`);
        chrome.tabs.update(tab.id, {url});
        chrome.tabs.highlight({ tabs: [ tab.index ], windowId: tab.windowId }, () => {});
        return;
      }
    });
  }

  if (!userOptions.showTabConfirmation) {
    return addPluginToNewTab();
  }

  if (typeof openTabDialog.showModal === "function") {
    openTabDialog.showModal();
  } else {
    // The <dialog> API is not supported by this browser
    addPluginToNewTab();
  }

}

const addPluginToNewTab = () => {
  const tabId = localStorage.getItem('extensionAnimationTabId');
  if (tabId) {
    chrome.tabs.get(parseInt(tabId), tab => {
      if(chrome.runtime.lastError) {
        // tab probably closed
      }
      if (tab && tab.title === manifest.name) {
        let page = currentGotoPageBtn?.dataset.gotoPage;
        let currentTab = tab.url.substring(tab.url.indexOf('#'));
        let url = tab.url.replace(currentTab, `#${page}`);
        chrome.tabs.update(tab.id, {url});
        chrome.tabs.highlight({ tabs: [ tab.index ], windowId: tab.windowId }, () => {});
        return;
      } else {
        createExtensionTab();
      }
    });
  } else {
    createExtensionTab();
  }

}

const createExtensionTab = () => {
  // store current tab id to come back to extension pop-up if needed
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs && tabs[0]) {
      const tab = tabs[0];
      localStorage.setItem('previousTabId', tab.id);
    }
  });
  let page = currentGotoPageBtn?.dataset.gotoPage;
  let url = `fullpage/fullpage.html#${page}`;
  if (isFirefox) {
    url = `../fullpage/fullpage.html#${page}`;
  }
  const options = {
    url,
    active: true
  };
  chrome.tabs.create( options, (tab) => {
    localStorage.setItem('extensionAnimationTabId', tab.id);
  });
}

const resetSelection = () => {
  pubSub.publish('clear-selection', null); // reset selection if navigating
}

const goToCo2 = () => {
  resetSelection();
  navUp.classList.add("hidden");
  dataNewer.classList.add("hidden");
  dataOlder.classList.add("hidden");
  navUp.classList.add("hidden");
  navCo2.classList.add("selected");
  navFlux.classList.remove("selected");
  navData.classList.remove("selected");
  navDown.classList.remove("hidden");
  Matter.Bounds.shift(render.bounds, {x:0, y: -conf.pageHeight});
  CarbonVue.historyCO2.show = true;
  CarbonVue.historyData.show = false;
  if (CarbonVue.historyCO2.maxStage > 0) {
    topBar.classList.remove("hidden");
    co2Older.classList.remove("hidden");
    topBar.classList.remove("disabled");
    co2Older.classList.remove("disabled");
  }
}
const goToFlux = () => {
  resetSelection();
  navigation.classList.remove('outside');
  menu.classList.remove('outside');
  navFlux.classList.add("selected");
  navCo2.classList.remove("selected");
  navData.classList.remove("selected");
  navUp.classList.remove("hidden");
  navDown.classList.remove("hidden");
  topBar.classList.add("hidden");
  bottomBar.classList.add("hidden");
  co2Newer.classList.add("hidden");
  co2Older.classList.add("hidden");
  dataNewer.classList.add("hidden");
  dataOlder.classList.add("hidden");
  Matter.Bounds.shift(render.bounds, {x:0, y: 0});
  CarbonVue.historyCO2.show = false;
  CarbonVue.historyData.show = false;
}
const goToData = () => {
  resetSelection();
  navDown.classList.add("hidden");
  topBar.classList.add("hidden");
  co2Newer.classList.add("hidden");
  co2Older.classList.add("hidden");
  navData.classList.add("selected");
  navCo2.classList.remove("selected");
  navFlux.classList.remove("selected");
  navUp.classList.remove("hidden");
  Matter.Bounds.shift(render.bounds, {x:0, y: conf.pageHeight});
  CarbonVue.historyCO2.show = false;
  CarbonVue.historyData.show = true;
  if (CarbonVue.historyData.maxStage > 0) {
    bottomBar.classList.remove("hidden");
    dataOlder.classList.remove("hidden");
    bottomBar.classList.remove("disabled");
    dataOlder.classList.remove("disabled");
  }
}

const nextStageCo2 = () => {
  resetSelection();
  CarbonVue.historyCO2.nextStage();
  navDown.classList.add("hidden");
  bottomBar.classList.remove("hidden");
  co2Newer.classList.remove("hidden");
  if (CarbonVue.historyCO2.stage === CarbonVue.historyCO2.maxStage) {
    topBar.classList.add("disabled");
    co2Older.classList.add("disabled");
  }
}

const previousStageCo2 = () => {
  resetSelection();
  CarbonVue.historyCO2.previousStage();
  if (CarbonVue.historyCO2.stage === 0) {
    navDown.classList.remove("hidden");
    bottomBar.classList.add("hidden");
    co2Newer.classList.add("hidden");
  }
  if (CarbonVue.historyCO2.stage < CarbonVue.historyCO2.maxStage) {
    topBar.classList.remove("disabled");
    co2Older.classList.remove("disabled");
  }
}

const nextStageData = () => {
  resetSelection();
  CarbonVue.historyData.nextStage();
  navUp.classList.add("hidden");
  topBar.classList.remove("hidden");
  dataNewer.classList.remove("hidden");
  if (CarbonVue.historyData.stage === CarbonVue.historyData.maxStage) {
    bottomBar.classList.add("disabled");
    dataOlder.classList.add("disabled");
  }
}

const previousStageData = () => {
  resetSelection();
  CarbonVue.historyData.previousStage();
  if (CarbonVue.historyData.stage === 0) {
    navUp.classList.remove("hidden");
    topBar.classList.add("hidden");
    dataNewer.classList.add("hidden");
  }
  if (CarbonVue.historyCO2.stage < CarbonVue.historyData.maxStage) {
    bottomBar.classList.remove("disabled");
    dataOlder.classList.remove("disabled");
  }
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
co2Newer.addEventListener('click', previousStageCo2)
co2Older.addEventListener('click', nextStageCo2)
dataNewer.addEventListener('click', previousStageData)
dataOlder.addEventListener('click', nextStageData)


for (const btn of openTabButtons) {
  btn.addEventListener('click', () => {
    currentGotoPageBtn = btn;
    openNewTabDialog();
  });
}
tabDialog.addEventListener('close', (event) => {
  if (tabDialog.returnValue !== 'cancel') {
    if (tabConfirmationCheckbox.checked) {
      // do not show again
      userOptions.showTabConfirmation = false;
      localStorage.setItem('options', JSON.stringify(userOptions));
    }
    addPluginToNewTab();
  }
});

let scrolling = false;

window.document.onwheel = (e) => {
  if (body.classList.contains('anim-onboarding')) return; // disabled at onboarding
  if (scrolling) return;
  scrolling = true;
  if (e.deltaY < 0) {
    goUp();
  } else {
    goDown();
  }
  setTimeout(() => { scrolling = false; }, 2000)
};

// Packet info display
const showLegend = () => {
  hide(info);
}

const displayCo2Info = (data) => {
  hide([ packetSize, packetSizeSubheader ]);
  show([info, packetTime, packetType, packetCo2, packetCo2Subheader ]);
  info.classList.add("co2-highlight");
  info.classList.remove("data-highlight");

  packetTime.innerHTML = time(data);
  packetCo2.innerHTML = co2(data);

  if (data.initiator === 'computer') {
    packetType.innerHTML = 'Computer';
  } else {
    packetType.innerHTML = type(data);
  }
}

const displayDataInfo = (data) => {
  hide([ packetCo2, packetCo2Subheader ]);
  show([info, packetType, packetTime, packetSize, packetSizeSubheader ]);

  info.classList.add("data-highlight");
  info.classList.remove("co2-highlight");

  packetTime.innerHTML = time(data);
  packetType.innerHTML = type(data);
  packetSize.innerHTML = size(data);
}

pubSub.subscribe('clear-selection', data => {
  showLegend();
});

pubSub.subscribe('selected-data', data => {
  displayDataInfo(data);
});

pubSub.subscribe('selected-co2', data => {
  displayCo2Info(data);
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
    CarbonVue.co2DataCounter.data += animations[id].contentLength - 0;
    CarbonVue.co2DataCounter.co2 += animations[id].co2 - 0;
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
      pubSub.publish('input-data', packet);
      return;
    }
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
    // update history
    shiftHistory();
    const icon = packet.extraInfo.tabIcon;
    let block = history[0];
    if ( icon ) {
      block.icon.hidden = false;
      block.icon.src = packet.extraInfo.tabIcon;
    } else {
      block.icon.hidden = true;
    }
    block.title.innerText = domain(packet);
    block.date.innerText = time(packet);
    block.size.innerText = size(packet);
  }
  return true;
}

const shiftHistory = () => {
  for ( let i=history.length-1; i>0; i--) {
    history[i].icon.hidden = history[i-1].icon.hidden;
    let icon = history[i-1].icon.src;
    history[i].icon.src = icon;
    history[i].title.innerText = history[i-1].title.innerText;
    history[i].date.innerText = history[i-1].date.innerText;
    history[i].size.innerText = history[i-1].size.innerText;
  }
}

const createHistoryPacket = (last) => {
  const block = document.createElement('div');
  block.className = 'data-info';
  const separator = document.createElement('div');
  separator.className = 'separator';
  const info = document.createElement('div');
  info.className = 'tab-info';
  const iconContainer = document.createElement('div');
  iconContainer.className = 'tab-icon';
  const icon = document.createElement('img');
  icon.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
  const title = document.createElement('div');
  title.className = 'tab-title';
  const date = document.createElement('div');
  date.className = 'packet-date';
  const size = document.createElement('div');
  size.className = 'packet-size';
  info.appendChild(iconContainer);
  iconContainer.appendChild(icon);
  info.appendChild(title);
  block.appendChild(info);
  block.appendChild(date);
  block.appendChild(size);
  if (!last) {
    block.appendChild(separator);
  }
  historyContainer.appendChild(block);
  return { icon, title, date, size, separator };
}

let history = [{}, {}, {}];
const initHistory = () => {
  for ( let i=0; i < history.length; i++) {
    const last = (i === (history.length - 1)) ;
    history[i] = createHistoryPacket(last);
  }
}

const configureDarkMode = (mode) => {
  if (mode.matches) {
    //dark mode
    render.options.background = '#363636';
    conf.assets.data = 'assets/dataDark.png';
    conf.assets.dataHover = 'assets/dataDarkHover.png';
    conf.assets.dataActive = 'assets/dataDarkActive.png';
    conf.assets.co2 = 'assets/co2Dark.png';
    conf.assets.co2Hover = 'assets/co2DarkHover.png';
    conf.assets.co2Active = 'assets/co2DarkActive.png';
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
    render.options.background = '#fff';
    conf.assets.data = 'assets/data.png';
    conf.assets.dataHover = 'assets/dataHover.png';
    conf.assets.dataActive = 'assets/dataActive.png';
    conf.assets.co2 = 'assets/co2.png';
    conf.assets.co2Hover = 'assets/co2Hover.png';
    conf.assets.co2Active = 'assets/co2Active.png';
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

const configure = () => {
  conf.uiElements = [];
  conf.mouseManagement = false;
  // debounceCheckbox.checked = userOptions.debounce;
  // disable options display menu in iframe
  if (window.self !== window.top) {
    document.querySelector('.options').style.display = "none";
  }
  configureDarkMode(window.matchMedia('(prefers-color-scheme: dark)'));
}

const initAnimation = () => {
  // Onboarding (do it only once)
  if (userOptions.showOnBoarding) {
    body.classList.add('anim-onboarding');
    setTimeout(() => {
      body.classList.remove('anim-onboarding');
      userOptions.showOnBoarding = false;
      localStorage.setItem('options', JSON.stringify(userOptions));
    }, 10000);
  }
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

  // check if tab extension opened
  // const tabId = localStorage.getItem('extensionAnimationTabId');
  // if (tabId) {
  //   chrome.tabs.get(parseInt(tabId), tab => {
  //     if(chrome.runtime.lastError) {
  //       // tab probably closed
  //     }
  //     if (tab) {
  //       // set button stlye as active
  //       for (const btn of openTabButtons) {
  //         btn.classList.add('active');
  //         btn.classList.remove('inactive');
  //       }
  //     }
  //   });
  // }

  configure();

  initHistory();

  initAnimation();

  // Adapt size if zooming set in appearance settings
  function fixWindowHeight(){
    const windowHeight = window.innerHeight;
    if (windowHeight < 600) {
        document.getElementById('carbonViz').style.height = `${windowHeight}px`;
    }
  }
  setTimeout(() => fixWindowHeight(), 250); // 250ms is enough to finish popup open animation

  // listen to nee packets
  chrome.runtime.onMessage.addListener(handleMessage);

}

init();
