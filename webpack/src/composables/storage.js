import { nextTick } from 'vue';
import { init as initDB, getDailyAggregates } from '../../../storage/indexedDB';

let database;

export const retrieveHistoryLayers = async () => {
    /*
    [
        { amount: 120, label: 'week 21' }, { amount: 75, label: 'week 22' },
        { amount: 120, label: 'week 23' },{ amount: 150, label: 'last week' },
        { amount: 120, label: 'Monday' },{ amount: 75, label: 'Tuesday' },
        { amount: 100, label: 'Yesterday' }, { amount: 50, label: 'Today' }
    ]
    */

    const layersCo2 = [];
    const layersData = [];

    if (!database) {
        database = await initDB();
    }

    // get data fo the last 4 months
    const dailyData = await getDailyAggregates('month', 4);
    if (!dailyData) {
        return { co2: layersCo2, data: layersData };
    }
    const today = dailyData[dailyData.length-1];
    const currentMonth = today.currentMonth;
    const currentWeekYear = today.weekOfYear;

    // get today
    layersCo2.push({ amount: today.co2, label: 'Today', details: today });
    layersData.push({ amount: today.data, label: 'Today', details: today });

    // get current week days
    let index = dailyData.length-2; // yesterday
    let entry = dailyData[index]
    let weekNb = entry ? entry.weekOfYear : -1;
    while ( weekNb === currentWeekYear) {
        layersCo2.push({ amount: entry.co2, label: `${entry.date}-${entry.month}`, details: entry });
        layersData.push({ amount: entry.data, label: `${entry.date}-${entry.month}`, details: entry });
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
        const weeklyData = dailyData.filter(day => day.weekOfYear === week);
        if (!weeklyData.length) {
            continue;
        }
        const co2 = weeklyData.reduce((acc, entry) => acc + entry.co2, 0);
        const data = weeklyData.reduce((acc, entry) => acc + entry.data, 0);
        layersCo2.push({ amount: co2, label: `Week ${week}`, details: weeklyData });
        layersData.push({ amount: data, label: `Week ${week}`, details: weeklyData });
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
        const data = monthlyData.reduce((acc, entry) => acc + entry.data, 0);
        layersCo2.push({ amount: co2, label: `Month ${month}`, details: monthlyData });
        layersData.push({ amount: data, label: `Month ${month}`, details: monthlyData });
    }

   return { co2: layersCo2, data: layersData };

}
