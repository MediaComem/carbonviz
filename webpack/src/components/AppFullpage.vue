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
      hashRoutes['#FAQ'] = t('global.faq');
      hashRoutes['#Settings'] = t('global.settings');
      hashRoutes['#Partners'] = t('global.partners');
    });

    const {currentHash, currentPage} = LocationHashRouter(hashRoutes);

    const subNav = ref([]);
    const subnavPages = ['#Trends', '#FAQ'];
    const scroll = ref(null);
    provide('setSubNav', (nav) => {
      subNav.value = nav;
    });

    const onSubnavClick = evt => {
      const data = evt.currentTarget.dataset;
      const scrollTo = document.querySelector(`[data-section="${data.scrollto}"]`);
      const topPos = scrollTo?.offsetTop ?? 0;
      if (scroll.value) {
        scroll.value.scrollTop = topPos - 120;
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

    return {scroll, subNav, subnavPages, hashRoutes, currentHash, currentPage, onSubnavClick, t, changeLang};
  }

}
</script>

<template>
  <div id="carbonViz" class="wrapper" ref="scroll">
    <div data-area="logo">
      <h1>{{ t('appTitle') }}</h1>
      <img src="../../../assets/icons/logos/logo-equiwatt-large.png" class="logoEquiwatt">
    </div>
    <div data-area="language">
      <div id="lang"><button @click='changeLang("en")'>EN</button><button @click='changeLang("fr")'>FR</button></div>
    </div>
    <nav data-area="nav">
      <ul>
        <li v-for="(label, hash) in hashRoutes" :key="hash">
          <a :href="hash" :class="{active: hash === currentHash }">{{ label }}</a>
        </li>
      </ul>
    </nav>
    <nav data-area="subnav" :class="{ hidden: !subnavPages.includes(currentHash)}">
      <ul>
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
  body {
    margin: 0;
    padding: 0;
    min-width: 800px;
    font-size: 0.75rem;
  }
  :root {
    --trans-time: 0.3s;
  }
  [data-area="body"] {
    padding: 50px 0px 0px 0px;
  }
  [data-area="body"] h1 {
    font-size: 1.5rem;
    font-weight: 900;
    margin: 0;
    padding: 30px 0 17px 0px;
  }
  [data-area="body"] h2 {
    font-size: 1.4rem;
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
    font-size: 1rem;
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
  [data-area="language"] {grid-area: language;}
  [data-area="nav"] {grid-area: nav;}
  [data-area="subnav"] {grid-area: nav;}
  [data-area="body"] {grid-area: body}
  .wrapper {
    font-family: Roboto, system-ui, Arial, sans-serif ;
    display: grid;
    grid-template-columns: 1fr 300px 400px 300px 1fr;
    grid-template-rows: 100px 70px 1fr;
    grid-template-areas:
      ". logo   .      language ."
      ". nav    nav    nav      ."
      ". body   body   body     .";
    overflow: auto;
  }

  [data-area="subnav"] {
    margin-top: 70px;
  }

  [data-area="subnav"].hidden {
    display:none;
  }

  /* logo */
  [data-area="logo"] {
    display: flex;
    align-items: center;
    flex-direction: row;
  }
  [data-area="logo"]::before {
    display: inline-block;
    padding-right: 15px;
    content: ' ';
    background: url("../assets/icons/icon48.png") no-repeat;
    width: 42px;
    height: 48px;
  }

  .logoEquiwatt {
    width: 107px;
    height: auto;
    margin-left: 20px;
    margin-top: 3px;
  }

  [data-area="language"] {
    align-self: center;
  }

  #lang {
    display: flex;
    align-items: center;
    justify-content: end;
  }

  /* nav + subnav*/
  [data-area="nav"] {
    font-size: 1.125rem;
    font-weight: 700;
    justify-self: center;
    position: sticky;
    top: 0px;
    width: 1000px;
    height: 70px;
    margin: auto;
    background-color: white;
    z-index: 1000;
  }
  [data-area="nav"] ul, [data-area="subnav"] ul {
    padding-left: 0px;
    text-align: center;
  }
  [data-area="nav"] li, [data-area="subnav"] li {
    display: inline-block;
  }
  [data-area="nav"] a {
    display: inline-block;
    text-align: center;
    color:#CECECE;
    width: 166px;
    text-decoration: none;
    padding-bottom: 8px;
    padding-top: 8px;
    border-bottom: solid 2px;
    border-bottom-color: #BFBFBF;
    transition: border-bottom-color var(--trans-time), color var(--trans-time);
  }
  [data-area="nav"] a.active, [data-area="nav"] a:hover {
    color:black;
    border-bottom-color: black;
  }
  /* sub nav */
  [data-area="subnav"] {
    font-size: 0.75rem;
    justify-self: center;
    position: sticky;
    top: 70px;
    width: 1000px;
    height: 48px;
    background-color: #F8F8F8;
    z-index: 1000;
  }
  [data-area="subnav"] a {
    display: inline-block;
    text-align: center;
    color:black;
    text-decoration: none;
    padding: 3px 8px 0px 8px;
    cursor: pointer;
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
