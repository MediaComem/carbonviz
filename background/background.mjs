import { updateHistoryDb, updateRunningDurationSec } from "../storage/co2History.js";
import { init as initDB, getTodayCounter } from "../storage/indexedDB.js";

// Note that since the switch to manifest v3, chrome extension API switched mostly to Promises (as Firefox)
// And Firefox supports chrome.* namespace for API available in chrome and firefox
// Only the path to the extension web pages is still different
const isFirefox = typeof(browser) !== 'undefined';

const usageDevicePerYear = 1917.3;
const lifetimeLaptopYears = 6.5;
const lifetimeInternetAccessEquipmentYears = 6;
const lifetimeRouterYears = 6;

const laptopEnergyConsumptionKWh = 0.03;
const laptopPowerAdaptorEnergyConsumptionKWh = 0.001;
const internetEquipmentEnergyConsumptionKWh = 0.005;
const routerEnergyConsumptionKWh = 0.0076;

const coreNetworkElectricityUsePerByte = 8.39e-11;
const dataCenterElectricityUsePerByte = 6.16e-11;

// Miniviz inner page animation option
let minivizOptions = {
  time: undefined,
  show: true
};

chrome.storage.local.get(['minivizOptions']).then(storage => {
  const minivizPreviousState = storage.minivizOptions;
  if (minivizPreviousState) {
    minivizOptions = JSON.parse(minivizPreviousState);
  }
})

let dump = [];
let co2ComputerInterval;
const co2ComputerIntervalMs = 2000;
let lastCo2Tick = new Date();
let writeDataInterval;
const writingIntervalMs = 60000;

let statistics = { co2: 0, data: 0};

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
  } else if (match = hostname.match(/^([^\.]+)\..+$/)) {
    domain = match[1]
  }
  const capitalized = domain.charAt(0).toUpperCase() + domain.slice(1)
  return capitalized;
}

const saveToDump = (data) => {
  let match = false;
  for(let entry of dump) {
    if (entry.domainName === data.domainName) {
      entry.co2Size += data.co2Size;
      entry.packetSize += data.packetSize;
      entry.energySize += data.energySize;
      entry.timeStamp = data.timeStamp;
      match = true;
      break;
    }
  }
  if(!match) {
    dump.push(data);
  }
}

const energyImpactHome = (timeElapsed) => {
  const timeHour = timeElapsed / (1000 * 3600);
  // NRE stands for Non renewable primary energy
  // RE stands for renewable energy
  // Low voltage standard CH electricity
  const electricityCHLowNRE = 7.0625547;
  const electricityCHLowRE = 2.300712;

  // setup: laptop + core network CH + data center EU
  const impactManufacturingLaptopNRE = 2098.3146;
  const impactManufacturingLaptopRE = 185.389;
  const impactManufacturingPowerAdaptorLaptopNRE = 57.620504;
  const impactManufacturingPowerAdaptorLaptopRE = 8.814852;

  const laptopNREPerHour = (impactManufacturingLaptopNRE+impactManufacturingPowerAdaptorLaptopNRE)/(lifetimeLaptopYears*usageDevicePerYear);
  const laptopREPerHour = (impactManufacturingLaptopRE+impactManufacturingPowerAdaptorLaptopRE)/(lifetimeLaptopYears*usageDevicePerYear);

  const impactManufacturingInternetAccessEquipmentNRE = 98.930851;
  const impactManufacturingInternetAccessEquipmentRE = 8.698307;

  const internetEquipementNREPerHour = impactManufacturingInternetAccessEquipmentNRE/(lifetimeInternetAccessEquipmentYears*usageDevicePerYear);
  const internetEquipementREPerHour = impactManufacturingInternetAccessEquipmentRE/(lifetimeInternetAccessEquipmentYears*usageDevicePerYear);

  const impactManufacturingRouterNRE = 449.28912;
  const impactManufacturingRouterRE = 39.83213;

  const routerNREPerHour = impactManufacturingRouterNRE/(lifetimeRouterYears*usageDevicePerYear);
  const routerREPerHour = impactManufacturingRouterRE/(lifetimeRouterYears*usageDevicePerYear);

  const homeElectricityNREPerHour = (laptopEnergyConsumptionKWh + laptopPowerAdaptorEnergyConsumptionKWh + internetEquipmentEnergyConsumptionKWh + routerEnergyConsumptionKWh) * electricityCHLowNRE;
  const homeElectricityREPerHour = (laptopEnergyConsumptionKWh + laptopPowerAdaptorEnergyConsumptionKWh + internetEquipmentEnergyConsumptionKWh + routerEnergyConsumptionKWh) * electricityCHLowRE;

  const energyNREHomePerHour = laptopNREPerHour + internetEquipementNREPerHour + routerNREPerHour + homeElectricityNREPerHour;
  const energyREHomePerHour = laptopREPerHour + internetEquipementREPerHour + routerREPerHour + homeElectricityREPerHour;

  const energyNRE = energyNREHomePerHour * timeHour;
  const energyRE = energyREHomePerHour * timeHour;
  return { energyNRE, energyRE };
}

