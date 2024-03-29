import { updateHistoryDb, updateRunningDurationSec } from "../storage/co2History.js";
import { getTodayCounter } from "../storage/indexedDB.js";
import { initStorage, getLastDaysSummary } from "../storage/storage.js";
import { retrieveSettings, resetSettings } from "../settings/settings.js";
import { saveNotifications, retrieveNotifications } from '../utils/notifications.js';
import { formatSize } from "../utils/format.js";

// Note that since the switch to manifest v3, chrome extension API switched mostly to Promises (as Firefox)
// And Firefox supports chrome.* namespace for API available in chrome and firefox
// Only the path to the extension web pages is still different
const isFirefox = typeof(browser) !== 'undefined';

const dailyNotificationURL = 'https://carbonviz.heig-vd.ch/notification.json';
const notificationIcon = '../assets/icons/logos/carbonViz-48.png'  //'../assets/icons/logos/logo-equiwatt-large.png';

const coreNetworkElectricityUsePerByte = 8.39e-11;
const dataCenterElectricityUsePerByte = 6.16e-11;

let notificationsStatus = {
  lastDisplayedWeeklyTimeStamp: '',
  lastDisplayedDailyTimeStamp: '',
  dailyNotificationBacklog: [],
};

retrieveNotifications().then(notifications => {
  notificationsStatus = notifications;
});

const refreshSettings = async () => {
  const settings = await retrieveSettings();
  return settings;
};

let DBInitialized = false;
let dailyResponseJson = [];
let dump = [];
let writeDataInterval;
const writingIntervalMs = 60000;
const weeklyIntervalMins = 10080; // Set the alarm to repeat every week (7 days * 24 hours * 60 minutes = 10080 minutes)
const dailyIntervalMins = 1440;

let statistics = { co2: 0, data: 0, energy: 0, time: 0};
// miniviz analogy counter
let analogyCounter = {
  // 10L boiling water
  co2: { count: 0, previous: 0, step: 0.116, quantityAnalogy: 1, time: 0, previousTime: 0 },
  // 10 mins music streaming
  data: { count: 0, previous: 0, step: 24 * 1000000, quantityAnalogy: 10, time: 0, previousTime: 0 }
};

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
  statistics.data += packetSize - 0;

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

}

const handleMessage = (request, _sender, sendResponse) => {
  if (request.query) {
    switch (request.query) {
      case 'openExtension':
        addPluginToNewTab('#Trends');
        break;
      case 'startMiniviz':
        refreshSettings().then((settings) => {
          if(settings.showMiniViz) {
            let now = new Date();
            const endDate = settings.deactivateUntil ? new Date(settings.deactivateUntil) : 0;
            if(now > endDate) {
              sendResponse({show: true, counters: analogyCounter });
            }
          }
        });
        return true;
      case 'removeMiniviz':
        chrome.tabs.query({}).then((tabs) => {
          for (const tab of tabs) {
            sendMessageToTab(tab.id, { query: 'removeMiniviz' });
          }
        })
        return;
      case 'showMiniviz':
        chrome.tabs.query({}).then((tabs) => {
          for (const tab of tabs) {
            sendMessageToTab(tab.id, { query: 'showMiniviz' });
          }
        })
        return;
      case 'updatePosition':
          chrome.tabs.query({}).then((tabs) => {
            for (const tab of tabs) {
              sendMessageToTab(tab.id, { query: 'updatePosition' });
            }
          })
          return;
      case 'sendNextDailyNotification':
        if (dailyResponseJson.length > 0) {
          chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
            const activeTab = tabs[0];
            if(activeTab?.id) {
              sendDailyUpdateStore(activeTab?.id)
            }
          });
        } else {
          saveNotifications('dailyNotificationBacklog', dailyResponseJson);
        }
      case 'deactivateDataStorage':
        chrome.webRequest.onCompleted.removeListener(completedListener);
        chrome.tabs.query({}).then((tabs) => {
          for (const tab of tabs) {
            sendMessageToTab(tab.id, { query: 'removeMiniviz' });
          }
        });
        return;
      case 'reactivateDataStorage':
        addPluginHeaderListener();
        chrome.tabs.query({}).then((tabs) => {
          for (const tab of tabs) {
            sendMessageToTab(tab.id, { query: 'showMiniviz' });
          }
        });
        return;
      default:
        break;
    }
  }
  return;
}

