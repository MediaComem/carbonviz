import { days } from '../utils/format';
import { init as initDB, getDailyAggregates as dailyAggregatesFromDB, getAggregate, getTodayCounter, getWebsites, getCurWeekHistory } from '../../../storage/indexedDB';
import { retrieveSettings } from '../utils/settings.js';

let database;

const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

const getDailyAggregates = async (period, range) => {
    const settings = await retrieveSettings();
    return dailyAggregatesFromDB(period, range, settings.lifetimeComputer)
}

export const getLastDaysSummary = async(range) => {
    database ??= await initDB();
    const dailyData = await getDailyAggregates('day', range); // may contain holes for inactive days
    return dailyData.reduce((acc, day) => {
        return {
            data: acc.data + day.data,
            energy: acc.energy + day.energy,
            co2: acc.co2 + day.co2,
            computer: { energy: acc.computer.energy + day.computer.energy, co2: acc.computer.co2 + day.computer.co2 }
        }
    }, { data: 0, energy: 0, co2: 0, computer: { energy: 0, co2: 0}});
}

export const retrieveTodayCounter = async () => {
    database ??= await initDB();
    const settings = await retrieveSettings();
    return getTodayCounter(settings.lifetimeComputer);
}

// Retrieve top websites for all time
export const getTopWebsites = async (mode = 'co2', limit = 10) => {
    database ??= await initDB();
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
export const getComputerCo2Series = async (granularity = 'day') => {
    database ??= await initDB();

    const periods = arrayForPeriods(granularity); // Periods to retrieve (days 0 to 6 or months 1 to 12)

    const result = [];

    // Add computer active time energy for co2
    let dailyData;
    if (granularity === 'day') {
        dailyData = await getDailyAggregates('week', [-1, 0]); // may contain holes for inactive days
        const data =  new Array(periods.length).fill(0);
        for (const info of dailyData) {
            const dayOfWeek = info.dayOfWeek; // sunday is 0
            data[dayOfWeek > 0 ? dayOfWeek - 1 : 6] = info.computer.co2;
        }
        result.push({
            name: "computer",
            data
        });
    } else if (granularity === 'month') {
        dailyData = await getDailyAggregates('month', [-12, 0]);
        // aggregate per month
        const data =  new Array(periods.length).fill(0);
        for (const info of dailyData) {
            const month = info.month;
            data[month-1] += info.computer.co2;
        }
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
export const getTopWebsitesSeries = async (mode = 'co2', number = 3, granularity = 'day') => {
    database ??= await initDB();

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
        const table = `domains_${granularity}_${period}`; // TODO fix inactive days may not be empty
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

    // Add remaing data consumption to 'Divers' category
    result.push({
        name: 'Divers',
        data: totalPerTimeEntity.map((total, idx) => total - totalPerTimeEntity4TopWebsites[idx])
    });

    return result;
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

export const retrieveHistoryLayers = async (period, scrollCount) => {
    const year = new Date().getFullYear();
    const layersCo2 = [];
    const layersData = [];
    // min 3 months / max is one year
    const historyLimit = (3 + scrollCount) < 12 ? (3 + scrollCount) : 12;

    database ??= await initDB();

    // get data (daily summaries) for the last 4 months
    const dailyData = await getDailyAggregates('month', [-historyLimit, 0]);
    if (!dailyData) {
        return { co2: layersCo2, data: layersData };
    }
    const today = dailyData[dailyData.length-1];
    const currentMonth = today.month;
    const currentWeekYear = today.weekOfYear;
    const itemsCount = 0;

    const getDaysList = () => {
        for(let data of dailyData) {
            layersCo2.push({ amount: data.co2, computer: data.computer.co2, energy: data.energy, label: `${data.date}.${months[data.month - 1]}.${year}`, level: 'day', key: `co2Day${data.date}` });
            layersData.push({ amount: data.data, label: `${data.date}.${months[data.month - 1]}.${year}`, level: 'day', key: `dataDay${data.date}`  });
        }
        layersCo2[layersCo2.length-1].label = 'current_today';
        layersData[layersCo2.length-1].label = 'current_today';
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

   return { co2: layersCo2, data: layersData, count: layersCo2.length };

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
