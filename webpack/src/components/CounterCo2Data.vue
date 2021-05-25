<script>
import {ref} from 'vue';
import {formatSize, formatCo2} from '../utils/format';

export default {

  setup(props, context) {
    const data = ref(0);
    const co2 = ref(0);
    return { data, co2, formatSize, formatCo2};
  }

}
</script>

<template>
  <section>
    <div class="co2">
      <svg width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.467 7a4.533 4.533 0 109.066 0 4.533 4.533 0 00-9.066 0z" stroke="#000" stroke-width="3.5"></path></svg>
    </div>
    <span>Co2 - <span class="val">{{ formatCo2(co2) }}</span></span>
    <div class="data">
      <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 13.212L13.212 8 8 2.788 2.788 8 8 13.212z" stroke="#000" stroke-width="3"></path></svg>
    </div>
    <span>Data - <span class="val">{{ formatSize(data) }}</span></span>
  </section>
</template>

<style scoped>
  section {
    margin-top: 10px;
    margin-left: 10px;
    display: grid;
    font-weight: 700;
    font-size: 10px;
    grid-template-columns: auto 1fr;
    grid-template-rows: 1fr 1fr;
    row-gap: 5px;
  }
  .co2 {
    padding-left: 1px;
  }
  section > span {
    padding-left: 10px;
  }
  .val {
    font-weight: 500;
  }
</style>
