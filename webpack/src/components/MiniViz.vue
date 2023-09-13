 <template>
  <div class="mv-extension" v-if="showMiniViz">
    <div class="mv-miniviz" :class="{ 'hidden': showInteraction, 'mv-positionBottom': mvPosition&POSITION_BOTTOM, 'mv-positionLeft': mvPosition&POSITION_LEFT }" id="mv-miniViz_container">
      <div class="mv-anim" :class="dataType === 'data' ? 'mv-data' : 'mv-co2'" @mouseover="hideMiniViz">
        <img v-for="(item, index) in iconBar" key="item" class="mv-image" :class="{'mv-fill': currentMeter[dataType][item]}" :src="asset" height="20" width="20">
      </div>
      <div
        id="mv-description"
        :class="{
          hidden: !showDescription,
          'mv-co2': dataType === 'co2',
          'mv-data': dataType === 'data'
        }"
        @mouseover="hideMiniViz"
      >
        <img class="mv-image" :src="asset" height="40" width="40">
        <div class="mv-counter">
          <div class="mv-counter-quantity">{{ counterInfo.quantity }}</div>
          <div class="mv-counter-time">{{ counterInfo.time }}</div>
          <div class="mv-counter-analogy">{{ counterInfo.analogy }}</div>
        </div>

      </div>
      <div
        id="mv-notification"
        :class="{
          hidden: !showNotification,
          'mv-co2': dataType === 'co2',
          'mv-data': dataType === 'data',
        }"
      >
        <div
          class="mv-notificationContainer"
          v-if="notificationType === 'weekly'"
        >
          <img class="mv-exit" :src="closeBtn" alt="X" @click="closeNotification" width="15" height="15">
          <div id="mv-stats">
            <div class="mv-title"> {{ t('components.miniViz.notification.weekly.title') }} </div>
            <div id="mv-current" class="mv-summary">
              <p> {{ t(`components.miniViz.notification.weekly.days`)}} </p>
              <p>
                <span id="dataValue">
                  {{ t(`components.miniViz.notification.${dataType}`,
                    {
                      data: dataType === 'co2' ? formatCo2(weeklyTotals.currentWeek[dataType], 0) : formatSize(weeklyTotals.currentWeek[dataType], 0)
                    }
                  )}}
                </span>
                {{ t(`components.miniViz.notification.analogy`,
                  { amount: getAnalogyValue(customAnalogyNames, dataType, weeklyTotals.currentWeek, activeIndex).amount + ' ' + getAnalogyText(customAnalogyNames, dataType, weeklyTotals.currentWeek[dataType], activeIndex, t) }
                )}}
              </p>
            </div>
            <div id="mv-average">
              <div class="averageBox">
                <p>
                  {{ t('components.miniViz.notification.weekly.average') }}
                </p>
                <span> {{ dataType === 'co2' ? formatCo2(weeklyTotals.currentWeek.co2 / 7, 0) : formatSize(weeklyTotals.currentWeek.data / 7, 0) }} / {{ t(`global.day`) }}</span>
              </div>
              <div class="hr"></div>
              <div class="trendBox">
                <p id="mv-trend">
                  {{ t('components.miniViz.notification.weekly.trend') }}:
                </p>
                <div v-if="weeklyTotals.trend[dataType] !== 0">
                  <span v-if="weeklyTotals.trend[dataType] > 0">+</span>
                  <span v-if="weeklyTotals.trend[dataType] < 0">-</span>
                  <span>{{ Math.round(Math.abs(100 * weeklyTotals.trend[dataType]))}} % </span>
                  <svg :class="weeklyTotals.trend[dataType] > 0 ? 'mv-up' : 'mv-down'" width="23" height="23" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                    <path id="arrow" d="M0.93934 19.9393C0.353553 20.5251 0.353553 21.4749 0.93934 22.0607C1.52513 22.6464 2.47487 22.6464 3.06066 22.0607L0.93934 19.9393ZM22.5 2C22.5 1.17157 21.8284 0.5 21 0.5H7.5C6.67157 0.5 6 1.17157 6 2C6 2.82843 6.67157 3.5 7.5 3.5H19.5V15.5C19.5 16.3284 20.1716 17 21 17C21.8284 17 22.5 16.3284 22.5 15.5V2ZM3.06066 22.0607L22.0607 3.06066L19.9393 0.93934L0.93934 19.9393L3.06066 22.0607Z" fill="currentColor" />
                  </svg>
                </div>
                <div v-else>
                  -
                </div>
              </div>
            </div>
            <div class="mv-cta">
              <div id="openTab" :style="{ 'background':'url(' + openTab + ') no-repeat', 'background-size':'cover' }" @click='openExtension'></div>
              <button id="openNewTab" @click='openExtension'> {{ t('components.miniViz.notification.details') }} </button>
            </div>
          </div>
        </div>
        <div
          class="mv-notificationContainer"
          v-if="notificationType === 'daily'"
          @click="onDailyNotificationClick"
        >
        <img class="mv-exit" :src="closeBtn" alt="X" @click="closeNotification">
        <div id="mv-dailyNotification">
          <div class="mv-title"> {{ dailyNotificartion.title }}</div>
          <span v-html="dailyNotificartion.messageHTML"></span>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const HIDE_MINIVIZ_DELAY = 5000;
