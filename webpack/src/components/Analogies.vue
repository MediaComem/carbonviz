<script>
import { ref, toRefs, onMounted } from 'vue';
import { useI18n } from 'vue-i18n'
import { roundToPrecision } from '../utils/format.js'
import { kwPerUnitCo2, mbPerUnitData, analogyNames } from '../utils/analogies'
import { retrieveAnalogiesLayer } from '../composables/storage';
import Analogy from './Analogy.vue'
import TypePicker from './TypePicker.vue';

export default {
  components: { Analogy, TypePicker },
  props: {
    defaultDataType: {
      type: String,
      default: "co2"
    },
    hideTypeChange: {
      type: Boolean,
      default: false
    },
    analogy: {
      type: String,
      default: ""
    }
  },
  setup(props) {
    const { t } = useI18n({});
    const { defaultDataType , hideTypeChange , analogy } = toRefs(props);
    const dataType = ref(defaultDataType.value);
    const layer = ref({});
    const currentYear = new Date().getFullYear();
    let activeIndex = ref(0);
    let isOneAnalogy = false;
    let customAnalogyNames = {
      co2: [],
      data: []
    };

    // for Analogies page we have one analogy per section
    if (analogy.value) {
      customAnalogyNames[dataType.value].push(analogy.value);
      isOneAnalogy = true;
    } else {
      customAnalogyNames = analogyNames;
    }

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
        const currentAnalogy = customAnalogyNames.co2[activeIndex.value];
        const kwPerUnit = kwPerUnitCo2[currentAnalogy];
        const { amount, unit } = computeAnalogy(currentAnalogy, amountCo2, kwPerUnit);
        return { amount, unit }
      }
      else {
        // data in MB for analogies
        const amountData = value.amount / 1000000;
        const currentAnalogy = customAnalogyNames.data[activeIndex.value];
        const mbPerUnit = mbPerUnitData[currentAnalogy];
        const  { amount, unit } = computeAnalogy(currentAnalogy, amountData, mbPerUnit);
        return { amount, unit }
      }
    };

    function getAnalogyText(value) {
      const analogyType = this.customAnalogyNames[dataType.value][activeIndex.value];
      return this.t(`components.analogies.${analogyType}${getAnalogyValue(value).unit}`)
    }

    onMounted(async () => {
      await retrieveData();
    });

    return {t, measureChange, roundToPrecision, statsIndex, getAnalogyValue, getAnalogyText,
      layer, dataType, currentYear, activeIndex, customAnalogyNames, hideTypeChange, isOneAnalogy};
  }
}
</script>

<template>
  <div class="analogiesWrapper">
    <type-picker id="type" v-if="!hideTypeChange" @change="measureChange"></type-picker>
    <div class="section" :class="dataType === 'co2' ? 'co2' : 'data'">
      <div class="section-title bold"> {{ t('components.analogies.message') }} </div>
      <el-carousel arrow="always" class="analogies" :class="{hideButtons: isOneAnalogy}" trigger="click" :indicator-position="isOneAnalogy ? 'none':''" @change="statsIndex">
        <el-carousel-item v-for="(item, index) in customAnalogyNames[dataType]" :key="item" label="." class="analogy">
          <div v-if="layer.year">
            <analogy :type="dataType" :layer="layer.year" :name="item"></analogy>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
    <div class="stats">
      <div v-for="(value, key) in layer">
        <div class="statsData">
          <p> {{ getAnalogyValue(value).amount }} </p>
          <p> {{ getAnalogyText(value) }} </p>
          <p> {{ key === 'year' ? t(`global.last.${key}`)+this.currentYear : t(`global.last.${key}`) }} </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analogiesWrapper {
  /*  height: 490px;
      width: 480px; */
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 60px 200px 220px;
  grid-template-areas:
    "header"
    "analogies"
    "stats"
}
#type {
  grid-area: header;
  display: flex;
  width: 300px;
  justify-self: center;
  padding: 15px;
}
.section {
  grid-area: analogies;
  border-radius: 5px 5px 0 0;
  width: 100%;
  padding-top: 5%;
  white-space: pre-line;
  text-align: center;
  color: var(--white);
}
.stats {
  grid-area: stats;
  display: flex;
  flex-wrap: wrap;
  border-radius: 0 0 10px 10px;
  box-shadow: inset 0 -5px 5px -5px var(--dark-grey),
    inset -5px 0 5px -5px var(--dark-grey),
    inset 5px 0 5px -5px var(--dark-grey);
  background-color: var(--activeBackground);
}
.stats > div {
  flex: 45%;
  text-align: center;
  padding-top: 20px;
}
.stats > div:first-child {
  border-right: 1px solid var(--grey);
}
.stats > div:nth-last-child(2) {
  border-top: 1px solid var(--grey);
  border-right: 1px solid var(--grey);
}
.stats > div:last-child {
  border-top: 1px solid var(--grey);
}
.stats .statsData > p {
  margin: 0;
  padding-top: 0;
}
.stats .statsData > p:first-child {
  font-size: 2em;
  font-weight: 700;
}
.stats .statsData > p:last-child {
  font-weight: bold;
}
.co2 {
  background-color: var(--co2);
}
.data {
  background-color: var(--data);
}
</style>

<style lang="scss">
.el-carousel__container {
  height: 130px;
  & button {
    background-color: inherit;
  }
  & button:hover {
    background-color: inherit;
  }
  & button .el-icon, button .el-icon svg {
    height: 2em;
    width: 2em;
  }
}
.hideButtons .el-carousel__container button{
  display: none;
}
.el-carousel ul.el-carousel__indicators {
  margin-left: 0px;
  & li button {
    padding: 0;
  }
}

</style>
