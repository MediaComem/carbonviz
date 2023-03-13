<template>
  <div class="miniviz">
    <div class="anim" id="miniViz_container">
      <!-- placeholder for js animation -->
    </div>
  </div>
</template>

<script lang='ts'>

import { setup as setupAnimation } from '../composables/animation';

export default {
  props: {
  },
  setup(props) {
    return setupAnimation();
  }
}
</script>

<style scoped>
.miniviz {
  all: initial;
}
.anim {
  position: fixed;
  top: 50%;
  margin-top: -150px;
  right: 0px;
  width: 50px;
  height: 300px;
  z-index: 10000;
  background-color: red;
}
:hover {
  background-color: #ff000055;
  transition: transform 1s linear;
  transform: translateY(300px);
}
</style>