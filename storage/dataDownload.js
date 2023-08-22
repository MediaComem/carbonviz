import { downloadData as downloadDB } from './indexedDB.js';
import { downloadZip } from 'client-zip';

export async function downloadData() {
    // Main DB tables
    const stores = [
        {
            db: 'domains',
            name: 'summaryByDomain'
        },
        {
            db: 'history',
            name: 'summaryByHours'
        },
        {
            db: 'historySummary',
            name: 'summaryByDay'
        }
    ];
    // Monthly summariey
    for (const month of [1,2,3,4,5,6,7,8,9,10,11,12]) {
        stores.push({ db: `domains_month_${month}`, name: `currentYear/month/${month}/domains`});
    }
    for (const day of [0,1,2,3,4,5,6]) {
        stores.push({ db: `domains_day_${day}`, name: `currentWeek/day/${day}/domains`});
    }
    const data = [];
    for (const store of stores) {
        const csv = await createCSVInputforDB(store.db, store.name);
        data.push(csv);
    }
    const blob = await downloadZip(data).blob();
    const now = new Date();
    downloadBlob(blob, `carbonviz_data_${now.toISOString().split('T')[0]}.zip`);

}

async function createCSVInputforDB(dbStore, name) {
    const data = await downloadDB(dbStore);
    const csvstring = toCSV(data);
    return { name: `${name}.csv`, input: csvstring};
}

function toCSV(data) {
    let output = [];
    let headers = [];

    for (let header in data[0]) {
        headers.push(to_csv_value(header));
        headers.push(',');
    }
    headers.push('\n')
    output.push(headers.join(''));

    for (let rowObject of data) {
        let row = [];
        for (let cell in rowObject) {
            row.push(to_csv_value(rowObject[cell]));
            row.push(',');
        }
        row.push('\n');
        output.push(row.join(''));
    }

    return output.join('');
}
function to_csv_value(value) {
    value = value.toString();
    let output = '"';
    output += value.replace('"', '\\"');
    return output + '"';
}

function downloadBlob(blob, filename) {
    const anchor = document.createElement('a');
    anchor.setAttribute('download', filename);
    const url = URL.createObjectURL(blob);
    anchor.setAttribute('href', url);
    anchor.click();
    URL.revokeObjectURL(url);
}