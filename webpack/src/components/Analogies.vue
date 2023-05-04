<script>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n'
import { roundToPrecision } from '../utils/format.js'
import { kwPerUnitCo2, mbPerUnitData } from '../utils/analogies'
import { retrieveAnalogiesLayer } from '../composables/storage';
import Analogy from './Analogy.vue'

export default {
  components: {
    Analogy
  },
  setup() {
    const { t } = useI18n({});
    let dataType = ref('co2');
    const layer = ref({});
    const currentYear = new Date().getFullYear();
    let activeIndex = ref(0);
    const analogyNames = {
      co2: ["marathon","swimming","biking","cooking","boiling","sawing"],
      data: ["dictionaries","instagram","music","netflix","wordFile","usb"]
    };
    const retrieveData = async () => {
      const { data } = await retrieveAnalogiesLayer(dataType);
      layer.value = data;
    }

    function measureChange (newDataType) {
      dataType.value = newDataType;
      retrieveData();
    };

    function statsIndex (newIndex) {
      activeIndex.value = newIndex
    };

    // Compute the necessary data for one analogy based on the raw amount
    // ex: 1Kw means boiling 8.6 liters of water [currentAnalogy: 'boilingwater', amount: 1, amountPerUnit: 0.116] 0.116kW for 1L
    function computeAnalogy(currentAnalogy , amount, amountPerUnit) {
      let unit = '';
      let number = Math.floor(amount/amountPerUnit);
      switch(currentAnalogy) {
        case 'marathon':
          if(number < 1) {
            number = Math.ceil(100* amount / amountPerUnit)+'%';
            unit = '_%';
          }
          break;
        case 'swimming':
          if(number > 1000) {
            number = Math.ceil(number/1000);
            unit = '_km';
          } else {
            unit = '_meter';
          }
          break;
        case 'cooking':
        case 'boiling':
        case "dictionaries":
          number = roundToPrecision(amount/amountPerUnit, 1);
          break;
        case "netflix":
          number = roundToPrecision(amount/amountPerUnit, 2);
          break;
        case "wordFile":
          if (number > 1000000) {
            number = Math.ceil(number/1000000);
            unit = '_million'
          }
          break;
      }
      return { amount: number, unit: unit};
    }

    function getAnalogyValue(value) {
      if(dataType.value === 'co2') {
        // analogies based on energy (switch energy MJ to kWh)
        const amountCo2 = 0.278 * value.energy;
        const currentAnalogy = analogyNames.co2[activeIndex.value];
        const kwPerUnit = kwPerUnitCo2[currentAnalogy];
        const { amount, unit } = computeAnalogy(currentAnalogy, amountCo2, kwPerUnit);
        return { amount, unit }
      }
      else {
        // data in MB for analogies
        const amountData = value.amount / 1000000;
        const currentAnalogy = analogyNames.data[activeIndex.value];
        const mbPerUnit = mbPerUnitData[currentAnalogy];
        const  { amount, unit } = computeAnalogy(currentAnalogy, amountData, mbPerUnit);
        return { amount, unit }
      }
    };

    function getAnalogyText(value) {
      const analogyType = this.analogyNames[dataType.value][activeIndex.value];
      return this.t(`components.analogies.${analogyType}${getAnalogyValue(value).unit}`)
    }
  
    onMounted(async () => {
      await retrieveData();
    });

    return {t, measureChange, roundToPrecision, statsIndex, getAnalogyValue, getAnalogyText,
      layer, dataType, currentYear, activeIndex, analogyNames};
  }
}
</script>

<template>
  <div id="type">
    <button type="button" name="co2" :class="{activeButton: dataType ==='co2'}" @click='measureChange("co2")'> {{ t('global.co2') }}</button>
    <button type="button" name="data" :class="{activeButton: dataType ==='data'}" @click='measureChange("data")'> {{ t('global.data') }}</button>
  </div>
  <div class="section" :class="dataType === 'co2' ? 'co2' : 'data'">
    <div class="section-title bold"> {{ t('components.analogies.message') }} </div>
    <el-carousel arrow="always" class="analogies" trigger="click" indicator-position="none" @change="statsIndex">
      <el-carousel-item v-for="(item, index) in [0,1,2,3,4,5]" :key="index" label="." class="analogy">
        <div v-if="layer.year">
          <analogy :type="dataType" :layer="layer.year" :index="item"></analogy>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
  <div class="stats">
    <div v-for="(value, key) in layer">
      <p> {{ getAnalogyValue(value).amount }} </p>
      <p> {{ getAnalogyText(value) }} </p>
      <p> {{ key === 'year' ? t(`global.last.${key}`)+this.currentYear : t(`global.last.${key}`) }} </p>
    </div>
  </div>
</template>

<style scoped>
#type {
  display: flex;
  height: 5%;
  width: 100%;
}
#type button {
  flex-grow: 1;
  cursor: pointer;
  border-radius: 5px;
  background-color: var(--activeBackground);
  color: var(--activeColor);
}
.section {
  width: 100%;
  padding-top: 10%;
  white-space: pre-line;
  text-align: center;
  color: var(--white);
}
.stats {
  width: 100%;
  height: 40%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.stats > div {
  flex: 1 1 45%;
  text-align: center;
  padding: 10px;
  margin: 0.5px;
  background-color: var(--activeBackground);
}
.stats > div > p {
  margin: 0;
  padding-top: 0;
}
.stats > div > p:first-child {
  font-size: 2em;
}
.stats > div > p:last-child {
  font-weight: bold;
}
.co2 {
  background-color: var(--co2);
}
.data {
  background-color: var(--data);
}
</style>

<style>
.el-carousel__container {
  height: 130px;
}
</style>
