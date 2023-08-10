import {createApp} from 'vue';
import { createI18n } from 'vue-i18n'
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

export const popup = createApp(PopupPage).use(i18n).mount('#popupPage');
