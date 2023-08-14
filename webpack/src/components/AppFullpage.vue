<script>
import {ref, provide, onMounted, watch} from 'vue';
import { useI18n } from 'vue-i18n';
import LocationHashRouter from '../composables/LocationHashRouter';
import Historical from '../pages/Historical.vue';
import { saveSettings, retrieveSettings } from '../../../settings/settings.js';

export default {
  components: { Historical },

  setup(props, context) {
    const { t, locale } = useI18n({});

    // Hash's name must mach the Page's name in the pages folder
    const hashRoutes = {
      '#Historical': t('global.history'),
      '#Analogies': t('global.analogies'),
      '#Trends': t('global.trends'),
      '#Journey': t('global.data_journey'),
      '#FAQ': t('global.faq'),
      '#Settings': t('global.settings'),
      '#Partners': t('global.partners'),
    };

    // Watch for changes to the locale value
    watch(locale, async (newLocale) => {
      // Update the hashRoutes object with the new translations
      hashRoutes['#Historical'] = t('global.history');
      hashRoutes['#Analogies'] = t('global.analogies');
      hashRoutes['#Trends'] = t('global.trends');
      hashRoutes['#Journey'] = t('global.data_journey');
      hashRoutes['#FAQ'] = t('global.faq');
      hashRoutes['#Settings'] = t('global.settings');
      hashRoutes['#Partners'] = t('global.partners');
    });

    const {currentHash, currentPage} = LocationHashRouter(hashRoutes);

    const subNav = ref([]);
    const scrollElt = ref(null);
    provide('setSubNav', (nav, scroll = undefined) => {
      subNav.value = nav;
      if (scroll)
      {
        scrollElt.value = scroll.value;
      }
    });

    const onSubnavClick = evt => {
      const data = evt.currentTarget.dataset;
      const scrollTo = document.querySelector(`[data-section="${data.scrollto}"]`);
      const topPos = scrollTo?.offsetTop ?? 0;
      if (scrollElt.value) {
        scrollElt.value.setScrollTop(topPos);
      }
    }

    function changeLang(lang) {
      saveSettings('lang', lang);
      locale.value = lang;
    }

    onMounted(async () => {
      const settings = await retrieveSettings();
      locale.value = settings.lang;
    });

    return {subNav, hashRoutes, currentHash, currentPage, onSubnavClick, t, changeLang};
  }

}
</script>

<template>
  <div id="carbonViz" class="wrapper">
    <div data-area="logo"></div>
    <div data-area="title">
      <h1>{{ t('appTitle') }}</h1>
      <div id="lang"><button @click='changeLang("en")'>EN</button><button @click='changeLang("fr")'>FR</button></div>
    </div>
    <img data-area="equiwatt" src="../../../assets/icons/logos/logo-equiwatt-large.png" id="logoEquiwatt">
    <nav data-area="nav">
      <ul>
        <li v-for="(label, hash) in hashRoutes" :key="hash">
          <a :href="hash" :class="{active: hash === currentHash }">{{ label }}</a>
        </li>
      </ul>
    </nav>
    <nav data-area="subnav">
      <ul v-show="currentHash !== '#Historical'">
        <li v-for="(label, id) in subNav" :key="id">
          <a :data-scrollto="id" @click.prevent="onSubnavClick">{{ label }}</a>
        </li>
      </ul>
    </nav>
    <div data-area="body">
      <Historical v-show="currentHash === '#Historical'"></Historical>
      <transition name="fade" mode="out-in">
          <component :is="currentPage" v-if="currentHash !== '#Historical'"></component>
      </transition>
    </div>
  </div>
</template>

<style>
  /* global */
  * { box-sizing: border-box }
  body {
    margin: 0;
    padding: 0;
    min-width: 800px;
  }
  :root {
    --trans-time: 0.3s;
  }
  [data-area="body"] {
    padding: 10px 10px 0px 0px;
  }
  [data-area="body"] h1 {
    font-size: 24px;
    font-weight: 900;
    margin: 0;
    padding: 30px 0 17px 0px;
  }
  [data-area="body"] h2, [data-area="body"] h3, [data-area="body"] ul, [data-area="body"] p, [data-area="body"] article > div {
    margin-left: 60px;
  }
  [data-area="body"] h2 {
    font-size: 22px;
    font-weight: 800;
    margin-top: 0;
    padding: 10px 0 17px 0;
  }
  [data-area="body"] h3 {
    font-weight: 600;
    margin-top: 0;
    padding: 0;
  }
  [data-area="body"] p, [data-area="body"] article > div, [data-area="body"] ul li {
    max-width: 600px;
    font-weight: 400;
    font-size: 16px;
  }

  @media (prefers-color-scheme: dark) {
    #fullpage, [data-area="body"] {
      background-color: #262626;
      color: #BFBFBF;
    }
  }

</style>

