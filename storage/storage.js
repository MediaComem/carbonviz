import { init as initDB, getDailyAggregates as dailyAggregatesFromDB, getRecentEntries as recentEntriesFromDB, getAggregate, getTodayCounter, getWebsites } from './indexedDB.js';
import { retrieveSettings } from '../settings/settings.js';
import { ONE_DAY_SEC, co2ImpactHomeHardware} from '../model/model.js'

const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const initStorage = async() => {
    return initDB();
}

const getDailyAggregates = async (period, range) => {
    const settings = await retrieveSettings();
    return dailyAggregatesFromDB(period, range, settings.lifetimeComputer)
}

const computerDailyEmbodiedCo2 = async () => {
    const settings = await retrieveSettings();
    return co2ImpactHomeHardware(ONE_DAY_SEC, settings.lifetimeComputer);
}

const getLastDaysSummary = async (range) => {
    await initDB();
    const dailyData = await getDailyAggregates('day', range); // may contain holes for inactive days
    // Add missing computer embodied energy for inactive days
    const nbDaysInactive = range[1] - range [0] - dailyData.length;
    const computerDailyCo2 = await computerDailyEmbodiedCo2();
    dailyData.push({ data: 0, co2: nbDaysInactive * computerDailyCo2, computer: { co2: nbDaysInactive * computerDailyCo2 } });
    return dailyData.reduce((acc, day) => {
        return {
            data: acc.data + day.data,
            co2: acc.co2 + day.co2,
            computer: { co2: acc.computer.co2 + day.computer.co2 }
        }
    }, { data: 0, co2: 0, computer: { co2: 0}});
}

const retrieveTodayCounter = async () => {
    await initDB();
    const settings = await retrieveSettings();
    return getTodayCounter(settings.lifetimeComputer);
}

// Retrieve top websites for all time
const getTopWebsites = async (mode = 'co2', limit = 10) => {
    await initDB();
    return await getWebsites(mode, limit, 'domains');
}

const arrayForPeriods = (granularity) => {
    // Retrieve data for given periods
    switch (granularity) {
        case 'month': {
            // Period: full year (last 12 months)
            // Time entity: 1 month
            return [1,2,3,4,5,6,7,8,9,10,11,12];
        }
        case 'day': {
            // Period: last 7 days (1 week)
            // Time entity: 1 day
            return [1,2,3,4,5,6,0]; // Week Monday to Sunday
        }
        default:
            throw new Error('Invalid period');
    }
}

// Retrieve computer co2 series for current week by day or current year by month
// add computer energy as additionnal set
// granularity: 'day' | 'month'
// format is as expected by ApexChart in Statistics.vue component
const getComputerCo2Series = async (granularity = 'day') => {
    await initDB();

    const periods = arrayForPeriods(granularity); // Periods to retrieve (days 0 to 6 or months 1 to 12)
    const computerDailyCo2 = await computerDailyEmbodiedCo2();

    const result = [];

    // Add computer active time energy for co2
    let dailyData;
    if (granularity === 'day') {
        const data =  new Array(periods.length).fill(computerDailyCo2);
        result.push({
            name: "computer",
            data
        });
    } else if (granularity === 'month') {
        const data =  new Array(periods.length).fill(30*computerDailyCo2);
        result.push({
            name: "computer",
            data
        });
    }
    return result;
}
// Retrieve top websites data series for current week by day or current year by month
// add computer energy as additionnal set
// granularity: 'day' | 'month'
// format is as expected by ApexChart in Statistics.vue component
// Data for top 'number' websites + aggregate of others in 'Divers'
//    [{name: 'Netflix', data: [300, 250, 0, 600, 0, 800, 2000]},
//    {name: 'YouTube', data: [100, 50, 500, 200, 0, 100, 0]},
//    {name: 'Divers', data: [600, 50, 200, 100, 150, 0, 0],
//    {name: 'Computer', data: [1300, 500, 2000, 1000, 1500, 1000, 3000]}]
const getTopWebsitesSeries = async (mode = 'co2', number = 3, granularity = 'day') => {
    await initDB();

    const consumptionByWebsite = {}; // consumption by website (gggregated for the full period + detail per time entity)
    const totalPerTimeEntity = []; // total consumption per time entity (1 day or 1 month)
    let totalPerTimeEntity4TopWebsites; // total consumption from top websites per time entity (1 day or 1 month)
    let limit;

    switch (granularity) {
        case 'month': {
            // Worse case, we have different top website for each month
            // To get the top "number" for a year, we need to consider the top 12*number websites
            limit = 12 * number;
            break;
        }
        case 'day': {
            // Worse case, we have different top website for each day
            // To get the top "number" for a week, we need to consider the top 7*number websites
            limit = 7 * number;
            break;
        }
        default:
            throw new Error('Invalid period');
    }

    const periods = arrayForPeriods(granularity); // Periods to retrieve (days 0 to 6 or months 1 to 12)

    // retrieve data from database
    for (const period of periods) {
        const table = `domains_${granularity}_${period}`;
        const dailyData = await getWebsites(mode, limit, table);
        for (const website of dailyData) {
            const name = website.name;
            const amount = website[mode];
            // aggregate data for the last 7 days
            if (!consumptionByWebsite[name]) {
                consumptionByWebsite[name] = {
                    name: name,
                    data: new Array(periods.length).fill(0),
                    aggregate: 0
                }
            }
            let index = period - 1;
            if (index < 0) {
                index = periods.length - 1; // special case for sunday (period 0 instead of 7)
            }
            consumptionByWebsite[name].data[index] = amount;
            consumptionByWebsite[name].aggregate += amount;
        }
        const co2Total =  await getAggregate(mode, table);
        totalPerTimeEntity.push(co2Total);
    }
    // Keep only top website
    const websites = Object.values(consumptionByWebsite);
    websites.sort((a,b) => b.aggregate - a.aggregate);
    const topWebsites = websites.slice(0,number-1).map(site => site.name);

    // Now prepare data to return
    const result = [];
    totalPerTimeEntity4TopWebsites = new Array(periods.length).fill(0)
    for (const [website, serie] of Object.entries(consumptionByWebsite)) {
        if (!topWebsites.includes(website)) {
            continue;
        }
        result.push(serie);
        totalPerTimeEntity4TopWebsites = totalPerTimeEntity4TopWebsites.map((total, idx) => total + serie.data[idx]);
    }
    // sort series
    result.sort((a,b) => b.aggregate - a.aggregate);

    // Add remaing data consumption to 'otherCategory' category
    result.push({
        name: 'otherCategory',
        data: totalPerTimeEntity.map((total, idx) => total - totalPerTimeEntity4TopWebsites[idx])
    });

    return result;
}

