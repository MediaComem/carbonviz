 <template>
  <div class="mv-extension" v-if="showMiniViz">
    <div class="miniviz" :class="{ 'hidden': showInteraction}" id="miniViz_container">
      <div class="mv-anim" :class="dataType === 'data' ? 'mv-data' : 'mv-co2'" @mouseover="hideMiniViz">
        <img v-for="(item, index) in iconBar" key="item" class="mv-image" :class="currentMeter[dataType][item] ? 'mv-fill': ''" :src="asset" height="20" width="20">
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
          @click="onNotificationClick"
        >
          <img class="mv-exit" :src="closeBtn" alt="X">
          <div id="mv-stats">
            <h3 class="mv-title"> {{ t('components.miniViz.notification.weekly.title') }} </h3>
            <div id="mv-current">
              <p>
                {{ t(`components.miniViz.notification.${dataType}`,
                  {
                    data: dataType === 'co2' ? formatCo2(weeklyTotals.currentWeek[dataType]) : formatSize(weeklyTotals.currentWeek[dataType])
                  }
                )}}
              </p>
              <p> {{ t(`components.miniViz.notification.weekly.days`)}} </p>
              <p>
                {{ t(`components.miniViz.notification.analogy`,
                  { amount: getAnalogyValue(customAnalogyNames, dataType, weeklyTotals.currentWeek[dataType], activeIndex).amount + getAnalogyText(customAnalogyNames, dataType, weeklyTotals.currentWeek[dataType], activeIndex) }
                )}}
              </p>
            </div>
            <div id="mv-average">
              <p>
                {{ t('components.miniViz.notification.weekly.average') }}
                <strong> {{ dataType === 'co2' ? formatCo2(weeklyTotals.currentWeek.co2 / 7, 0) : formatSize(weeklyTotals.currentWeek.data / 7, 0) }} </strong>
              </p>
              <p id="mv-trend">
                {{ t('components.miniViz.notification.weekly.trend') }}:
              </p>
              <div v-if="weeklyTotals.trend[dataType] !== 0">
                <span v-if="weeklyTotals.trend[dataType] > 0">+</span>
                <span v-if="weeklyTotals.trend[dataType] < 0">-</span>
                {{ Math.round(Math.abs(100 * weeklyTotals.trend[dataType]))}} %
                <svg :class="weeklyTotals.trend[dataType] > 0 ? 'mv-up' : 'mv-down'" width="23" height="23" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                  <path id="arrow" d="M0.93934 19.9393C0.353553 20.5251 0.353553 21.4749 0.93934 22.0607C1.52513 22.6464 2.47487 22.6464 3.06066 22.0607L0.93934 19.9393ZM22.5 2C22.5 1.17157 21.8284 0.5 21 0.5H7.5C6.67157 0.5 6 1.17157 6 2C6 2.82843 6.67157 3.5 7.5 3.5H19.5V15.5C19.5 16.3284 20.1716 17 21 17C21.8284 17 22.5 16.3284 22.5 15.5V2ZM3.06066 22.0607L22.0607 3.06066L19.9393 0.93934L0.93934 19.9393L3.06066 22.0607Z" fill="currentColor" />
                </svg>
              </div>
              <div v-else>
                -
              </div>
            </div>
          </div>
          <!--
          <div id="mv-advise">
            <h3>Recommandations</h3>
            <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laborum quo quis, porro nostrum pariatur repellendus dicta sequi ipsam, nesciunt,
              doloremque nam. Enim quo accusamus explicabo deserunt upiditate et, doloremque architecto excepturi.</p>
          </div>
          -->
        </div>
        <div
          class="mv-notificationContainer"
          v-if="notificationType === 'daily'"
          @click="onDailyNotificationClick"
        >
        <div id="mv-dailyNotification">
          <h3> {{ dailyNotificartion.title }}</h3>
          <span v-html="dailyNotificartion.messageHTML"></span>
        </div>
        </div>
      </div>
    </div>
    <div class="mv-actionContainer" v-if="interactive">
      <div class="mv-actionPanel" :class="{ 'mv-show': showInteraction, 'mv-hide': !showInteraction }">
        <Logo class="mv-icon"></Logo>
        {{ t('appTitle') }}
        <svg class="mv-icon cvz-interactive" width="15" height="15" fill="none" xmlns="http://www.w3.org/2000/svg" @click="openTabExtension">
          <path :fill="color" fill-rule="evenodd" clip-rule="evenodd" d="M5.56068 3.51027H3.51027V11.4897H11.4854V9.43932H12.9957V11.8139C12.9957 12.468 12.4637 13 11.8096 13H3.18609C2.53202 13 2 12.468 2 11.8139V3.18609C2 2.53202 2.53202 2 3.18609 2H5.56068V3.51027ZM7.93124 2.04474C7.41618 2.04474 6.99685 2.46406 6.99685 2.97912V7.07324C6.99685 7.5883 7.41618 8.00762 7.93124 8.00762H12.0254C12.5404 8.00762 12.9597 7.5883 12.9597 7.07324V2.97912C12.9597 2.46406 12.5404 2.04474 12.0254 2.04474H7.93124Z"/>
        </svg>
        <span class="mv-vl"></span>
        <svg class="mv-closeIcon cvz-interactive" width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" @click="closeActionPanel">
          <path d="M1 12.2065L12.2065 1.00003M12.2065 12.2065L1 1.00003" stroke="#333333" stroke-width="2"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const HIDE_MINIVIZ_DELAY = 5000;