<style scoped>
  [data-area="logo"] {grid-area: logo;}
  [data-area="title"] {grid-area: title;}
  [data-area="equiwatt"] {grid-area: equiwatt;}
  [data-area="nav"] {grid-area: nav;}
  [data-area="subnav"] {grid-area: subnav;}
  [data-area="body"] {grid-area: body}
  .wrapper {
    font-family: Roboto, Arial, sans-serif ;
    display: grid;
    /* width: 1000px;
    margin: 0 auto; */
    grid-template-columns: 200px minmax(auto, 800px) 300px;
    grid-template-rows: 120px 100px auto;
    grid-template-areas:
      "logo   title equiwatt"
      ".      nav nav"
      "subnav body body"
  }
  /* title */
  [data-area="title"] {
    display: flex;
    flex-direction: column;
    padding-left: 5px;
  }
  [data-area="title"] h1 {
    margin-bottom: 0px;
    align-items: baseline;
    text-align: left;
    font-size: 48px;
    font-weight: 900;
  }
  #lang {
    display: flex;
    align-items: center;
  }
  button {
    background: none;
    color:black;
    border: none;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
  /* logo */
  [data-area="logo"] {
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
  }
  [data-area="logo"]::before {
    display: inline-block;
    padding-right: 15px;
    content: ' ';
    background: url("../assets/icons/icon48.png") no-repeat;
    width: 42px;
    height: 48px;
  }

  [data-area="equiwatt"] {
    width: 200px;
    height: auto;
    margin: auto;
    justify-self: start;
  }

  /* nav */
  [data-area="nav"] {
    font-size: 18px;
    font-weight: 700;
  }
  [data-area="nav"] ul {
    padding-left: 0px;
  }
  [data-area="nav"] li {
    display: inline-block;
  }
  [data-area="nav"] a {
    display: inline-block;
    text-align: center;
    color:#BFBFBF;
    min-width: 150px;
    text-decoration: none;
    padding-bottom: 8px;
    padding-top: 8px;
    border-bottom: solid 5px;
    border-bottom-color: #BFBFBF;
    transition: border-bottom-color var(--trans-time), color var(--trans-time);
  }
  [data-area="nav"] a.active, [data-area="nav"] a:hover {
    color:black;
    border-bottom-color: black;
  }
  /* sub nav */
  [data-area="subnav"] {
    font-size: 12px;
    font-weight: 700;
    margin: 25px 0 0 0;
    padding: 0;
  }
  [data-area="subnav"] ul {
    padding-left: 0px;
  }
  [data-area="subnav"] li {
    margin: 0;
    padding: 0;
    list-style-type: none;
    text-align: right;
  }
  [data-area="subnav"] a {
    cursor: pointer;
    display: inline-block;
    color:#BFBFBF;
    min-width: 100px;
    text-decoration: none;
    padding-bottom: 8px;
    transition: color var(--trans-time);
  }
  [data-area="subnav"] a::after {
    display: inline-block;
    content: ' ';
    width: 6px;
    height: 6px;
    border: 1px solid;
    border-color: #BFBFBF;
    background-color: white;
    margin-left: 6px;
    margin-right: 16px;
    border-radius: 12px;
    transition: background-color var(--trans-time), border-color var(--trans-time);
  }
  [data-area="subnav"] a.active, [data-area="subnav"] a:hover {
    color: black;
  }
  [data-area="subnav"] a.active::after, [data-area="subnav"] a:hover::after {
    border-color: black;
    background-color: black;
  }
  /* body */
  [data-area="body"] {
    justify-self: stretch;
    height: calc(100vh - 220px);
  }
  /* Vue3 transition */
  .fade-enter-active, .fade-leave-active {
    transition: all var(--trans-time);
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }

  @media only screen and (max-width: 1000px) {
    .wrapper {
      grid-template-columns: 60px auto 300px;
    }

    [data-area="subnav"] {
      display: none;
    }
  }

  @media (prefers-color-scheme: dark) {
    [data-area="body"] {
      background-color: #262626;
      color: white;
    }
     [data-area="title"] {
      background-color: #262626;
      color: white;
    }
    [data-area="nav"] a.active, [data-area="nav"] a:hover {
      color:white;
      border-bottom-color: white;
    }
    [data-area="subnav"] a.active, [data-area="subnav"] a:hover {
      color: white;
    }
    [data-area="subnav"] a.active::after, [data-area="subnav"] a:hover::after {
      border-color: white;
      background-color: white;
    }
    [data-area="logo"]::before {
      background: url("../assets/icons/icon48Dark.png") no-repeat;
    }
    :deep(.apexcharts-menu) {
      color: black;
    }
    :deep(.apexcharts-text) {
      fill: white;
    }
  }
</style>

<style>
  /* Analogies spacing when no dataType buttons*/
  .AnalogyItem .section {
    margin-top: -60px;
  }
</style>