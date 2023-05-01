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
    const analogyNamesCo2 = ["marathon","swimming","biking","cooking","boiling","sawing"];
    const analogyNamesData = ["dictionaries","instagram","music","netflix","wordFile","usb"];

    const retrieveData = async () => {
      const { data } = await retrieveAnalogiesLayer(dataType);
      layer.value = data;
    }

    function messureChange (newDataType) {
      let btnList = document.getElementById("type").getElementsByTagName("Button");
      for (let button of btnList) {
        if (button.name === newDataType) {
          button.classList.add("activeButton");
        }
        else {
          button.classList.remove("activeButton")
        }
      };
      dataType.value = newDataType;
      retrieveData();
    };

    function statsIndex (newIndex) {
      activeIndex.value = newIndex
    };

    function getAnalogyValue(value) {
      if(dataType.value === 'co2') {
        // analogies based on energy (switch energy MJ to kWh)
        const amount = 0.278 * value.energy;
        const currentAnalogy = this.analogyNamesCo2[this.activeIndex];
        const kwPerUnit = kwPerUnitCo2[currentAnalogy];
        let number = Math.floor(amount/kwPerUnit);
        switch(currentAnalogy) {
          case 'marathon':
            if(number < 1) {
              number = Math.ceil(100* amount / kwPerUnit)+'%';
            }
            break;
          case 'swimming':
            if(number > 1000) {
              number = Math.ceil(number/1000);
            }
            break;
          case 'cooking':
          case 'boiling':
            number = roundToPrecision(amount/kwPerUnit, 1);
            break;
        }
        return number;
      }
      else {
        // data in MB for analogies
        const amount = value.amount / 1000000;
        const currentAnalogy = this.analogyNamesData[this.activeIndex];
        const mbPerUnit = mbPerUnitData[currentAnalogy];
        let number = Math.floor(amount/mbPerUnit);
        switch(currentAnalogy) {
          case "dictionaries":
            number = roundToPrecision(amount/mbPerUnit, 1);
            break;
          case "netflix":
            number = roundToPrecision(amount/mbPerUnit, 2);
            break;
          case "wordFile":
            if (number > 1000000) {
              number = Math.ceil(number/1000000);
            }
            break;
        }
        return number;
      }
    };

    function getAnalogyText(data) {
      if (dataType.value === "co2") {
        const amount = 0.278 * data.energy;
        const currentAnalogy = this.analogyNamesCo2[this.activeIndex];
        const kwPerUnit = kwPerUnitCo2[currentAnalogy];
        let number = Math.floor(amount/kwPerUnit);
        let largeScale = false;
        switch(currentAnalogy) {
          case 'marathon':
            if(number > 1) {
              largeScale = true;
            }
            break;
          case 'swimming':
            if(number > 1000) {
              largeScale = true;
            }
            break;
        }
        if(largeScale) {
          return this.t(`components.analogies.${this.analogyNamesCo2[this.activeIndex]}s`);
        } else {
          return this.t(`components.analogies.${this.analogyNamesCo2[this.activeIndex]}`);
        }
      } else {
        const amount = data.amount / 1000000;
        const currentAnalogy = this.analogyNamesData[this.activeIndex];
        const mbPerUnit = mbPerUnitData[currentAnalogy];
        let number = Math.floor(amount/mbPerUnit);
        let largeScale = false;
        switch(currentAnalogy) {
          case 'wordFile':
            if (number > 1000000) {
              largeScale = true;
            }
            break;
        }
        if(largeScale) {
          return this.t(`components.analogies.${this.analogyNamesData[this.activeIndex]}s`);
        } else {
          return this.t(`components.analogies.${this.analogyNamesData[this.activeIndex]}`);
        }
      }
    };

    onMounted(async () => {
      await retrieveData();
    });

    return {t, messureChange, roundToPrecision, statsIndex, getAnalogyValue, getAnalogyText,
      layer, dataType, currentYear, activeIndex, analogyNamesCo2, analogyNamesData};
  }
}
</script>

<template>
  <div id="type">
    <button type="button" name="co2" class="activeButton" @click='messureChange("co2")'> {{ t('global.co2') }}</button>
    <button type="button" name="data" @click='messureChange("data")'> {{ t('global.data') }}</button>
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
      <p> {{ getAnalogyValue(value) }} </p>
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
