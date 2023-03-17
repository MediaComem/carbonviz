<script>
import {ref, provide} from 'vue';
import { useI18n } from 'vue-i18n'
import LocationHashRouter from '../composables/LocationHashRouter';
import Live from '../pages/Live.vue';

// Hash's name must mach the Page's name in the pages folder
const hashRoutes = {
  '#Live': 'Live consumption',
  '#Statistics': 'Statistics',
  '#Journey': "Data's journey",
  '#Method': 'Method & links',
  '#About': 'About',
  '#Privacy': 'Data & Privacy'
};

export default {
  components: { Live },

  setup(props, context) {
    const {currentHash, currentPage} = LocationHashRouter(hashRoutes);
    const { t } = useI18n({})

    const subNav = ref([]);
    provide('setSubNav', nav => subNav.value = nav);

    const onSubnavClick = evt => {
      const data = evt.currentTarget.dataset;
      const scrollTo = document.querySelector(`[data-section="${data.scrollto}"]`);
      const topPos = scrollTo?.offsetTop ?? 200;
      document.querySelector('[data-area="body"]').scrollTop = topPos - 200;
    }

    return {subNav, hashRoutes, currentHash, currentPage, onSubnavClick, t};
  }

}
</script>

<template>
  <div class="wrapper">
    <div data-area="logo"></div>
    <h1 data-area="title">{{ t('appTitle') }}</h1>
    <nav data-area="nav">
      <ul>
        <li v-for="(label, hash) in hashRoutes" :key="hash">
          <a :href="hash" :class="{active: hash === currentHash }">{{ label }}</a>
        </li>
      </ul>
    </nav>
    <nav data-area="subnav">
      <ul v-show="currentHash !== '#Live'">
        <li v-for="(label, id) in subNav" :key="id">
          <a :data-scrollto="id" @click.prevent="onSubnavClick">{{ label }}</a>
        </li>
      </ul>
    </nav>
    <main data-area="body">
      <live v-show="currentHash === '#Live'"></live>
      <transition name="fade" mode="out-in">
          <component :is="currentPage" v-if="currentHash !== '#Live'"></component>
      </transition>
    </main>
  </div>
</template>

<style>
  /* global */
  * { box-sizing: border-box }
  body {
    margin: 0;
    padding: 0;
  }
  :root {
    --trans-time: 0.3s;
  }
  [data-area="body"] h1 {
    font-size: 24px;
    font-weight: 900;
    margin: 0;
    padding: 34px 0 17px 59px;
  }
  [data-area="body"] h1::after {
    display: block;
    margin: 17px 84px 0 23px;
    content: '';
    border-bottom: solid #BFBFBF 2px;
  }
  [data-area="body"] h2, [data-area="body"] h3, [data-area="body"] ul, [data-area="body"] p, [data-area="body"] article > div {
    margin-left: 122px;
  }
  [data-area="body"] h2 {
    font-size: 22px;
    font-weight: 800;
    margin-top: 0;
    padding: 34px 0 17px 0;
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
  [data-area="nav"] {grid-area: nav;}
  [data-area="subnav"] {grid-area: subnav;}
  [data-area="body"] {grid-area: body}
  .wrapper {
    font-family: Roboto, Arial, sans-serif ;
    display: grid;
    /* width: 1000px;
    margin: 0 auto; */
    grid-template-columns: 200px auto;
    grid-template-rows: 120px 100px auto;
    grid-template-areas:
      "logo   title"
      ".      nav"
      "subnav body"
  }
  /* title */
  [data-area="title"] {
    padding-left: 5px;
    text-align: left;
    font-size: 48px;
    font-weight: 900;
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
    background: url("../icons/icon48.png") no-repeat;
    width: 42px;
    height: 48px;
  }
  /* nav */
  [data-area="nav"] {
    font-size: 18px;
    font-weight: 700;
  }
  [data-area="nav"] ul {
    padding-left: 70px;
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
    background-color: #F8F8F8;
    width: 1000px;
    height: calc(100vh - 240px);
    padding-bottom: 20px;
    overflow: auto;
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
      background: url("../icons/icon48Dark.png") no-repeat;
    }
    :deep(.apexcharts-menu) {
      color: black;
    }
    :deep(.apexcharts-text) {
      fill: white;
    }
  }
</style>