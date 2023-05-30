<script>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n'
import History from './History.vue';
import Analogies from './Analogies.vue';
import Trends from './Trends.vue';
import Settings from './Settings.vue';
import { setup as setupExtensionTab } from '../composables/tab';

export default {
  components: {
    History, Analogies, Trends, Settings
  },
  setup() {
    let currentView = ref("history");
    const { t, locale } = useI18n();

    function changeLang(lang) {
      this.locale = lang;
    }

    function viewChange (newTab) {
      currentView.value = newTab;
    }
    const { checkbox, openNewTabDialog, addPluginToNewTab } = setupExtensionTab();

    return { t, locale, currentView, changeLang, viewChange, checkbox, openNewTabDialog, addPluginToNewTab};
  }
}

</script>

<template>
    <dialog id="tabDialog">
      <form method="dialog">
        <p>{{ t('components.popup.messages.openTab') }}<br>
          {{ t('components.popup.messages.checkActivity') }}<br>
          {{ t('components.popup.messages.accessPopup') }}
        </p>
        <input type="checkbox" ref="checkbox" name="tabConfirmation">
        <label for="tabConfirmation">{{ t('global.askAgain') }}</label>
        <menu>
          <button value="cancel">{{ t('global.cancel') }}</button>
          <button id="confirmBtn" @click='addPluginToNewTab()' value="default">{{ t('global.newTab') }}</button>
        </menu>
      </form>
    </dialog>
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
        <div data-area="logo" id="openTab"></div>
        <button id="openNewTab" @click='openNewTabDialog()'> {{ t('global.newTab') }} </button>
        <div id="lang"><button @click='changeLang("en")'>EN</button><button @click='changeLang("fr")'>FR</button></div>
        <div data-area="logo" id="logoEquiwatt"></div>
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
  font-size: 22px;
}
#tabs button.activeTab {
  color: var(--black);
}
#footer {
  display: flex;
  width: 100%;
}
#openNewTab {
  color: var(--grey);
}
#lang {
  display: flex;
  align-items: center;
}
/* title */
[data-area="title"] {
  padding: 0px 10px;
  margin: auto;
  text-align: left;
  font-weight: 900;
  text-decoration: underline;
}
/* logo */
[data-area="logo"] {
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
}
#footer #logoEquiwatt {
  flex-grow: 1;
}
[data-area="logo"]#appTitle::before {
  display: inline-block;
  content: ' ';
  background: url("../icons/icon16.png") no-repeat;
  width: 16px;
  height: 16px;
}
[data-area="logo"]#logoEquiwatt::before {
  display: inline-block;
  content: ' ';
  background: url("../icons/logos/logoEquiwatt.svg") no-repeat;
  width: 80px;
  height: 20px;
}
[data-area="logo"]#openTab::before {
  display: inline-block;
  content: ' ';
  background: url("../icons/iconOpenTab.svg") no-repeat;
  width: 13px;
  height: 13px;
}
</style>

<style>
/* styles for elementPlus HTML after build */
</style>