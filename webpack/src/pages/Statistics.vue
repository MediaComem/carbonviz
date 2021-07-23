<script>
import { inject, onMounted } from 'vue';


const subNav = {
  'trends': 'Trends Summary',
};

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
    Statistics
  </div>
</template>

<style scoped>

</style>