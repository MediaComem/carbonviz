import {createApp} from 'vue';
import { createI18n } from 'vue-i18n';
import AppFullpage from './components/AppFullpage.vue';
import "./assets/base.css";

// import i18n resources
import en from './locales/en.json'
import fr from './locales/fr.json'

const userLang = navigator.languages[0].slice(0, 2);

const i18n = createI18n({
  locale: userLang,
  legacy: false,
  fallbackLocale: 'en',
  messages: {
    en,
    fr
  }
})

export const fullpage = createApp(AppFullpage).use(i18n).mount('#fullpage');
