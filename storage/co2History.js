import { getLastStoredEntries, updateData, deleteData } from "./indexedDB.js";

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

export function updateRunningDurationSec(duration) {
    return new Promise(async function(resolve) {
        const now = new Date();
        const lastStoredDBEntry = await getLastStoredEntries(now);
        const history = lastStoredDBEntry.history;
        const historySummary = lastStoredDBEntry.historySummary;

        const hourlyData = { ...history }
        const dailyData = { ...historySummary };

        // same hour
        if (history === undefined) {
            hourlyData.duration = duration;
        } else {
            hourlyData.duration += duration
        }
        // same day
        if (historySummary === undefined) {
            dailyData.duration = duration;
        } else {
            dailyData.duration += duration;
        }

        await updateData(now, hourlyData, dailyData);

        resolve();
    });
}

export function updateCo2Total(packet) {
    return new Promise(async function(resolve) {
        const domain = packet.domainName;
        const sizeCo2 = packet.co2Size;
        const dataBytes = packet.packetSize ;
        const timestamp = packet.timeStamp;
        const date = new Date(timestamp);
        const lastStoredDBEntry = await getLastStoredEntries(date, domain);
        const storedDates = lastStoredDBEntry.storedDates;
        const history = lastStoredDBEntry.history;
        const historySummary = lastStoredDBEntry.historySummary;
        const historyDomain = lastStoredDBEntry.domain;

        const hourlyData = { co2: sizeCo2, data: dataBytes, duration: history?.duration ?? 0}
        const dailyData = { co2: sizeCo2, data: dataBytes, duration: historySummary?.duration ?? 0};

        const domainData = {
            name: domain,
            co2: sizeCo2,
            data: dataBytes
        };
        if(historyDomain != undefined) {
            domainData.co2 += historyDomain.co2;
            domainData.data += historyDomain.data;
        }

        // Clean obsolete data storage (older than four months)
        let oldestDate = new Date(storedDates[0]);
        if (oldestDate.getFullYear != date.getFullYear || oldestDate.getMonth() < date.getMonth() - 4) {
            deleteData(storedDates[0]);
        }
        // same hour
        if (history != undefined) {
            hourlyData.co2 += history.co2;
            hourlyData.data += history.data;
        }
        // same day
        if (historySummary != undefined) {
            dailyData.co2 += historySummary.co2;
            dailyData.data += historySummary.data;
        }

        await updateData(date, hourlyData, dailyData, domainData);

        resolve();
    });
}
