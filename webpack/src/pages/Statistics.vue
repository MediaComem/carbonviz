<script>
import { inject, onMounted, ref, computed } from 'vue';
import { retrieveTodayCounter, getTopWebsites } from '../composables/storage';
import {formatSize, formatCo2} from '../utils/format';
import { layerHeightCo2, layerHeightData } from '../composables/history'

const subNav = {
  'Live': 'Live Digest',
  //'Trends': 'Trends Summary',
  'Co2top': 'CO2 Top Sites',
};

export default {

  setup() {
    const setSubNav = inject('setSubNav');
    const data = ref(0);
    const co2 = ref(0);
    const co2Size = computed(() => layerHeightCo2(co2.value));
    const dataSize = computed(() => layerHeightData(data.value));

    onMounted(async () => {
      setSubNav(subNav);
      const counters = await retrieveTodayCounter();
      co2.value = counters.co2;
      data.value = counters.data;
      console.log(await getTopWebsites('co2', 10));
    });

    chrome.runtime.onMessage.addListener(request => {
      if (!request?.data) return;
      const packet = request.data;
      if (packet.contentLength < 1 || !packet.extraInfo.tabIcon || packet.extraInfo.tabIcon.startsWith('chrome-extension:')) return;
      data.value += parseInt(packet.contentLength);
      co2.value += packet.co2;
    });

    return {data, co2, co2Size, dataSize, formatSize, formatCo2};
  }

}
</script>

<template>
  <div>
    <article class="live" data-section="Live">
      <h1>Live Digest</h1>
      <div id="live-grid" :style="`--size: 410px`">
        <div>
          <div class="co2" :style="`--size: ${co2Size}px`">
            <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.467 7a4.533 4.533 0 109.066 0 4.533 4.533 0 00-9.066 0z" stroke-width="3.5"></path></svg>
          </div>
          <div class="live-co2">
            CO<sub>2</sub> {{ formatCo2(co2) }}
          </div>
        </div>
        <div>
          <div class="data" :style="`--size: ${dataSize}px`">
            <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.467 7a4.533 4.533 0 109.066 0 4.533 4.533 0 00-9.066 0z" stroke-width="3.5"></path></svg>
          </div>
          <div class="live-data">
            Data {{ formatSize(data) }}
          </div>
        </div>
      </div>
    </article>
    <article class="live" data-section="Co2top">
      <h1>CO<sub>2</sub> Top Sites</h1>

    </article>
  </div>
</template>

<style>
  #live-grid {
    display: grid;
    max-width: 350px;
    margin-left: 90px;
    grid-template-columns: var(--size) var(--size);
    grid-template-rows: auto;
  }
  #live-grid > div {
    text-align: center;
  }
  .live .live-co2, .live .live-data {
    font-size: 1rem;
  }
  .live .co2 svg, .live .data svg {
    width: var(--size);
    height: var(--size);
  }
  .live .co2, .live .live-co2 {
    stroke: #906C0D;
    color:  #906C0D;
  }
  .live .data, .live .live-data{
    stroke: #3D4D50;
    color: #3D4D50;
  }
  @media (prefers-color-scheme: dark) {
    .live .co2, .live .live-co2 {
      stroke: #BBAA70;
      color: #BBAA70;
    }
    .live .data, .live .live-data{
      stroke: #A3AFB1;
      color: #A3AFB1;
    }
  }
</style>