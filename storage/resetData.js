import { deleteStore } from './indexedDB.js';

export async function eraseAll() {
    // Main DB tables
    const stores = ['dataTimeStamp', 'domains', 'history', 'historySummary'];
    // Monthly summariey
    for (const month of [1,2,3,4,5,6,7,8,9,10,11,12]) {
        stores.push(`domains_month_${month}`);
    }
    for (const day of [0,1,2,3,4,5,6]) {
        stores.push(`domains_day_${day}`);
    }
    const data = [];
    for (const store of stores) {
      deleteStore(store);
    }
}
