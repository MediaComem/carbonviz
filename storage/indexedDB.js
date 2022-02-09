//window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

if ('webkitIndexedDB' in window) {
  window.IDBTransaction = window.webkitIDBTransaction;
  window.IDBKeyRange = window.webkitIDBKeyRange;
}

const co2HistoryDB = {
  db: null
};

const today = new Date();

function getMonday(date) {
  date = new Date(date);
  let day = date.getDay();
  let diff = date.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday
  return new Date(date.setDate(diff));
}

function dateToISOLocal(date) {
  const offset = date.getTimezoneOffset() * 60000;
  const timeLocal =  date.getTime() - offset;
  const dateLocal = new Date(timeLocal);
  return dateLocal.toISOString().substring(0, 19);
}

function getWeekOfYear(date){
  let d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  let dayNum = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - dayNum);
  let yearStart = new Date(d.getFullYear(),0,1);
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
};

function dateStringHour(dataObject) {
  return dateToISOLocal(dataObject).slice(0,13);
}

function dateString(dataObject) {
  return dateToISOLocal(dataObject).slice(0,10);
}

co2HistoryDB.open = () => {

  return new Promise(function(resolve) {
    let version = 2;
    /*
      version 1: basic
      version 2: add by_co2 / by_data indexes for domains
    */
    const request = indexedDB.open("co2HistoryDB", version);
    // For any changes to an existing DB structure, the version number needs to be incremented.
    // Only then will the onupgradeneeded function run.
    request.onupgradeneeded = function (event) {
      let db = request.result;
      // This is the implied IDBTransaction instance available when
      // upgrading, it is type versionchange, and is similar to
      // readwrite.
      var tx = request.transaction;
      if (!db.objectStoreNames.contains('dataTimeStamp')) {
        const storeDays = db.createObjectStore("dataTimeStamp", { keyPath: "index" });
        storeDays.createIndex("by_index", "index", { unique: true });
        storeDays.add({
          index: 0,
          lastStoredDate: today,
          weekStartDate: getMonday(today)
        });
      }

      const dateInfo = {
        date: today.getDate(),
        month: today.getMonth()+1,
        dayOfWeek: today.getDay(),
        weekOfYear: getWeekOfYear(today),
        weekOfMonth: Math.floor((today.getDate() / 7)+1)
      }

      if (!db.objectStoreNames.contains('history')) {
        const storeHistory = db.createObjectStore("history", { keyPath: "index" });
        storeHistory.createIndex("by_index", "index", { unique: true });
        storeHistory.add({
          ...dateInfo,
          index: dateStringHour(today),
          hour: today.getHours(),
          co2: 0,
          data: 0,
          energy: 0,
          duration: 0
        });
      }

      if (!db.objectStoreNames.contains('historySummary')) {
        const storeHistorySummary = db.createObjectStore("historySummary", { keyPath: "index" });
        storeHistorySummary.createIndex("by_index", "index", { unique: true });
        storeHistorySummary.add({
          ...dateInfo,
          index: dateString(today),
          co2: 0,
          data: 0,
          energy: 0,
          duration: 0
        });
      }

      if (!db.objectStoreNames.contains('domains')) {
        const storeDomains = db.createObjectStore("domains", { keyPath: "name" });
        storeDomains.createIndex("by_name", "name", { unique: true });
        storeDomains.createIndex("by_co2", "co2");
        storeDomains.createIndex("by_data", "data");
        storeDomains.add({
          name: "0.0",
          co2: 0,
          data: 0,
          energy: 0
        });
      } else {
        var domains = tx.objectStore('domains');
        if(!domains.indexNames.contains('by_co2')) {
          domains.createIndex("by_co2", "co2");
        }
        if(!domains.indexNames.contains('by_data')) {
          domains.createIndex("by_data", "data");
        }
      }
    };

    request.onsuccess = function (e) {
      co2HistoryDB.db = request.result;
      return resolve(co2HistoryDB.db);
    };

    request.onerror = function (e) {
      return reject();
    }
  })
};

function init() {
  return co2HistoryDB.open();
}

