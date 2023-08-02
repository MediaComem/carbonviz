 <template>
  <div class="extension" v-if="showMiniViz">
    <div class="miniviz" :class="{ 'hidden': showInteraction}" id="miniViz_container">
      <div class="anim" :class="dataType === 'data' ? 'data' : 'co2'" @mouseover="showDescAnimation" @click="onMiniVizClick">
        <img v-for="(item, index) in iconBar" key="item" class="image" :class="currentMeter[dataType][item] ? 'fill': ''" :src="asset" height="20" width="20">
      </div>
      <div
        id="description"
        :class="{
          hidden: !showDescription,
          co2: dataType === 'co2',
          data: dataType === 'data',
        }"
        @click="onMiniVizClick"
      >
        <img class="image" :src="asset" height="40" width="40">
        <p>{{ t(`components.miniViz.description.${dataType}`,
            {
              data: dataType === 'co2' ? formatCo2(dayTotals.energy) : formatSize(dayTotals.data),
              time: createTimeString(dayTotals.time),
              amount: getAnalogyValue(customAnalogyNames, dataType, dayTotals, activeIndex).amount + getAnalogyText(customAnalogyNames, dataType, dayTotals, activeIndex)
            }
          )}}
        </p>

      </div>
      <div
        id="notification"
        :class="{
          hidden: !showNotification,
          co2: dataType === 'co2',
          data: dataType === 'data',
        }"
        @click="onNotificationClick"
      >
        <div class="notificationContainer" v-if="notificationType === 'weekly'">
          <img class="exit" :src="closeBtn" alt="X">
          <div id="stats">
            <h3 class="title"> {{ t('components.miniViz.notification.weekly.title') }} </h3>
            <div id="current">
              <p>
                {{ t(`components.miniViz.notification.weekly.${dataType}`,
                  {
                    data: dataType === 'co2' ? formatCo2(weeklyTotals.currentWeek[dataType]) : formatSize(weeklyTotals.currentWeek[dataType])
                  }
                )}}
              </p>
              <p> {{ t(`components.miniViz.notification.weekly.days`)}} </p>
              <p>
                {{ t(`components.miniViz.notification.weekly.analogy`,
                  { amount: getAnalogyValue(customAnalogyNames, dataType, dayTotals, activeIndex).amount + getAnalogyText(customAnalogyNames, dataType, dayTotals, activeIndex) }
                )}}
              </p>
            </div>
            <div id="average">
              <p>
                {{ t('components.miniViz.notification.weekly.average') }}
                <strong> {{ dataType === 'co2' ? formatCo2(weeklyTotals.currentWeek.co2 / 7, 0) : formatSize(weeklyTotals.currentWeek.data / 7, 0) }} </strong>
              </p>
              <p id="trend">
                {{ t('components.miniViz.notification.weekly.trend') }}:
              </p>
              <div v-if="weeklyTotals.trend[dataType] !== 0">
                <span v-if="weeklyTotals.trend[dataType] > 0">+</span>
                <span v-if="weeklyTotals.trend[dataType] < 0">-</span>
                {{ Math.round(Math.abs(100 * weeklyTotals.trend[dataType]))}} %
                <svg :class="weeklyTotals.trend[dataType] > 0 ? 'up' : 'down'" width="23" height="23" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                  <path id="arrow" d="M0.93934 19.9393C0.353553 20.5251 0.353553 21.4749 0.93934 22.0607C1.52513 22.6464 2.47487 22.6464 3.06066 22.0607L0.93934 19.9393ZM22.5 2C22.5 1.17157 21.8284 0.5 21 0.5H7.5C6.67157 0.5 6 1.17157 6 2C6 2.82843 6.67157 3.5 7.5 3.5H19.5V15.5C19.5 16.3284 20.1716 17 21 17C21.8284 17 22.5 16.3284 22.5 15.5V2ZM3.06066 22.0607L22.0607 3.06066L19.9393 0.93934L0.93934 19.9393L3.06066 22.0607Z" fill="currentColor" />
                </svg>
              </div>
              <div v-else>
                -
              </div>
            </div>
          </div>
          <div id="advise">
            <h3>Recommandations</h3>
            <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laborum quo quis, porro nostrum pariatur repellendus dicta sequi ipsam, nesciunt,
              doloremque nam. Enim quo accusamus explicabo deserunt upiditate et, doloremque architecto excepturi.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="actionContainer" v-if="interactive">
      <div class="actionPanel" :class="{ 'show': showInteraction, 'hide': !showInteraction }">
        <Logo class="icon"></Logo>
        {{ t('appTitle') }}
        <svg class="icon cvz-interactive" width="15" height="15" fill="none" xmlns="http://www.w3.org/2000/svg" @click="openTabExtension">
          <path :fill="color" fill-rule="evenodd" clip-rule="evenodd" d="M5.56068 3.51027H3.51027V11.4897H11.4854V9.43932H12.9957V11.8139C12.9957 12.468 12.4637 13 11.8096 13H3.18609C2.53202 13 2 12.468 2 11.8139V3.18609C2 2.53202 2.53202 2 3.18609 2H5.56068V3.51027ZM7.93124 2.04474C7.41618 2.04474 6.99685 2.46406 6.99685 2.97912V7.07324C6.99685 7.5883 7.41618 8.00762 7.93124 8.00762H12.0254C12.5404 8.00762 12.9597 7.5883 12.9597 7.07324V2.97912C12.9597 2.46406 12.5404 2.04474 12.0254 2.04474H7.93124Z"/>
        </svg>
        <span class="vl"></span>
        <svg class="closeIcon cvz-interactive" width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 12.2065L12.2065 1.00003M12.2065 12.2065L1 1.00003" stroke="#333333" stroke-width="2"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