const retrieveHistoryLayers = async (period, scrollCount) => {
    const year = new Date().getFullYear();
    const layersCo2 = [];
    const layersData = [];
    // min 3 months / max is one year
    const historyLimit = (3 + scrollCount) < 12 ? (3 + scrollCount) : 12;

    await initDB();


    // get data (daily summaries) for the last 4 months
    const dailyData = await getDailyAggregates('month', [-historyLimit, 0]);
    if (!dailyData) {
        return { co2: layersCo2, data: layersData };
    }

    // EXPERIMENT
    // get Aggregate for the last minute, last 10 minutes and current hour
    // HACK keep level day/week/month
    const lastMinuteData = await recentEntriesFromDB('second', [-60, 0]);
    const last10MinutesData = await recentEntriesFromDB('minute', [-10, 0]);
    const lastHourData = await recentEntriesFromDB('5minutes', [-12, 0]);

    const getLastMinuteList = () => {
        for(let data of lastMinuteData) {
            if(data.data < 1000) { // hide less than 1kB
                continue;
            }
            const label = data.timestamp.slice(11, 19);
            layersCo2.push({ amount: data.co2, computer: 0, energy: data.energy, label: label, level: 'day', key: label });
            layersData.push({ amount: data.data, label: label, level: 'day', key: label });
        }
    }
    const getLast10MinutesList = () => {
        const byMinute = new Map();
        for (const entry of last10MinutesData) {
            const minuteKey = entry.timestamp.slice(11, 16); // HH:MM
            if (!byMinute.has(minuteKey)) {
                byMinute.set(minuteKey, { co2: 0, data: 0, energy: 0, entries: [] });
            }
            const group = byMinute.get(minuteKey);
            group.co2 += entry.co2;
            group.data += entry.data;
            group.energy += entry.energy;
            group.entries.push(entry);
        }
        for (const [minuteKey, group] of [...byMinute.entries()].sort(([a], [b]) => a.localeCompare(b))) {
            if (group.data < 1000) continue;
            const detailsCo2 = group.entries.map(e => ({ amount: e.co2, label: e.timestamp.slice(11, 19), key: `co2Sec${e.timestamp}` }));
            const detailsData = group.entries.map(e => ({ amount: e.data, label: e.timestamp.slice(11, 19), key: `dataSec${e.timestamp}` }));
            layersCo2.push({ amount: group.co2, computer: 0, energy: group.energy, label: minuteKey, details: detailsCo2, level: 'week', key: `co2Min${minuteKey}` });
            layersData.push({ amount: group.data, label: minuteKey, details: detailsData, level: 'week', key: `dataMin${minuteKey}` });
        }
    }
    const getLastHourList = () => {
        const by10Min = new Map();
        for (const entry of lastHourData) {
            const hour = entry.timestamp.slice(11, 13);
            const minute = parseInt(entry.timestamp.slice(14, 16));
            const rangeStart = Math.floor(minute / 10) * 10;
            const rangeKey = `${hour}:${String(rangeStart).padStart(2, '0')}`;
            if (!by10Min.has(rangeKey)) {
                by10Min.set(rangeKey, { co2: 0, data: 0, energy: 0, byMinute: new Map() });
            }
            const group = by10Min.get(rangeKey);
            group.co2 += entry.co2;
            group.data += entry.data;
            group.energy += entry.energy;
        }
        for (const [rangeKey, group] of [...by10Min.entries()].sort(([a], [b]) => a.localeCompare(b))) {
            if (group.data < 1000) continue;
            const sortedMinutes = [...group.byMinute.entries()].sort(([a], [b]) => a.localeCompare(b));
            const detailsCo2 = sortedMinutes.map(([minuteKey, v]) => ({ amount: v.co2, label: minuteKey, key: `co2Min${minuteKey}` }));
            const detailsData = sortedMinutes.map(([minuteKey, v]) => ({ amount: v.data, label: minuteKey, key: `dataMin${minuteKey}` }));
            layersCo2.push({ amount: group.co2, computer: 0, energy: group.energy, label: rangeKey, details: detailsCo2, level: 'month', key: `co2_10min_${rangeKey}` });
            layersData.push({ amount: group.data, label: rangeKey, details: detailsData, level: 'month', key: `data_10min_${rangeKey}` });
        }
      }

    const getWeeksList = () => {
        const previousWeeks = [];
        let previousWeek = currentWeekYear;
        const weeksHistory = (5 * historyLimit) < 53 ? (5 * historyLimit) : 52;
        while (previousWeeks.length < weeksHistory) {
            const week = previousWeek > 0 ? previousWeek : previousWeek + 52;
            previousWeeks.push(week);
            previousWeek--;
        }
        for (const week of previousWeeks) {
            const weeklyData = dailyData.filter(day => day.weekOfYear === week);
            if (!weeklyData.length) {
                continue;
            }
            const co2 = weeklyData.reduce((acc, entry) => acc + entry.co2, 0);
            const computerCo2 = weeklyData.reduce((acc, entry) => acc + entry.computer.co2, 0);
            const energy = weeklyData.reduce((acc, entry) => acc + entry.energy, 0);
            const data = weeklyData.reduce((acc, entry) => acc + entry.data, 0);
            const detailsCo2 = weeklyData.map( entry => { return { amount: entry.co2, label: days[entry.dayOfWeek], key: `co2Week${days[entry.dayOfWeek]}` } });
            const detailsData = weeklyData.map( entry => { return { amount: entry.data, label: days[entry.dayOfWeek], key: `dataWeek${days[entry.dayOfWeek]}` } });
            layersCo2.unshift({ amount: co2, computer: computerCo2, energy: energy, label: `${week}`, details: detailsCo2, level: 'week', key: `co2Week${week}` });
            layersData.unshift({ amount: data, label: `${week}`, details: detailsData, level: 'week', key: `dataWeek${week}` });
        }

        layersCo2[layersCo2.length-1].label = 'current_week';
        layersData[layersCo2.length-1].label = 'current_week';
    }

    const getMonthsList = () => {
        const previousMonths = [];
        let previousMonth = currentMonth;
        while (previousMonths.length < historyLimit) {
            const month = previousMonth > 0 ? previousMonth : previousMonth + 12;
            previousMonths.push(month);
            previousMonth--;
        }
        for (const month of previousMonths) {
            const monthlyData = dailyData.filter(day => day.month === month);
            if (!monthlyData.length) {
                continue;
            }
            const co2 = monthlyData.reduce((acc, entry) => acc + entry.co2, 0);
            const computerCo2 = monthlyData.reduce((acc, entry) => acc + entry.computer.co2, 0);
            const energy = monthlyData.reduce((acc, entry) => acc + entry.energy, 0);
            const data = monthlyData.reduce((acc, entry) => acc + entry.data, 0);
            // Display details per week of month data
            const detailsCo2 = [];
            const detailsData = [];
            for (const weekOfMonth of [1, 2, 3, 4, 5]) {
                const weeklyData = monthlyData.filter(day => day.weekOfMonth === weekOfMonth);
                if (weeklyData.length) {
                    const co2 = weeklyData.reduce((acc, entry) => acc + entry.co2, 0);
                    const data = weeklyData.reduce((acc, entry) => acc + entry.data, 0);
                    detailsCo2.push({ amount: co2, label: `${weekOfMonth}`, key: `co2Month${weekOfMonth}`});
                    detailsData.push({ amount: data, label: `${weekOfMonth}`, key: `dataMonth${weekOfMonth}` });
                }
            }

            layersCo2.unshift({ amount: co2,  computer: computerCo2, energy: energy, label: `${month}`, details: detailsCo2, level: 'month', key: `co2Month${month}` });
            layersData.unshift({ amount: data, label: `${month}`, details: detailsData, level: 'month', key: `dataMonth${month}` });
        }

        layersCo2[layersCo2.length-1].label = 'current_month';
        layersData[layersCo2.length-1].label = 'current_month';
    }

    switch(period) {
        case 'days':
            getLastMinuteList();
            break;
        case 'weeks':
            getLast10MinutesList();
            break;
        case 'months':
            getLastHourList();
            break;
        default:
            getLastHourList();
    }

   return { co2: layersCo2, data: layersData, count: layersCo2.length };

}

