<script>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import History from './History.vue';
import Analogies from './Analogies.vue';
import Trends from './Trends.vue';
import Settings from './Settings.vue';
import { saveSettings, retrieveSettings } from '../../../settings/settings.js';
import { setup as setupExtensionTab } from '../composables/tab';

export default {
  components: {
    History, Analogies, Trends, Settings
  },
  setup() {
    let currentView = ref("history");
    const { t, locale } = useI18n();

    function changeLang(lang) {
      saveSettings('lang', lang);
      locale.value = lang;
    }

    onMounted(async () => {
      const settings = await retrieveSettings();
      locale.value = settings.lang;
    });

    function viewChange (newTab) {
      currentView.value = newTab;
    }
    const { checkbox, openNewTabDialog, addPluginToNewTab } = setupExtensionTab();

    return { t, locale, currentView, changeLang, viewChange, checkbox, openNewTabDialog, addPluginToNewTab};
  }
}

</script>

<template>
    <div class="container" id="carbonViz">
      <div id="tabs">
        <button :class="currentView === 'analogies' ? 'activeTab' : '' " @click='viewChange("analogies")'>{{ t('global.analogies') }}</button>
        <button :class="currentView === 'history' ? 'activeTab' : '' " @click='viewChange("history")'>{{ t('global.history') }}</button>
        <button :class="currentView === 'statistics' ? 'activeTab' : '' " @click='viewChange("statistics")'>{{ t('global.trends') }}</button>
        <button :class="currentView === 'settings' ? 'activeTab' : '' " @click='viewChange("settings")'>{{ t('global.settings') }}</button>
      </div>
      <div id="view">
        <History v-if="currentView === 'history'"></History>
        <Analogies v-if="currentView === 'analogies'"></Analogies>
        <Trends v-if="currentView === 'statistics'" @show-settings='viewChange("settings")'></Trends>
        <Settings v-if="currentView === 'settings'"></Settings>
      </div>
      <div id="footer">
        <div data-area="logo" id="appTitle"></div>
        <h2 data-area="title"> {{ t('appTitle') }} </h2>
        <div class="tab-action">
          <div data-area="logo" id="openTab"></div>
          <button id="openNewTab" @click='openNewTabDialog()'> {{ t('global.newTab') }} </button>
        </div>
        <div id="lang"><button @click='changeLang("en")'>EN</button><button @click='changeLang("fr")'>FR</button></div>
        <div data-area="logo"><a href="https://www.equiwatt-lausanne.ch/" target="_blank"><div id="logoEquiwatt"></div></a></div>
      </div>
    </div>
</template>


<style scoped>
.container {
  /*  height: 600px;
      width: 500px; */
  display: grid;
  grid-template-rows: 70px 480px 50px;
  grid-template-areas:
    "header"
    "body"
    "footer"
}
#tabs {
  grid-area: header;
}
#view {
  grid-area: body;
}
#footer {
  grid-area: footer;
}
.container{
  width: auto;
  padding: 0% 15px;
}
#tabs {
  display: flex;
  width: 100%;
}
#tabs button {
  flex-grow: 1;
  color: var(--light-grey);
  font-size: 1.25rem;
}
#tabs button.activeTab {
  color: var(--black);
}
#footer {
  display: flex;
  width: 100%;
}
#openNewTab {
  color: black;
  font-weight: 400;
}
#lang {
  display: flex;
  align-items: center;
  flex-grow: 1;
}
/* title */
[data-area="title"] {
  padding: 0px 4px;
  margin: auto;
  text-align: left;
  color: var(--dark-grey);
  font-size: 0.75rem;
  font-style: normal;
  font-weight: 400;
  line-height: 140%;
}
/* logo */
[data-area="logo"] {
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
}
#footer .tab-action {
  display:flex;
  justify-content: center;
  flex-grow: 1;
}
[data-area="logo"]#appTitle::before {
  display: inline-block;
  content: ' ';
  background: url("../assets/icons/ico_footer.svg") no-repeat;
  width: 20px;
  height: 20px;
  margin-bottom: 3px;
}
#logoEquiwatt::before {
  display: inline-block;
  content: ' ';
  background: url("../assets/icons/logos/logoEquiwatt.svg") no-repeat;
  width: 70px;
  height: 15px;
}
[data-area="logo"]#openTab::before {
  display: inline-block;
  content: ' ';
  background: url("../assets/icons/iconOpenTab.svg") no-repeat;
  width: 13px;
  height: 13px;
}
</style>

<style>
/* styles for elementPlus HTML after build or targets outside of template*/
body {
  background-color: white;
  margin: 0px;
  font-family: Roboto, system-ui, Arial, sans-serif !important;
}
body * {
  font-family: Roboto, system-ui, Arial, sans-serif !important;
}
#popupPage{
  height: 600px;
  width: 500px;
}
/* HistoryStratum labels container on popup have wider width */
#history .summary .label {
  left: 5px;
}
</style>

<style>
body {
  font-size: 0.75rem;
}
</style>