const HIDE_MINIVIZ_DELAY = 5000;
const SHOW_DESC_NOTIF_DELAY = 10000;

import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatSize, formatCo2 } from '../../../utils/format';
import { retrieveSettings } from '../../../settings/settings.js';
import { analogiesCo2, analogiesData, analogyNames, getAnalogyValue, getAnalogyText } from '../../../utils/analogies';

export default {
  props: {
  },
  setup(props) {
    // Setup color theme
    const color = ref('#333');
    const { t, locale } = useI18n();
    const showMiniViz = ref(true);
    const showDescription = ref(false);
    const showNotification = ref(false);
    const showInteraction = ref(false);
    const interactive = ref(false);
    const closeBtn = chrome.runtime.getURL(`icons/roundBtnX.svg`);
    let activeIndex = ref(0);
    let dataType = ref('co2');
    let notificationType = ref('weekly');
    const dayTotals = ref({
      co2: 0,
      data: 0,
      energy: 0,
      time: 0
    });
    const weeklyTotals = ref({
      currentWeek: {data: 0, energy: 0, co2: 0, computer: { energy: 0, co2: 0}},
      lastWeek: {data: 0, energy: 0, co2: 0, computer: { energy: 0, co2: 0}},
      trend: {co2: 0, data: 0}
    });
    let notification = ref(
      [
        {
          date: '',
          title: '',
          messageHTML: ''
        }
      ]
    );
    let notificationDataJSON = [
      {
        date: '',
        title: '',
        messageHTML: ''
      }
    ];
    // Icon bar of 12
    const iconBar = [0,1,2,3,4,5,6,7,8,9,10,11];
    let currentMeter = {
      co2: Array(12).fill(0),
      shownCo2Desc: false,
      data: Array(12).fill(0),
      shownDataDesc: false
    }
    const analogies = analogyNames; // ** if we want to replace customAnalogyNames and incluide all analogies with some timer to switch betweem them
    const customAnalogyNames = {
      co2: ['boiling'],
      data: ['music' ]
    };

    retrieveSettings().then(settings => {
      showMiniViz.value = settings.showMiniViz;
    });
    const asset = computed(() => {
      if (dataType.value === 'co2') {
        return chrome.runtime.getURL(`icons/analogies/${analogiesCo2[customAnalogyNames[dataType.value][activeIndex.value]].asset}`);
      } else {
        return chrome.runtime.getURL(`icons/analogies/${analogiesData[customAnalogyNames[dataType.value][activeIndex.value]].asset}`);
      }
    });
    const showDescAnimation = () => {
      showDescription.value = true;
      setTimeout( () => showDescription.value = false, SHOW_DESC_NOTIF_DELAY);
    };
    const onMiniVizClick = () => {
      showInteraction.value = true;
      interactive.value = true;
      setTimeout( () => { showInteraction.value = false; interactive.value = false }, HIDE_MINIVIZ_DELAY);
    };
    const onNotificationClick = () => {
      showNotification.value = false
    };

    function switchDataType () {
      if (dataType.value === 'co2') {
        dataType.value = 'data';
      } else { dataType.value = 'co2' }
    }
    // switch dataType every 10mins
    setInterval(function () { switchDataType(); }, 600000);

    function updateIconBar() {
      currentMeter.co2.fill(0);
      currentMeter.data.fill(0);
      const Co2Value = getAnalogyValue(customAnalogyNames, 'co2', dayTotals.value, activeIndex.value).amount;
      const DataValue = getAnalogyValue(customAnalogyNames, 'data', dayTotals.value, activeIndex.value).amount;
      const normalizedCo2 = Co2Value % 12 || 12;
      const normalizedData = DataValue % 12 || 12;
      const Co2Index = 12 - Math.floor(normalizedCo2);
      const DataIndex = 12 - Math.floor(normalizedData);
      currentMeter.co2.fill(1, Co2Index);
      currentMeter.data.fill(1, DataIndex);
      // Switch display to data type which has maxed (0 index) to show its desc
      Co2Index ? dataType.value = 'data' : dataType.value = 'co2';
      // Display description when bar is full once per cycle
      if(Co2Index === 0 && !currentMeter.shownCo2Desc) {
        currentMeter.shownCo2Desc = true;
        showDescAnimation();
      } else if (DataIndex === 0 && !currentMeter.shownDataDesc) {
        currentMeter.shownDataDesc = true;
        showDescAnimation();
      } else {
        currentMeter.shownCo2Desc = false;
        currentMeter.shownDataDesc = false;
      }
    }

    function createTimeString(milliseconds: number) {
      const dateObject = new Date(milliseconds);
      if (dateObject.getHours() > 0) {
          return dateObject.getHours() + 'h' + ' ' + dateObject.getMinutes() + 'min';
        } else if (dateObject.getMinutes() > 0) {
          return dateObject.getMinutes() + 'min' + ' ' + dateObject.getSeconds() + 's';
        } else {
          return dateObject.getSeconds() + 's';
        }
    }

    function buildWeeklyNotification() {
      let currentCo2 = weeklyTotals.value.currentWeek.co2;
      let currentData = weeklyTotals.value.currentWeek.data;
      let previousWeekCo2 = weeklyTotals.value.lastWeek.co2;
      let previousWeekData = weeklyTotals.value.lastWeek.data;
      if (previousWeekCo2 > 0 && previousWeekData > 0) {
        weeklyTotals.value.trend.co2 = (currentCo2 - previousWeekCo2) / previousWeekCo2;
        weeklyTotals.value.trend.data = (currentData - previousWeekData) / previousWeekData;
      } else {
        weeklyTotals.value.trend.co2 = 0;
        weeklyTotals.value.trend.data = 0;
      }
    };

    function buildDailyNotification() { // TBD -- Do we want to change or validate the data??
      return notificationDataJSON;
    };

    function DefaultNotification() {
      return [{
        date: '-',
        title: "No data to display",
        messageHTML: '-'
      }]
    };

    async function displayNotification(type: string) {
      switch(type) {
        case 'weekly':
          await buildWeeklyNotification();
          notificationType.value = 'weekly';
          showNotification.value = true;
          setTimeout( () => showNotification.value = false, SHOW_DESC_NOTIF_DELAY);
          break;
        case 'daily':
          notification.value = await buildDailyNotification();
          if(notification.value.length > 0) {
            notificationType.value = 'daily';
            showNotification.value = true;
          }
          break;
        default:
          notification.value = DefaultNotification();
          showNotification.value = true;
          setTimeout( () => showNotification.value = false,  SHOW_DESC_NOTIF_DELAY);
      }
    }

    chrome.runtime.onMessage.addListener(request => {
      if (request.statistics) {
        // Update stats with todays totals
        const stats = request.statistics;
        if (stats?.extraInfo?.tabIcon?.startsWith('chrome-extension:')) return;
        dayTotals.value = {...stats};
        updateIconBar();
      }
      if (request.weeklynotification) {
        const stats = request.weeklynotification;
        weeklyTotals.value = {...stats, trend: { co2: 0, data: 0 } };
        displayNotification('weekly');
      }
      if (request.dailyNotifications) {
        notificationDataJSON = request.dailyNotifications.data;
        displayNotification('daily');
      }
    });

    const openTabExtension = () => {
      chrome.runtime.sendMessage({ query: 'openExtension' });
    };

    onMounted(async () => {
      const settings = await retrieveSettings();
      locale.value = settings.lang;
    });

    return { color, asset, iconBar, currentMeter, showInteraction, showDescription, showNotification, interactive, customAnalogyNames,
      dayTotals, dataType, activeIndex, notification, showMiniViz, notificationType, weeklyTotals, closeBtn,
      formatCo2, formatSize, createTimeString, openTabExtension, showDescAnimation, onMiniVizClick, t, getAnalogyValue, getAnalogyText,
      onNotificationClick
    }
  }
}
</script>