const energyImpactInternet = (bytes) => {
  // Medium voltage standard CH electricity
  const electricityCHMediumNRE = 6.7217031;
  const electricityCHMediumRE = 2.1383485;
  // Medium voltage standard EU electricity
  const electricityEUMediumNRE = 9.162991;
  const electricityEUMediumRE = 1.506303;
  const coreNetworkElectricityNRE = coreNetworkElectricityUsePerByte * bytes * electricityCHMediumNRE;
  const coreNetworkElectricityRE = coreNetworkElectricityUsePerByte * bytes * electricityCHMediumRE;
  const dataCenterElectricityNRE = dataCenterElectricityUsePerByte * bytes * electricityEUMediumNRE;
  const dataCenterElectricityRE = dataCenterElectricityUsePerByte * bytes * electricityEUMediumRE;

  const energyNRE = coreNetworkElectricityNRE + dataCenterElectricityNRE;
  const energyRE = coreNetworkElectricityRE + dataCenterElectricityRE;

  return { energyNRE, energyRE };
}

// get co2 emissions
const co2ImpactHome = (timeElapsed) => {
  const timeHour = timeElapsed / (1000 * 3600);
  // Low voltage standard CH electricity
  const electricityCHLowFactor = 0.129;

  // setup: laptop + core network CH + data center EU
  const impactManufacturingLaptop = 173.7;
  const impactManufacturingPowerAdaptorLaptop = 4.7;
  const lifetimeLaptopYears = 6.5;

  const co2LaptopPerHour = (impactManufacturingLaptop+impactManufacturingPowerAdaptorLaptop)/(lifetimeLaptopYears*usageDevicePerYear);

  const impactManufacturingInternetAccessEquipment = 7.7;

  const co2InternetEquipementPerHour = impactManufacturingInternetAccessEquipment/(lifetimeInternetAccessEquipmentYears*usageDevicePerYear);

  const impactManufacturingRouter = 35;

  const co2RouterPerHour = impactManufacturingRouter/(lifetimeRouterYears*usageDevicePerYear);

  const co2HomeElectricityPerHour = (laptopEnergyConsumptionKWh + laptopPowerAdaptorEnergyConsumptionKWh + internetEquipmentEnergyConsumptionKWh + routerEnergyConsumptionKWh) * electricityCHLowFactor;
  const co2HomePerHour = co2LaptopPerHour + co2InternetEquipementPerHour + co2RouterPerHour + co2HomeElectricityPerHour;
  return co2HomePerHour * timeHour;
}

// get co2 emissions
const co2ImpactInternet = (bytes) => {
  // Medium voltage standard CH electricity
  const electricityCHMediumFactor = 0.120;
  // Medium voltage standard EU electricity
  const electricityEUMediumFactor = 0.433;

  const co2CoreNetworkElectricity = coreNetworkElectricityUsePerByte * bytes * electricityCHMediumFactor;
  const co2DataCenterElectricity = dataCenterElectricityUsePerByte * bytes * electricityEUMediumFactor;

  return co2CoreNetworkElectricity + co2DataCenterElectricity;
}

