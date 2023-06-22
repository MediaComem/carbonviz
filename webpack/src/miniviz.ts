import {createApp} from 'vue';
import { createI18n } from 'vue-i18n';
import MiniViz from './components/MiniViz.vue';
import "./assets/base.css";

// import i18n resources
import en from './locales/en.json'
import fr from './locales/fr.json'

const i18n = createI18n({
  locale: 'fr',
  legacy: false,
  fallbackLocale: 'en',
  messages: {
    en,
    fr
  }
})

export const miniviz = createApp(MiniViz).use(i18n);
