<script>
import { inject, onMounted } from 'vue';
import { useI18n } from 'vue-i18n'
import { analogyNames } from '../utils/analogies'
import Analogies from '../components/Analogies.vue';

const subNav = {};

export default {
  components: { Analogies },

  setup(props, context) {
    const { t } = useI18n({});
    const setSubNav = inject('setSubNav');
    onMounted(() => setSubNav(subNav));
    return { t, analogyNames };
  }

}

</script>

<template>
  <div id="Analogies" class="flexContainer">
    <div class="AnalogiesCol">
        <h3>{{ t('global.co2') }}</h3>
        <div class="AnalogyItem" v-for="(item, index) in analogyNames['co2']" :key="index">
            <Analogies :hideTypeChange="true" defaultDataType="co2" :analogy="item"></Analogies>
        </div>
    </div>
    <div class="AnalogiesCol">
        <h3>{{ t('global.data') }}</h3>
        <div class="AnalogyItem" v-for="(item, index) in analogyNames['data']" :key="index">
            <Analogies :hideTypeChange="true" defaultDataType="data" :analogy="item"></Analogies>
        </div>
    </div>
  </div>
</template>

<style scoped>
.flexContainer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}
.flexContainer div h3{
  text-align: center;
  font-size: xx-large;
  margin: 0;
  margin-bottom: 10px;
}
.flexContainer > .AnalogiesCol {
  flex-basis: 45%;
  height: 75px;
  margin-bottom: 10px;
}
.AnalogyItem {
    height: 500px;
}
</style>

<style>
.stats > div > p {
  font-size: 0.7rem;
}
.stats > div > p:first-child {
  font-size: 1.5em;
}
.AnalogyItem .el-carousel__container {
  height: 170px;
}
.AnalogyItem .el-carousel__container .el-carousel__item img {
  max-height: 180px;
  max-width: 180px;
}
</style>
