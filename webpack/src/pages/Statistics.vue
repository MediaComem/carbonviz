<script>
import { inject, onMounted, ref, computed } from 'vue';
import { retrieveTodayCounter } from '../composables/storage';
import {formatSize, formatCo2} from '../utils/format';

const subNav = {
  'live': 'Live Digest',
  'trends': 'Trends Summary',
};

export default {

  setup() {
    const setSubNav = inject('setSubNav');
    const data = ref(0);
    const co2 = ref(0);
    const co2Size = computed(() => {
      let v = Math.round(co2.value * 200);
      console.log(v);
      return 120;
    })

    onMounted(async () => {
      setSubNav(subNav);
      const counters = await retrieveTodayCounter();
      co2.value = counters.co2;
      data.value = counters.data;
    });

    chrome.runtime.onMessage.addListener(request => {
      if (!request?.data) return;
      const packet = request.data;
      if (packet.contentLength < 1 || !packet.extraInfo.tabIcon || packet.extraInfo.tabIcon.startsWith('chrome-extension:')) return;
      data.value += parseInt(packet.contentLength);
      co2.value += packet.co2;
    });



    return {data, co2, co2Size, formatSize, formatCo2};
  }

}
</script>

<template>
  <div>
    <article>
      <h1>Live Digest</h1>
      <div>
        <div class="co2">
          <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.467 7a4.533 4.533 0 109.066 0 4.533 4.533 0 00-9.066 0z" stroke-width="3.5"></path></svg>
        </div>
        <div id="co2">
          CO<sub>2</sub> - {{ formatCo2(co2) }}
        </div>
      </div>
    </article>
  </div>
</template>

<style>
  #co2 {
    font-size: 1rem;
  }
</style>

<style scoped>
  .co2 {
    stroke: #906C0D;
  }
  .co2 svg {
    width: 50px;
    height: 50px;
  }
  .data{
    stroke: #3D4D50;
  }
  @media (prefers-color-scheme: dark) {
    .co2 {
      stroke: #BBAA70;
      color: #BBAA70;
    }
    .data{
      stroke: #A3AFB1;
    }
  }
</style>