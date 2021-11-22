<script>
import { inject, onMounted } from 'vue';

const subNav = {
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
    <article>
      <h1>Data & Privacy</h1>
        <h2>Data analysis</h2>
        <p>
            Web packets downloaded in your browser are used to check how much data was downloaded and estimate the climate impact of your digital activities. The following information are retrieved for each packet:
            <ul>
                <li>url: used to display usage and impact per site</li>
                <li>timestamp: used to display history</li>
                <li>url: used to display usage and impact per site</li>
                <li>cache: used to consider only relevant packets</li>
                <li>type: used to display if content corresponds to video, audio, image, etc.</li>
            </ul>
        </p>
        <p>
            Duration usage of the plugin is also used to monitor the climate impact of your device.
        </p>
        <h2>Data storage</h2>
        <p>
            CarbonViz stores data only locally inside your broswer. No data is automatically synchronised with external servers.
        </p>
        <h2>Data history</h2>
        <p>
            Historical data is saved so you can check your usage history. The following data are saved:
            <ul>
                <li>daily data: aggregated data consumption + co2 / energy impact</li>
                <li>hourly data: aggregated data consumption + co2 / energy impact</li>
                <li>by domain: aggregated data consumption + co2 / energy impact</li>
            </ul>
        </p>
        <h2>Open Source</h2>
        <p>
            CarbonViz is open source software and you can check the source code on <a href="https://github.com/MediaComem/carbonviz">Github</a>.
        </p>
    </article>
  </div>
</template>

<style scoped lang="scss">
.bold {
  font-weight: 700;
}
a {
  color: black;
  font-style: italic;
}
a:visited {
  color: black;
}
.logos {
  img {
    height: 50px;
    width: auto;
  }
}


@media (prefers-color-scheme: dark) {
  a {
    color: white;
    font-style: italic;
  }
  a:visited {
    color: white;
  }
}
</style>