const sendMessageToTab = (tabId, data) => {
  chrome.tabs.sendMessage(tabId, data).then()
  .catch(e => { /* miniViz probably not loaded */ });
}

const completedListener = async(responseDetails) => {
  const { fromCache, initiator, responseHeaders, statusCode, timeStamp, url } = responseDetails;
  const info = { fromCache, initiator, statusCode, timeStamp, url };
  const headers = [];
  const mainHeaders = ['content-range', 'content-length', 'content-type' ];
  let packetWithSize = false;

  for (let header of responseHeaders) {
    const keep = mainHeaders.includes(header.name.toLowerCase());
    if (keep) {
      headers.push(header);
      if (header.name.toLowerCase().localeCompare('content-length')===0) {
        packetWithSize = true;
        info.contentLength = header.value;
      }
    }
  }

  let packetSize = parseInt(info.contentLength);

  if (info.fromCache || // skip data from cache
      packetSize < 1) { // skip packet less than 1 byte)
        return
  }

  if(
    url.startsWith('http://localhost') || url.startsWith('https://localhost') || // skip localhost (since local)
    url.startsWith('chrome-extension:') // skip extension files (since local)
  ){
    return;
  }

  if (!packetWithSize) {
    // Try to get packet size even though Content-Length not provided
    // In particular video with range request
    // ex: specific to YouTube QUIC Request
    const rangeRegex = /range=(\d+)-(\d+)/g;
    const m = rangeRegex.exec(url);
    if (m!==null && m.length > 2) {
      packetWithSize = true;
      packetSize = parseInt(m[2])-parseInt(m[1]);
      if (packetSize < 1) { // skip packet less than 1 byte)
        return
      }
    }
  }

  if(!packetWithSize) { // no size
    return;
  }

  info.headers = headers;

  // compute Co2 + energy (primary + renewable)
  const co2Internet = co2ImpactInternet(packetSize);
  const energyInternet = energyImpactInternet(packetSize);
  info.co2 = co2Internet;
  info.energyNRE = energyInternet.energyNRE;
  info.energyRE = energyInternet.energyRE;
  info.energy = energyInternet.energyNRE + energyInternet.energyRE;
  info.extraInfo = { timeStamp };

  statistics.co2 += info.co2 - 0;
  statistics.data += info.contentLength - 0;

  // retrieve tab url
  // we do not use initiator since some embedded frame could be different from the original website
  // ex: we want to assign a youtube video on a webpage to the webpage and not to youtube
  if (responseDetails.tabId > 0 ) {
    chrome.tabs.get(responseDetails.tabId, tab => {
      if(chrome.runtime.lastError) {
        // tab probably closed after response received or coming from extension
        console.log(`Error retrieving tab: ${chrome.runtime.lastError}`);
        return;
      }
      if (tab) {
        if (!tab.url) {
          return;
        }
        if (tab.url.startsWith('http://localhost') || tab.url.startsWith('https://localhost') || // skip localhost (since local)
            tab.url.startsWith('chrome-extension:') // skip extension files (since local)
        ){
          return;
        }
        info.extraInfo.tabIcon = tab.favIconUrl;
        info.extraInfo.tabTitle = tab.title;
        info.extraInfo.tabUrl = tab.url;
      }
      // send data to popup
      sendMessageToPopup({ data: info });

      if (!writeDataInterval) {
        writeDataInterval = setInterval(writeData, writingIntervalMs);
      }
      // (domain, sizeCo2, sizeData, timestamp)
      let domainName = domain(info);
      let co2Size = info.co2;
      let energySize = info.energy;
      saveToDump({domainName, co2Size, packetSize, energySize, timeStamp});
    });
  }

  // Get todays total for miniViz
  const dayTotal = await getTodayCounter();

  // send message to miniViz
  chrome.tabs.query({active: true}, function(tabs) {
    if (tabs && tabs[0]) {
      for (const tab of tabs) {
        sendMessageToTab(tab.id, { data: info });
        sendMessageToTab(tab.id, { total: dayTotal });
        sendMessageToTab(tab.id, { statistics });
      }
    }
  });

  // check if co2 computer tick OK
  // prevent setInterval not working after long computer sleep
  // allow some margin
  const now = new Date();
  if(now - lastCo2Tick > 2 * co2ComputerIntervalMs) {
    startComputerCo2Interval();
  }
}

