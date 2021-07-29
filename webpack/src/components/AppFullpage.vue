<script>
import {ref, provide} from 'vue';
import LocationHashRouter from '../composables/LocationHashRouter';
import Live from '../pages/Live.vue';

// Hash's name must mach the Page's name in the pages folder
const hashRoutes = {
  '#Live': 'Live consumption',
  '#Statistics': 'Statistics',
  '#Journey': "Data's journey",
  '#Method': 'Method & links',
  '#Partners': 'Partners'
};

export default {
  components: { Live },

  setup(props, context) {
    const {currentHash, currentPage} = LocationHashRouter(hashRoutes);
    const subNav = ref([]);
    provide('setSubNav', nav => subNav.value = nav);
    return {subNav, hashRoutes, currentHash, currentPage};
  }

}
</script>

<template>
  <div class="wrapper">
    <div data-area="logo"></div>
    <h1 data-area="title">Carbonviz</h1>
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
          <a :data-section="id" @click.prevent="">{{ label }}</a>
        </li>
      </ul>
    </nav>
    <main data-area="body">
      <Live v-show="currentHash === '#Live'"></Live>
      <transition name="fade" mode="out-in">
          <component :is="currentPage" v-if="currentHash !== '#Live'"></component>
      </transition>
    </main>
  </div>
</template>

<style>
  * { box-sizing: border-box }
  body {
    margin: 0;
    padding: 0;
  }
  :root {
    --trans-time: 0.3s;
  }
</style>

<style scoped>
  [data-area="logo"] {grid-area: logo}
  [data-area="title"] {grid-area: title}
  [data-area="nav"] {grid-area: nav}
  [data-area="subnav"] {grid-area: subnav}
  [data-area="body"] {grid-area: body}
  .wrapper {
    font-family: Roboto;
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
  }
  [data-area="subnav"] li {
    display: inline-block;
  }
  [data-area="subnav"] a {
    cursor: pointer;
    display: inline-block;
    text-align: center;
    color:#BFBFBF;
    min-width: 200px;
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
    height: 800px;
  }
  /* Vue3 transition */
  .fade-enter-active, .fade-leave-active {
    transition: all var(--trans-time);
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
</style>