const SHOW_DESC_NOTIF_DELAY = 10000;

// Use flag for Mniviz position
const POSITION_TOP = 1;
const POSITION_BOTTOM = 2;
const POSITION_RIGHT = 4;
const POSITION_LEFT = 8;

import { computed, ref, onBeforeMount, toRefs, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatSize, formatCo2 } from '../../../utils/format';
import { retrieveSettings } from '../../../settings/settings.js';
import { analogiesCo2, analogiesData, analogyNames, getAnalogyValue, getAnalogyText } from '../../../utils/analogies';

type Counter = {
  count: number,
  previous: number,
  step: number,
  quantityAnalogy: number,
  time: number,
  previousTime: number
}
type Counters = {
  co2: Counter,
  data: Counter
}

const props = defineProps<{
  counters: Counters
}>()

// Setup color theme
const { counters } = toRefs(props);
const color = ref('#333');
const { t, locale } = useI18n();
const showMiniViz = ref(true);
const showDescription = ref(false);
const showNotification = ref(false);
const showInteraction = ref(false);
const interactive = ref(false);
const mvPosition = ref(5);
const closeBtn = chrome.runtime.getURL(`assets/icons/roundBtnX.svg`);
const openTab = chrome.runtime.getURL(`assets/icons/iconOpenTab.svg`);
let activeIndex = ref(0);
let dataType = ref('data');
let notificationType = ref('weekly');
const countersCo2 = ref(counters.value.co2);
const countersData = ref(counters.value.data);
const counterInfo = computed(() => {
  let counters;
  if (dataType.value === 'co2') {
    counters = countersCo2.value;
  } else {
    counters = countersData.value;
  }

  const quantity = counters.count - counters.previous;
  const time = counters.time - counters.previousTime;
  const nbAnalogy = quantity * counters.quantityAnalogy;
  if (dataType.value === 'co2') {
    return {
      quantity: `+ ${t('components.miniViz.notification.co2', { data: formatCo2(quantity * counters.step) })}`,
      time: t('components.miniViz.notification.time', { time: createTimeString(time) }),
      analogy: t('components.miniViz.notification.analogy', { amount: `+${nbAnalogy} ${t('components.analogies.boiling')}` })
    }
  } else {
    return {
      quantity: `+ ${formatSize(quantity * counters.step) }`,
      time: t('components.miniViz.notification.time', { time: createTimeString(time) }),
      analogy: t('components.miniViz.notification.analogy', {amount: `+${nbAnalogy} ${t('components.analogies.music')}` })
    }
  }
})
const weeklyTotals = ref({
  currentWeek: {data: 0, energy: 0, co2: 0, computer: { energy: 0, co2: 0}},
  lastWeek: {data: 0, energy: 0, co2: 0, computer: { energy: 0, co2: 0}},
  trend: {co2: 0, data: 0}
});
let dailyNotificartion = ref({
  date: '',
  title: '',
  messageHTML: ''
});
// Icon bar of 12
const iconBar = [0,1,2,3,4,5,6,7,8,9,10,11];
let currentMeter = reactive({
  co2: Array(12).fill(0),
  data: Array(12).fill(0),
});
const analogies = analogyNames; // ** if we want to replace customAnalogyNames and incluide all analogies with some timer to switch betweem them
const customAnalogyNames = {
  co2: ['boiling'],
  data: ['music' ]
};
const asset = computed(() => {
  if (dataType.value === 'co2') {
    return chrome.runtime.getURL(`assets/icons/analogies/${analogiesCo2[customAnalogyNames[dataType.value][activeIndex.value]].asset}`);
  } else {
    return chrome.runtime.getURL(`assets/icons/analogies/${analogiesData[customAnalogyNames[dataType.value][activeIndex.value]].asset}`);
  }
});
const showDescAnimation = () => {
  showDescription.value = true;
  setTimeout( () => showDescription.value = false, SHOW_DESC_NOTIF_DELAY);
};
const hideMiniViz = () => {
  if (showNotification.value) {
    // do not hide if notification active
    return;
  }
  showInteraction.value = true;
  interactive.value = true;
  setTimeout( () => { showInteraction.value = false; interactive.value = false }, HIDE_MINIVIZ_DELAY);
};
const closeNotification = () => {
  showNotification.value = false
};
const onDailyNotificationClick = () => {
  // send next daily notification if any
  chrome.runtime.sendMessage({ query: 'sendNextDailyNotification' });
  showNotification.value = false
};

