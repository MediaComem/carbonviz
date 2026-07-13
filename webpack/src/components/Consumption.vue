<script>
import { useI18n } from "vue-i18n";
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import {
  startSession,
  endSession,
  getSessions,
  getSessionStats,
} from "../../../storage/storage.js";
import {
  formatSize,
  formatCo2,
  formatDuration,
  formatDateTime,
} from "../../../utils/format";

export default {
  setup() {
    const { t } = useI18n({});
    const sessions = ref([]);
    const selectedSession = ref(null);
    const stats = ref({
      data: 0,
      co2: 0,
      energy: 0,
      durationSec: 0,
      averageWatts: 0,
    });
    let tickInterval = null;

    const runningSession = computed(
      () => sessions.value.find((session) => !session.end) || null,
    );
    const isViewingRunningSession = computed(
      () => !!selectedSession.value && !selectedSession.value.end,
    );

    async function refreshSessions() {
      sessions.value = await getSessions();
    }

    async function refreshStats() {
      if (!selectedSession.value) {
        stats.value = {
          data: 0,
          co2: 0,
          energy: 0,
          durationSec: 0,
          averageWatts: 0,
        };
        return;
      }
      const result = await getSessionStats(selectedSession.value);
      const averageWatts =
        result.durationSec > 0 ? (result.energy * 1e6) / result.durationSec : 0;
      stats.value = { ...result, averageWatts };
    }

    function selectSession(session) {
      selectedSession.value = session;
    }

    async function toggleSession() {
      if (runningSession.value) {
        await endSession(runningSession.value);
      } else {
        await startSession();
      }
      await refreshSessions();
      selectedSession.value = runningSession.value || sessions.value[0] || null;
      await refreshStats();
    }

    watch(selectedSession, refreshStats);

    onMounted(async () => {
      await refreshSessions();
      selectedSession.value = runningSession.value || sessions.value[0] || null;
      await refreshStats();
      tickInterval = setInterval(() => {
        if (isViewingRunningSession.value) {
          refreshStats();
        }
      }, 1000);
    });

    onBeforeUnmount(() => {
      clearInterval(tickInterval);
    });

    return {
      t,
      sessions,
      selectedSession,
      stats,
      runningSession,
      isViewingRunningSession,
      selectSession,
      toggleSession,
      formatSize,
      formatCo2,
      formatDuration,
      formatDateTime,
    };
  },
};
</script>

<template>
  <div class="consumption">
    <div class="session-control">
      <button
        class="session-toggle"
        :class="{ running: runningSession }"
        @click="toggleSession"
      >
        {{
          runningSession
            ? t("components.consumption.stop")
            : t("components.consumption.start")
        }}
      </button>
    </div>

    <div v-if="selectedSession" class="session-stats">
      <div class="stat">
        <div class="value">{{ formatSize(stats.data, 1) }}</div>
        <div class="label">{{ t("global.data") }}</div>
      </div>
      <div class="stat">
        <div class="value">{{ formatCo2(stats.co2, 1) }}</div>
        <div class="label">{{ t("global.co2") }}</div>
      </div>
      <div class="stat">
        <div class="value">{{ Math.round(stats.averageWatts) }} W</div>
        <div class="label">{{ t("components.consumption.averagePower") }}</div>
      </div>
      <div class="stat">
        <div class="value">{{ formatDuration(stats.durationSec) }}</div>
        <div class="label">{{ t("components.consumption.duration") }}</div>
      </div>
    </div>
    <div v-else class="empty">
      {{ t("components.consumption.noSessions") }}
    </div>

    <div class="session-history">
      <div class="session-history-title">
        {{ t("components.consumption.history") }}
      </div>
      <div class="session-list">
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
      </div>
    </div>
  </div>
</template>

<style scoped>
.consumption {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.session-control {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}
.session-toggle {
  padding: 8px 24px;
  border-radius: 20px;
  background: var(--light-grey);
  color: var(--black);
  font-weight: 700;
}
.session-toggle.running {
  background-color: var(--black);
  color: var(--white);
}
.session-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  margin-bottom: 14px;
  gap: 1px;
  background: var(--grey);
  border-radius: 5px;
  overflow: hidden;
  flex-shrink: 0;
}
.stat {
  text-align: center;
  padding: 8px;
  background: var(--white);
}
.stat .value {
  font-size: 1.1rem;
  font-weight: 700;
}
.stat .label {
  font-size: 0.75rem;
  color: var(--dark-grey);
}
.empty {
  text-align: center;
  color: var(--dark-grey);
  margin-bottom: 14px;
}
.session-history {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: auto;
}
.session-history-title {
  font-weight: 700;
  margin-bottom: 6px;
}
.session-list {
  overflow-y: auto;
  border-radius: 5px;
}
.session-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
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
@media (prefers-color-scheme: dark) {
  .session-toggle {
    background-color: var(--dark-grey);
    color: var(--white);
  }
  .session-toggle.running {
    background-color: var(--grey);
    color: var(--black);
  }
  .session-item:not(:first-of-type) {
    border-top: solid 1px var(--dark-grey);
  }
  .stat .value,
  .empty,
  .session-history-title,
  .session-item.running {
    color: var(--white);
  }
  .stat .label {
    color: var(--light-grey);
  }
  .stat {
    background: var(--activeBackground);
  }
  .session-item:hover,
  .session-item.active {
    background-color: var(--dark-grey);
    color: var(--white);
  }
}
</style>