async function updateData(date, hourlyData, dailyData, domainData = undefined) {
  return new Promise(function (resolve) {
    const db = co2HistoryDB.db;
    let trans = db.transaction(["dataTimeStamp", "history", "historySummary", "domains"], "readwrite");
    let daysStore = trans.objectStore("dataTimeStamp");
    let historyStore = trans.objectStore("history");
    let historySummaryStore = trans.objectStore("historySummary");
    let domainStore = trans.objectStore("domains");

    const storedData  = {
      index: 0,
      lastStoredDate: date,
      weekStartDate: getMonday(date)
    }

    const dateInfo = {
      date: date.getDate(),
      month: date.getMonth()+1,
      dayOfWeek: date.getDay(),
      weekOfYear: getWeekOfYear(date),
      weekOfMonth: Math.floor((date.getDate() / 7)+1)
    }

    const history = {
      ...dateInfo,
      index: dateStringHour(date),
      hour: date.getHours(),
      co2: hourlyData.co2,
      data: hourlyData.data,
      energy: hourlyData.energy,
      duration: hourlyData.duration
    }
    const historySummary = {
      ...dateInfo,
      index: dateString(date),
      co2: dailyData.co2,
      data: dailyData.data,
      energy: dailyData.energy,
      duration: dailyData.duration
    }

    daysStore.put(storedData );
    historyStore.put(history);
    historySummaryStore.put(historySummary);
    if (domainData) {
      domainStore.put(domainData);
    }
    trans.oncomplete = function() {
      return resolve();
    }

  });
};

async function getLastStoredEntries(today, domainName = undefined) {
  return new Promise(function (resolve) {
    const historyIndex = dateStringHour(today);
    const historySummaryIndex = dateString(today);
    const data = {
      dataTimeStamp: {},
      history: {},
      historySummary: {},
      domain: {},
      storedDates: {}
    };
    const db = co2HistoryDB.db;
    const trans = db.transaction(["dataTimeStamp", "history", "historySummary", "domains"], "readonly");
    const DayStore = trans.objectStore("dataTimeStamp");
    const historyStore = trans.objectStore("history");
    const historySummaryStore = trans.objectStore("historySummary");
    const domainStore = trans.objectStore("domains");

    DayStore.get(0).onsuccess = function (event) {
      data.dataTimeStamp = event.target.result;
    }
    historyStore.get(historyIndex).onsuccess = function (event) {
      data.history = event.target.result;
    }
    historySummaryStore.get(historySummaryIndex).onsuccess = function (event) {
      data.historySummary = event.target.result;
    }
    if (domainName) {
      domainStore.get(domainName).onsuccess = function (event) {
        data.domain = event.target.result;
      }
    }
    historySummaryStore.getAllKeys().onsuccess = function (event) {
      data.storedDates = event.target.result;
    }

    trans.oncomplete = function() {
      return resolve(data);
    }

  });
}

function getkeyRangeSummary(period, occurrence) {
  let endDate = new Date();
  let startDate = new Date(endDate);
  let startKey = '';
  let endKey = '';

  if (period === 'day') {
    startDate = new Date(startDate.setDate(startDate.getDate() - occurrence));
  }
  if (period === 'week') {
    startDate = new Date(startDate.setDate(startDate.getDate() - (7 * occurrence)));
  }
  if (period === 'month') {
    startDate = new Date(startDate.setMonth(startDate.getMonth() - occurrence));
  }
  endKey = dateString(endDate);
  startKey = dateString(startDate);
  return {startKey, endKey};
}

async function getDailyAggregates(period, occurrence) {
  return new Promise(function (resolve, reject) {
    let data = [];
    const keys = getkeyRangeSummary(period, occurrence);
    let keyRangeValue = IDBKeyRange.bound(keys.startKey, keys.endKey);

    const db = co2HistoryDB.db;
    const trans = db.transaction(["historySummary"], "readonly");
    const historySummaryStore = trans.objectStore("historySummary");

    const dbCursor = historySummaryStore.openCursor(keyRangeValue);
    dbCursor.onsuccess = function(event) {
      let cursor = event.target.result;
      if(cursor) {
        data.push(cursor.value);
        cursor.continue();
      } else {
        // add computer co2
        const dailyAggregates = data.map( entry => {
          const computerCo2 = entry.duration * 6.57e-6; // constant value: ~6.57 [mg/sec]
          const computerEnergy = entry.duration * 180e-6;// constant value: ~180 [J/sec]
          return {
            ...entry,
            co2: entry.co2 + computerCo2,
            energy: entry.energy + computerEnergy
          }
        });
        return resolve(dailyAggregates);
      }
    };
    dbCursor.onerror = function(error) { reject(error)};
  });
}

