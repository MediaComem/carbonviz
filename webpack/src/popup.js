import {createApp} from 'vue';
import { createI18n } from 'vue-i18n'   
import CounterCo2Data from './components/CounterCo2Data.vue';
import History from './components/History.vue';

// import i18n resources
import en from './locales/en.json'
import fr from './locales/fr.json'

const i18n = createI18n({
  locale: 'fr',
  legacy: false,
  messages: {
    en,
    fr
  }
})

export const co2DataCounter = createApp(CounterCo2Data).use(i18n).mount('#vue-co2-data-counter');
export const historyCO2 = createApp(History, {type: 'co2' }).use(i18n).mount('#vue-history-co2');
export const historyData = createApp(History, {type: 'data' }).use(i18n).mount('#vue-history-data');