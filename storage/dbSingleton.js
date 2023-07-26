import { getWeekOfYear, getMonday, dateStringHour, dateString } from "./indexedDB.js"

export class DBInstance {
  static db = null;
  _opened = false;
  constructor() {
    if (DBInstance._instance) {
      return DBInstance._instance
    }
    DBInstance._instance = this;
  }

  open = () => {
    if(this._opened) {
      return Promise.resolve(DBInstance.db);
    }

    this._opened = true;
    const today = new Date();

    return new Promise((resolve) => {

      let version = 4;
      /*
        version 1: basic
        version 2: add by_co2 / by_data indexes for domains
        version 3: monthly data by domain
        version 4: daily data by domain
      */
      const request = self.indexedDB.open("co2HistoryDB", version);
      // For any changes to an existing DB structure, the version number needs to be incremented.
      // Only then will the onupgradeneeded function run.
      request.onupgradeneeded = function (event) {
        DBInstance.db = request.result;
        // This is the implied IDBTransaction instance available when
        // upgrading, it is type versionchange, and is similar to
        // readwrite.
        var tx = request.transaction;
        if (!DBInstance.db.objectStoreNames.contains('dataTimeStamp')) {
          const storeDays = DBInstance.db.createObjectStore("dataTimeStamp", { keyPath: "index" });
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

        if (!DBInstance.db.objectStoreNames.contains('history')) {
          const storeHistory = DBInstance.db.createObjectStore("history", { keyPath: "index" });
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

        if (!DBInstance.db.objectStoreNames.contains('historySummary')) {
          const storeHistorySummary = DBInstance.db.createObjectStore("historySummary", { keyPath: "index" });
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

        if (!DBInstance.db.objectStoreNames.contains('domains')) {
          const storeDomains = DBInstance.db.createObjectStore("domains", { keyPath: "name" });
          storeDomains.createIndex("by_name", "name", { unique: true });
          storeDomains.createIndex("by_co2", "co2");
          storeDomains.createIndex("by_data", "data");
          storeDomains.add({
            name: "_",
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

        // Monthly history data (keeping maximum 1 year)
        // create one table per month
        for (const month of [1,2,3,4,5,6,7,8,9,10,11,12]) {
          const table = `domains_month_${month}`;
          if (!DBInstance.db.objectStoreNames.contains(table)) {
            const storeDomains = DBInstance.db.createObjectStore(table, { keyPath: "name" });
            storeDomains.createIndex("by_name", "name", { unique: true });
            storeDomains.createIndex("by_co2", "co2");
            storeDomains.createIndex("by_data", "data");
            storeDomains.add({
              name: "_",
              co2: 0,
              data: 0,
              energy: 0
            });
          }
        }

        // Daily history data (keeping maximum 1 week)
        // create one table per day (0 to 6 - sunday is 0)
        for (const day of [0,1,2,3,4,5,6]) {
          const table = `domains_day_${day}`;
          if (!DBInstance.db.objectStoreNames.contains(table)) {
            const storeDomains = DBInstance.db.createObjectStore(table, { keyPath: "name" });
            storeDomains.createIndex("by_name", "name", { unique: true });
            storeDomains.createIndex("by_co2", "co2");
            storeDomains.createIndex("by_data", "data");
            storeDomains.add({
              name: "_",
              co2: 0,
              data: 0,
              energy: 0
            });
          }
        }
      };

      request.onsuccess = (e) => {
        DBInstance.db = request.result;
        this.cleanData();
        return resolve(DBInstance.db);
      };

      request.onerror = (e) => {
        return reject();
      }
    })
  }

  cleanData = async () => {
    // Clean old data
    // Clear new month if needed [max 1 year monthly domains aggregate retention]
    // Clear new day if needed [max 1 week daily domains aggregate retention]
    // Done asynchronously since write every 60 seconds, should be sufficient for cleaning operations
    return new Promise((resolve) => {
      const today = new Date();
      const month = today.getMonth() + 1;
      const week = getWeekOfYear(today);
      const day = today.getDay();
      let trans = DBInstance.db.transaction(["dataTimeStamp"], "readonly");
      const dates = trans.objectStore("dataTimeStamp");

      // retrieve last running dates
      dates.get(0).onsuccess = function (event) {
        const info = event.target.result;
        if (info) {
          const lastRunning = new Date(info.lastStoredDate);
          const lastRunningMonth = lastRunning.getMonth() + 1;
          const lastRunningWeek = getWeekOfYear(lastRunning);
          const lastRunningDay = lastRunning.getDay();
          // check if we need to clear data from last week or last year
          if (month !== lastRunningMonth || week !== lastRunningWeek || day !== lastRunningDay) {
            let clearTransaction = DBInstance.db.transaction([`domains_month_${month}`, `domains_day_${day}`], "readwrite");
            if (month !== lastRunningMonth) {
              const monthlyDomainStore = clearTransaction.objectStore(`domains_month_${month}`);
              monthlyDomainStore.clear();
            }
            if (week !== lastRunningWeek || day !== lastRunningDay) {
              const days = [0,1,2,3,4,5,6];
              // check how many days the plugin was inactive to clear irrelevant data for last 7 days
              const nbDaysInactive = Math.floor((today - lastRunning) / (1000 * 3600 * 24));
              for (let inactiveDay = 0; inactiveDay < Math.min(nbDaysInactive, 7); inactiveDay++) {
                const dailyDomainStore = clearTransaction.objectStore(`domains_day_${days[(7 + day - inactiveDay) % 7]}`);
                dailyDomainStore.clear();
              }
            }
            return resolve(clearTransaction);
          }
        }
      };
      return resolve(trans);
    });
  }
}