const switchDataType = () => {
  if (dataType.value === 'co2') {
    dataType.value = 'data';
  } else { dataType.value = 'co2' }
}
// switch dataType every 10mins
//setInterval(function () { switchDataType(); }, 600000);

const updateIconBar = () => {
  currentMeter.co2.fill(0);
  currentMeter.data.fill(0);
  const normalizedCo2 = countersCo2.value.count % 13;
  const normalizedData = countersData.value.count % 13;
  const Co2Index = 12 - normalizedCo2;
  const DataIndex = 12 - normalizedData;
  currentMeter.co2.fill(1, Co2Index);
  currentMeter.data.fill(1, DataIndex);
  if(dataType.value === 'co2') {
    if(countersCo2.value.count !== countersCo2.value.previous) {
      showDescAnimation();
    }
  } else {
    if(countersData.value.count !== countersData.value.previous) {
      showDescAnimation();
    }
  }
}

const createTimeString = (seconds: number) => {
  if (seconds >= 3600) {
      const minutes = Math.floor(seconds % 3600 / 60);
      return Math.floor(seconds/3600) + 'h' + (minutes<10 ? '0'+minutes : minutes) + 'min';
    } else if (seconds >= 60) {
      return Math.floor(seconds/60) + 'min';
    } else {
      return seconds + 's';
    }
}