const handleMessage = (request, _sender, sendResponse) => {
  if (request.query) {
    switch (request.query) {
      case 'openExtension':
        addPluginToNewTab();
        break;
      case 'startMiniviz':
        if(!minivizOptions.show) {
          let timeNow = Date.now();
          if(timeNow > minivizOptions.time) {
            minivizOptions.show = true;
            chrome.storage.local.set({'minivizOptions' : JSON.stringify(minivizOptions)});
          }
        }
        sendResponse({show: minivizOptions.show});
        return true;
      case 'removeMiniviz':
        minivizOptions.time = Date.now() + request.time;
        minivizOptions.show = false;
        chrome.storage.local.set({'minivizOptions' : JSON.stringify(minivizOptions)});
        chrome.tabs.query({}).then((tabs) => {
          for (const tab of tabs) {
            sendMessageToTab(tab.id, { query: 'removeMiniviz' });
          }
        })
        return;
      default:
        break;
    }
  }
  return;
}

// computer CO2 default usage
const computerCo2 =  () => {
  // const co2 =  0.023651219231638508 * 10000000 / 3600;
  // const energgyNREHomeDefaultPerHour = 0.5285774234423879;
  // const energyREHomeDefaultPerHour = 0.12011280706531807;
  // doesnt need to calculate, it's a constant value: ~6.57 [mg/sec]
  const seconds = co2ComputerIntervalMs / 1000;
  const computerCo2 =  {
    initiator: 'computer',
    contentLength: 0,
    co2: 6.57e-6 * seconds,
    energyNRE: 1.47e-4 * seconds,
    energyRE: 3.34e-5 * seconds,
    extraInfo: { timeStamp: new Date() }
  };

  statistics.co2 += computerCo2.co2 - 0;

  // send data to animation
  sendMessageToPopup({ data: computerCo2 });

  // send message to miniViz
  chrome.tabs.query({active: true}, function(tabs) {
    if (tabs && tabs[0]) {
      for (const tab of tabs) {
        sendMessageToTab(tab.id, { data: computerCo2 });
        sendMessageToTab(tab.id, { statistics });
      }
    }
  });
  lastCo2Tick = new Date();
};

const startComputerCo2Interval = () => {
  console.log("Starting computer co2 consumption interval");
  if (co2ComputerInterval) {
    clearInterval(co2ComputerInterval);
  }
  co2ComputerInterval = setInterval(computerCo2, co2ComputerIntervalMs);
}

const writeData = async () => {
  for(let packet of dump) {
    await updateHistoryDb(packet);
  }
  updateRunningDurationSec(writingIntervalMs / 1000);

  dump = [];
};

startComputerCo2Interval();

chrome.webRequest.onCompleted.addListener(
  completedListener,
  {urls: ['<all_urls>']},
  ['responseHeaders']
);

chrome.runtime.onMessage.addListener(handleMessage);

// TODO handle light / dark also with service owrker
/*
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  chrome.browserAction.setIcon({path: '../icons/iconDark.png'});
}
*/

const createExtensionTab = () => {
  let url = 'fullpage/fullpage.html#Statistics';
  if (isFirefox) {
    url = '../fullpage/fullpage.html#Statistics';
  }
  const options = {url, active: true};
  chrome.tabs.create(options);

}
const addPluginToNewTab = async () => {
  let fullpageTabIndex = undefined;

  await chrome.storage.local.get(['fullpageTabIndex']).then(storage => {
    fullpageTabIndex = storage.fullpageTabIndex;
  });

  if(fullpageTabIndex) {
    chrome.tabs.update(fullpageTabIndex,{active: true}, function() {
      // if tab was closed and no longer exists
      if (chrome.runtime.lastError) {
        createExtensionTab();
      }
    });
  }
  else {
    createExtensionTab();
  }
}

initDB().then( async () => {
  statistics = await getTodayCounter();
})
