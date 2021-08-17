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

function getWeekOfYear(date){
  let d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  let dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  let yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
};

function dateStringHour(dataObject) {
  return dataObject.toISOString().slice(0,13)
}

function dateString(dataObject) {
  return dataObject.toISOString().slice(0,10)
}

co2HistoryDB.open = () => {

  return new Promise(function(resolve) {
    let version = 1;
    const request = indexedDB.open("co2HistoryDB", version);
    // For any changes to an existing DB structure, the version number needs to be incremented.
    // Only then will the onupgradeneeded function run.
    request.onupgradeneeded = function () {
      let db = request.result;

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
          hour: today.getUTCHours(),
          co2: 0,
          data: 0,
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
          duration: 0
        });
      }

      if (!db.objectStoreNames.contains('domains')) {
        const storeDomains = db.createObjectStore("domains", { keyPath: "name" });
        storeDomains.createIndex("by_name", "name", { unique: true });
        storeDomains.add({
          name: "0.0",
          co2: 0,
          data: 0
        });
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
      hour: date.getUTCHours(),
      co2: hourlyData.co2,
      data: hourlyData.data,
      duration: hourlyData.duration
    }
    const historySummary = {
      ...dateInfo,
      index: dateString(date),
      co2: dailyData.co2,
      data: dailyData.data,
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
          return {
            ...entry,
            co2: entry.co2 + computerCo2
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

    historySummaryStore.openCursor(keyRangeValue).onsuccess = function(event) {
      let cursor = event.target.result;
      if(cursor) {
        data.push(cursor.value);
        cursor.continue();
      } else {
        // add computer co2
        const dailyEntrie =  data.map( entry => {
          const computerCo2 = entry.duration * 6.57e-6; // constant value: ~6.57 [mg/sec]
          return {
            ...entry,
            co2: entry.co2 + computerCo2
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
      const computerCo2 = summary.duration * 6.57e-6;// constant value: ~6.57 [mg/sec]
      const counter = { co2: summary.co2 + computerCo2, data: summary.data };
      return resolve(counter);
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

export { init, getLastStoredEntries, updateData, getDailyAggregates, getDailyEntries, getTodayCounter, deleteData }
