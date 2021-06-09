<script>
import { computed, ref, toRef, watch } from 'vue';

export default {
  props: {
    amount: {type: Number},
    type: {type: String},
    label: {type: String},
    expanded: {type: Boolean, default: false}
  },

  setup(props, context) {
    const height = computed(() => props.amount); //formula to find ! borne entre min max(200px) (easing linear ?)

    return {height};
  }

}
</script>

<template>
  <div class="wrapper" :style="`--height: ${height}px`" :class="{expanded: expanded, co2: type == 'co2', data: type == 'data'}">
    <span>{{ label }}</span><img :src="`assets/${type}.svg`" :style="`--amount: ${amount - 10}px;`">
    <div class="metadata">internal data</div>
  </div>
</template>

<style scoped>
  .wrapper {
    height: var(--height);
    caret-color: transparent;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .wrapper.expanded {
    height: 200px;
  }

  .metadata {
    display: none;
  }
  .expanded .metadata {
    position: absolute;
    display: block;
  }

  .co2 {
    background-color: #906C0D;
  }
  .data {
    background-color: #384E50;
  }

  span {
    display: block;
    position: absolute;
    left: 13px;
    font-weight: 700;
  }
  .expanded span {
    transform: translateY(-90px);
  }

  img {
    display: inline-block;
    height: var(--amount);
    filter: brightness(0) saturate(100%) invert(100%);
  }
  .expanded img{
    transform: translateX(-250px);
  }

  @media (prefers-color-scheme: dark) {

  }

</style>
