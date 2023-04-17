<script>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n'
import { ElTabs, ElTabPane } from 'element-plus';
import History from './History.vue';
import Analogies from './Analogies.vue';
import Statistics from './Statistics.vue';

export default {
  components: {
    ElTabs, ElTabPane, History, Analogies, Statistics
  },
  setup() {
    let currentView = ref("history");
    const { t } = useI18n({});
    function openNewTabDialog () {
      const openTabDialog = window.document.getElementById("tabDialog");
      if (typeof openTabDialog.showModal === "function") {
        openTabDialog.showModal();
      } else {
        // The <dialog> API is not supported by this browser
        //addPluginToNewTab();
        console.log("addPluginToNewTab tbd");
      }
    }
    function viewChange (newTab) {
      currentView.value = newTab;
    }
    return { t, currentView, openNewTabDialog, viewChange};
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
        <input type="checkbox" id="disableNewTabConfirmation" name="tabConfirmation">
        <label for="tabConfirmation">{{ t('global.askAgain') }}</label>
        <menu>
          <button value="cancel">{{ t('global.cancel') }}</button>
          <button id="confirmBtn" value="default">{{ t('global.newTab') }}</button>
        </menu>
      </form>
    </dialog>
    <div class="container" id="carbonViz">
      <div id="tabs">
        <button :class="currentView === 'analogies' ? 'activeTab' : '' " @click='viewChange("analogies")'>{{ t('global.analogies') }}</button>
        <button :class="currentView === 'history' ? 'activeTab' : '' " @click='viewChange("history")'>{{ t('global.history') }}</button>
        <button :class="currentView === 'statistics' ? 'activeTab' : '' " @click='viewChange("statistics")'>{{ t('global.statistics') }}</button>
      </div>
      <History v-if="currentView === 'history'"></History>
      <Analogies v-if="currentView === 'analogies'"></Analogies>
      <Statistics v-if="currentView === 'statistics'"></Statistics>
      <div id="footer">
        <div data-area="logo" id="appTitle"></div>
        <h4 data-area="title"> {{ t('appTitle') }} </h4>
        <div data-area="logo" id="openTab"></div>
        <button id="openNewTab" @click='openNewTabDialog()'> {{ t('global.newTab') }} </button>
        <div data-area="logo" id="logoEquiwatt"></div>
      </div>
    </div>
</template>


<style scoped>
.container{
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
#tabs {
  display: flex;
  width: 70%;
  height: 70px;
  margin-bottom: 20px;
}
#tabs button {
  flex-grow: 1;
  background-color: var(--light-grey);
  color: var(--dark-grey);
  font-size: 22px;
}
#tabs button.activeTab {
  background-color: var(--white);
  color: var(--black);
}
#footer {
  display: flex;
  width: 100%;
}
#openNewTab {
  color: var(--grey);
}
/* title */
[data-area="title"] {
  padding: 0px 10px;
  text-align: left;
  font-weight: 900;
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
  background: url("../icons/logoEquiwatt.svg") no-repeat;
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