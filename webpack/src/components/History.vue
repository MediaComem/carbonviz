<script>
import { useI18n } from "vue-i18n";
import { setup as setupHistorySeries } from "../composables/history";
import PeriodPicker from "./PeriodPicker.vue";
import TypePicker from "./TypePicker.vue";
import Analogy from "./Analogy.vue";
import VueApexCharts from "vue3-apexcharts";
import { ElCarousel, ElCarouselItem } from "element-plus";
import "element-plus/theme-chalk/index.css";
import { analogyNames } from "../../../utils/analogies";
import { ref, toRefs } from "vue";

export default {
  components: {
    PeriodPicker,
    TypePicker,
    Analogy,
    apexchart: VueApexCharts,
    ElCarousel,
    ElCarouselItem,
  },
  props: {
    defaultDataType: {
      type: String,
      default: "co2",
    },
    hideTypeChange: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const { t } = useI18n({});
    const timePeriod = ref("seconds");
    const { defaultDataType, hideTypeChange } = toRefs(props);
    const dataType = ref(defaultDataType.value);
    const selectedPoint = ref(null);
    const selectedIndex = ref(null);

    const { options, series, points } = setupHistorySeries(
      dataType,
      timePeriod,
    );

    function periodChange(newPeriod) {
      timePeriod.value = newPeriod;
      selectedPoint.value = null;
      selectedIndex.value = null;
    }

    function measureChange(newDataType) {
      dataType.value = newDataType;
      selectedPoint.value = null;
      selectedIndex.value = null;
    }

    function onPointSelect(_event, _chartContext, config) {      
      if (selectedIndex.value === config.dataPointIndex) {
        // clicking the already-selected point closes the panel
        selectedPoint.value = null;
        selectedIndex.value = null;
        return;
      }

      const point = points.value[config.dataPointIndex];

      selectedPoint.value = point
        ? { amount: point.y, energy: point.energy }
        : null;

      selectedIndex.value = config.dataPointIndex;
    }

    return {
      t,
      timePeriod,
      dataType,
      hideTypeChange,
      options,
      series,
      selectedPoint,
      analogyNames,
      periodChange,
      measureChange,
      onPointSelect,
    };
  },
};
</script>

<template>
  <div class="buttons">
    <period-picker
      :periods="['seconds', 'minutes']"
      @change="periodChange"
    ></period-picker>
    <type-picker v-if="!hideTypeChange" @change="measureChange"></type-picker>
  </div>
  <div class="dataArea">
    <div class="chart-wrapper">
      <apexchart
        class="timeline"
        type="area"
        height="260"
        :options="options"
        :series="series"
        @click="onPointSelect"
      >
      </apexchart>
      <div v-if="selectedPoint" class="analogies-panel">
        <el-carousel arrow="always" class="analogies" trigger="click">
          <el-carousel-item
            v-for="item in analogyNames[dataType]"
            :key="item"
            label="."
            class="analogy"
          >
            <analogy
              :label="true"
              :type="dataType"
              :layer="selectedPoint"
              :name="item"
            ></analogy>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
  </div>
</template>

<style scoped>
.buttons {
  height: 30px;
  margin-bottom: 30px;
  display: flex;
  width: 100%;
  column-gap: 9px;
}
.dataArea {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 87%;
}
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  box-shadow: inset 0px 0px 8px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  padding: 10px 0;
}
.timeline {
  width: 100%;
}
.analogies-panel {
  /* absolutely positioned so opening/closing it never resizes the chart's
     container -- apexcharts redraws (and briefly blanks) on container resize */
  position: absolute;
  top: 270px;
  left: 0;
  right: 0;
}
.analogies-panel .analogy {
  text-align: center;
}
.analogies-panel .analogies {
  height: 150px;
}
</style>
