<script>
import { useI18n } from 'vue-i18n'
import History from '../components/History.vue';

export default {
  components: { History },

  setup(props, context) {
    const { t } = useI18n({});
    return { t };
  }

}
</script>

<template>
  <div id="historical" class="flexContainer">
    <div>
      <h3>{{ t('global.co2') }}</h3>
      <History :hideTypeChange="true" defaultDataType="co2"></History>
    </div>
    <div>
      <h3>{{ t('global.data') }}</h3>
      <History :hideTypeChange="true" defaultDataType="data"></History>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.flexContainer {
  position: relative;
  max-width: 1000px;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
}
.flexContainer div{
  max-width: 400px;
  flex-grow: 1;
  position: relative;
}
.flexContainer div h3{
  text-align: center;
  font-size: xx-large;
  margin: 0;
  margin-bottom: 10px;
}
</style>

<style>
.flexContainer div div#time{
  height: 50px;
}
</style>

<style lang="scss">
#historical #time {
  height: 30px;
}
button {
  border: none;
  font-size: 12px;
  font-weight: 700;
}
#historical .dataArea {
  position: absolute;
  height: unset;
  max-width: 400px;
  top: 90px;
  bottom: 0px;

  .history-wrapper {
    border-radius: unset;
  }
}
</style>