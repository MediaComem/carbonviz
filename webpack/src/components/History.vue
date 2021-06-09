<script>
import history from '../composables/history';
import Stratum from './HistoryStratum.vue';
import { watch } from 'vue';

export default {
  components: { Stratum },

  props: {
    type: {type: String}
  },

  setup(props, context) {
    const {totalHeight, show, expanded, expand} = history();
    let expandIt = () => expand();

    // for DATA we need "move up" the animation by the height of the sratums
    if (props.type == 'data') {
      const anim = window.document.querySelector('.animation');

      watch(show, val => anim.style.top = val ? `-${totalHeight.value}px` : '0');
      anim.style.top = 0;

      expandIt = () => {
        expand();
        anim.style.top = `-${totalHeight.value}px`;
      };

    }

    return {totalHeight, show, expanded, expandIt};
  }

}
</script>

<template>
  <div v-if="show">
    <stratum :amount="100" :expanded="expanded" label="Today" :type="type"  @click="expandIt"></stratum>
  </div>
</template>

<style scoped>
  div {
    cursor: pointer;
  }
  @media (prefers-color-scheme: dark) {

  }
</style>