const SHOW_DESC_NOTIF_DELAY = 10000;

import { computed, ref, onMounted, toRefs } from 'vue';
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
const closeBtn = chrome.runtime.getURL(`icons/roundBtnX.svg`);
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
let currentMeter = {
  co2: Array(12).fill(0),
  data: Array(12).fill(0),
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
const hideMiniViz = () => {
  showInteraction.value = true;
  interactive.value = true;
  setTimeout( () => { showInteraction.value = false; interactive.value = false }, HIDE_MINIVIZ_DELAY);
};
const onNotificationClick = () => {
  showNotification.value = false
};
const onDailyNotificationClick = () => {
  // send next daily notification if any
  chrome.runtime.sendMessage({ query: 'sendNextDailyNotification' });
  showNotification.value = false
};

function switchDataType () {
  if (dataType.value === 'co2') {
    dataType.value = 'data';
  } else { dataType.value = 'co2' }
}
// switch dataType every 10mins
//setInterval(function () { switchDataType(); }, 600000);

function updateIconBar() {
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

function createTimeString(seconds: number) {
  if (seconds > 3600) {
      const minutes = Math.floor(seconds % 3600 / 60);
      return Math.floor(seconds/3600) + 'h' + ' ' + (minutes<10 ? '0'+minutes : minutes) + 'min';
    } else if (seconds > 60) {
      return Math.floor(seconds/60) + 'min';
    } else {
      return seconds + 's';
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

function DefaultNotification() {
  return {
    date: '-',
    title: "No data to display",
    messageHTML: '-'
  }
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
      notificationType.value = 'daily';
      showNotification.value = true;
      break;
    default:
      dailyNotificartion.value = DefaultNotification();
      notificationType.value = 'daily';
      showNotification.value = true;
      setTimeout( () => showNotification.value = false,  SHOW_DESC_NOTIF_DELAY);
  }
}

chrome.runtime.onMessage.addListener(request => {
  if (request.counters) {
    // Update stats with todays totals
    const counters = request.counters;
    countersCo2.value = {...counters.co2};
    countersData.value = {...counters.data};
    console.log(counters)
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
});

const openTabExtension = () => {
  chrome.runtime.sendMessage({ query: 'openExtension' });
};

const closeActionPanel = () => {
  interactive.value = false;
};

onMounted(async () => {
  const settings = await retrieveSettings();
  locale.value = settings.lang;
  updateIconBar();
});

</script>

<style lang="scss" scoped>
.mv-extension {
  all: initial;
}
.miniviz, .mv-actionContainer {
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
.mv-anim {
  display: flex;
  justify-content: space-evenly;
  max-width: 270px;
  margin-right: 0px;
  margin-left: auto;
  background-color: var(--co2);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  border: 1px solid white;
  border-top: 0;
  padding: 4px;
  &.mv-data {
    background-color: var(--data);
  }
  & img {
    opacity: 0.4;
  }
  & img.mv-fill {
    opacity: 1;
  }
}
.miniviz #mv-description, .miniviz #mv-notification {
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
    pointer-events: none;
    max-height: 0px;
    opacity: 0;
  }
}
.miniviz #mv-description {
  max-width: 270px;
  margin-right: 0px;
  margin-left: auto;
  color: white;
  background-color: var(--co2Active);
  box-shadow: inset 0px 10px 10px -8px rgba(0, 0, 0, 0.25),
      inset 0px 0px 0px 0px rgba(0, 0, 0, 0);
  &.mv-data {
    background-color: var(--dataActive);
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
    font-size: 12px;
  }
  .mv-counter-analogy {
    font-size: 12px;
  }
}
.miniviz #mv-notification {
  flex-wrap: wrap;
  color: black;
  background-color: var(--grey);
  & .mv-notificationContainer {
    width: 100%;
  }
  & .mv-title {
    margin-bottom: 15px
  }
  & svg.mv-up {
    display: inline-flex;
    color: red;
  }
  & svg.mv-down {
    display: inline-flex;
    transform: rotate(90deg);
    color: var(--green);
  }
}
.mv-exit {
  float: right;
  margin: 10px;
  &:hover {
    cursor: pointer;
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
#mv-stats #mv-trend {
  margin-top: 20px;
}
#mv-advise h3 {
  margin-bottom: 15px
}
.mv-actionContainer {
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

.mv-actionPanel {
  position: relative;
  height: 33px;
  background: #FFFFFF;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
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
/* styles for messageHTML which is created after injection */
#mv-notification.mv-data .mv-message a {
  color: #00A0D6;
}
#mv-notification.mv-co2 .mv-message a {
  color: #52B788;
}
</style>