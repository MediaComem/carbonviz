 <template>
  <div class="extension">
    <div class="miniviz">
      <div class="anim" :class="{ 'hidden': showInteraction}" id="miniViz_container" @mouseover="hideAnimation">
        <!-- placeholder for js animation -->
      </div>
    </div>
    <div class="actionContainer" v-if="interactive">
      <div class="actionPanel" :class="{ 'show': showInteraction, 'hide': !showInteraction }">
        <Logo class="icon"></Logo>
        CarbonViz
        <svg class="icon" width="15" height="15" fill="none" xmlns="http://www.w3.org/2000/svg"> 
          <path :fill="color" fill-rule="evenodd" clip-rule="evenodd" d="M5.56068 3.51027H3.51027V11.4897H11.4854V9.43932H12.9957V11.8139C12.9957 12.468 12.4637 13 11.8096 13H3.18609C2.53202 13 2 12.468 2 11.8139V3.18609C2 2.53202 2.53202 2 3.18609 2H5.56068V3.51027ZM7.93124 2.04474C7.41618 2.04474 6.99685 2.46406 6.99685 2.97912V7.07324C6.99685 7.5883 7.41618 8.00762 7.93124 8.00762H12.0254C12.5404 8.00762 12.9597 7.5883 12.9597 7.07324V2.97912C12.9597 2.46406 12.5404 2.04474 12.0254 2.04474H7.93124Z"/>
        </svg>
        <span class="vl"></span>
        <svg class="closeIcon" width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 12.2065L12.2065 1.00003M12.2065 12.2065L1 1.00003" stroke="#333333" stroke-width="2"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

const HIDE_MINIVIZ_DELAY = 5000;

import { ref } from 'vue';
import { setup as setupAnimation } from '../composables/animation';

export default {
  props: {
  },
  setup(props) {
    // Setup color theme
    const color = ref('#333');
    // Setup animation
    const animSetup = setupAnimation();
    // Setup miniViz interaction
    const showInteraction = ref(false);
    const interactive = ref(false);
    const hideAnimation = () => {
      showInteraction.value = true;
      interactive.value = true;
      setTimeout( () => showInteraction.value = false, HIDE_MINIVIZ_DELAY);
    };
    return { color, ...animSetup, interactive, hideAnimation, showInteraction }
  }
}
</script>

<style lang="scss" scoped>

.extension {
  all: initial;
}

.miniviz, .actionContainer {
  font-family: Roboto, Arial, sans-serif ;

}
.anim {
  all: initial;
  position: fixed;
  top: 50%;
  margin-top: -150px;
  right: 0px;
  width: 50px;
  height: 300px;
  z-index: 10000;

  &.hidden {
    display: none;
  }
}

.actionContainer {
  position: fixed;
  z-index: 1000;
  width: 138px;
  height: 33px;
  line-height: 33px;
  font-size: 10px;
  right: 10px;
  bottom: 10px;
  &.hidden {
    display: none;
  }
}

.actionPanel {
  position: relative;
  height: 33px;
  background: #FFFFFF;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}

.vl {
  display: block;
  position: absolute;
  right: 34px;
  top: 4px;
  height: 75%;
  border-left: 1px solid #d9d9d9;
  margin: auto;
}

.icon {
  all: initial;
  vertical-align: -0.25em;
  margin-left: 4px;
  margin-right: 4px;
}

.closeIcon {
  position: absolute;
  right: 11px;
  top: 11px;
}

.fa-icon {
  width: 2em;
  height: 2em;
  vertical-align: -0.125em;
}

.show {
  --translate-amount: 45px;
  animation: slide-up 0.3s ease-out forwards;
}
.hide {
  --translate-amount: 45px;
  animation: slide-down 0.3s ease-out forwards;
}

@keyframes slide-up {
  0% {transform: translateY(var(--translate-amount))}
  100% {transform: translateY(0)}
}

@keyframes slide-down {
  0% {transform: translateY(0)}
  100% {transform: translateY(var(--translate-amount))}
}

</style>