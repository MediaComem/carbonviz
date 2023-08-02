import { updateHistoryDb, updateRunningDurationSec } from "../storage/co2History.js";
import { getTodayCounter, getDailyAggregates } from "../storage/indexedDB.js";
import { initStorage } from "../storage/storage.js";
import { retrieveSettings, resetSettings } from "../settings/settings.js";
import { saveNotifications, retrieveNotifications } from '../utils/offlineNotifications.js';

// Note that since the switch to manifest v3, chrome extension API switched mostly to Promises (as Firefox)
// And Firefox supports chrome.* namespace for API available in chrome and firefox
// Only the path to the extension web pages is still different
const isFirefox = typeof(browser) !== 'undefined';

const dailyNotificationURL = 'https://carbonviz.heig-vd.ch/notification.json';
const notificationIcon = '../icons/logos/carbonViz-48.png'  //'../icons/logos/logo-equiwatt-large.png';

const coreNetworkElectricityUsePerByte = 8.39e-11;
const dataCenterElectricityUsePerByte = 6.16e-11;

let failedNotifications = {
  weeklynotificationTimeStamp: '',
  dailyNotificationBacklog: [],
  lastDisplayedDailyNotification: ''
};

retrieveNotifications().then(notifications => {
  failedNotifications = notifications;
});

const refreshSettings = async () => {
  const settings = await retrieveSettings();
  return settings;
};

let DBInitialized = false;
let dailyResponseJson = [];
let dump = [];
let co2ComputerInterval;
const co2ComputerIntervalMs = 2000;
let lastCo2Tick = new Date();
let writeDataInterval;
const writingIntervalMs = 60000;
const weeklyIntervalMins = 10080; // Set the alarm to repeat every week (7 days * 24 hours * 60 minutes = 10080 minutes)
const dailyIntervalMins = 1440;

let statistics = { co2: 0, data: 0, energy: 0, time: 0};

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

const reduceDailyAggregates = (data) => {
  return data.reduce((acc, day) => {
    return {
        data: acc.data + day.data,
        energy: acc.energy + day.energy,
        co2: acc.co2 + day.co2,
        computer: { energy: acc.computer.energy + day.computer.energy, co2: acc.computer.co2 + day.computer.co2 }
    }
  }, { data: 0, energy: 0, co2: 0, computer: { energy: 0, co2: 0}});
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

  // send message to miniViz
  chrome.tabs.query({active: true}, function(tabs) {
    if (tabs && tabs[0]) {
      for (const tab of tabs) {
        sendMessageToTab(tab.id, { data: info });
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
        refreshSettings().then((settings) => {
          if(settings.showMiniViz) {
            let now = new Date();
            const endDate = settings.deactivateUntil ? new Date(settings.deactivateUntil) : 0;
            if(now > endDate) {
              sendResponse({show: true});
            }
          }
        });
        return true; // if (response && response.show === true) {
      case 'removeMiniviz':
        chrome.tabs.query({}).then((tabs) => {
          for (const tab of tabs) {
            sendMessageToTab(tab.id, { query: 'removeMiniviz' });
          }
        })
        return;
      case 'sendNextDailyNotification':
        if (dailyResponseJson.length > 0) {
          chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
            const activeTab = tabs[0];
            if(activeTab?.id) {
              sendDailyUpdateStore(activeTab?.id)
            } else {
              sendOSAlert('daily');
            }
          });
        }
      case 'deactivateDataStorage':
        chrome.webRequest.onCompleted.removeListener(completedListener);
        return;
      case 'reactivateDataStorage':
        addPluginHeaderListener();
        return;
      default:
        break;
    }
  }
  return;
}

const sendOSAlert = (type) => {
  chrome.notifications.create(type+'-' + new Date().getTime(), {
    type: 'basic',
    iconUrl: notificationIcon,
    title: 'CarbonViz '+type+' notification',
    message: 'Notification will be shown the next time you open a chrome broswer',
    priority: 2,
    buttons: [
      { title: 'Ignore' },
      { title: 'openTab' }
    ]
  });
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

const addPluginHeaderListener = () => {
  const pluginListener = chrome.webRequest.onCompleted.hasListener(completedListener);
  if(!pluginListener) {
    chrome.webRequest.onCompleted.addListener(
      completedListener,
      {urls: ['<all_urls>']},
      ['responseHeaders']
    );
  }
};

const writeData = async () => {
  for(let packet of dump) {
    await updateHistoryDb(packet);
  }
  updateRunningDurationSec(writingIntervalMs / 1000);
  statistics.time += writingIntervalMs / 1000;
  dump = [];
};

const getNextMonday9AM = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
  const daysUntilMonday = (8 - dayOfWeek) % 7; // Calculate the number of days until the next Monday
  const nextMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilMonday);
  nextMonday.setHours(9, 0, 0, 0); // Set the time to 9 AM
  return nextMonday;
};

