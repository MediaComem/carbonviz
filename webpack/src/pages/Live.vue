<script>
import { inject, onMounted } from 'vue';

const subNav = {};

export default {

  setup() {
    const setSubNav = inject('setSubNav');
    onMounted(() => setSubNav(subNav));
    return {};
  }

}
</script>

<template>
  <div id="liveVue">
    <iframe src="/popup/popup.html" width="500" height="600" frameBorder="0"></iframe>
  </div>
</template>

<style scoped>
  #liveVue {
    display: flex;
  }
  iframe {
    margin: 5% auto;
    width: 500px;
    height: 600px;
  }
</style>