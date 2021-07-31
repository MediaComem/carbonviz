import { updateCo2Total } from "../co2History/co2History.js";

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

const minivizOptions = {
  time: undefined,
  show: true
};

let dump = [];
let addFiveMinuteInterval;

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

const saveToDump = (data) => {
  let match = false;
  for(let entry in dump) {
    if (dump[entry].domainName === data.domainName) {
      dump[entry].co2Size += data.co2Size;
      dump[entry].packetSize += data.packetSize;
      dump[entry].timeStamp = data.timeStamp;
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

const completedListener = (responseDetails) => {
  const { frameId, fromCache, initiator, requestId, responseHeaders, statusCode, timeStamp, type, url, ip, event } = responseDetails;
  const info = { frameId, fromCache, initiator, requestId, statusCode, timeStamp, type, url, ip, event };
  const headers = [];
  const mainHeaders = ['content-range', 'content-length', 'content-type' ];
  let packetWithSize = false;
  for (let header of responseHeaders) {
    const keep = mainHeaders.includes(header.name.toLowerCase());
    if (keep) {
      headers.push(header);
      if (header.name.toLowerCase().localeCompare('content-length')==0) {
        packetWithSize = true;
        info.contentLength = header.value;
      }
    }
  }

  const packetSize = parseInt(info.contentLength);

  if (info.fromCache || // skip data from cache
      !packetWithSize || packetSize < 1 ||// skip no data packet or packet less than 1 byte
      url.startsWith('http://localhost') || url.startsWith('https://localhost') || // skip localhost (since local)
      url.startsWith('chrome-extension:') // skip extension files (since local)
  ){
    return;
  }

  info.headers = headers;

  // compute Co2 + energy (primary + renewable)
  const co2Internet = co2ImpactInternet(packetSize);
  const energyInternet = energyImpactInternet(packetSize);
  info.co2 = co2Internet;
  info.energyNRE = energyInternet.energyNRE;
  info.energyRE = energyInternet.energyRE;
  info.extraInfo = { timeStamp, type };

  // retrieve tab name
  if (responseDetails.tabId > 0 ) {
    chrome.tabs.get(responseDetails.tabId, tab => {
      if(chrome.runtime.lastError) {
        // tab probably closed after response received or coming from extension
        console.log(`Error retrieving tab: ${chrome.runtime.lastError}`);
        return;
      }
      if (tab) {
        if (tab.url.startsWith('http://localhost') || tab.url.startsWith('https://localhost') || // skip localhost (since local)
            tab.url.startsWith('chrome-extension:') // skip extension files (since local)
      ){
        return;
      }
        info.extraInfo.tabIcon = tab.favIconUrl;
        info.extraInfo.tabTitle = tab.title;
        info.extraInfo.tabUrl = tab.url;
      }
      // send data to animation
      chrome.runtime.sendMessage({ data: info });

      if (!addFiveMinuteInterval) {
        addFiveMinuteInterval = setInterval(addFiveMinute, 300000);
      }
      // (domain, sizeCo2, sizeData, timestamp)
      let domainName = domain(info);
      let co2Size = info.co2;
      saveToDump({domainName, co2Size, packetSize, timeStamp});
    });
  }

  // send message to inner animation
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs && tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { data: info });
    }
  });
}

const loadScripts = () => {
  chrome.tabs.executeScript({
    file: 'content/matter.js'
  });
  chrome.tabs.executeScript({
    file: 'content/content-script.js'
  });
}

const embedPlugin = () => {
  // check if scripts loaded
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs && tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { query: 'isLoaded' }, (response) => {
        if (response && response.isLoaded === true) {
          console.log('Script already loaded!');
        } else {
          loadScripts();
        }
        return true;
      });
    }
  });
}

const handleMessage = async (request, _sender, sendResponse) => {
  if (request.query) {
    switch (request.query) {
      case 'embedPlugin':
        embedPlugin();
        break;
      case 'openExtension':
        window.open("../popup/popup.html", "_blank", "width=600,height=600,status=no,scrollbars=yes");
        break;
      case 'startMiniviz':
        if(!minivizOptions.show) {
          let timeNow = Date.now();
          if(timeNow > minivizOptions.time) {
            minivizOptions.show = true;
          }
        }
        sendResponse({show: minivizOptions.show});        
        break;
      case 'removeMiniviz':
        minivizOptions.time = Date.now() + request.time;
        minivizOptions.show = false;
        chrome.tabs.query({}, function(tabs) {
          for (var i=0; i<tabs.length; ++i) {
            chrome.tabs.sendMessage(tabs[i].id, { query: 'removeMiniviz' });
          }
        });
      default:
        break;
    }
  }
  return true;
}

const addFiveMinute = () => {
  for(let store in dump) {
    updateCo2Total(dump[store]);
  }
  dump = [];
};

chrome.webRequest.onCompleted.addListener(
  completedListener,
  {urls: ['<all_urls>']},
  ['responseHeaders']
);

chrome.runtime.onMessage.addListener(handleMessage);

if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  chrome.browserAction.setIcon({path: '../icons/iconDark.png'});
}