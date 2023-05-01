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
        const d = new Date(entry.index + ':00:00');
        const diffInTime = d.getTime() - date.getTime();
        const indDay = Math.ceil(diffInTime / 86400000) - 1 ;
        byHours[entry.hour][indDay] = mode == 'co2' ? entry.co2 : entry.data;
    }
    return byHours;
}

export const retrieveHistoryLayers = async (period) => {
    const year = new Date().getFullYear();
    const layersCo2 = [];
    const layersData = [];

    database ??= await initDB();

    // get data (daily summaries) for the last 4 months
    const dailyData = await getDailyAggregates('month', 4);
    if (!dailyData) {
        return { co2: layersCo2, data: layersData };
    }
    const today = dailyData[dailyData.length-1];
    const currentMonth = today.month;
    const currentWeekYear = today.weekOfYear;

    const getDaysList = () => {
        for(let data of dailyData) {
            layersCo2.push({ amount: data.co2, energy: data.energy, label: `${data.date} ${months[data.month - 1]} ${year}`, level: 'day', key: `co2Day${data.date}` });
            layersData.push({ amount: data.data, label: `${data.date} ${months[data.month - 1]} ${year}`, level: 'day', key: `dataDay${data.date}`  });
        }
        layersCo2[layersCo2.length-1].label = 'current_today';
        layersData[layersCo2.length-1].label = 'current_today';
    }

    const getWeeksList = () => {
        // get last weeks including this week (til month start)
        const endOfWeekRange = dailyData[0].weekOfYear;
        const previousWeeks = [];
        let previousWeek = currentWeekYear;
        while (previousWeek >= endOfWeekRange) {
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
            const detailsCo2 = dailyWeekData.map( entry => { return { amount: entry.co2, label: days[entry.dayOfWeek], key: `co2Week${days[entry.dayOfWeek]}` } });
            const detailsData = dailyWeekData.map( entry => { return { amount: entry.data, label: days[entry.dayOfWeek], key: `dataWeek${days[entry.dayOfWeek]}` } });
            layersCo2.unshift({ amount: co2, energy: energy, label: `${week}`, details: detailsCo2, level: 'week', key: `co2Week${week}` });
            layersData.unshift({ amount: data, label: `${week}`, details: detailsData, level: 'week', key: `dataWeek${week}` });
        }

        layersCo2[layersCo2.length-1].label = 'current_week';
        layersData[layersCo2.length-1].label = 'current_week';
    }

    const getMonthsList = () => {
        // get previous 3 months
        const previousMonths = [];
        let previousMonth = currentMonth;
        while (previousMonths.length < 3) {
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

            layersCo2.unshift({ amount: co2, energy: energy, label: `${month}`, details: detailsCo2, level: 'month', key: `co2Month${month}` });
            layersData.unshift({ amount: data, label: `${month}`, details: detailsData, level: 'month', key: `dataMonth${month}` });
        }

        layersCo2[layersCo2.length-1].label = 'current_month';
        layersData[layersCo2.length-1].label = 'current_month';
    }

    switch(period) {
        case 'days':
            getDaysList();
            break;
        case 'weeks':
            getWeeksList();
            break;
        case 'months':
            getMonthsList();
            break;
        default:
            getDaysList();
    }

   return { co2: layersCo2, data: layersData };

}

export const retrieveAnalogiesLayer = async (type) => {
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

    database ??= await initDB();

    // get data (daily summaries) for the last 4 months
    const dailyData = await getDailyAggregates('month', 12);
    if (!dailyData) {
        return { co2: consumedCo2, data: consumedData };
    }
    const today = dailyData[dailyData.length-1];
    const currentWeekYear = today.weekOfYear;
    const currentMonth = today.month;
    const currentYear = new Date().getFullYear();
    // today
    consumedCo2.today = { amount: today.co2, energy: today.energy, level: 'day', key: `co2Day${today.date}` };
    consumedData.today = { amount: today.data, level: 'day', key: `dataDay${today.date}` };
    // Week
    const dailyWeekData = dailyData.filter(day => day.weekOfYear > (currentWeekYear - 4));
    if (!dailyWeekData.length) {
        consumedCo2.week = { amount: 0, energy: 0, level: 'week', key: `co2Week${currentWeekYear}` };
        consumedData.week = { amount: 0, level: 'week', key: `dataWeek${currentWeekYear}` };
    } else {
        const weeekCo2 = dailyWeekData.reduce((acc, entry) => acc + entry.co2, 0);
        const weekEnergy = dailyWeekData.reduce((acc, entry) => acc + entry.energy, 0);
        const weekData = dailyWeekData.reduce((acc, entry) => acc + entry.data, 0);
        consumedCo2.week = { amount: weeekCo2, energy: weekEnergy, level: 'week', key: `co2Week${currentWeekYear}` };
        consumedData.week = { amount: weekData, level: 'week', key: `dataWeek${currentWeekYear}` };
    }
    // month
    const monthlyData = dailyData.filter(day => day.month > (currentMonth - 4));
    if (!monthlyData.length) {
        consumedCo2.month = { amount: 0, level: 'month', key: `co2Month${currentMonth}` };
        consumedData.month = { amount: 0, level: 'month', key: `dataMonth${currentMonth}` };
    } else {
        const monthCo2 = monthlyData.reduce((acc, entry) => acc + entry.co2, 0);
        const monthEnergy = monthlyData.reduce((acc, entry) => acc + entry.energy, 0);
        const monthData = monthlyData.reduce((acc, entry) => acc + entry.data, 0);
        consumedCo2.month = { amount: monthCo2, energy: monthEnergy, level: 'month', key: `co2Month${currentMonth}` };
        consumedData.month = { amount: monthData, level: 'month', key: `dataMonth${currentMonth}` };
    }
    // From January
    const yearlyData = dailyData.filter(day => day.index.slice(0,4) === currentYear.toString());
    if (!yearlyData.length) {
        consumedCo2.year = { amount: 0, level: 'month', key: `co2Month${currentYear}` };
        consumedData.year = { amount: 0, level: 'month', key: `dataMonth${currentYear}` };
    } else {
        const yearCo2 = yearlyData.reduce((acc, entry) => acc + entry.co2, 0)
        const yearEnergy = yearlyData.reduce((acc, entry) => acc + entry.energy, 0);
        const yearData = yearlyData.reduce((acc, entry) => acc + entry.data, 0);
        consumedCo2.year = { amount: yearCo2, energy: yearEnergy, level: 'year', key: `co2year${currentYear}` };
        consumedData.year = { amount: yearData, level: 'year', key: `datayear${currentYear}` };
    }

    if(type.value === 'co2') {
        return { data: consumedCo2 };
    } else {
        return { data: consumedData };
    }
}
