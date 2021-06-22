//window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

if ('webkitIndexedDB' in window) {
  window.IDBTransaction = window.webkitIDBTransaction;
  window.IDBKeyRange = window.webkitIDBKeyRange;
}

const co2HistoryDB = {
  db: null,
  onerror: function (e) {
    console.log(e);
  }
};

const today = new Date();

function getMonday(date) {
  date = new Date(date);
  let day = date.getDay();
  let diff = date.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
  return new Date(date.setDate(diff));
}

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

    // We can only create Object stores in a versionchange transaction.
    request.onupgradeneeded = function () {
      request.transaction.onerror = co2HistoryDB.onerror;
      let db = request.result;

      const storeDays = db.createObjectStore("dataTimeStamp", { keyPath: "index" });
      storeDays.createIndex("by_index", "index", { unique: true });
      storeDays.add({
        index: 0,
        lastStoredDate: today,
        weekStartDate: getMonday(today)
      });

      const storeHistory = db.createObjectStore("history", { keyPath: "index" });
      storeHistory.createIndex("by_index", "index", { unique: true });
      storeHistory.add({
        index: today.toISOString().slice(0,13),
        co2: 0,
        data: 0
      });

      const storeHistorySummary = db.createObjectStore("historySummary", { keyPath: "index" });
      storeHistorySummary.createIndex("by_index", "index", { unique: true });
      storeHistorySummary.add({
        index: today.toISOString().slice(0,10),
        co2: 0,
        data: 0
      });

      const storeDomains = db.createObjectStore("domains", { keyPath: "name" });
      storeDomains.createIndex("by_name", "name", { unique: true });
      storeDomains.add({
        name: "0.0",
        co2: 0,
        data: 0
      });
      console.log("onupgradeneeded");
    };

    request.onsuccess = function (e) {
      co2HistoryDB.db = request.result;
      console.log("DB created");
      return resolve();
    };

    request.onerror = co2HistoryDB.onerror;
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
    co2: hourCo2,
    data: hourData
  }
  const historySummary = {
    index: dateStringWithHour(timeStamp, false),
    co2: dayCo2,
    data: dayData
  }

  daysStore.put(storedData );
  historyStore.put(history);
  historySummaryStore.put(historySummary);
  domainStore.put(domainTotal);
};


function getLastStoredTime(today, domainName) {
  const historyIndex = today.toISOString().slice(0,13);
  const historySummaryIndex = today.toISOString().slice(0,10);
  const data = {
    dataTimeStamp: {},
    history: {},
    historySummary: {}
  };
  return new Promise(function (resolve) {
    const db = co2HistoryDB.db;
    const tx = db.transaction(["dataTimeStamp", "history", "historySummary", "domains"], "readonly");
    const DayStore = tx.objectStore("dataTimeStamp");
    const historyStore = tx.objectStore("history");
    const historySummaryStore = tx.objectStore("historySummary");
    const domainStore = tx.objectStore("domains");

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

    tx.oncomplete = function() {
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
    index: timeStamp.toISOString().slice(0,13),
    co2: co2Size,
    data: sizeData
  }
  const historySummary = {
    index: timeStamp.toISOString().slice(0,10),
    co2: co2Size,
    data: sizeData
  }

  daysStore.put(storedData );
  historyStore.put(history);
  historySummaryStore.put(historySummary);
  domainStore.put(domainTotal);

}


export { getLastStoredTime, updateTodaysData, addnewRecord }
