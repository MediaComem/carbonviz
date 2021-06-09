import { ref, watchEffect } from 'vue';

export default function () {
  // TODO How to pass the nb of stratums  ? (calculate ? or n strat (max 4 ( = 150*4)))
  const totalHeight = ref(100);
  const show = ref(false);
  // TODO expanded reactive value for each stratum instead of a signle one
  const expanded = ref(false);

  let backupHeight = totalHeight.value;

  const updateTotalHeight = () => {
    // TODO  calculate the height of all startum childs
    // for now it's just a signle startum for testing purpose
    if (totalHeight.value != 200) {
      backupHeight = totalHeight.value;
      totalHeight.value = 200;
    } else {
      totalHeight.value = backupHeight;
    }
  }

  // autoclose if not shown
  watchEffect(() => {
    if (!show.value && expanded.value) {
      expanded.value = false;
      updateTotalHeight();
    }
  });

  // toggle expanded value and update the height
  // TODO: manage it for each stratum
  const expand = () => {
    expanded.value = !expanded.value;
    updateTotalHeight();
  };

  return {totalHeight, show, expanded, expand};
}