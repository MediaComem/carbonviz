<script>
import { computed, toRefs } from 'vue';
import { useI18n } from 'vue-i18n'
import { roundToPrecision } from '../utils/format.js'
import { kwPerUnitCo2, mbPerUnitData } from '../utils/analogies'

const analogiesCo2 = [
    {
        text: (value, t) => {
            const kwPerUnit = kwPerUnitCo2.marathon;
            let number = Math.floor(value / kwPerUnit);
            if (number < 1) {
                number = Math.ceil(100* value / kwPerUnit);
                return t('components.analogies.number.marathon', {number});
            }
            return t('components.analogies.number.marathons', {number});
        },
        asset: 'analogy_running.png'
    },
    {
        text: (value, t) => {
            const kwPerUnit = kwPerUnitCo2.swimming;
            let number = Math.floor(value / kwPerUnit);
            if (number < 1000) {
                return t('components.analogies.number.swimming',{number});
            }
            number = Math.ceil(number/1000);
            return t('components.analogies.number.swimmings',{number});
        },
        asset: 'analogy_swimming.png'
    },
    {
        text: (value, t) => {
            const kwPerUnit = kwPerUnitCo2.biking;
            let number = Math.floor(value / kwPerUnit);
            return t('components.analogies.number.biking', {number});
        },
        asset: 'analogy_bicycle.png'
    },
    {
        text: (value, t) => {
            const kwPerUnit = kwPerUnitCo2.cooking;
            let number = roundToPrecision(value/kwPerUnit, 1);
            return t('components.analogies.number.cooking', {number});
        },
        asset: 'analogy_frozenpizza.png'
    },
    {
        text: (value, t) => {
            const kwPerUnit = kwPerUnitCo2.boiling;
            let number = roundToPrecision(value/kwPerUnit, 1);
            return t('components.analogies.number.boiling', {number});
        },
        asset: 'analogy_boilingwater.png'
    },
    {
        text: (value, t) => {
            const kwPerUnit = kwPerUnitCo2.sawing;
            let number = Math.floor(value / kwPerUnit);
            return t('components.analogies.number.sawing', {number});
        },
        asset: 'analogy_sawing.png'
    }
]

const analogiesData = [
    {
        text: (value, t) =>  {
            const mbPerUnit = mbPerUnitData.dictionaries;
            let number = roundToPrecision(value/mbPerUnit, 1);
            return t('components.analogies.number.dictionaries', {number});
        },
        asset: 'analogy_dictionary.png'
    },
    {
        text: (value, t) =>  {
            const mbPerUnit = mbPerUnitData.instagram;
            let number = Math.floor(value / mbPerUnit);
            return t('components.analogies.number.instagram', {number});
        },
        asset: 'analogy_insta.png'
    },
    {
        text: (value, t) =>  {
            const mbPerUnit = mbPerUnitData.music;
            let number = Math.floor(value / mbPerUnit);
            return t('components.analogies.number.music', {number});
        },
        asset: 'analogy_streaming.png'
    },
    {
        text: (value, t) =>  {
            const mbPerUnit = mbPerUnitData.netflix;
            let number = roundToPrecision(value/mbPerUnit, 2);
            return t('components.analogies.number.netflix', {number});
        },
        asset: 'analogy_tvzomby.png'
    },
    {
        text: (value, t) =>  {
            const mbPerUnit = mbPerUnitData.wordFile;
            let number = Math.floor(value / mbPerUnit);
            if (number < 1000000) {
                return t('components.analogies.number.wordFile', {number});
            }
            number = Math.ceil(number/1000000);
            return t('components.analogies.number.wordFileMillion', {number});
        },
        asset: 'analogy_wordfile.png'
    },
    {
        text: (value, t) =>  {
            const mbPerUnit = mbPerUnitData.usb;
            let number = Math.floor(value / mbPerUnit);
            return t('components.analogies.number.usb', {number});
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
    const { t } = useI18n({});
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
