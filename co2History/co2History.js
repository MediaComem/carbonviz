import { getLastStoredData, addCo2, updateDays } from "./indexedDB.js";

const getUnit = (randamUnit) => {
    var unit = /[A-Za-z]+$/;
    var num = /(^[0-9\.]+)/g;

    switch(randamUnit.match(unit)[0]) {
        case 'g': return Number(randamUnit.match(num)[0]);
        case 'kg': return Number(randamUnit.match(num)[0] * 1000);
        case 'Mg': return Number(randamUnit.match(num)[0] * 1000000);
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

const calcDaysTotals = (historyStorage) => {
    let daysTotals = 0;
    let value = 0;
    for (let i = 1; i < 8; i++) {
        value = getUnit(historyStorage.days[i].total);
        daysTotals += parseFloat(value);
    }
    return co2Size(daysTotals);
}

/* const updateDays = (days) => {
    for ( ; days > 0; days--) {
        for (let i = 7; i > 1; i--) {
            historyStorage.days[i].total = historyStorage.days[i-1].total
        }
        historyStorage.days[1].total = 0;
    }
} */

const resetDays = (historyStorage) => {
    for (let i=7; i>0; i--) {
        historyStorage.days[i].total = "0 g";
    }
}

const resetWeeks = (historyStorage) => {
    for (let i=4; i>0; i--) {
        historyStorage.weeks[i].total = "0 g";
    }
}

const updateHistory = (today, lastStoredDBTotals, sameMonth) => {
    const timeDiff = today.getTime() - lastStoredDBTotals.lastStoredDate.getTime();
    const numDays = Math.floor(timeDiff / (1000*60*60*24));
    const weekStartDate = lastStoredDBTotals.weekOneStartDate;
    const weekEndDate = weekStartDate + 6;
    const sameWeek = today.getDate() <= weekEndDate;

    if (!sameMonth) {
        let numMonths = today.getMonth() - lastStoredDBTotals.lastStoredDate.getMonth();
        if (numMonths < 0) {
            numMonths += 12; //to compare months in the new year
        }
        for ( ; numMonths > 0; numMonths--) {
            for (let i=4; i>1; i--) {
                //historyStorage.months[i].total = historyStorage.months[i-1].total;
            }
            //historyStorage.months[1].total = co2Size(currentMonthTotal);
            currentMonthTotal = 0; // reset for next loop if more than one month has passed
        }
        //resetWeeks(historyStorage);
        //resetDays(historyStorage);
        //historyStorage.weeks.newMonthtotal.total = "0 g";
    } else if (!sameWeek) {
        let numWeeks = Math.floor(numDays/7);
        for ( ; numWeeks>0; numWeeks--) {
            for (let i = 4; i > 1; i--) {
                //historyStorage.weeks[i].total = historyStorage.weeks[i-1].total;
            }
            //historyStorage.weeks[1].total = calcDaysTotals(historyStorage);
            //resetDays(historyStorage);
        }
    } else {
        updateDays(numDays);
    }
}

export async function updateCo2Total(domain, sizeCo2) {
    const today = new Date();
    const lastStoredDBTotals = await getLastStoredData(today);

    const sameMonth = lastStoredDBTotals.lastStoredDate.getMonth() == today.getMonth();
    let currentMonthTotal = lastStoredDBTotals.newMonthtotal;
    let newTotalCo2 = 0;

    if (lastStoredDBTotals.lastStoredDate.getDate() == today.getDate() && sameMonth) {
        newTotalCo2 = parseFloat((sizeCo2 + lastStoredDBTotals.currentDateTotal).toFixed(3));
        currentMonthTotal += sizeCo2;
        await addCo2(newTotalCo2, currentMonthTotal, domain, today);
    } else {
        //updateHistory(today, lastStoredDBTotals, sameMonth);
        newTotalCo2 = sizeCo2;
        await addCo2(newTotalCo2, currentMonthTotal, domain, today);
    };
    document.getElementById("todayCo2").innerHTML="Today: "+co2Size(newTotalCo2);
}