const buildWeeklyNotification = () => {
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

const DefaultNotification = () => {
  return {
    date: '-',
    title: "No data to display",
    messageHTML: '-'
  }
};

const resyncSettings = async () => {
  const settings = await retrieveSettings();
  locale.value = settings.lang;
  showMiniViz.value = settings.showMiniViz;
  mvPosition.value = settings.positionMiniviz;
}

const displayNotification = async (type: string) => {
  switch(type) {
    case 'weekly':
      await buildWeeklyNotification();
      notificationType.value = 'weekly';
      showNotification.value = true;
      break;
    case 'daily':
      notificationType.value = 'daily';
      showNotification.value = true;
      break;
    default:
      dailyNotificartion.value = DefaultNotification();
      notificationType.value = 'daily';
      showNotification.value = true;
  }
}

const openExtension = () => {
  chrome.runtime.sendMessage({ query: 'openExtension' });
}

chrome.runtime.onMessage.addListener(request => {
  if (request.counters) {
    // Update stats with todays totals
    const counters = request.counters;
    countersCo2.value = {...counters.co2};
    countersData.value = {...counters.data};
    updateIconBar();
  }
  if (request.weeklynotification) {
    const stats = request.weeklynotification;
    weeklyTotals.value = {...stats, trend: { co2: 0, data: 0 } };
    displayNotification('weekly');
  }
  if (request.dailyNotifications) {
    dailyNotificartion.value = request.dailyNotifications.data;
    displayNotification('daily');
  }
  if (request.query === 'updatePosition') {
    resyncSettings();
  }
});

const openTabExtension = () => {
  chrome.runtime.sendMessage({ query: 'openExtension' });
};

const closeActionPanel = () => {
  interactive.value = false;
};

onBeforeMount(async () => {
  const settings = await retrieveSettings();
  locale.value = settings.lang;
  showMiniViz.value = settings.showMiniViz;
  mvPosition.value = settings.positionMiniviz;
  updateIconBar();
});

</script>

<style lang="scss" scoped>
.mv-extension {
  all: initial;
}

.mv-miniviz {
  all: initial;
  position: fixed;
  top: 5%;
  right: 5px;
  height: auto;
  max-height: 250px;
  width: auto;
  max-width: 270px;
  z-index: 10000;
  &.hidden {
    display: none;
  }
  &.mv-positionBottom {
    top: auto;
    bottom: 5%;
  }
  &.mv-positionLeft {
    right: auto;
    left: 5px;
  }
}
.mv-anim {
  display: flex;
  justify-content: space-evenly;
  max-width: 270px;
  margin-right: 0px;
  margin-left: auto;
  background-color: var(--miniviz-co2);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  border: 1px solid white;
  padding: 4px;
  &.mv-data {
    background-color: var(--miniviz-data);
  }
  img {
    opacity: 0.4;
    width: 20px;
    min-height: 20px;
    height: 20px;
  }
  img.mv-fill {
    opacity: 1;
  }
}
.mv-miniviz #mv-description, .mv-miniviz #mv-notification {
  p, h1, h2, h3, img {
    margin: initial;
    padding: initial;
  }
  font-family: Roboto, system-ui, Arial, sans-serif;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  max-height: auto;
  max-height: 500px;
  transition: max-height 1.5s linear, opacity 1.5s linear;
  opacity: 1;
  border: 1px solid white;
  border-top: 0;
  &.hidden {
    border: none;
    pointer-events: none;
    max-height: 0px;
    opacity: 0;
  }
}
.mv-miniviz #mv-description {
  max-width: 270px;
  margin-right: 0px;
  margin-left: auto;
  color: white;
  background-color: var(--miniviz-co2Active);
  box-shadow: inset 0px 10px 10px -8px rgba(0, 0, 0, 0.25),
      inset 0px 0px 0px 0px rgba(0, 0, 0, 0);
  img {
    width: 40px;
    height: 40px;
  }
  &.mv-data {
    background-color: var(--miniviz-dataActive);
    box-shadow: inset 0px 10px 10px -8px rgba(0, 0, 0, 0.25),
      inset 0px 0px 0px 0px rgba(0, 0, 0, 0);
  }
  .mv-image{
    margin: 10px;
    line-height: normal;
    font-size: 12px;
  }
  .mv-counter {
    flex-grow: 2;
    padding-top: 4px;
    padding-bottom: 4px;
    font-weight: 700;
  }
  .mv-counter-quantity {
    font-size: 21px;
    line-height: 21px;
  }
  .mv-counter-time {
    font-size: 10px;
  }
  .mv-counter-analogy {
    font-size: 10px;
  }
}
.mv-miniviz #mv-notification {
  flex-wrap: wrap;
  color: black;
  background-color: var(--miniviz-grey);
  font-size: 10px;
  .mv-notificationContainer {
    width: 100%;
  }
  .mv-title {
    margin-bottom: 10px;
    color: var(--miniviz-dark-grey);
    font-size: 12px;
    font-weight: 700;
  }
  .mv-summary {
    margin-bottom: 20px;
    p {
      font-size: 13px;
    }
    #dataValue {
      font-size: 14px;
      font-weight: 700;
    }
  }

  .mv-cta{
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
    font-size: 14px;
    #openTab {
      cursor: pointer;
      display: inline-block;
      content: ' ';
      width: 13px;
      height: 13px;
      margin-right: 2px;
    }
    button {
      background: initial;
      font-size: 12px;
      box-shadow: initial;
      color: black;
      padding: 0px;
      font-weight: 400;
    }
  }

  #mv-dailyNotification .mv-title {
    font-weight: 700;
  }

  svg {
    display: inline-flex;
    width: 11px;
    height: 11px;
    margin-top: 4px;
    margin-bottom: -2px;
    margin-left: 2px;  }
  svg.mv-up {
    color: red;
  }
  svg.mv-down {
    transform: rotate(90deg);
    color: var(--miniviz-green);
  }
}
.mv-miniviz #mv-description, .mv-miniviz #mv-notification {
  .mv-exit {
    float: right;
    margin: 10px;
    &:hover {
      cursor: pointer;
    }
  }
}
#mv-stats, #mv-dailyNotification {
    box-shadow: inset 0px 10px 10px -8px rgba(0, 0, 0, 0.25),
      inset 0px 0px 0px 0px rgba(0, 0, 0, 0);
}
#mv-stats, #mv-advise, #mv-dailyNotification {
  padding: 10px;
}
#mv-stats h3, #mv-stats p, #mv-advise h3 {
  margin-left: 0;
}
#mv-stats #current {
  font-weight: bold;
  margin-bottom: 20px;
}
#mv-stats #mv-average {
  display: flex;
  justify-content: start;
  gap: 20px;
  font-size: 13px;
  .averageBox, .trendBox {
    width: 50%;
  }
  .averageBox span {
    font-weight: 700;
    font-size: 14px;
  }
  .trendBox span {
    font-weight: 700;
    font-size: 14px;
  }
}
#mv-stats #mv-average div.hr {
	height: auto;
	width: 1px;
	background-color: var(--miniviz-dark-grey);
}


.mv-vl {
  display: block;
  position: absolute;
  right: 34px;
  top: 4px;
  height: 75%;
  border-left: 1px solid #d9d9d9;
  margin: auto;
}

.mv-icon {
  all: initial;
  vertical-align: -0.25em;
  margin-left: 4px;
  margin-right: 4px;
  &.cvz-interactive {
    cursor: pointer;
  }
}

.mv-closeIcon {
  position: absolute;
  right: 11px;
  top: 11px;
}

.mv-show {
  --translate-amount: 45px;
  animation: slide-up 0.3s ease-out forwards;
}
.mv-hide {
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
.mv-extension .mv-miniviz {
  font-size: 12px !important;
  font-family: Roboto, system-ui, Arial, sans-serif !important;
}
/* styles for messageHTML which is created after injection */
#mv-notification.mv-data .mv-message a {
  color: #00A0D6;
}
#mv-notification.mv-co2 .mv-message a {
  color: #52B788;
}
</style>