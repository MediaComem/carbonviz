<script>
import {ref} from 'vue';
import { useI18n } from 'vue-i18n';
import {formatSize, formatCo2} from '../../../utils/format';
export default {
  data() {
    return {
      large: false
      }
  },
  setup(props, context) {
    const large = ref(false);
    const data = ref(0);
    const co2 = ref(0);
    const { t } = useI18n({})
    return {large, data, co2, formatSize, formatCo2, t};
  }
}
</script>

<template>
  <section :class="large ? 'large' : 'small'">
    <div class="co2">
      <svg fill="none" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><path d="M2.467 7a4.533 4.533 0 109.066 0 4.533 4.533 0 00-9.066 0z" stroke-width="3.5"></path></svg>
    </div>
    <span>CO<sub>2</sub> - <span class="val">{{ formatCo2(co2) }}</span></span>
    <div class="data">
      <svg fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 13.212L13.212 8 8 2.788 2.788 8 8 13.212z" stroke-width="3"></path></svg>
    </div>
    <span>{{ t('global.data') }} - <span class="val">{{ formatSize(data) }}</span></span>
  </section>
</template>

<style scoped lang="scss">
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
    padding-left: 4px;
  }
  .val {
    color: grey;
    font-weight: 400;
  }
  .co2 {
    stroke: #906C0D;
  }
  .data{
    stroke: #3D4D50;
  }
  .co2 {
    svg {
      width: 14px;
      height: 14px;
    }
  }
  .data {
    svg {
      width: 16px;
      height: 16px;
    }
  }
  .large {
    font-size: 10px;
    span {
      padding-top: 4px;
    }
    .co2 {
      svg {
        width: 23px;
        height: 23px;
      }
    }
    .data {
      svg {
        width: 25px;
        height: 25px;
      }
    }
  }
  @media (prefers-color-scheme: dark) {
    .co2 {
      stroke: #BBAA70;
    }
    .data{
      stroke: #A3AFB1;
    }
    section {
      color: #BFBFBF;
    }
  }
</style>
