<script>
import SessionHistory from '../components/SessionHistory.vue';

export default {
  components: { SessionHistory },
}
</script>

<template>
  <div id="historical">
    <SessionHistory></SessionHistory>
  </div>
</template>

<style scoped>
#historical {
  height: 100%;
}
</style>
