 <template>
  <div class="extension" v-if="showMiniViz">
    <div class="miniviz" :class="{ 'hidden': showInteraction}" id="miniViz_container" @mouseover="showDescAnimation" @click="onMiniVizClick">
      <div class="anim" :class="dataType === 'data' ? 'data' : 'co2'">
        <img v-for="(item, index) in iconBar" key="item" class="image" :class="currentMeter[dataType][item] ? 'fill': ''" :src="asset" height="20" width="20">
      </div>
      <div
        id="description"
        :class="{
          hidden: !showDescription,
          co2: dataType === 'co2',
          data: dataType === 'data',
        }"
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
      >
        <div v-for="item in notification">
          <h3 class="title"> {{ item.title }} {{ item.date }}</h3>
          <span v-html="item.messageHTML" class="message"></span>
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
import { formatSize, formatCo2 } from '../utils/format';
import { retrieveSettings } from '../utils/settings.js';
import { analogiesCo2, analogiesData, analogyNames, getAnalogyValue, getAnalogyText } from '../utils/analogies';

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
    let activeIndex = ref(0);
    let dataType = ref('co2');
    const dayTotals = ref({
      co2: 0,
      data: 0,
      energy: 0,
      time: 0
    });
    const summary = ref({ data: 0, energy: 0, co2: 0, computer: { energy: 0, co2: 0}});
    const trend = ref({ data: 0, energy: 0, co2: 0, computer: { energy: 0, co2: 0}});
    let notification = ref(
      [
        {
          date: '',
          title: '',
          messageHTML: ''
        }
      ]
    );
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
      showMiniViz.value = settings.showMiniviz;
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

    function switchDataType () {
      if (dataType.value === 'co2') {
        dataType.value = 'data';
      } else { dataType.value = 'co2' }
    }
    // switch dataType every 10mins
    setInterval(function () { switchDataType(); }, 1000000);

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

    async function fetchNotificationData() {
      const Today = new Date();
      const TodayString = Today.toLocaleDateString();
      const LastWeek = new Date(Today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const LastWeekString = LastWeek.toLocaleDateString();
      let currentCo2;
      let currentData;
      let previousWeekCo2;
      let previousWeekData;
      let trendCo2;
      let trendData;

      currentCo2 = summary.value.co2;
      currentData = summary.value.data;
      previousWeekCo2 = trend.value.co2;
      previousWeekData = trend.value.data;
      if (previousWeekCo2 > 0 && previousWeekData > 0) {
        trendCo2 = (currentCo2 - previousWeekCo2) / previousWeekCo2;
        trendData = (currentData - previousWeekData) / previousWeekData;
      } else {
        trendCo2 = 0;
        trendData = 0;
      }

      const data = [
        {
          date: TodayString,
          title: "Weekly CO2 comsumption",
          messageHTML: `<p>${formatCo2(currentCo2,0)} ${t('global.of_co2')} ${ t('global.last.week') } incl.${ formatCo2(summary.value.computer.co2, 0) } ${ t('components.statistics.computerImpact') }</p>`
        },
        {
          date: TodayString,
          title: "Weekly Data comsumption",
          messageHTML: `<p>${formatSize(currentData,0)} ${ t('global.last.week')}</p>`
        },
        {
          date: LastWeekString,
          title: "weekly CO2 trend",
          messageHTML: `<p>${t(`components.statistics.day.trend`)} ${trendCo2 ? trendCo2 > 0 ? '+' : '-' : 'N/A'} ${ trendCo2 ? Math.round(Math.abs(100 * trendCo2))+'%' : ''}</p>`
        },
        {
          date: LastWeekString,
          title: "Weekly Data trend",
          messageHTML: `<p>${t(`components.statistics.day.trend`)} ${trendData ? trendData > 0 ? '+' : '-' : 'N/A'} ${ trendData ? Math.round(Math.abs(100 * trendData))+'%' : ''}</p>`
        }
      ]

      return data;
    }

    async function displayNotification() {
      notification.value = await fetchNotificationData();
      showNotification.value = true;
      setTimeout( () => showNotification.value = false, SHOW_DESC_NOTIF_DELAY);
    }

    chrome.runtime.onMessage.addListener(request => {
      if (request.total) {
        // Update stats with todays totals
        const stats = request.total;
        if (stats?.extraInfo?.tabIcon?.startsWith('chrome-extension:')) return;
        dayTotals.value = {...stats}
        updateIconBar();
      }
      if (request.notification) {
        summary.value = request.notification.currentWeek;
        trend.value = request.notification.lastWeek;
        displayNotification();
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
      dayTotals, dataType, activeIndex, notification, showMiniViz,
      formatCo2, formatSize, createTimeString, openTabExtension, showDescAnimation, onMiniVizClick, t, getAnalogyValue, getAnalogyText }
  }
}
</script>

<style lang="scss" scoped>

#notificationDialog {
  font-family: initial;
  max-width: 350px;
  border-radius: 10px;
  border-width: 1px;
  .title {
    font-weight: bold;
    font-size: medium;
    margin-bottom: 5px;
  }
  .message {
    display: block;
    font-size: medium;
    margin-bottom: 5px;
  }
  .button {
    float: right;
    background: none;
    color:black;
    border: none;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
}
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
  width: 270px;
  z-index: 10000;
  &.hidden {
    display: none;
  }
}
.anim {
  display: flex;
  border-radius: 10px;
  justify-content: space-evenly;
  margin-bottom: 1px;
  background-color: var(--co2);
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
  border-radius: 10px;
  justify-content: space-evenly;
  align-items: center;
  color: white;
  height: 50px;
  max-height: 100px;
  background-color: var(--co2Active);
  transition: height 1s linear, opacity 1.5s linear;
  opacity: 1;
  &.data {
    background-color: var(--dataActive);
  }
  &.hidden {
    height: 0px;
    opacity: 0;
  }
  & .image, p {
    margin: 5px;
    line-height: normal;
    font-size: 12px;
  }
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