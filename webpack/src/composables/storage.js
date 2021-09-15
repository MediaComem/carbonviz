import { days } from '../utils/format';
import { init as initDB, getDailyAggregates, getTodayCounter, getWebsites, getCurWeekHistory } from '../../../storage/indexedDB';

let database;

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const retrieveTodayCounter = async () => {
    database ??= await initDB();
    return getTodayCounter();
}

export const getTopWebsites = async (mode = 'co2', limit = 10) => {
    database ??= await initDB();
    return getWebsites(mode, limit);
}

export const getCurWeek = async (mode = 'co2') => {
    database ??= await initDB();
    let history = await getCurWeekHistory(mode);
    // build 24h history for 7 days filled with 0 if no data
    const byHours = [];
    for (let h = 0; h < 24; h++) byHours.push(Array(7).fill(0));
    // Ceate a date one week ago at the begening of the day
    const date = new Date();
    date.setHours(0,0,0,0);
    date.setDate(date.getDate() - 6);
    for (const entry of history) {
        // Put the history data to the right hour's index in the right day's index
        const indHour = entry.index.substring(11);
        const d = new Date(entry.index + ':00:00');
        const diffInTime = d.getTime() - date.getTime();
        const indDay = Math.round(diffInTime / 86400000);
        byHours[indHour][indDay] = mode == 'co2' ? entry.co2 : entry.data;
    }
    return byHours;
}

export const retrieveHistoryLayers = async () => {
    const year = new Date().getFullYear();
    const layersCo2 = [];
    const layersData = [];

    database ??= await initDB();

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
        layersCo2.push({ amount: entry.co2, energy: entry.energy, label: `${entry.date} ${months[entry.month - 1]} ${year}`, level: 'day' });
        layersData.push({ amount: entry.data, label: `${entry.date} ${months[entry.month - 1]} ${year}`, level: 'day' });
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
