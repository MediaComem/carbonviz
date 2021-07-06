<script>
import { inject, onMounted } from 'vue';

const subNav = {
  'todo': 'Todo',
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
    Partners
  </div>
</template>

<style scoped>

</style>