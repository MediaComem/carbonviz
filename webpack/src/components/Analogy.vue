<script>
import { computed, toRefs } from 'vue';
import { useI18n } from 'vue-i18n'
import { analogiesCo2, analogiesData } from '../utils/analogies'

export default {
  props: {
    layer: {type: Object},
    type: {type: String},
    name: {type: String}
  },
  setup(props) {
    const { t } = useI18n({});
    const { name, type, layer } = toRefs(props);

    const analogy = computed(() => {
      switch(type.value) {
        case 'co2':
          return analogiesCo2[name.value]
        case 'data':
            return analogiesData[name.value]
        default:
            throw('Invalid type');
      }
    });
    const asset = computed(() => {
        return `../icons/analogies/${analogy.value.asset}`
    });
    const legend = computed(() => {
        const data = layer.value;
        let amount = data.amount;
        if(type.value === 'co2') {
            // analogies based on energy (switch energy MJ to kWh)
            amount = 0.278 * data.energy;
        } else if(type.value === 'data') {
            // analogies based on energy (switch energy MJ to kWh)
            amount = data.amount / 1000000;
        }
        return analogy.value.text(amount, t); // data in MB for analogies
    });

    return {t, asset, legend};
  }
}
</script>

<template>
  <div>
    <img class="image" :src="asset">
    <div class="legend"> {{ legend }} </div>
  </div>
</template>

<style scoped lang="scss">
.image {
    max-width: 100px;
    max-height: 100px;
}
.legend {
  justify-content: center;
}
</style>