<style lang="scss" scoped>
.extension {
  all: initial;
}
.miniviz, .actionContainer {
  font-family: Roboto, Arial, sans-serif ;
}
.miniviz {
  all: initial;
  position: fixed;
  top: 5%;
  right: 5px;
  height: auto;
  max-height: 130px;
  width: auto;
  max-width: 270px;
  z-index: 10000;
  &.hidden {
    display: none;
  }
}
.anim {
  display: flex;
  justify-content: space-evenly;
  max-width: 270px;
  margin-right: 0px;
  margin-left: auto;
  background-color: var(--co2);
  border: 2px solid white;
  border-top: 0;
  &.data {
    background-color: var(--data);
  }
  & img {
    opacity: 0.4;
  }
  & img.fill {
    opacity: 1;
  }
}
.miniviz #description, .miniviz #notification {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  max-height: auto;
  max-height: 500px;
  transition: max-height 1.5s linear, opacity 1.5s linear;
  opacity: 1;
  &.hidden {
    max-height: 0px;
    opacity: 0;
  }
  & .image, p {
    margin: 5px;
    margin-left: 0;
    line-height: normal;
    font-size: 12px;
  }
}
.miniviz #description {
  max-width: 270px;
  margin-right: 0px;
  margin-left: auto;
  color: white;
  background-color: var(--co2Active);
  &.data {
    background-color: var(--dataActive);
  }
}
.miniviz #notification {
  width: 100%;
  max-width: 270px;
  flex-wrap: wrap;
  color: black;
  background-color: var(--grey);
  & .notificationContainer {
    width: 100%;
  }
  & .notificationItem {
    flex-basis: 100%;
  }
  & .title {
    margin-bottom: 15px
  }
  & svg.up {
    display: inline-flex;
    color: red;
  }
  & svg.down {
    display: inline-flex;
    transform: rotate(90deg);
    color: var(--green);
  }
}
.exit {
  float: right;
  margin: 10px;
  &:hover {
    cursor: pointer;
  }
}
#stats {
    box-shadow: inset 0px 10px 10px -8px rgba(0, 0, 0, 0.25),
      inset 0px 0px 0px 0px rgba(0, 0, 0, 0);
}
#stats, #advise {
  padding: 10px;
  border: 2px solid white;
  border-top: 0;
}
#stats h3, #stats p, #advise h3 {
  margin-left: 0;
}
#stats #current {
  font-weight: bold;
  margin-bottom: 20px;
}
#stats #trend {
  margin-top: 20px;
}
#advise h3 {
  margin-bottom: 15px
}
.actionContainer {
  position: fixed;
  z-index: 10000;
  width: 138px;
  height: 33px;
  line-height: 33px;
  font-size: 10px;
  right: 10px;
  bottom: 10px;
  &.hidden {
    display: none;
  }
}

