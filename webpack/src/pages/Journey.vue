<script>
import { inject, onMounted } from 'vue';
import { ElPopover, ElRow, ElCol } from 'element-plus';
import { useI18n } from 'vue-i18n'
import 'element-plus/theme-chalk/index.css';

const subNav = {};

export default {
  components: {
    ElPopover,
    ElRow,
    ElCol
  },
  setup() {
    const { t } = useI18n({});

    const setSubNav = inject('setSubNav');
    onMounted(() => setSubNav(subNav));
    return { t };
  }

}
</script>

<template>
  <el-scrollbar>
    <div class="content">
      <h1>{{ t('global.data_journey') }}</h1>
      <p>
        {{ t('pages.journey.part_1') }}
      </p>
      <p>
        {{ t('pages.journey.part_2') }}
      </p>
      <p class="video-container">
        <video autoplay loop width="600">
          <span style="position: absolute; top: 0px; width: 200px; height: 200px;cursor: pointer;"></span>
          <source src="../../../assets/video/Data_Journey.mp4" type="video/mp4">
        </video>
        <div> <!-- energy -->
          <el-popover
            placement="top"
            trigger="hover"
            :width="600"
          >
            <template #reference>
              <div class="trigger energy"></div>
            </template>
            <el-row align="middle">
              <el-col :span="10">
                <video class="video-explanation" autoplay loop style="width:200">
                  <span style="position: absolute; top: 0px; width: 200px; height: 200px;cursor: pointer;"></span>
                  <source src="../../../assets/video/Energy_Mix.mp4" type="video/mp4">
                </video>
              </el-col>
              <el-col :span="14">
                <span class="bold">{{ t('pages.journey.energy_mix') }}</span>
                <p>{{ t('pages.journey.energy_mix_details') }}</p>
              </el-col>
            </el-row>
          </el-popover>
        </div>
        <div> <!-- device -->
          <el-popover
            placement="top"
            trigger="hover"
            :width="600"
          >
            <template #reference>
              <div class="trigger device"></div>
            </template>
            <el-row align="middle">
              <el-col :span="10">
                <video class="video-explanation" autoplay loop style="width:200">
                  <span style="position: absolute; top: 0px; width: 200px; height: 200px;cursor: pointer;"></span>
                  <source src="../../../assets/video/Device_Color.mp4" type="video/mp4">
                </video>
              </el-col>
              <el-col :span="14">
                <span class="bold">{{ t('pages.journey.connected_devices') }}</span>
                <p>{{ t('pages.journey.connected_devices_details') }}</p>
              </el-col>
            </el-row>
          </el-popover>
        </div>
        <div> <!-- network -->
          <el-popover
            placement="top"
            trigger="hover"
            :width="600"
          >
            <template #reference>
              <div class="trigger network"></div>
            </template>
            <el-row align="middle">
              <el-col :span="10">
                <video class="video-explanation" autoplay loop style="width:200">
                  <span style="position: absolute; top: 0px; width: 200px; height: 200px;cursor: pointer;"></span>
                  <source src="../../../assets/video/Network_Color.mp4" type="video/mp4">
                </video>
              </el-col>
              <el-col :span="14">
                <span class="bold">{{ t('pages.journey.core_network') }}</span>
                <p>{{ t('pages.journey.core_network_details') }}</p>
              </el-col>
            </el-row>
          </el-popover>
        </div>
        <div> <!-- network -->
          <el-popover
            placement="top"
            trigger="hover"
            :width="600"
          >
            <template #reference>
              <div class="trigger data-center"></div>
            </template>
            <el-row align="middle">
              <el-col :span="10">
                <video class="video-explanation" autoplay loop style="width:200">
                  <span style="position: absolute; top: 0px; width: 200px; height: 200px;cursor: pointer;"></span>
                  <source src="../../../assets/video/Server_Color.mp4" type="video/mp4">
                </video>
              </el-col>
              <el-col :span="14">
                <span class="bold">{{ t('pages.journey.data_center') }}</span>
                <p>{{ t('pages.journey.data_center_details') }}</p>
              </el-col>
            </el-row>
          </el-popover>
        </div>
      </p>
      <p>
        {{ t('pages.journey.part_3') }}
      </p>
    </div>
  </el-scrollbar>
</template>

<style lang="scss">
.content {
  max-width: 1000px;
}
.bold {
  font-weight: 700;
}
.el-popover.el-popper p {
  word-break: break-word;
}
.video-container {
  position: relative;
  margin-left: 100px;
}
.trigger {
  position: absolute;
  cursor: pointer;
  width: 95px;
  height: 100px;
  &.energy {
    left: 230px;
    top: 130px;
    width: 150px;
    height: 130px;
  }
  &.device {
    left: 149px;
    top: 296px;
  }
  &.network {
    left: 260px;
    top: 296px;
  }
  &.data-center {
    left: 370px;
    top: 296px;
  }
}

.video-explanation {
  width: 200px;
  height: auto;
}
</style>