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

<style scoped>
.flexContainer {
  display: flex;
  flex-wrap: wrap;
  gap: 60px;
}
.flexContainer div{
  flex-grow: 1;
  width: 45%;
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

<style>
#historical #time {
  height: 30px;
}
button {
  border: none;
  font-size: 12px;
  font-weight: 700;
}
#historical .dataArea {
  height: 450px
}
</style>