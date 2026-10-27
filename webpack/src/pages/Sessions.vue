<script>
import Consumption from '../components/Consumption.vue';

export default {
  components: { Consumption },
}
</script>

<template>
  <div id="sessions">
    <Consumption wide></Consumption>
  </div>
</template>

<style scoped>
#sessions {
  height: calc(100% - 10px);
}
</style>
