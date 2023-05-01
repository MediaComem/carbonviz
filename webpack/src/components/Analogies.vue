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
      let amount = 0;
      let currentAnalogy = '';
      if(dataType.value === 'co2') {
        // analogies based on energy (switch energy MJ to kWh)
        amount = 0.278 * value.energy;
        currentAnalogy = this.analogyNamesCo2[this.activeIndex];
        const kwPerUnit = kwPerUnitCo2[currentAnalogy];
        let number = 0;
        const precisionAnalogys = ['cooking','boiling'];
        if (precisionAnalogys.includes(currentAnalogy)) {
          number = roundToPrecision(amount/kwPerUnit, 1);
        } else {
          number = Math.floor(amount / kwPerUnit);
        }
        // index 0,1 (running, swimming) have two units
        if (this.activeIndex === 0) {
          if(number < 1) {
            number = Math.ceil(100* amount / kwPerUnit);
            return number;
          } else {
            return number;
          }
        } else if (this.activeIndex === 1) {
          if(number < 1000) {
            return number;
          } else {
            number = Math.ceil(number/1000);
            return number;
          }
        } else {
          return number;
        }
      }
      else {
        // data in MB for analogies
        amount = value.amount / 1000000;
        currentAnalogy = this.analogyNamesData[this.activeIndex];
        const mbPerUnit = mbPerUnitData[currentAnalogy];
        let number = 0;
        switch(currentAnalogy) {
          case "dictionaries":
            number = roundToPrecision(amount/mbPerUnit, 1);
            break;
          case "netflix":
            number = roundToPrecision(amount/mbPerUnit, 2);
            break;
          case "wordFile":
            number = Math.floor(amount / mbPerUnit);
            if (number > 1000000) {
              number = Math.ceil(number/1000000)+" million";
            }
            break;
          default:
            number = Math.floor(amount/mbPerUnit);
        }

        return number;
      }
    };

    function getAnalogyText() {
      if (dataType.value === "co2") {
        return this.t(`components.analogies.${this.analogyNamesCo2[this.activeIndex]}`);
      } else {
        return this.t(`components.analogies.${this.analogyNamesData[this.activeIndex]}`);
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
      <p> {{ getAnalogyText() }} </p>
      <p> {{ t(`global.current_${key}`) }} </p>
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