const sendOSWeeklyAlert = async () => {
  const weekData = await getLastDaysSummary([-7, 0]);
  refreshSettings().then((settings) => {
    let title = 'CarbonViz weekly trends';
    let message = `You downloaded ${formatSize(weekData.data, 0)} in the last 7 days. Check you trends in CarbonViz.`;
    let action0 = 'Ignore';
    let action1 = 'Check';
    if(settings.lang === 'fr') {
      title = 'CarbonViz tendance hebdomadaire';
      message = `Vous avez téléchargé ${formatSize(weekData.data, 0)} dans les 7 derniers jours. Vérifier la tendance dans CarbonViz.`;
      action0 = 'Ignorer';
      action1 = 'Vérifier';
    }
    chrome.notifications.create('CarbonViz-' + new Date().getTime(), {
      type: 'basic',
      iconUrl: notificationIcon,
      title,
      message,
      priority: 2,
      buttons: [
        { title: action0 },
        { title: action1 }
      ]
    });
  });
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
  // check analogy counters
  const co2Steps = Math.floor(statistics.co2 / analogyCounter.co2.step);
  const dataSteps = Math.floor(statistics.data / analogyCounter.data.step);
  analogyCounter.co2.previous = analogyCounter.co2.count;
  if (co2Steps > analogyCounter.co2.count) {
    analogyCounter.co2.previous = analogyCounter.co2.count;
    analogyCounter.co2.count = co2Steps;
    analogyCounter.co2.previousTime = analogyCounter.co2.time;
    analogyCounter.co2.time = statistics.time;
  }
  analogyCounter.data.previous = analogyCounter.data.count;
  if (dataSteps > analogyCounter.data.count) {
    analogyCounter.data.previous = analogyCounter.data.count;
    analogyCounter.data.count = dataSteps;
    analogyCounter.data.previousTime = analogyCounter.data.time;
    analogyCounter.data.time = statistics.time;
  }
  // send message to miniViz
  chrome.tabs.query({active: true}, function(tabs) {
    if (tabs && tabs[0]) {
      for (const tab of tabs) {
        sendMessageToTab(tab.id, { counters: analogyCounter });
      }
    }
  });
};

const getNextMonday9AM = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
  const daysUntilMonday = (8 - dayOfWeek) % 7; // Calculate the number of days until the next Monday
  const nextMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilMonday);
  nextMonday.setHours(9, 0, 0, 0); // Set the time to 9 AM
  return nextMonday;
};

addPluginHeaderListener();

chrome.runtime.onMessage.addListener(handleMessage);

chrome.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL
    || ( reason === chrome.runtime.OnInstalledReason.UPDATE && /^0.*/.test(previousVersion))) {
    const url = 'chrome/info.html';
    const options = {url, active: true};
    chrome.tabs.create(options);
  }
  if (reason !== chrome.runtime.OnInstalledReason.INSTALL) {
    // resetSettings(); TODO uncomment in case of settings version change
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
        // send OS Notification for weekly summary if browser inactive
        sendOSWeeklyAlert();
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
      }
    });
  }
});

chrome.notifications.onButtonClicked.addListener(function(notifType, buttonIndex) {
  if (buttonIndex === 1) {
    createExtensionTab('#Trends');
  }
});

// Check for missed notifications on new tab & pluginListener if disabled
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    checkMissedNotifications([tab]);
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
  chrome.browserAction.setIcon({path: '../assets/icons/iconDark.png'});
}
*/

