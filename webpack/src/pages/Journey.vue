<script>
import { inject, onMounted } from 'vue';

const subNav = {};

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
    <h1>Data's journey</h1>
    <p>
      Day after day, we all consume data that passes through the Internet: email, images, videos, documents, music or articles are just the main ones. Instantly accessing this online content became a normality, and losing this access leaves us as helpless as when the electricity goes out.
    </p><p>
      Yet, "Online" means that data travels through physical equipments and lines, goes from somewhere to our favorite browser. Therefore, this trip is not free. It is only made possible by an extraordinary profusion of resources: thousands of kilometers of submarine cables that connect continents, colossal data centers that are constantly running at full speed to guarantee a flawless availability of content, fleet of satellites roaming from every corner of earth's orbit to keep us connected even while we are asleep, factories that manufacture hundreds of millions of technical devices that we often completely ignore.
    </p><p>
      These infrastructures and devices, which transform our landscape and our interiors, need a colossal amount of energy and material to be built, to function and to be eliminated. Greenhouse gas emissions, depletion of rare earths, toxic emissions, including plastics, are all visible, but often overlooked, signs of our digital footprint on our environment. Dematerialization is indeed very expensive. CarbonViz tackles this problem by aiming to improve the perception and understanding of digital energy issues. By placing itself at the heart of our activities, within the browser itself, CarbonViz makes it possible to view the downloaded data and the corresponding quantity of CO2 emitted live.
    </p>
  </div>
</template>

<style scoped>

</style>