import { roundToPrecision } from './format.js'
/*
*   When updating analogies please be aware of the *analogiesData* object ex: webpack\src\pages\FAQ.vue
*/

// kwPerUnit
const kwPerUnitCo2 = {
    marathon: 2.790697674,
    swimming: 0.0001813953488,
    biking: 0.02543604651,
    cooking: 0.25,
    boiling: 0.116,
    sawing: 0.0203488372093023,
}
// mbPerUnit
const mbPerUnitData = {
    dictionaries: 20,
    instagram: 0.078,
    music: 2.4,
    netflix: 5376,
    wordFile: 0.000011444,
    usb: 8
}

// Populate analogies from the defined unit types
const analogyNames = {
    co2: [],
    data: [],
};
for (let key in kwPerUnitCo2) {
    analogyNames.co2.push(key);
}
for (let key in mbPerUnitData) {
    analogyNames.data.push(key);
}


const analogiesCo2 = {
    marathon: {
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
    swimming: {
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
    biking: {
        text: (value, t) => {
            const kwPerUnit = kwPerUnitCo2.biking;
            let number = Math.floor(value / kwPerUnit);
            return t('components.analogies.number.biking', {number});
        },
        asset: 'analogy_bicycle.png'
    },
    cooking: {
        text: (value, t) => {
            const kwPerUnit = kwPerUnitCo2.cooking;
            let number = roundToPrecision(value/kwPerUnit, 1);
            return t('components.analogies.number.cooking', {number});
        },
        asset: 'analogy_frozenpizza.png'
    },
    boiling: {
        text: (value, t) => {
            const kwPerUnit = kwPerUnitCo2.boiling;
            let number = roundToPrecision(value/kwPerUnit, 1);
            return t('components.analogies.number.boiling', {number});
        },
        asset: 'analogy_boiling.png'
    },
    sawing: {
        text: (value, t) => {
            const kwPerUnit = kwPerUnitCo2.sawing;
            let number = Math.floor(value / kwPerUnit);
            return t('components.analogies.number.sawing', {number});
        },
        asset: 'analogy_sawing.png'
    }
}

const analogiesData = {
    dictionaries: {
        text: (value, t) =>  {
            const mbPerUnit = mbPerUnitData.dictionaries;
            let number = roundToPrecision(value/mbPerUnit, 1);
            return t('components.analogies.number.dictionaries', {number});
        },
        asset: 'analogy_dictionary.png'
    },
    instagram: {
        text: (value, t) =>  {
            const mbPerUnit = mbPerUnitData.instagram;
            let number = Math.floor(value / mbPerUnit);
            return t('components.analogies.number.instagram', {number});
        },
        asset: 'analogy_insta.png'
    },
    music: {
        text: (value, t) =>  {
            const mbPerUnit = mbPerUnitData.music;
            let number = Math.floor(value / mbPerUnit);
            return t('components.analogies.number.music', {number});
        },
        asset: 'analogy_streaming.png'
    },
    netflix: {
        text: (value, t) =>  {
            const mbPerUnit = mbPerUnitData.netflix;
            let number = roundToPrecision(value/mbPerUnit, 2);
            return t('components.analogies.number.netflix', {number});
        },
        asset: 'analogy_tvzomby.png'
    },
    wordFile: {
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
    usb: {
        text: (value, t) =>  {
            const mbPerUnit = mbPerUnitData.usb;
            let number = Math.floor(value / mbPerUnit);
            return t('components.analogies.number.usb', {number});
        },
        asset: 'analogy_usbdrive.png'
    }
}

// Compute the necessary data for one analogy based on the raw amount
// ex: 1Kw means boiling 8.6 liters of water [currentAnalogy: 'boilingwater', amount: 1, amountPerUnit: 0.116] 0.116kW for 1L
function computeAnalogy(currentAnalogy , amount, amountPerUnit) {
    let unit = '';
    let number = Math.floor(amount/amountPerUnit);
    switch(currentAnalogy) {
        case 'marathon':
        if(number < 1) {
            number = Math.ceil(100* amount / amountPerUnit)+'%';
            unit = '_%';
        }
        break;
        case 'swimming':
        if(number > 1000) {
            number = Math.ceil(number/1000);
            unit = '_km';
        } else {
            unit = '_meter';
        }
        break;
        case 'cooking':
        case 'boiling':
        case "dictionaries":
        number = roundToPrecision(amount/amountPerUnit, 1);
        break;
        case "netflix":
        number = roundToPrecision(amount/amountPerUnit, 2);
        break;
        case "wordFile":
        if (number > 1000000) {
            number = Math.ceil(number/1000000);
            unit = '_million'
        }
        break;
    }
    return { amount: number, unit: unit};
}

function getAnalogyValue(customAnalogyNames, dataType, value, activeIndex) {
    if(dataType === 'co2') {
      // analogies based on energy (switch energy MJ to kWh)
      const amountCo2 = 0.278 * value.energy;
      const currentAnalogy = customAnalogyNames.co2[activeIndex];
      const kwPerUnit = kwPerUnitCo2[currentAnalogy];
      const { amount, unit } = computeAnalogy(currentAnalogy, amountCo2, kwPerUnit);
      return { amount, unit }
    }
    else {
      // data in MB for analogies
      const amountData = value.data / 1000000;
      const currentAnalogy = customAnalogyNames.data[activeIndex];
      const mbPerUnit = mbPerUnitData[currentAnalogy];
      const  { amount, unit } = computeAnalogy(currentAnalogy, amountData, mbPerUnit);
      return { amount, unit }
    }
}

function getAnalogyText(customAnalogyNames, dataType, value, activeIndex) {
    const analogyType = this.customAnalogyNames[dataType][activeIndex];
    return this.t(`components.analogies.${analogyType}${getAnalogyValue(customAnalogyNames, dataType, value, activeIndex).unit}`)
}

export { analogyNames, analogiesCo2, analogiesData, computeAnalogy, getAnalogyValue, getAnalogyText }