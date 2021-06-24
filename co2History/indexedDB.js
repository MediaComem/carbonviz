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
  let diff = date.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
  return new Date(date.setDate(diff));
}

function getWeekOfYear(date){
  let d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  let dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  let yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
};

function dateStringWithHour(dataObject, withHour) {
  if (withHour) {
    return dataObject.toISOString().slice(0,13)
  } else {
    return dataObject.toISOString().slice(0,10)
  }
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

      if (!db.objectStoreNames.contains('history')) {
        const storeHistory = db.createObjectStore("history", { keyPath: "index" });
        storeHistory.createIndex("by_index", "index", { unique: true });
        storeHistory.add({
          index: dateStringWithHour(today, true),
          month: today.getMonth()+1,
          date: today.getDate(),
          weekOfMonth: (today.getDate() / 7)+1,
          co2: 0,
          data: 0
        });
      }

      if (!db.objectStoreNames.contains('historySummary')) {
        const storeHistorySummary = db.createObjectStore("historySummary", { keyPath: "index" });
        storeHistorySummary.createIndex("by_index", "index", { unique: true });
        storeHistorySummary.add({
          index: dateStringWithHour(today, false),
          month: today.getMonth()+1,
          date: today.getDate(),
          weekOfMonth: (today.getDate() / 7)+1,
          co2: 0,
          data: 0
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
      return resolve();
    };

    request.onerror = function (e) {
      return reject();
    }
  })
};

function init() {
  co2HistoryDB.open();
}

window.addEventListener("DOMContentLoaded", init, false);

async function updateTodaysData(dayCo2, hourCo2, dayData, hourData, domainTotal, timeStamp) {
  const db = co2HistoryDB.db;
  let trans = db.transaction(["dataTimeStamp", "history", "historySummary", "domains"], "readwrite");
  let daysStore = trans.objectStore("dataTimeStamp");
  let historyStore = trans.objectStore("history");
  let historySummaryStore = trans.objectStore("historySummary");
  let domainStore = trans.objectStore("domains");

  const storedData  = {
    index: 0,
    lastStoredDate: timeStamp,
    weekStartDate: getMonday(timeStamp)
  }
  const history = {
    index: dateStringWithHour(timeStamp, true),
    month: today.getMonth()+1,
    date: today.getDate(),
    hour: today.getUTCHours(),
    weekOfYear: getWeekOfYear(today),
    weekOfMonth: parseInt((today.getDate() / 7)+1),
    co2: hourCo2,
    data: hourData
  }
  const historySummary = {
    index: dateStringWithHour(timeStamp, false),
    month: today.getMonth()+1,
    date: today.getDate(),
    weekOfYear: getWeekOfYear(today),
    weekOfMonth: parseInt((today.getDate() / 7)+1),
    co2: dayCo2,
    data: dayData
  }

  daysStore.put(storedData );
  historyStore.put(history);
  historySummaryStore.put(historySummary);
  domainStore.put(domainTotal);
};


function getLastStoredTime(today, domainName) {
  const historyIndex = dateStringWithHour(today, true);
  const historySummaryIndex = dateStringWithHour(today, false);
  const data = {
    dataTimeStamp: {},
    history: {},
    historySummary: {},
    domain: {},
    storedDates: {}
  };
  return new Promise(function (resolve) {
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
    domainStore.get(domainName).onsuccess = function (event) {
      data.domain = event.target.result;
    }
    historySummaryStore.getAllKeys().onsuccess = function (event) {
      data.storedDates = event.target.result;
    }

    trans.oncomplete = function() {
      return resolve(data);
    }

  });
}

function addnewRecord(co2Size, sizeData, domainTotal, timeStamp) {
  const db = co2HistoryDB.db;
  let trans = db.transaction(["dataTimeStamp", "history", "historySummary", "domains"], "readwrite");
  let daysStore = trans.objectStore("dataTimeStamp");
  let historyStore = trans.objectStore("history");
  let historySummaryStore = trans.objectStore("historySummary");
  let domainStore = trans.objectStore("domains");

  const storedData  = {
    index: 0,
    lastStoredDate: timeStamp,
    weekStartDate: getMonday(timeStamp)
  }
  const history = {
    index: dateStringWithHour(timeStamp, true),
    month: today.getMonth()+1,
    date: today.getDate(),
    hour: today.getUTCHours(),
    weekOfYear: getWeekOfYear(today),
    weekOfMonth: parseInt((today.getDate() / 7)+1),
    co2: co2Size,
    data: sizeData
  }
  const historySummary = {
    index: dateStringWithHour(timeStamp, false),
    month: today.getMonth()+1,
    date: today.getDate(),
    weekOfYear: getWeekOfYear(today),
    weekOfMonth: parseInt((today.getDate() / 7)+1),
    co2: co2Size,
    data: sizeData
  }

  daysStore.put(storedData );
  historyStore.put(history);
  historySummaryStore.put(historySummary);
  domainStore.put(domainTotal);

}

function getkeyRange(period, occurrence) {
  let endDate = new Date();
  let startDate = new Date(endDate);
  let startKey = '';
  let endKey = '';

  if (period == 'day') {
    startDate = new Date(startDate.setDate(startDate.getDate() - occurrence));
    endKey = dateStringWithHour(endDate, true);
    startKey = dateStringWithHour(startDate, true);
  }
  if (period == 'week') {
    startDate = new Date(startDate.setDate(startDate.getDate() - (7 * occurrence)));
    endKey = dateStringWithHour(endDate, false);
    startKey = dateStringWithHour(startDate, false);
  }
  if (period == 'month') {
    startDate = new Date(startDate.setMonth(startDate.getMonth() - occurrence));
    endKey = dateStringWithHour(endDate, false);
    startKey = dateStringWithHour(startDate, false);
  }
  return {startKey, endKey};
}

function getHistory(period, occurrence) {
  let data = [];
  const keys = getkeyRange(period, occurrence);
  let keyRangeValue = IDBKeyRange.bound(keys.startKey, keys.endKey);

  const db = co2HistoryDB.db;
  const trans = db.transaction(["history", "historySummary"], "readonly");
  const historyStore = trans.objectStore("history");
  const historySummaryStore = trans.objectStore("historySummary");

  if (period == 'day') {
    historyStore.openCursor(keyRangeValue).onsuccess = function(event) {
      let cursor = event.target.result;
      if(cursor) {
        data.push(cursor.value);
        cursor.continue();
      } else {
        return data;
      }
    };
  } else {
    historySummaryStore.openCursor(keyRangeValue).onsuccess = function(event) {
      let cursor = event.target.result;
      if(cursor) {
        data.push(cursor.value);
        cursor.continue();
      } else {
        return data;
      }
    };
  }
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

export { getLastStoredTime, updateTodaysData, addnewRecord, getHistory, deleteData }
