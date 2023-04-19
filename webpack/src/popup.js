import {createApp} from 'vue';
import { createI18n } from 'vue-i18n'   
import CounterCo2Data from './components/CounterCo2Data.vue';
import History from './components/History.vue';
import PopupPage from './components/Popup.vue';
import "./assets/base.css";

// import i18n resources
import en from './locales/en.json'
import fr from './locales/fr.json'

const userLang = navigator.languages[0].slice(0, 2);

const i18n = createI18n({
  locale: userLang,
  legacy: false,
  messages: {
    en,
    fr
  }
})

/* 
export const co2DataCounter = createApp(CounterCo2Data).mount('#vue-co2-data-counter');
export const historyCO2 = createApp(History, {type: 'co2' }).mount('#vue-history-co2');
export const historyData = createApp(History, {type: 'data' }).mount('#vue-history-data');
*/

export const popup = createApp(PopupPage).use(i18n).mount('#popupPage');
