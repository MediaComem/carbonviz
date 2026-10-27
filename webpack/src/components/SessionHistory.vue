<script>
import { useI18n } from "vue-i18n";
import { ref, computed, onMounted, watch } from "vue";
import VueApexCharts from "vue3-apexcharts";
import { getSessions, retrieveSessionSeries } from "../../../storage/storage.js";
import { formatDuration, formatDateTime } from "../../../utils/format";
import buildAreaChart from "../composables/historyChart.js";

export default {
  components: {
    apexchart: VueApexCharts,
  },

  setup() {
    const { t } = useI18n({});
    const sessions = ref([]);
    const selectedSession = ref(null);
    const points = ref({ co2: [], data: [] });

    const charts = computed(() =>
      ["co2", "data"].map((type) => ({
        type,
        options: buildAreaChart(type, points.value[type]).options,
        series: [
          {
            name: type,
            data: points.value[type].map((point) => ({ x: point.x, y: point.y })),
          },
        ],
      })),
    );

    async function refreshSeries() {
      points.value = selectedSession.value
        ? await retrieveSessionSeries(selectedSession.value)
        : { co2: [], data: [] };
    }

    function selectSession(session) {
      selectedSession.value = session;
    }

    watch(selectedSession, refreshSeries);

    onMounted(async () => {
      sessions.value = await getSessions();
      selectedSession.value = sessions.value[0] || null;
    });

    return {
      t,
      sessions,
      selectedSession,
      charts,
      selectSession,
      formatDuration,
      formatDateTime,
    };
  },
};
</script>

<template>
  <div class="session-history">
    <div class="session-list-wrapper">
      <div class="session-history-title">
        {{ t("components.consumption.history") }}
      </div>
      <div v-if="!sessions.length" class="empty">
        {{ t("components.consumption.noSessions") }}
      </div>
      <el-scrollbar class="session-list">
        <div
          v-for="session in sessions"
          :key="session.start"
          class="session-item"
          :class="{
            active: selectedSession === session,
            running: !session.end,
          }"
          @click="selectSession(session)"
        >
          <span class="session-date">{{ formatDateTime(session.start) }}</span>
          <span class="session-duration">
            {{
              session.end
                ? formatDuration(
                    (new Date(session.end) - new Date(session.start)) / 1000,
                  )
                : t("components.consumption.ongoing")
            }}
          </span>
        </div>
      </el-scrollbar>
    </div>
    <div v-if="selectedSession" class="charts">
      <div v-for="chart in charts" :key="chart.type" class="chart">
        <h3>{{ t(`global.${chart.type}`) }}</h3>
        <div class="chart-wrapper">
          <apexchart
            type="area"
            height="260"
            :options="chart.options"
            :series="chart.series"
          ></apexchart>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.session-history {
  display: flex;
  column-gap: 40px;
  max-width: 1000px;
  width: 100%;
  height: calc(100% - 10px);
  margin: auto;
}
.session-list-wrapper {
  display: flex;
  flex-direction: column;
  width: 300px;
  flex-shrink: 0;
  min-height: 0;
}
.session-history-title {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 6px;
}
.empty {
  color: var(--dark-grey);
}
.session-list {
  flex-grow: 1;
  min-height: 0;
  border-radius: 5px;
}
.session-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 14px;
  cursor: pointer;
}
.session-item:not(:first-of-type) {
  border-top: solid 1px var(--grey);
}
.session-item:hover {
  background-color: var(--activeBackground);
  outline: solid 1px var(--white);
}
.session-item.active {
  background-color: var(--light-grey);
}
.session-item.running {
  font-weight: 700;
}
.charts {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  row-gap: 20px;
}
.chart h3 {
  text-align: center;
  font-size: xx-large;
  margin: 0 0 10px 0;
}
.chart-wrapper {
  box-shadow: inset 0px 0px 8px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  padding: 10px 0;
}
@media (prefers-color-scheme: dark) {
  .session-item:not(:first-of-type) {
    border-top: solid 1px var(--dark-grey);
  }
  .empty,
  .session-history-title,
  .session-item.running {
    color: var(--white);
  }
  .session-item:hover,
  .session-item.active {
    background-color: var(--dark-grey);
    color: var(--white);
  }
}
</style>