const retrieveAnalogiesLayer = async (type) => {
    const consumedCo2 = {
        today: '',
        week: '',
        month: '',
        year: ''
    };
    const consumedData = {
        today: '',
        week: '',
        month: '',
        year: ''
    };

    await initDB();

    // get data (daily summaries) for the last month
    const dailyData = await getDailyAggregates('month', [-1, 0]);
    if (!dailyData) {
        return { co2: consumedCo2, data: consumedData };
    }
    const today = dailyData[dailyData.length-1];
    const currentWeekYear = today.weekOfYear;
    const currentMonth = today.month;
    const currentYear = new Date().getFullYear();
    const todayDate = new Date();
    const lastWeek = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - 6);
    // today
    consumedCo2.today = { co2: today.co2, energy: today.energy, level: 'day', key: `co2Day${today.date}` };
    consumedData.today = { data: today.data, level: 'day', key: `dataDay${today.date}` };
    // last 7 days
    const lastSevenDaysData = dailyData.filter(day => {
        const date = new Date(day.index);
        return date >= lastWeek;
    });
    if (!lastSevenDaysData.length) {
        consumedCo2.week = { co2: 0, energy: 0, level: 'week', key: `co2Week${currentWeekYear}` };
        consumedData.week = { data: 0, level: 'week', key: `dataWeek${currentWeekYear}` };
    } else {
        const weeekCo2 = lastSevenDaysData.reduce((acc, entry) => acc + entry.co2, 0);
        const weekEnergy = lastSevenDaysData.reduce((acc, entry) => acc + entry.energy, 0);
        const weekData = lastSevenDaysData.reduce((acc, entry) => acc + entry.data, 0);
        consumedCo2.week = { co2: weeekCo2, energy: weekEnergy, level: 'week', key: `co2Week${currentWeekYear}` };
        consumedData.week = { data: weekData, level: 'week', key: `dataWeek${currentWeekYear}` };
    }
    // last 30 days
    const thirtyDays = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - 30);
    const fourWeeksData = dailyData.filter(day => {
        const date = new Date(day.index);
        return date >= thirtyDays;
    });
    if (!fourWeeksData.length) {
        consumedCo2.month = { co2: 0, level: 'month', key: `co2Month${currentMonth}` };
        consumedData.month = { data: 0, level: 'month', key: `dataMonth${currentMonth}` };
    } else {
        const monthCo2 = fourWeeksData.reduce((acc, entry) => acc + entry.co2, 0);
        const monthEnergy = fourWeeksData.reduce((acc, entry) => acc + entry.energy, 0);
        const monthData = fourWeeksData.reduce((acc, entry) => acc + entry.data, 0);
        consumedCo2.month = { co2: monthCo2, energy: monthEnergy, level: 'month', key: `co2Month${currentMonth}` };
        consumedData.month = { data: monthData, level: 'month', key: `dataMonth${currentMonth}` };
    }
    // From January
    const yearlyData = dailyData.filter(day => day.index.slice(0,4) === currentYear.toString());
    if (!yearlyData.length) {
        consumedCo2.year = { co2: 0, level: 'month', key: `co2Month${currentYear}` };
        consumedData.year = { data: 0, level: 'month', key: `dataMonth${currentYear}` };
    } else {
        const yearCo2 = yearlyData.reduce((acc, entry) => acc + entry.co2, 0)
        const yearEnergy = yearlyData.reduce((acc, entry) => acc + entry.energy, 0);
        const yearData = yearlyData.reduce((acc, entry) => acc + entry.data, 0);
        consumedCo2.year = { co2: yearCo2, energy: yearEnergy, level: 'year', key: `co2year${currentYear}` };
        consumedData.year = { data: yearData, level: 'year', key: `datayear${currentYear}` };
    }

    if(type.value === 'co2') {
        return { data: consumedCo2 };
    } else {
        return { data: consumedData };
    }
}

export { initStorage, getLastDaysSummary, retrieveTodayCounter, getTopWebsites, getComputerCo2Series, getTopWebsitesSeries, retrieveHistoryLayers, retrieveAnalogiesLayer, computerDailyEmbodiedCo2 }