import { days } from '../utils/format';
import { init as initDB, getDailyAggregates, getTodayCounter, getWebsites } from '../../../storage/indexedDB';

let database;

export const retrieveTodayCounter = async () => {
    if (!database) {
        database = await initDB();
    }
    return getTodayCounter();
}

export const getTopWebsites = async (mode = 'co2', limit = 10) => {
    if (!database) {
        database = await initDB();
    }
    return getWebsites(mode, limit);
}

export const retrieveHistoryLayers = async () => {
    const layersCo2 = [];
    const layersData = [];

    if (!database) {
        database = await initDB();
    }

    // get data (daily summaries) fo the last 4 months
    const dailyData = await getDailyAggregates('month', 4);
    if (!dailyData) {
        return { co2: layersCo2, data: layersData };
    }
    const today = dailyData[dailyData.length-1];
    const currentMonth = today.currentMonth;
    const currentWeekYear = today.weekOfYear;

    // get today
    layersCo2.push({ amount: today.co2, energy: today.energy, label: 'Today', level: 'today' });
    layersData.push({ amount: today.data, label: 'Today', level: 'today'  });

    // get current week days
    let index = dailyData.length-2; // yesterday
    let entry = dailyData[index]
    let weekNb = entry ? entry.weekOfYear : -1;
    while ( weekNb === currentWeekYear) {
        layersCo2.push({ amount: entry.co2, energy: entry.energy, label: `${entry.date}-${entry.month}`, level: 'day' });
        layersData.push({ amount: entry.data, label: `${entry.date}-${entry.month}`, level: 'day' });
        index--;
        entry = dailyData[index]
        weekNb = entry ? entry.weekOfYear : -1;
    }
    // get last weeks including this week (til month start)
    const previousWeeks = [];
    let previousWeek = currentWeekYear;
    while (previousWeeks.length < 4) {
        const week = previousWeek > 0 ? previousWeek : 52;
        previousWeeks.push(week);
        previousWeek--;
    }
    for (const week of previousWeeks) {
        const dailyWeekData = dailyData.filter(day => day.weekOfYear === week);
        if (!dailyWeekData.length) {
            continue;
        }
        const co2 = dailyWeekData.reduce((acc, entry) => acc + entry.co2, 0);
        const energy = dailyWeekData.reduce((acc, entry) => acc + entry.energy, 0);
        const data = dailyWeekData.reduce((acc, entry) => acc + entry.data, 0);
        const detailsCo2 = dailyWeekData.map( entry => { return { amount: entry.co2, label: days[entry.dayOfWeek] } });
        const detailsData = dailyWeekData.map( entry => { return { amount: entry.data, label: days[entry.dayOfWeek] } });
        layersCo2.push({ amount: co2, energy: energy, label: `Week ${week}`, details: detailsCo2, level: 'week' });
        layersData.push({ amount: data, label: `Week ${week}`, details: detailsData, level: 'week' });
    }
    // get previous 3 months
    const previousMonths = [];
    let previousMonth = currentMonth - 1;
    while (previousMonths.length < 3) {
        const month = previousMonth > 0 ? previousMonth : 12;
        previousMonths.push(month);
        previousMonth--;
    }
    for (const month of previousMonths) {
        const monthlyData = dailyData.filter(day => day.month === month);
        if (!monthlyData.length) {
            continue;
        }
        const co2 = monthlyData.reduce((acc, entry) => acc + entry.co2, 0);
        const energy = monthlyData.reduce((acc, entry) => acc + entry.energy, 0);
        const data = monthlyData.reduce((acc, entry) => acc + entry.data, 0);
        layersCo2.push({ amount: co2, energy: energy, label: `Month ${month}`, details: monthlyData, level: 'month' });
        layersData.push({ amount: data, label: `Month ${month}`, details: monthlyData, level: 'month' });
    }

   return { co2: layersCo2, data: layersData };

}