const createExtensionTab = (hash = '') => {
  let url = `fullpage/fullpage.html${hash}`;
  if (isFirefox) {
    url = `../fullpage/fullpage.html${hash}`;
  }
  const options = {url, active: true};
  chrome.tabs.create(options);

}
const addPluginToNewTab = async (hash = '') => {
  let fullpageTabIndex = undefined;

  await chrome.storage.local.get(['fullpageTabIndex']).then(storage => {
    fullpageTabIndex = storage.fullpageTabIndex;
  });

  if(fullpageTabIndex) {
    chrome.tabs.update(fullpageTabIndex,{active: true}, function() {
      // if tab was closed and no longer exists
      if (chrome.runtime.lastError) {
        createExtensionTab(hash);
      }
    });
  }
  else {
    createExtensionTab(hash);
  }
}

const filterSortDailyDates = (notifications) => {
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - 2);
  const filteredNotifications = notifications.filter(notification => {
    return new Date(notification.date) > minDate;
  });

  return filteredNotifications.sort((a, b) => new Date(a.date) - new Date(b.date));
}

const sendDailyUpdateStore = (activeTabId) => {
  sendMessageToTab(activeTabId, { dailyNotifications: {data: dailyResponseJson[0]} });
  dailyResponseJson.shift();
  if(dailyResponseJson.length === 0) {
    saveNotifications('lastDisplayedDailyTimeStamp', new Date().getTime());
  }
  saveNotifications('dailyNotificationBacklog', dailyResponseJson);
}

const sendWeeklyNotification = async (activeTabId) => {
  const today = new Date();
  today.setHours(0,0,0);
  const weekData = await getLastDaysSummary([-7, 0]);
  const lastWeekData = await getLastDaysSummary([-14, -7]);

  if (weekData.data === 0) {
    return;
  }

  saveNotifications('lastDisplayedWeeklyTimeStamp', today.getTime());
  sendMessageToTab(activeTabId, { weeklynotification: {currentWeek: weekData, lastWeek: lastWeekData} });
}

const sendDailyNotification = async (activeTabId) => {
  const today = new Date();
  today.setHours(0,0,0);
  dailyResponseJson =  await fetch(dailyNotificationURL).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Failed to fetch dailyNotification');
  })
  .then((responseJson) => {
    const orderByDate = filterSortDailyDates(responseJson.dailyNotifications);
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
    saveNotifications('dailyNotificationBacklog', []);
    saveNotifications('lastDisplayedDailyTimeStamp', today.getTime());
  }
}

const checkMissedNotifications = async (tab = false) => {
  const today = new Date();
  today.setHours(0,0,0);
  const todayIsMonday = (today.getDay() === 1);
  let queryOptions = { active: true, lastFocusedWindow: true };
  let activeTab = tab ? tab : await chrome.tabs.query(queryOptions);
  notificationsStatus = await retrieveNotifications();

  let weekStartMonday = new Date(today);
  if (!todayIsMonday) {
    weekStartMonday.setDate(today.getDate() - (today.getDay() + 6) % 7); // Calculate last Monday's date
  }

  if (activeTab[0].id) {
    const lastWeeklyDisplay =  new Date(notificationsStatus.lastDisplayedWeeklyTimeStamp);
    const lastDailyDisplay = new Date(notificationsStatus.lastDisplayedDailyTimeStamp);
    if (!lastWeeklyDisplay.valueOf() || lastWeeklyDisplay < weekStartMonday) {
      sendWeeklyNotification(activeTab[0].id);
      return; // User to acknowledge popup before replacing with weekly below.
    };
    if (!lastDailyDisplay.valueOf() || lastDailyDisplay < today) {
      sendDailyNotification(activeTab[0].id);
    };
  }
}

initStorage().then( async () => {
  const settings = await retrieveSettings();
  statistics = await getTodayCounter(settings.lifetimeComputer);
  DBInitialized = true;
})
