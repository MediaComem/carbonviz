<script>
import { inject, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n'
import { ElCarousel, ElCarouselItem, ElRow, ElCol } from 'element-plus';
import { downloadData } from '../../../storage/dataDownload.js'

const analogiesData = [
    {
        image: 'analogy_running.png',
        title: '~ 0.4 marathon ran',
        explanation:`Assuming a marathon in 4h<br>
        ~600 Kcal / hour - 1 KWh = ~860 Kcal<br>
Total: <span class="bold"> 2.79 KWh per marathon</span>`,
        sources: '<a href="https://www.futura-sciences.com/sante/questions-reponses/sport-sport-calories-depense-t-on-ces-activites-11658/">sources</a>'
    },
    {
        image: 'analogy_swimming.png',
        title: '~ 9.5 kilometers swan',
        explanation:`~500 Kcal / hour avg.  - ~3.2 kmh avg. speed - 0.156 Kcal per meter  - 1 KWh = ~860 Kcal<br>
Total: <span class="bold"> 0.00018 KWh per meter</span>`,
        sources: '<a href="https://www.futura-sciences.com/sante/questions-reponses/sport-sport-calories-depense-t-on-ces-activites-11658/">sources</a>'
    },
    {
        image: 'analogy_bicycle.png',
        title: '~ 68kms travelled by bicycle',
        explanation:`
        ~350 Kcal / hour - ~16 kmh avg. speed - 1KWh = ~860Kcal<br>
Total: <span class="bold"> 0.0254 KWh per km</span>`,
        sources: '<a href="http://veloptimum.net/Velop/documents/9-autre/calories.html"> source 1 </a><a href="https://www.futura-sciences.com/sante/questions-reponses/sport-sport-calories-depense-t-on-ces-activites-11658/">source 2</a>'
    },
    {
        image: 'analogy_frozenpizza.png',
        title: '~ 7 frozen pizzas cooked',
        explanation:`avg. of 1 KWh consumption for an electric oven<br>
Pre-Heating : 5 minutes - Cooking : 10 minutes<br>
Total : 15 minutes = <span class="bold">1/4 KWh per pizza</span>`,
        sources: '<a href="https://www.totalenergies.fr/particuliers/parlons-energie/dossiers-energie/economie-d-energie/tout-savoir-sur-la-consommation-de-votre-four">source</a>'
    },
    {
        image: 'analogy_boiling.png',
        title: '~ 15 liters of water brought to boil',
        explanation:`Increase 1 L of 1°C = 1.162 Wh
From 20°C to 100°C = 116 Wh = 0.116 KWh per liter<br>
Total: <span class="bold">0.116KWh per liter</span>`,
        sources: '<a href="https://www.ista.com/fr/ista/blog/combien-coute-votre-production-deau-chaude-sanitaire-ecs/">sources</a>'
    },
    {
        image: 'analogy_sawing.png',
        title: '~ 85 sawn wood boards',
        explanation:`~285Kcal Kcal / hour avg.
 - 5 minutes avg. / board - 1KWh = ~860Kcal<br>
Total: <span class="bold"> 17.5 KWh per board</span>`,
        sources: '<a href="https://www.futura-sciences.com/sante/questions-reponses/sport-sport-calories-depense-t-on-ces-activites-11658/">sources</a>'
    },
]

export default {
  components: {
    ElCarousel,
    ElCarouselItem,
    ElRow, ElCol
  },
  setup() {
    const { locale, t } = useI18n({});

    const subNav = ref({
      'Journey': t('global.data_journey'),
      'Privacy': t('pages.faq.data_privacy'),
      'Observations': t('pages.faq.observations.title'),
      'Model': t('pages.faq.model.title'),
      'Modelshow': t('pages.faq.model_result'),
      'Analogies': t('pages.faq.analogies'),
      'Sources': t('pages.faq.sources')
    });

    watch(locale, async (newLocale) => {
      // Update the hashRoutes object with the new translations
      subNav.value['Journey'] = t('global.data_journey');
      subNav.value['Privacy'] = t('pages.faq.data_privacy');
      subNav.value['Observations'] = t('pages.faq.observations.title');
      subNav.value['Model'] = t('pages.faq.model.title');
      subNav.value['Modelshow'] = t('pages.faq.model_result');
      subNav.value['Analogies'] = t('pages.faq.analogies');
      subNav.value['Sources'] = t('pages.faq.sources');
    });

    const setSubNav = inject('setSubNav');
    onMounted(() => setSubNav(subNav.value) );
    function triggerDownloadData() {
      downloadData();
    };

    const analogies = ref(analogiesData);

    return { analogies, triggerDownloadData, t };
  }

}
</script>

<template>
  <div class="faq">
    <div class="content">
      <div class="data-journey" data-section="Journey">
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
      <article data-section="Privacy">
        <h1>{{ t('pages.faq.data_privacy') }}</h1>
          <p>
              {{ t('pages.faq.data_explanation_intro') }}
          </p>
          <ul>
              <li>{{ t('pages.faq.data_url') }}</li>
              <li>{{ t('pages.faq.data_header') }}</li>
              <li>{{ t('pages.faq.data_timestamp') }}</li>
              <li>{{ t('pages.faq.data_cache') }}</li>
          </ul>
          <p>
            {{ t('pages.faq.computer_duration') }}
          </p>
          <h2>{{ t('pages.faq.data_storage') }}</h2>
          <p>
              {{ t('pages.faq.data_storage_explanation') }}
          </p>
          <div>
            <button style="margin: 10px; cursor: pointer;"  @click='triggerDownloadData()'>{{ t('pages.faq.data_download') }} </button>
          </div>
          <h2>{{ t('pages.faq.data_history') }}</h2>
          <p>
            {{ t('pages.faq.data_history_explanation_intro') }}
          </p>
          <ul>
              <li>{{ t('pages.faq.data_aggregated') }}</li>
              <li>{{ t('pages.faq.data_daily') }}</li>
              <li>{{ t('pages.faq.data_monthly') }}</li>
          </ul>
          <h2>{{ t('pages.faq.open_source') }}</h2>
          <p>
            {{ t('pages.faq.open_source_explanation') }} <a href="https://github.com/MediaComem/carbonviz">Github</a>.
          </p>
      </article>
      <article data-section="Observations">
        <h1>{{ t('pages.faq.observations.title') }}</h1>
        <p>
          {{ t('pages.faq.observations.part1') }}
        </p><p>
          {{ t('pages.faq.observations.part2') }}
        </p><p>
          {{ t('pages.faq.observations.part3') }}
        </p><p>
          {{ t('pages.faq.observations.part4') }}
        </p>
      </article>
      <article data-section="Model">
        <h1>{{ t('pages.faq.model.title') }}</h1>
        <h2>{{ t('pages.faq.model.principle') }}</h2>
        <p>
          {{ t('pages.faq.model.principle_lca') }}
        </p><p>
          {{ t('pages.faq.model.principle_example_intro') }}
        </p>
        <h3>{{ t('pages.faq.model.principle_example_user_level') }}</h3>
        <ul>
          <li>{{ t('pages.faq.model.principle_example_user_computer') }}</li>
          <li>{{ t('pages.faq.model.principle_example_user_access') }}</li>
        </ul>
        <h3>{{ t('pages.faq.model.principle_example_network_level') }}</h3>
        <ul>
          <li>{{ t('pages.faq.model.principle_example_network_core') }}</li>
          <li>{{ t('pages.faq.model.principle_example_network_dc') }}</li>
        </ul>
        <el-row justify="start">
          <img src="../../../assets/icons/model_scope.png">
        </el-row>
        <h2>{{ t('pages.faq.model.data_sources') }}</h2>
        <p>
          {{ t('pages.faq.model.data_sources_1') }}
        </p><p>
          {{ t('pages.faq.model.data_sources_2') }}
        </p>
        <h2>{{ t('pages.faq.model.parameters') }}</h2>
        <p>
          {{ t('pages.faq.model.parameters_1') }}
        </p><p>
          {{ t('pages.faq.model.parameters_2') }}
        </p><p>
          {{ t('pages.faq.model.parameters_3') }}
        </p>
        <ul v-html="t('pages.faq.model.parameters_scope')"></ul>
        <p>
          {{ t('pages.faq.model.parameters_4') }}
        </p>
        <ul v-html="t('pages.faq.model.parameters_input')"></ul>
        <p>{{ t('pages.faq.model.model_link') }}<a href="https://github.com/MediaComem/carbonviz/tree/master/method">{{ t('pages.faq.model.title') }}</a></p>
        <p>
          {{ t('pages.faq.model.parameters_default') }}
        </p>
        <ul v-html="t('pages.faq.model.parameters_default_list')"></ul>
        <p>
          {{ t('pages.faq.model.parameters_customization') }}
        </p>
        <h2>{{ t('pages.faq.electricity.title') }}</h2>
        <p>
          {{ t('pages.faq.electricity.part1') }}
        </p><p>
          {{ t('pages.faq.electricity.part2') }}
        </p><p>
          {{ t('pages.faq.electricity.part3') }}
        </p><p>
          {{ t('pages.faq.electricity.part4') }}
        </p>
        <h2> {{ t('pages.faq.example') }} </h2>
        <el-row justify="start">
          <img src="../../../assets/icons/web.png">
        </el-row>
        <el-row justify="start">
          <img src="../../../assets/icons/720p.png">
        </el-row>
        <el-row justify="start">
          <img src="../../../assets/icons/4K.png">
        </el-row>
        <p>
          <b>{{ t('pages.faq.disclaimer') }}</b>: {{ t('pages.faq.disclaimer_text_video') }}
        </p>
      </article>
      <article data-section="Modelshow">
        <h1>{{ t('pages.faq.model_result_video.title') }}</h1>
        <h2>{{ t('pages.faq.model_result_video.subtitle1') }}</h2>
        <p>
          {{ t('pages.faq.model_result_video.part1') }}
        </p><p>
          {{ t('pages.faq.model_result_video.part2') }}
        </p>
        <el-row justify="start">
          <img src="../../../assets/icons/standard_vs_renewable.svg">
        </el-row>
        <p>
          {{ t('pages.faq.model_result_video.part3') }}
        </p>
        <el-row justify="start">
          <img src="../../../assets/icons/energy.svg">
        </el-row>
        <h2>{{ t('pages.faq.model_result_video.subtitle2') }}</h2>
        <p>
          {{ t('pages.faq.model_result_video.part4') }}
        </p><p>
          {{ t('pages.faq.model_result_video.part5') }}
        </p><p>
          {{ t('pages.faq.model_result_video.part6') }}
        </p>
        <el-row justify="start">
          <img src="../../../assets/icons/lifespan.svg">
        </el-row>
      </article>
      <article data-section="Analogies">
        <h1> {{ t('pages.faq.analogies') }} </h1>
        <p>
          {{ t('pages.faq.analogies_explanation1') }}
        </p><p>
          {{ t('pages.faq.analogies_explanation2') }}
        </p><p>
          {{ t('pages.faq.analogies_explanation3') }}
        </p><p>
          <b>{{ t('pages.faq.disclaimer') }}</b>: {{ t('pages.faq.disclaimer_text_analogies') }}
        </p>
        <p>
          <span class="bold">{{ t('pages.faq.analogies_legend') }}</span>
          <el-row justify="center" align="middle">
            <el-col :span="22">
              <el-carousel trigger="click" :interval="10000" height="260px" class="analogies">
                <el-carousel-item v-for="(item, index) in analogies" :key="index">
                  <el-row justify="center" align="middle">
                    <img :src="`../../../assets/icons/analogies/${item.image}`">
                  </el-row>
                  <el-row justify="center" align="middle" class="title">
                    <el-col :span="20">
                      <span> {{item.title }} </span>
                    </el-col>
                  </el-row>
                  <el-row justify="center" align="middle">
                    <el-col :span="20">
                      <span v-html="item.explanation"></span>
                    </el-col>
                  </el-row>
                  <el-row justify="center" align="middle" class="sources">
                    <el-col :span="20">
                      <span v-html="item.sources"></span>
                    </el-col>
                  </el-row>
                </el-carousel-item>
              </el-carousel>
            </el-col>
          </el-row>
        </p>
      </article>
      <article data-section="Sources">
        <h1>Sources</h1>
        <ul class="source">
          <li><span class="ref">[1]</span>	« Statistics », ITU. https://www.itu.int:443/en/ITU-D/Statistics/Pages/stat/default.aspx (consulté le juin 17, 2021).</li>
          <li><span class="ref">[2]</span>	« Growth In the Cloud ». https://www.cisco.com/c/dam/assets/sol/sp/gci/global-cloud-index-infographic.html (consulté le juin 17, 2021).</li>
          <li><span class="ref">[3]</span>	« Global trends in internet traffic, data centre workloads and data centre energy use, 2010-2019 – Charts – Data & Statistics », IEA. https://www.iea.org/data-and-statistics/charts/global-trends-in-internet-traffic-data-centre-workloads-and-data-centre-energy-use-2010-2019 (consulté le juin 21, 2021).</li>
          <li><span class="ref">[4]</span>	W. Van Heddeghem, S. Lambert, B. Lannoo, D. Colle, M. Pickavet, et P. Demeester, « Trends in worldwide ICT electricity consumption from 2007 to 2012 », Comput. Commun., vol. 50, p. 64‑76, sept. 2014, doi: 10.1016/j.comcom.2014.02.008.</li>
          <li><span class="ref">[5]</span>	« Powering the beast: why we shouldn’t worry about the Internet’s rising electricity consumption », Physics World, janv. 13, 2021. https://physicsworld.com/powering-the-beast-why-we-shouldnt-worry-about-the-internets-rising-electricity-consumption/ (consulté le juin 17, 2021).</li>
          <li><span class="ref">[6]</span>	« Did The Shift Project really overestimate the carbon footprint of online video? », The Shift Project, juin 15, 2020. https://theshiftproject.org/en/article/shift-project-really-overestimate-carbon-footprint-video-analysis/ (consulté le juin 17, 2021).</li>
          <li><span class="ref">[7]</span>	G. Wernet, C. Bauer, B. Steubing, J. Reinhard, E. Moreno-Ruiz, et B. Weidema, « The ecoinvent database version 3 (part I): overview and methodology », Int. J. Life Cycle Assess., vol. 21, no 9, p. 1218‑1230, sept. 2016, doi: 10.1007/s11367-016-1087-8.</li>
          <li><span class="ref">[8]</span>	« References – ecoinvent ». https://www.ecoinvent.org/references/references.html (consulté le juin 28, 2021).</li>
          <li><span class="ref">[9]</span>	Cisco, « Growth In the Cloud », 2017. https://www.cisco.com/c/dam/assets/sol/sp/gci/global-cloud-index-infographic.html (consulté le juin 16, 2020).</li>
          <li><span class="ref">[10]</span>	IEA, « Tracking Buildings 2019 », 2019. [En ligne]. Disponible sur: https://www.iea.org/reports/tracking-buildings-2019</li>
          <li><span class="ref">[11]</span>	M. Avgerinou, P. Bertoldi, et L. Castellazzi, « Trends in Data Centre Energy Consumption under the European Code of Conduct for Data Centre Energy Efficiency », Energies, vol. 10, no 10, p. 1470, sept. 2017, doi: 10.3390/en10101470.</li>
          <li><span class="ref">[12]</span>	Koomey, « GROWTH IN DATA CENTER ELECTRICITY USE 2005 TO 2010 », 2011.</li>
          <li><span class="ref">[13]</span>	E. Masanet, A. Shehabi, N. Lei, S. Smith, et J. Koomey, « Recalibrating global data center energy-use estimates », Science, vol. 367, no 6481, p. 984‑986, févr. 2020, doi: 10.1126/science.aba3758.</li>
          <li><span class="ref">[14]</span>	M. Leuenberger, « Life Cycle Assessment of Swiss Electricity Mixes », p. 18.</li>
          <li><span class="ref">[15]</span>	« Renewable energy – Data Centers – Google », Google Data Centers. https://www.google.com/about/datacenters/renewable/ (consulté le juin 28, 2021).</li>
          <li><span class="ref">[16]</span>	« Recommended upload encoding settings - YouTube Help ». https://support.google.com/youtube/answer/1722171?hl=en#zippy=%2Cbitrate (consulté le juin 28, 2021). Video size estimates are based on recommended encoding bitrate and may be smaller depending on actual video and youtube additionnal compression before publication.</li>
        </ul>
      </article>
    </div>
  </div>
</template>

<style scoped lang="scss">
.faq {
  display: flex;
}
.content {
  max-width: 600px;
  margin: auto;
}
.bold {
  font-weight: 700;
}
a, :deep(a) {
  color: black;
  font-style: italic;
}
a:visited {
  color: black;
}
.logos {
  img {
    height: 50px;
    width: auto;
  }
}

.bold {
  font-weight: 700;
}
ul.source {
  list-style-type: none; /* Remove bullets */
  padding: 10px; /* Remove padding */
}
span.ref {
  font-weight: 700;
  margin-left: -25px;
}
.analogies {
  background-color: #906C0D;
  color: white;
  margin: 20px;
  text-align: center;
  .title {
    font-weight: 700;
    font-size: 24px;
    margin-bottom: 10px;
  }
  .sources {
    font-size: 10px;
    font-style: italic;
    position: absolute;
    bottom: 14px;
    left: 20px;
    a, a:visited {
      color: white;
    }
  }
  img {
    width: 120px;
  }
}
.el-carousel__indicators.el-carousel__indicators--horizontal {
  margin-left: 0px;
}

.bold {
  font-weight: 700;
}
.el-popover.el-popper p {
  word-break: break-word;
}
.video-container {
  position: relative;
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

@media (prefers-color-scheme: dark) {
  a {
    color: white;
    font-style: italic;
  }
  a:visited {
    color: white;
  }
}
</style>