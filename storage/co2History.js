import { getLastStoredEntries, updateData, deleteData } from "./indexedDB.js";

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
            hourlyData.co2 = 0;
            hourlyData.data = 0;
            hourlyData.energy = 0;
            hourlyData.duration = duration;
        } else {
            hourlyData.duration += duration
        }
        // same day
        if (historySummary === undefined) {
            dailyData.co2 = 0;
            dailyData.data = 0;
            dailyData.energy = 0;
            dailyData.duration = duration;
        } else {
            dailyData.duration += duration;
        }

        await updateData(now, hourlyData, dailyData);

        resolve();
    });
}

export function updateHistoryDb(packet) {
    return new Promise(async function(resolve) {
        const domain = packet.domainName;
        const sizeCo2 = packet.co2Size;
        const dataBytes = packet.packetSize;
        const energyMJ = packet.energySize;
        const timestamp = packet.timeStamp;
        const date = new Date(timestamp);
        const lastStoredDBEntry = await getLastStoredEntries(date, domain);
        const storedDates = lastStoredDBEntry.storedDates;
        const history = lastStoredDBEntry.history;
        const historySummary = lastStoredDBEntry.historySummary;
        const historyDomain = lastStoredDBEntry.domain;
        const historyDomainMonth = lastStoredDBEntry.monthlyDomain;
        const historyDomainDay = lastStoredDBEntry.dailyDomain;

        const hourlyData = { co2: sizeCo2, data: dataBytes, energy: energyMJ, duration: history?.duration ?? 0}
        const dailyData = { co2: sizeCo2, data: dataBytes, energy: energyMJ, duration: historySummary?.duration ?? 0};

        const domainDataInfo = {
            name: domain,
            co2: sizeCo2,
            data: dataBytes,
            energy: energyMJ
        };
        const domainData = {
            full: { ...domainDataInfo },
            monthly: { ...domainDataInfo },
            daily: { ...domainDataInfo }
        };
        if(historyDomain != undefined) {
            domainData.full.co2 = domainDataInfo.co2 + historyDomain.co2;
            domainData.full.data = domainDataInfo.data + historyDomain.data;
            domainData.full.energy = domainDataInfo.energy + historyDomain.energy;
        }
        if(historyDomainMonth != undefined) {
            domainData.monthly.co2 = domainDataInfo.co2 + historyDomainMonth.co2;
            domainData.monthly.data = domainDataInfo.data + historyDomainMonth.data;
            domainData.monthly.energy = domainDataInfo.energy + historyDomainMonth.energy;
        }
        if(historyDomainDay != undefined) {
            domainData.daily.co2 = domainDataInfo.co2 + historyDomainDay.co2;
            domainData.daily.data = domainDataInfo.data + historyDomainDay.data;
            domainData.daily.energy = domainDataInfo.energy + historyDomainDay.energy;
        }

        // same hour
        if (history != undefined) {
            hourlyData.co2 += history.co2;
            hourlyData.data += history.data;
            hourlyData.energy += history.energy;
        }
        // same day
        if (historySummary != undefined) {
            dailyData.co2 += historySummary.co2;
            dailyData.data += historySummary.data;
            dailyData.energy += historySummary.energy;
        }

        await updateData(date, hourlyData, dailyData, domainData);

        resolve();
    });
}
