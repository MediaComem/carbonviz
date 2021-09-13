import {createApp} from 'vue';
import AppFullpage from './components/AppFullpage.vue';
import ElementPlus from 'element-plus'

export const fullpage = createApp(AppFullpage).use(ElementPlus).mount('#fullpage');
