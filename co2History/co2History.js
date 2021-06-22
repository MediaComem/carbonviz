import { getLastStoredTime, updateTodaysData, addnewRecord } from "./indexedDB.js";

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

export function updateCo2Total(domain, sizeCo2, sizeData, timestamp) {
    return new Promise(async function(resolve) {
        const today = new Date(timestamp);
        let dayTotalCo2 = 0;
        let dayTotalData = 0;
        let hourTotalCo2 = 0;
        let hourTotalData = 0;
        const lastStoredDBEntry = await getLastStoredTime(today, domain);
        const dataBytes = getUnit(sizeData);
        let lastStoredDate = lastStoredDBEntry.dataTimeStamp.lastStoredDate;
        let weekStartDate = lastStoredDBEntry.dataTimeStamp.weekStartDate;
        let history = lastStoredDBEntry.history;
        let historySummry = lastStoredDBEntry.historySummary;
        const domainTotal = lastStoredDBEntry.domain;

        let newDomainTotal = {};
        if(domainTotal != undefined) {
            newDomainTotal = {
                name: domain,
                co2: parseFloat((domainTotal.co2 + sizeCo2).toFixed(3)),
                data: parseFloat((domainTotal.data + dataBytes).toFixed(3))
            }
        } else {
            newDomainTotal = {
                name: domain,
                co2: sizeCo2,
                data: dataBytes
            }
        }
        // same hour
        if (history != undefined) {
            hourTotalCo2 = parseFloat((sizeCo2 + history.co2).toFixed(3));
            hourTotalData = parseFloat((dataBytes + history.data).toFixed(3));
        }
        // same day
        if (historySummry != undefined) {
            dayTotalCo2 = parseFloat((sizeCo2 + historySummry.co2).toFixed(3));
            dayTotalData = parseFloat((dataBytes + historySummry.data).toFixed(3));
            updateTodaysData(dayTotalCo2, hourTotalCo2, dayTotalData, hourTotalData, newDomainTotal, today);
        } else {
            addnewRecord(sizeCo2, dataBytes, newDomainTotal, today);
        }

        document.getElementById("todayCo2").innerHTML="Today: "+co2Size(dayTotalCo2);
        resolve();
    });
}