startComputerCo2Interval();

addPluginHeaderListener();

chrome.runtime.onMessage.addListener(handleMessage);

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason !== chrome.runtime.OnInstalledReason.INSTALL) {
    resetSettings();
    return;
  }
  // Event can trigger before initStorage is complete and DB instance is not ready. 
  const DBReady = setInterval(() => {
    if (DBInitialized) {
      clearInterval(DBReady);
      // Set up a notification every Monday at 9am
      chrome.alarms.create('weeklynotification', {
        when: getNextMonday9AM().getTime(), // takes timestamp which getTime returns
        periodInMinutes: weeklyIntervalMins
      });
      // Set up a notification daily
      chrome.alarms.create('dailyNotification', {
        when: new Date().setHours(8, 0, 0, 0),
        periodInMinutes: dailyIntervalMins
      });
    }
  }, 100)
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'weeklynotification') {
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
      const activeTab = tabs[0];
      if(activeTab?.id) {
        sendWeeklyNotification(activeTab.id);
      } else {
        saveNotifications('weeklynotificationTimeStamp', new Date().getTime());
        sendOSAlert('weekly');
      }
    });
  }
  if (alarm.name === 'dailyNotification') {
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
      const activeTab = tabs[0];
      if(activeTab?.id) {
        sendDailyNotification(activeTab.id);
      } else {
        saveNotifications('dailyNotificationTimeStamp', new Date().getTime());
        sendOSAlert('daily');
      }
    });
  }
});

chrome.notifications.onButtonClicked.addListener(function(notifType, openTab) {
  if (openTab) { // TBD what action do we want when user clicks for weekly or daily notifi...
    notifType.startsWith('weekly') ? chrome.tabs.create({url: "https://www.equiwatt-lausanne.ch/"}) : chrome.tabs.create({url: "https://www.equiwatt-lausanne.ch/"});
  }
});

// Check for failed messages on new tab & pluginListener if disabled
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // make sure the status is 'complete' and it's the right tab
  if (changeInfo.status === 'complete') {
    checkFailedNotifications([tab]);
    const pluginActive = chrome.webRequest.onCompleted.hasListener(completedListener);
    refreshSettings().then((settings) => {
      if(!pluginActive) {
        let now = new Date();
        const endDate = new Date(settings.deactivateUntil);
        if(now > endDate) {
          //In case popup settings page is closed we need to reactivate the listener here
          addPluginHeaderListener();
        }
      }
    });
  }
});

// TODO handle light / dark also with service worker
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

const checkDailyDates = (notifications) => {
  return notifications.sort((a, b) => new Date(a.date) - new Date(b.date));
}

const sendDailyUpdateStore = (activeTabId) => {
  sendMessageToTab(activeTabId, { dailyNotifications: {data: dailyResponseJson[0]} });
  dailyResponseJson.shift();
  saveNotifications('dailyNotificationBacklog', dailyResponseJson );
}

const sendWeeklyNotification = async (activeTabId) => {
  let weekData = await getDailyAggregates('day',[-7, 0]);
  weekData = reduceDailyAggregates(weekData);

  let lastWeekData = await getDailyAggregates('day',[-14, -7]);
  lastWeekData = reduceDailyAggregates(lastWeekData);

  saveNotifications('weeklynotificationTimeStamp', '');
  sendMessageToTab(activeTabId, { weeklynotification: {currentWeek: weekData, lastWeek: lastWeekData} });
}

const sendDailyNotification = async (activeTabId) => {
  dailyResponseJson =  await fetch(dailyNotificationURL).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Failed to fetch dailyNotification');
  })
  .then((responseJson) => {
    const orderByDate = checkDailyDates(responseJson.dailyNotifications);
    return orderByDate;
  })
  .catch((error) => {
    console.log(error)
    return [];
  })
  if(dailyResponseJson.length > 1) {
    // send first notification and save others to be sent after user confirmation
    sendDailyUpdateStore(activeTabId);
  } else {
    sendMessageToTab(activeTabId, { dailyNotifications: {data: dailyResponseJson[0]} });
    saveNotifications('dailyNotificationTimeStamp', '');
  }
}

const checkFailedNotifications = async (tab = false) => {
  failedNotifications = await retrieveNotifications();
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let activeTab = tab ? tab : await chrome.tabs.query(queryOptions);
  if (activeTab[0].id && failedNotifications.dailyNotificationTimeStamp) {
    sendDailyNotification(activeTab[0].id);
    return; // User to acknowledge popup before replacing with weekly below.
  };
  if (activeTab[0].id && failedNotifications.weeklynotificationTimeStamp) {
    sendWeeklyNotification(activeTab[0].id);
  };
}

initStorage().then( async () => {
  const settings = await retrieveSettings();
  statistics = await getTodayCounter(settings.lifetimeComputer);
  DBInitialized = true;
})
