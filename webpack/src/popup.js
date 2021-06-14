import {createApp} from 'vue';
import CounterCo2Data from './components/CounterCo2Data.vue';
import History from './components/History.vue';

export const co2DataCounter = createApp(CounterCo2Data).mount('#vue-co2-data-counter');
export const historyCO2 = createApp(History, {type: 'co2', stage:0 }).mount('#vue-history-co2');
export const historyData = createApp(History, {type: 'data', stage: 0}).mount('#vue-history-data');