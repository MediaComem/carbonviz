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
const yesterday = new Date(today.setDate(today.getDate() - (1000*60*60*24)));
const dayOfWeek = today.getDay()
const weekStartDate = new Date(today.setDate(today.getDate() - dayOfWeek));

const history = {
  "days": [
    {
      index: 0,
      total: 0
    },
    {
      index: 1,
      total: 0
    },
    {
      index: 2,
      total: 0
    },
    {
      index: 3,
      total: 0
    },
    {
      index: 4,
      total: 0
    },
    {
      index: 5,
      total: 0
    },
    {
      index: 6,
      total: 0
    },
    {
      index: 7,
      day: "lastStoredDate",
      date: yesterday
    }
  ],
  "weeks": [
    {
      week: "weekOneStartDate",
      date: weekStartDate //Sunday-Saturday : 0-6 used to calc change to next week
    },
    {
      week: "one",
      total: 0
    },
    {
      week: "two",
      total: 0
    },
    {
      week: "three",
      total: 0
    },
    {
      week: "four",
      total: 0
    },
    {
      week: "newMonthtotal", // value for month one when months are updated
      total: 0
    }
  ],
  "months": [
    {
      month: "one",
      total: 0
    },
    {
      month: "two",
      total: 0
    },
    {
      month: "three",
      total: 0
    },
    {
      month: "four",
      total: 0
    }
  ]
};

co2HistoryDB.open = () => {
  let version = 1;
  const request = indexedDB.open("co2HistoryDB", version);

  // We can only create Object stores in a versionchange transaction.
  request.onupgradeneeded = function () {
    request.transaction.onerror = co2HistoryDB.onerror;
    let db = request.result;

    const storeDays = db.createObjectStore("days", { keyPath: "index" });
    storeDays.createIndex("by_index", "index", { unique: true });
    for (let day in history.days) {
      storeDays.add(history.days[day]);
    }
    const storeWeeks = db.createObjectStore("weeks", { keyPath: "week" });
    storeWeeks.createIndex("by_week", "week", { unique: true });
    for (let week in history.weeks) {
      storeWeeks.add(history.weeks[week]);
    }
    const storeMonths = db.createObjectStore("months", { keyPath: "month" });
    storeMonths.createIndex("by_month", "month", { unique: true });
    for (let month in history.months) {
      storeMonths.add(history.months[month]);
    }
    const storeDomains = db.createObjectStore("domains", { keyPath: "date" });
    storeDomains.createIndex("by_date", "date", { unique: true });
  };

  request.onsuccess = function (e) {
    co2HistoryDB.db = request.result;
  };

  request.onerror = co2HistoryDB.onerror;
};

function init() {
  co2HistoryDB.open();
}

window.addEventListener("DOMContentLoaded", init, false);

async function addCo2(co2Size, currentMonthTotal, domain, timeStamp) {
  //const currentTotal = await getCurrentTotal(timeStamp.getDay());
  //const newTotal = parseFloat(Number(currentTotal + co2Size).toFixed(3));

  const db = co2HistoryDB.db;
  let trans = db.transaction(["days","weeks","domains"], "readwrite");
  let daysStore = trans.objectStore("days");
  let weeksStore = trans.objectStore("weeks");
  let domainsStore = trans.objectStore("domains");

  const co2Data = {
    index: timeStamp.getDay(),
    total: co2Size
  };

  const lastStoredDate = {
    index: 7,
    day: "lastStoredDate",
    date: timeStamp
  };

  const monthTotal = {
    week: "newMonthtotal",
    total: parseFloat(currentMonthTotal.toFixed(3))
  };

  const domainData = {
    date: timeStamp,
    name: domain,
    co2: co2Size
  };

  daysStore.put(co2Data);
  daysStore.put(lastStoredDate);
  weeksStore.put(monthTotal);
  //domainsStore.put(domainData);
};

function updateDays(numDays) {
  return new Promise(function (resolve) {
    const db = co2HistoryDB.db;
    let tx = db.transaction("days", "readwrite");
    let store = tx.objectStore("days");

    store.getAll().onsuccess = function (event) {
      const returnedData = event.target.result;
      return resolve(Number(event.target.result));
    }

  });
};

function getLastStoredData(Today) {
  const data = {
    lastStoredDate: 0,
    currentDateTotal: 0,
    weekOneStartDate: 0,
    newMonthtotal: 0
  };
  return new Promise(function (resolve) {
    const db = co2HistoryDB.db;
    let tx = db.transaction(["days", "weeks"], "readonly");
    let DayStore = tx.objectStore("days");
    let weekStore = tx.objectStore("weeks");

    DayStore.get(7).onsuccess = function (event) {
      data.lastStoredDate = event.target.result.date;
    }
    DayStore.get(Today.getDay()).onsuccess = function (event) {
      data.currentDateTotal = event.target.result.total;
    }
    weekStore.get("weekOneStartDate").onsuccess = function (event) {
      data.weekOneStartDate = event.target.result.date;
    }
    weekStore.get("newMonthtotal").onsuccess = function (event) {
      data.newMonthtotal = event.target.result.total;
    }

    tx.oncomplete = function() {
      return resolve(data);
    }

  });
}


export { getLastStoredData, addCo2, updateDays }



