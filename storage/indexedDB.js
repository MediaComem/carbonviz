// TODO check if still necessary depending on browser
/*
if ('webkitIndexedDB' in window) {
  window.IDBTransaction = window.webkitIDBTransaction;
  window.IDBKeyRange = window.webkitIDBKeyRange;
}
*/
import { DBInstance } from './dbSingleton.js';
import { ONE_DAY_SEC, energyImpactHomeHardware, co2ImpactHomeHardware} from '../model/model.js'

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

function init() {
  const co2HistoryDB = new DBInstance();
  return co2HistoryDB.open();
}

async function updateData(date, hourlyData, dailyData, domainData = undefined) {
  return new Promise(function (resolve) {
    const storeData = () => {
      const month = date.getMonth()+1;
      const day = date.getDay();
      const db = DBInstance.db;
      const trans = db.transaction(["dataTimeStamp", "history", "historySummary", "domains", `domains_month_${month}`, `domains_day_${day}`], "readwrite");
      const daysStore = trans.objectStore("dataTimeStamp");
      const historyStore = trans.objectStore("history");
      const historySummaryStore = trans.objectStore("historySummary");
      const domainStore = trans.objectStore("domains");
      const monthlyDomainStore = trans.objectStore(`domains_month_${month}`);
      const dailyDomainStore = trans.objectStore(`domains_day_${day}`);
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
        if (domainData.full?.name) {
          domainStore.put(domainData.full);
        }
        if (domainData.monthly?.name) {
          monthlyDomainStore.put(domainData.monthly);
        }
        if (domainData.daily?.name) {
          dailyDomainStore.put(domainData.daily);
        }
      }
      trans.oncomplete = function() {
        return resolve();
      }
    }

    // reset daily / monthly data if new day or new month
    DBInstance.cleanData().then((resetDailyMonthlyTrans) => {
      resetDailyMonthlyTrans.oncomplete = () => {
        storeData();
      };
    });
  });
};

async function getLastStoredEntries(today, domainName = undefined) {
  return new Promise(function (resolve) {
    const historyIndex = dateStringHour(today);
    const historySummaryIndex = dateString(today);
    const month = today.getMonth()+1;
    const day = today.getDay();
    const data = {
      dataTimeStamp: {},
      history: {},
      historySummary: {},
      domain: {},
      monthlyDomain : {},
      storedDates: {}
    };
    const db = DBInstance.db;
    const trans = db.transaction(
      ["dataTimeStamp", "history", "historySummary", "domains", `domains_month_${month}`, `domains_day_${day}`],
      "readonly"
    );
    const DayStore = trans.objectStore("dataTimeStamp");
    const historyStore = trans.objectStore("history");
    const historySummaryStore = trans.objectStore("historySummary");
    const domainStore = trans.objectStore("domains");
    const monthlyDomainStore = trans.objectStore(`domains_month_${month}`);
    const dailyDomainStore = trans.objectStore(`domains_day_${day}`);

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
      monthlyDomainStore.get(domainName).onsuccess = function (event) {
        data.monthlyDomain = event.target.result;
      }
      dailyDomainStore.get(domainName).onsuccess = function (event) {
        data.dailyDomain = event.target.result;
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

// Range is the range desired
// ex: 'day'/[-7,0] will return data for the last 7 days
// ex: 'day'/[-14,-7] will return data for the previous last 7 days
function getkeyRangeSummary(period, range) {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();
  let startKey = '';
  let endKey = '';

  if (period === 'day') {
    startDate = new Date(startDate.setDate(startDate.getDate() + range[0]));
    endDate = new Date(endDate.setDate(endDate.getDate() + range[1]));
  }
  if (period === 'week') {
    startDate = new Date(startDate.setDate(startDate.getDate() +  7 * range[0]));
    endDate = new Date(endDate.setDate(endDate.getDate() + 7 * range[1]));
  }
  if (period === 'month') {
    startDate = new Date(startDate.setMonth(startDate.getMonth() + range[0]));
    endDate = new Date(endDate.setMonth(endDate.getMonth() + range[1]));
  }
  endKey = dateString(endDate);
  startKey = dateString(startDate);
  return {startKey, endKey};
}

async function getDailyAggregates(period, range, lifetime) {
  return new Promise(function (resolve, reject) {
    let data = [];
    const keys = getkeyRangeSummary(period, range);
    let keyRangeValue = IDBKeyRange.bound(keys.startKey, keys.endKey);

    const db = DBInstance.db;
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
          const computerCo2 = co2ImpactHomeHardware(ONE_DAY_SEC, lifetime);
          const computerEnergy = energyImpactHomeHardware(ONE_DAY_SEC, lifetime);
          return {
            ...entry,
            co2: entry.co2 + computerCo2,
            energy: entry.energy + computerEnergy,
            computer: { co2: computerCo2, energy: computerEnergy }
          }
        });
        return resolve(dailyAggregates);
      }
    };
    dbCursor.onerror = function(error) { reject(error)};
  });
}

async function getTodayCounter(lifetime) {
  const today = new Date();
  const index = dateString(today);
  return new Promise(function (resolve) {
    const db = DBInstance.db;
    const trans = db.transaction(["historySummary"], "readonly");
    const historySummaryStore = trans.objectStore("historySummary");

    historySummaryStore.get(index).onsuccess = function (event) {
      const summary = event.target.result;
      if (summary) {
        const computerCo2 = co2ImpactHomeHardware(ONE_DAY_SEC, lifetime)
        const computerEnergy = energyImpactHomeHardware(ONE_DAY_SEC, lifetime);
        const counter = { co2: summary.co2 + computerCo2, energy: summary.energy + computerEnergy, data: summary.data };
        return resolve(counter);
      }
      return { co2:0, data: 0, energy: 0, time: 0};
    }
  });
}

function deleteData(key) {
  const db = DBInstance.db;
  const trans = db.transaction(["history", "historySummary"], "readwrite");
  const historyStore = trans.objectStore("history");
  const historySummaryStore = trans.objectStore("historySummary");
  let keyRangeValue = IDBKeyRange.bound(key+"T00", key+"T23");
  historyStore.delete(keyRangeValue);
  historySummaryStore.delete(key);
}

async function getWebsites(mode = 'co2', limit = 10, table='domains') {
  return new Promise(function (resolve) {
    const db = DBInstance.db;
    const trans = db.transaction([table], "readonly");
    const store = trans.objectStore(table);
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

async function getAggregate(mode = 'co2', table='domains') {
  return new Promise(function (resolve) {
    const db = DBInstance.db;
    const trans = db.transaction([table], "readonly");
    const store = trans.objectStore(table);
    const index = store.index(mode == 'co2' ? 'by_co2' : 'by_data');
    const dbCursor = index.openCursor();
    let aggregate = 0;
    dbCursor.onsuccess = event => {
      const cursor = event.target.result;
      if (cursor) {
        aggregate += mode == 'co2' ? cursor.value.co2 : cursor.value.data;
        cursor.continue();
        return;
      }
      // the filter is to remove 0 co2 (or 0 data) domain in the list
      return resolve(aggregate);
    };
    dbCursor.onerror = error => reject(error);
  });
}

async function downloadData(dbStore) {
  return new Promise(function (resolve, reject) {
    let data = [];
    const db = DBInstance.db;
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

export { init, getLastStoredEntries, updateData, getDailyAggregates, getTodayCounter, deleteData, getWebsites, getAggregate,
  downloadData, getMonday, getWeekOfYear, dateStringHour, dateString }
