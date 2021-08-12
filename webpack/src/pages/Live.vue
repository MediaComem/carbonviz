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
  <div>
    <iframe src="/popup/popup.html" width="500" height="600" frameBorder="0"></iframe>
  </div>
</template>

<style scoped>
  iframe {
    margin: 100px 0 0 250px;
    width: 500px;
    height: 600px;
  }
</style>