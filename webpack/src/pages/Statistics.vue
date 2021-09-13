<script>
import { inject, onMounted, ref } from 'vue';
import { retrieveTodayCounter, getTopWebsites } from '../composables/storage';
import {formatSize, formatCo2} from '../utils/format';
import { layerHeightCo2, layerHeightData } from '../composables/history'

const subNav = {
  'Live': 'Live Digest',
  //'Trends': 'Trends Summary',
  'Co2top': 'CO2 Top Sites',
  'Datatop': 'Data Top Sites',
};

export default {

  setup() {
    const setSubNav = inject('setSubNav');
    const data = ref(0);
    const co2 = ref(0);
    const topSitesData = ref([]);
    const topSitesCo2 = ref([]);

    onMounted(async () => {
      setSubNav(subNav);
      const counters = await retrieveTodayCounter();
      co2.value = counters.co2;
      data.value = counters.data;
      topSitesCo2.value = await getTopWebsites('co2', 15);
      topSitesData.value = await getTopWebsites('data', 15);
    });

    chrome.runtime.onMessage.addListener(request => {
      if (!request?.data) return;
      const packet = request.data;
      if (packet.contentLength < 1 || !packet.extraInfo.tabIcon || packet.extraInfo.tabIcon.startsWith('chrome-extension:')) return;
      data.value += parseInt(packet.contentLength);
      co2.value += packet.co2;
    });

    return {data, co2, topSitesData, topSitesCo2, formatSize, formatCo2, layerHeightCo2, layerHeightData};
  }

}
</script>

<template>
  <div>
    <article class="live" data-section="Live">
      <h1>Live Digest</h1>
      <div id="live-grid" :style="`--size: 410px`">
        <div>
          <div class="co2" :style="`--size: ${layerHeightCo2(co2)}px`">
            <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.467 7a4.533 4.533 0 109.066 0 4.533 4.533 0 00-9.066 0z" stroke-width="3.5"></path></svg>
          </div>
          <div class="live-co2">
            CO<sub>2</sub> {{ formatCo2(co2) }}
          </div>
        </div>
        <div>
          <div class="data" :style="`--size: ${layerHeightData(data)}px`">
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 13.212L13.212 8 8 2.788 2.788 8 8 13.212z" stroke-width="3"></path></svg>
          </div>
          <div class="live-data">
            Data {{ formatSize(data) }}
          </div>
        </div>
      </div>
    </article>
    <article class="live top-sites" data-section="Co2top">
      <h1>CO<sub>2</sub> Top Sites</h1>
      <div class="top-site-grid">
        <div v-for="(site, index) in topSitesCo2" :key="index">
          <div class="co2" :style="`--size: ${layerHeightCo2(site.co2)}px`">
            <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.467 7a4.533 4.533 0 109.066 0 4.533 4.533 0 00-9.066 0z" stroke-width="3.5"></path></svg>
          </div>
          <div class="live-co2">
            <div class="site-name">{{site.name}}</div>
            CO<sub>2</sub> {{ formatCo2(site.co2) }}
          </div>
        </div>
      </div>
    </article>
    <article class="live top-sites" data-section="Datatop">
      <h1>Data Top Sites</h1>
      <div class="top-site-grid">
        <div v-for="(site, index) in topSitesCo2" :key="index">
          <div class="data" :style="`--size: ${layerHeightData(site.data)}px`">
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 13.212L13.212 8 8 2.788 2.788 8 8 13.212z" stroke-width="3"></path></svg>
          </div>
          <div class="live-data">
            <div class="site-name">{{site.name}}</div>
            Data {{ formatSize(site.data) }}
          </div>
        </div>
      </div>
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

  .top-site-grid {
    display: grid;
    width: 700px;
    grid-template-columns: repeat(auto-fit, 1fr);
    grid-template-rows: repeat(3, 1fr);
    grid-auto-flow: column dense;
    gap: 1rem;
  }
  .top-sites > div {
    text-align: center;
  }
  .top-sites .live-co2, .top-sites .live-data{
    color: black;
  }
  .top-sites .site-name {
    font-weight: bold;
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