async function getDailyEntries(period, occurrence) {
  return new Promise(function (resolve, reject) {

    let data = [];
    const keys = getkeyRangeSummary(period, occurrence);
    let keyRangeValue = IDBKeyRange.bound(keys.startKey, keys.endKey);

    const db = co2HistoryDB.db;
    const trans = db.transaction(["history"], "readonly");
    const historySummaryStore = trans.objectStore("history");

    const dbCursor = historySummaryStore.openCursor(keyRangeValue).onsuccess = function(event) {
      let cursor = event.target.result;
      if(cursor) {
        data.push(cursor.value);
        cursor.continue();
      } else {
        // add computer co2 + computer energy
        const dailyEntrie =  data.map( entry => {
          const computerCo2 = entry.duration * 6.57e-6; // constant value: ~6.57 [mg/sec]
          const computerEnergy = entry.duration * 180e-6;// constant value: ~180 [J/sec]
          return {
            ...entry,
            co2: entry.co2 + computerCo2,
            energy: entry.energy + computerEnergy
          }
        });
        return resolve(dailyEntrie);
      }
    };
    dbCursor.onerror = function(error) { reject(error)};
  });
}

async function getTodayCounter() {
  const today = new Date();
  const index = dateString(today);
  return new Promise(function (resolve) {
    const db = co2HistoryDB.db;
    const trans = db.transaction(["historySummary"], "readonly");
    const historySummaryStore = trans.objectStore("historySummary");

    historySummaryStore.get(index).onsuccess = function (event) {
      const summary = event.target.result;
      if (summary) {
        const computerCo2 = summary.duration * 6.57e-6;// constant value: ~6.57 [mg/sec]
        const computerEnergy = summary.duration * 180e-6;// constant value: ~180 [J/sec]
        const counter = { co2: summary.co2 + computerCo2, energy: summary.energy + computerEnergy, data: summary.data };
        return resolve(counter);
      }
      return { co2:0, data: 0, energy: 0};
    }
  });
}

function deleteData(key) {
  const db = co2HistoryDB.db;
  const trans = db.transaction(["history", "historySummary"], "readwrite");
  const historyStore = trans.objectStore("history");
  const historySummaryStore = trans.objectStore("historySummary");
  let keyRangeValue = IDBKeyRange.bound(key+"T00", key+"T23");
  historyStore.delete(keyRangeValue);
  historySummaryStore.delete(key);
}

async function getWebsites(mode = 'co2', limit = 10) {
  return new Promise(function (resolve) {
    const db = co2HistoryDB.db;
    const trans = db.transaction(["domains"], "readonly");
    const store = trans.objectStore("domains");
    const index = store.index(mode == 'co2' ? 'by_co2' : 'by_data');
    const dbCursor = index.openCursor(null, "prev");
    const data = [];
    let count = 0;
    dbCursor.onsuccess = event => {
      const cursor = event.target.result;
      if (cursor) {
        data.push(cursor.value);
        count++;
        if (count < limit) { cursor.continue(); return; }
      }
      // the filter is to remove 0 co2 (or 0 data) domain in the list
      return resolve(data.filter(domain => domain[mode]));
    };
    dbCursor.onerror = error => reject(error);
  });
}

async function getCurWeekHistory() {
  // Ceate a date one week ago at the begening of the day
  const date = new Date();
  date.setHours(0,0,0,0);
  date.setDate(date.getDate() - 6);
  const startTime = dateToISOLocal(date).substring(0, 13);

  return new Promise(function (resolve) {
    const db = co2HistoryDB.db;
    const trans = db.transaction(["history"], "readonly");
    const store = trans.objectStore("history");
    const index = store.index('by_index');
    const dbCursor = index.openCursor(null, "prev");
    const data = [];
    const computerCo2 = 3600 * 6.57e-6; // constant value: ~6.57 [mg/sec] * 3600 seconds
    dbCursor.onsuccess = event => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.index >= startTime) {
          let obj = {...cursor.value};
          obj.co2 += computerCo2;
          data.push(obj);
        }
        if (cursor.value.index > startTime) { cursor.continue(); return; }
      }
      return resolve(data);
    };
    dbCursor.onerror = error => reject(error);
  });
}

async function downloadData(dbStore) {
  return new Promise(function (resolve, reject) {
    let data = [];
    const db = co2HistoryDB.db;
    if(db) {
      const trans = db.transaction([dbStore], "readonly");
      const requestedStore = trans.objectStore(dbStore);

      const dataRequest = requestedStore.getAll();
      dataRequest.onerror = event => reject(event.target.error);
      dataRequest.onsuccess = event => {
        data = event.target.result;
        resolve(data);
      };
    } else {
      console.log("Unable to connect to CarbonViz database");
    }
  });
}

export { init, getLastStoredEntries, updateData, getDailyAggregates, getDailyEntries, getTodayCounter, deleteData, getWebsites, getCurWeekHistory, downloadData }
