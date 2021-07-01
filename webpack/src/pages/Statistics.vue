<script>
import { inject, onMounted } from 'vue';

const nav = [{
  anchor: '#trends',
  label: 'Trends Summary'
}];

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
    Statistics
  </div>
</template>

<style scoped>

</style>