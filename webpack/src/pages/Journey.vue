<script>
import { inject, onMounted } from 'vue';
import { ElPopover, ElRow, ElCol } from 'element-plus';
import 'element-plus/theme-chalk/index.css';

const subNav = {};

export default {
  components: {
    ElPopover,
    ElRow,
    ElCol
  },
  setup() {
    const setSubNav = inject('setSubNav');
    onMounted(() => setSubNav(subNav));
    return {};
  }

}
</script>

<template>
  <div>
    <h1>Data's journey</h1>
    <p>
      Day after day, we all consume data that passes through the Internet: email, images, videos, documents, music or articles are just the main ones. Instantly accessing this online content became a normality, and losing this access leaves us as helpless as when the electricity goes out.
    </p>
    <p>
      Yet, "Online" means that data travels through physical equipment and lines, coming from somewhere to our favorite browser. Therefore, this trip is not free. It is only made possible by an extraordinary profusion of resources: thousands of kilometers of submarine cables that connect continents, colossal data centers that are constantly running at full speed to guarantee a flawless availability of content, fleets of satellites roaming from every corner of earth's orbit to keep us connected even while we are asleep, factories that manufacture hundreds of millions of technical devices that we often completely ignore.
    </p>
    <p class="video-container">
      <video autoplay loop width="600">
        <span style="position: absolute; top: 0px; width: 200px; height: 200px;cursor: pointer;"></span>
        <source src="assets/Data_Journey.mp4" type="video/mp4">
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
                <source src="assets/Energy_Mix.mp4" type="video/mp4">
              </video>
            </el-col>
            <el-col :span="14">
              <span class="bold">Energy mix</span>
              <p>Electricity can come from renewable energy (solar, wind, hydro power, etc.) or fossil fuels.<br>
                Depending on the energy mix, the environmental impact can be a lot different.<br> Renewable energies have a much lower impact.
                </p>
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
                <source src="assets/Device_Color.mp4" type="video/mp4">
              </video>
            </el-col>
            <el-col :span="14">
              <span class="bold">Connected devices</span>
              <p>Devices consume energy while powered-on or in sleep mode. <br>
              A lot of energy and resources were also used during their manufacturing. Thus the environmental impact of devices varies a lot depending on the lifetime.
              The longest a device is used, the smallest its impact will be per hour of usage.
              </p>
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
                <source src="assets/Network_Color.mp4" type="video/mp4">
              </video>
            </el-col>
            <el-col :span="14">
              <span class="bold">Core network</span>
              <p>The core network is made up of cables, relays and switches to carry your data from and to your device.
              </p>
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
                <source src="assets/Server_Color.mp4" type="video/mp4">
              </video>
            </el-col>
            <el-col :span="14">
              <span class="bold">Data center</span>
              <p>Data centers are always on and keep data available 24/7.<br>
              They need power for servers that store, encode or process data and for cooling system to ensure servers do not overheat.
              </p>
            </el-col>
          </el-row>
        </el-popover>
      </div>
    </p>
    <p>
      These infrastructures and devices, which transform our landscape and our interiors, need a colossal amount of energy and material to be built, to function and to be replaced when needed. Greenhouse gas emissions, depletion of rare earth metals, toxic emissions, including plastics, are all visible but often overlooked signs of our digital footprint on our environment. Dematerialization is indeed very expensive. CarbonViz tackles this problem by aiming to improve the perception and understanding of digital energy issues. By placing itself at the heart of our activities, within the browser itself, CarbonViz makes it possible to view the downloaded data and the corresponding quantity of CO2 emitted in a live illustration.
    </p>
  </div>
</template>

<style lang="scss">
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