.actionPanel {
  position: relative;
  height: 33px;
  background: #FFFFFF;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}

.vl {
  display: block;
  position: absolute;
  right: 34px;
  top: 4px;
  height: 75%;
  border-left: 1px solid #d9d9d9;
  margin: auto;
}

.icon {
  all: initial;
  vertical-align: -0.25em;
  margin-left: 4px;
  margin-right: 4px;
  &.cvz-interactive {
    cursor: pointer;
  }
}

.closeIcon {
  position: absolute;
  right: 11px;
  top: 11px;
}

.fa-icon {
  width: 2em;
  height: 2em;
  vertical-align: -0.125em;
}

.show {
  --translate-amount: 45px;
  animation: slide-up 0.3s ease-out forwards;
}
.hide {
  --translate-amount: 45px;
  animation: slide-down 0.3s ease-out forwards;
}

@keyframes slide-up {
  0% {transform: translateY(var(--translate-amount))}
  100% {transform: translateY(0)}
}

@keyframes slide-down {
  0% {transform: translateY(0)}
  100% {transform: translateY(var(--translate-amount))}
}

</style>

<style>
/* styles for messageHTML which is created after injection */
#notification.data .message a {
  color: #00A0D6;
}
#notification.co2 .message a {
  color: #52B788;
}
</style>