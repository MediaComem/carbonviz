<script>
import { ref, toRefs, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { roundToPrecision } from '../../../utils/format.js';
import { analogyNames, getAnalogyValue, getAnalogyText } from '../../../utils/analogies';
import { retrieveAnalogiesLayer } from '../../../storage/storage';
import Analogy from './Analogy.vue';
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
          <p> {{ getAnalogyValue(customAnalogyNames, dataType, value, activeIndex).amount }} </p>
          <p> {{ getAnalogyText(customAnalogyNames, dataType, value, activeIndex, t) }} </p>
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
  grid-template-rows: 60px 214px 206px;
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
  height: 30px;
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
  box-shadow: inset 0 -5px 5px -5px rgba(0, 0, 0, 0.25),
    inset -5px 0 5px -5px rgba(0, 0, 0, 0.25),
    inset 5px 0 5px -5px rgba(0, 0, 0, 0.25);
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
  background-color: var(--co2Analogies);
}
.data {
  background-color: var(--dataAnalogies);
}
</style>

<style lang="scss">
.analogiesWrapper .el-carousel__container {
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
button.el-carousel__arrow--right {
  right: 0px;
}
button.el-carousel__arrow--left {
  left: 0px;
}
</style>
