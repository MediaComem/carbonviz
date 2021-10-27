<script>
import { computed, toRefs } from 'vue';
import { roundToPrecision } from '../utils/format.js'

const analogiesCo2 = [
    {
        text: (value) => {
            const kwPerUnit = 2.790697674;
            let number = Math.floor(value / kwPerUnit);
            if (number < 1) {
                const percent = Math.ceil(100* value / kwPerUnit);
                return `Running ${percent}% of a marathon`;
            }
            return `Running ${number} marathons`;
        },
        asset: 'analogy_running.png'
    },
    {
        text: (value) => {
            const kwPerUnit = 0.0001813953488;
            let number = Math.floor(value / kwPerUnit);
            if (number < 1000) {
                return `Swimming ${number}m in the sea`;
            }
            return `Swimming ${Math.ceil(number/1000)}km in the sea`;
        },
        asset: 'analogy_swimming.png'
    },
    {
        text: (value) => {
            const kwPerUnit = 0.02543604651;
            let number = Math.floor(value / kwPerUnit);
            return `Biking ${number}km`;
        },
        asset: 'analogy_bicycle.png'
    },
    {
        text: (value) => {
            const kwPerUnit = 0.25;
            return `Cooking ${roundToPrecision(value/kwPerUnit, 1)} frozen pizzas`;
        },
        asset: 'analogy_frozenpizza.png'
    },
    {
        text: (value) => {
            const kwPerUnit = 0.116;
            return `Boiling ${roundToPrecision(value/kwPerUnit, 1)}L water`;
        },
        asset: 'analogy_boilingwater.png'
    },
    {
        text: (value) => {
            const kwPerUnit = 0.0203488372093023;
            let number = Math.floor(value / kwPerUnit);
            return `Sawing ${number} wood boards`;
        },
        asset: 'analogy_sawing.png'
    }
]

const analogiesData = [
    {
        text: (value) =>  {
            const mbPerUnit = 20;
            let number = roundToPrecision(value/mbPerUnit, 1);
            return `${number} illustrated dictionaries`;
        },
        asset: 'analogy_dictionary.png'
    },
    {
        text: (value) =>  {
            const mbPerUnit = 0.078;
            let number = Math.floor(value / mbPerUnit);
            return `${number} instagram pictures`;
        },
        asset: 'analogy_insta.png'
    },
    {
        text: (value) =>  {
            const mbPerUnit = 2.4;
            let number = Math.floor(value / mbPerUnit);
            return `${number} minutes of streaming music`;
        },
        asset: 'analogy_streaming.png'
    },
    {
        text: (value) =>  {
            const mbPerUnit = 5376;
            let number = roundToPrecision(value/mbPerUnit, 2);
            return `${number} Netflix UHD episodes`;
        },
        asset: 'analogy_tvzomby.png'
    },
    {
        text: (value) =>  {
            const mbPerUnit = 0.000011444;
            let number = Math.floor(value / mbPerUnit);
            if (number < 1000000) {
                return `${number} pages of word file`;
            }
            return `${Math.ceil(number/1000000)} million pages of word file`;
        },
        asset: 'analogy_wordfile.png'
    },
    {
        text: (value) =>  {
            const mbPerUnit = 8;
            let number = Math.floor(value / mbPerUnit);
            return `${number} old USB Stick (8 MB)`;
        },
        asset: 'analogy_usbdrive.png'
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
        } else if(type.value === 'data') {
            // analogies based on energy (switch energy MJ to kWh)
            amount = data.amount / 1000000;
        }
        return analogy.value.text(amount); // data in MB for analogies
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
.legend {
  justify-content: center;
}
</style>
