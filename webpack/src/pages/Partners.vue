<script>
import { inject, onMounted } from 'vue';

const nav = [];

export default {

  setup() {
    const setSubNav = inject('setSubNav');
    onMounted(() => setSubNav(nav));
    return {};
  }

}
</script>

<template>
  <div>
    Partners
  </div>
</template>

<style scoped>

</style>