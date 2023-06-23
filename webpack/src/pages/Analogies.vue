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
  <div id="Analogies" class="container">
    <div class="header">
      <h3>{{ t('global.co2') }}</h3>
      <h3>{{ t('global.data') }}</h3>
    </div>
    <el-scrollbar class="scroll">
      <div  class="content">
        <div class="co2">
          <div class="AnalogyItem" v-for="(item, index) in analogyNames['co2']" :key="index">
              <Analogies :hideTypeChange="true" defaultDataType="co2" :analogy="item"></Analogies>
          </div>
        </div>
        <div class="data">
          <div class="AnalogyItem" v-for="(item, index) in analogyNames['data']" :key="index">
            <Analogies :hideTypeChange="true" defaultDataType="data" :analogy="item"></Analogies>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>

.container {
  height: 100%;
  width: 100%;
  position: relative;
}

.header, .content {
    max-width: 1000px;
    display: flex;
    justify-content: space-between;
}

.header h3{
  text-align: center;
  font-size: xx-large;
  margin: 0;
  margin-bottom: 10px;
  flex-basis: 45%;
}
.scroll {
  position: absolute;
  width: 100%;
  height: calc(100% - 50px);
  top: 50px;
  bottom: 0px;
}

.content .co2, .content .data {
  flex-basis: 45%;
}

.AnalogyItem {
    height: 500px;
    flex-basis: 45%;
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
