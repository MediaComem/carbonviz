import { getLastStoredTime, updateTodaysData, addnewRecord, getHistory, deleteData } from "./indexedDB.js";

const getUnit = (randamUnit) => {
    var unit = /[A-Za-z]+$/;
    var num = /(^[0-9\.]+)/g;

    switch(randamUnit.match(unit)[0]) {
        case 'g': 
        case 'B': return Number(randamUnit.match(num)[0]);
        case 'kg':
        case 'KB': return Number(randamUnit.match(num)[0] * 1000);
        case 'Mg':
        case 'MB': return Number(randamUnit.match(num)[0] * 1000000);
    }
}

const co2Size = (value) => {
    if (value / 1000 < 1) {
        return `${(value).toFixed(3)} g`;
    } else if (value / 1000 >= 1000) {
        return `${(value / 1000000).toFixed(3)} Mg`; // megagram (tonne)
    }
    else {
        return `${(value / 1000).toFixed(3)} kg`;
    }
}

export function updateCo2Total(packet) {
    return new Promise(async function(resolve) {
        const domain = packet.domainName;
        const sizeCo2 = packet.co2Size;
        const dataBytes = packet.packetSize ;
        const timestamp = packet.timeStamp;
        const today = new Date(timestamp);
        let dayTotalCo2 = 0;
        let dayTotalData = 0;
        let hourTotalCo2 = 0;
        let hourTotalData = 0;
        const lastStoredDBEntry = await getLastStoredTime(today, domain);
        //const dataBytes = getUnit(sizeData);
        let storedDates = lastStoredDBEntry.storedDates;
        let history = lastStoredDBEntry.history;
        let historySummry = lastStoredDBEntry.historySummary;
        const domainTotal = lastStoredDBEntry.domain;

        let newDomainTotal = {};
        if(domainTotal != undefined) {
            newDomainTotal = {
                name: domain,
                co2: domainTotal.co2 + sizeCo2,
                data: domainTotal.data + dataBytes
            }
        } else {
            newDomainTotal = {
                name: domain,
                co2: sizeCo2,
                data: dataBytes
            }
        }

        // Clean obsolete data storage (older than four months)
        let oldestDate = new Date(storedDates[0]);
        if (oldestDate.getFullYear != today.getFullYear || oldestDate.getMonth() < today.getMonth() - 4) {
            deleteData(storedDates[0]);
        }
        // same hour
        if (history != undefined) {
            hourTotalCo2 = sizeCo2 + history.co2;
            hourTotalData = dataBytes + history.data;
        }
        // same day
        if (historySummry != undefined) {
            dayTotalCo2 = sizeCo2 + historySummry.co2;
            dayTotalData = dataBytes + historySummry.data;
            updateTodaysData(dayTotalCo2, hourTotalCo2, dayTotalData, hourTotalData, newDomainTotal, today);
        } else {
            addnewRecord(sizeCo2, dataBytes, newDomainTotal, today);
        }
        resolve();
    });
}
