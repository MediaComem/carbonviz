const history = {
    "lastStoredDate": "", //YYYY-MM-DD
    "days": {
        "1": {
            "total": "0 g"
        },
        "2": {
            "total": "0 g"
        },
        "3": {
            "total": "0 g"
        },
        "4": {
            "total": "0 g"
        },
        "5": {
            "total": "0 g"
        },
        "6": {
            "total": "0 g"
        },
        "7": {
            "total": "0 g"
        }
    },
    "weeks": {
        "weekOneStartDate": "", //DD - used to calc change to next week
        "1": {
            "total": "0 g"
        },
        "2": {
            "total": "0 g"
        },
        "3": {
            "total": "0 g"
        },
        "4": {
            "total": "0 g"
        },
        "newMonthtotal": { // value for month one when months are updated
            "total": "0 g"
        }
    },
    "months": {
        "1": {
            "total": "0 g"
        },
        "2": {
            "total": "0 g"
        },
        "3": {
            "total": "0 g"
        },
        "4": {
            "total": "0 g"
        }
    }
}

if(!localStorage.getItem('co2History')) {
    const today = new Date();
    history.lastStoredDate = today.toISOString().slice(0,10)
    const firstdayOfWeek = (today.getDate() - today.getDay());
    history.weeks.weekOneStartDate = firstdayOfWeek;
    localStorage.setItem('co2History',  JSON.stringify(history))
}

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

const updateDays = (days, historyStorage) => {
    for ( ; days > 0; days--) {
        for (let i = 7; i > 1; i--) {
            historyStorage.days[i].total = historyStorage.days[i-1].total
        }
        historyStorage.days[1].total = 0;
    }
}

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

const updateHistory = (today, lastdateStored, sameMonth, currentMonthTotal, historyStorage) => {
    const timeDiff = today.getTime() - lastdateStored.getTime();
    const numDays = Math.floor(timeDiff / (1000*60*60*24));
    const weekStartDate = historyStorage.weeks.weekOneStartDate;
    const weekEndDate = weekStartDate + 6;
    const sameWeek = today.getDate() <= weekEndDate;

    if (!sameMonth) {
        let numMonths = today.getMonth() - lastdateStored.getMonth();
        if (numMonths < 0) {
            numMonths += 12; //to compare months in the new year
        }
        for ( ; numMonths > 0; numMonths--) {
            for (let i=4; i>1; i--) {
                historyStorage.months[i].total = historyStorage.months[i-1].total;
            }
            historyStorage.months[1].total = co2Size(currentMonthTotal);
            currentMonthTotal = 0; // reset for next loop if more than one month has passed
        }
        resetWeeks(historyStorage);
        resetDays(historyStorage);
        historyStorage.weeks.newMonthtotal.total = "0 g";
    } else if (!sameWeek) {
        let numWeeks = Math.floor(numDays/7);
        for ( ; numWeeks>0; numWeeks--) {
            for (let i = 4; i > 1; i--) {
                historyStorage.weeks[i].total = historyStorage.weeks[i-1].total;
            }
            historyStorage.weeks[1].total = calcDaysTotals(historyStorage);
            resetDays(historyStorage);
        }
    } else {
        updateDays(numDays, historyStorage);
    }
    historyStorage.lastStoredDate = today.toISOString().slice(0,10);
    historyStorage.weeks.weekOneStartDate = (today.getDate() - today.getDay())
}

export function updateCo2Total(domain, sizeCo2) {
    const historyStorage = JSON.parse(localStorage.getItem('co2History'));
    const today = new Date();
    const lastStoredDate = new Date(historyStorage.lastStoredDate);
    const sameMonth = lastStoredDate.getMonth() == today.getMonth();
    let currentMonthTotal = getUnit(historyStorage.weeks.newMonthtotal.total);
    let newTotalCo2 = 0;

    if (lastStoredDate.getDate() == today.getDate() && sameMonth) {
        newTotalCo2 = parseFloat((sizeCo2 + getUnit(historyStorage.days[1].total)).toFixed(3));
        currentMonthTotal += sizeCo2;
        historyStorage.weeks.newMonthtotal.total = co2Size(Number(currentMonthTotal.toFixed(3)));
    } else {
        updateHistory(today, lastStoredDate, sameMonth, currentMonthTotal, historyStorage);
        newTotalCo2 = sizeCo2;
    };

    historyStorage.days[1].total = co2Size(newTotalCo2);
    localStorage.setItem('co2History',  JSON.stringify(historyStorage))
    document.getElementById("todayCo2").innerHTML="Today: "+historyStorage.days[1].total;
}
