<script>
import { computed, toRefs } from 'vue';

const analogiesCo2 = [
    {
        text: (value) => {
            const amountPerKwh = 2.790697674;
            let number = Math.floor(value / amountPerKwh);
            if (number < 1) {
                const percent = Math.ceil(value / amountPerKwh);
                return `Running ${percent}% of a marathon`;
            }
            return `Running ${number} marathons`;
        },
        asset: 'analogy_running.png'
    },
    {
        text: (value) => {
            const amountPerKwh = 0.0001813953488;
            let number = Math.floor(value / amountPerKwh);
            if (number < 1000) {
                return `Swimming ${number}m in the sea`;
            }
            return `Swimming ${Math.ceil(number/1000)}km in the sea`;
        },
        asset: 'analogy_swimming.png'
    },
    {
        amountPerKwh: 0.25,
        text: (value) => {
            const amountPerKwh = 0.25;
            return `Cooking ${Math.ceil(value/amountPerKwh)} frozen pizzas`;
        },
        asset: 'analogy_frozenpizza.png'
    }
]

const analogiesData = [
    {
        amountPerKwh: 0,
        text: (value) => value,
        asset: 'data.png'
    },
    {
        amountPerKwh: 0,
        text: (value) => value,
        asset: 'data.png'
    },
    {
        amountPerKwh: 0,
        text: (value) => value,
        asset: 'data.png'
    }
]

export default {
  props: {
    layer: {type: Object},
    type: {type: String},
    index: {type: Number},
  },
  setup(props) {
    const { index, type, layer } = toRefs(props);

    const analogy = computed(() => {
      switch(type.value) {
        case 'co2':
          return analogiesCo2[index.value]
        case 'data':
            return analogiesData[index.value]
        default:
            throw('Invalid type');
      }
    });
    const asset = computed(() => {
        return `assets/${analogy.value.asset}`
    });
    const legend = computed(() => {
        const data = layer.value;
        let amount = data.amount;
        if(type.value === 'co2') {
            // analogies based on energy (switch energy MJ to kWh)
            amount = 0.278 * data.energy;
        }
        return analogy.value.text(amount);
    });

    return {asset, legend};
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
</style>
