import { downloadData } from './indexedDB.js';

export function downloadCSV(dbStore) {
    loadAndDownloadData(dbStore).catch(console.warn);
}

async function loadAndDownloadData(dbStore) {
    const data = await downloadData(dbStore);
    const csvstring = toCSV(data);
    const blob = createCSVFileFromString(csvstring);
    downloadBlob(blob, dbStore+'.csv');
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
function createCSVFileFromString(string) {
    const csv_mime_type = 'text/csv';
    return new Blob([string], { type: csv_mime_type });
}
function downloadBlob(blob, filename) {
    const anchor = document.createElement('a');
    anchor.setAttribute('download', filename);
    const url = URL.createObjectURL(blob);
    anchor.setAttribute('href', url);
    anchor.click();
    URL.revokeObjectURL(url);
}