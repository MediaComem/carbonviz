<script>
import { inject, onMounted, ref } from 'vue';

const subNav = {
  'Observations': 'Observations',
  'Model': 'CarbonViz Model',
  'Modelshow': 'What the model shows',
  'Analogies': 'Analogies',
  'Sources': 'Sources'
};

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
        image: 'analogy_boilingwater.png',
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

  setup() {
    const setSubNav = inject('setSubNav');
    onMounted(() => setSubNav(subNav));
    const analogies = ref(analogiesData);
    return {analogies};
  }

}
</script>

<template>
  <div>
    <article data-section="Observations">
      <h1>Observations</h1>
      <p>
        According to the International Telecommunication Union, there were around 4 billion internet users in 2019 [1]. It is 4 times the number of 2015's users. This user growth implies that the data traffic also drastically increased to reach around 20.6 zettabyte (ZB), which represent 2e13 gigabyte (GB), and is 12 times the 2010's consumption [2] [3]. Accordingly, the electricity consumption of the internet significantly increased to reach around 5% of the world's consumption in 2012, and could reach 20% by 2025 [4] [5].
      </p><p>
        The increase in online usage, and the growth of data, raises the question of the environmental footprint of digital technology. What impact our digital activities have on climate change? How much energy do we consume for those activities? How much non-renewable resources are used to build our devices? How much energy was needed to build our devices or servers inside the data centers?
      </p><p>
        It is at this moment hard to find answers to such questions and many sources are in contradiction [6]. In addition, current models are not always transparent and not suitable for Switzerland, especially regarding the specific swiss energy mix that is constituted in a majority of hydro power. That's why we decided to design a new transparent calculation model to understand the environmental impact of digital activities to be used in Switzerland.
      </p><p>
        This model was developed as part of the CarbonViz project supported by Innosuisse, the scientific teams of the Media Engineering Institute (MEI) and the Institut de Génie Thermique (IGT) of the Haute Ecole d'Ingénierie et de Gestion du canton de Vaud (HEIG-VD).
      </p>
    </article>
    <article data-section="Model">
      <h1>CarbonViz Model</h1>
      <h2>1. Principle</h2>
      <p>
        The calculation model of CarbonViz follows the life Cycle Assessment principles in order to consider the overall impacts of the entire value chain that lead to the provided online service. We therefore consider more than the energy required to provide the service, but also the energy that was used to manufacture the device.
      </p><p>
        For example, considering the streaming of an online video, different elements are to be considered to calculate the impact of this service. The following items are required to enable viewing of an online video from the data center hosting the video to the user's screen:
      </p>
      <h3>At a user level</h3>
      <ul>
        <li>a computer</li>
        <li>a network access device</li>
      </ul>
      <h3>At the level of the global network</h3>
      <ul>
        <li>an internet network (optical fiber, service provider equipment, etc.)</li>
        <li>a data center</li>
      </ul>
      <el-row justify="left">
        <img src="assets/model_scope.png">
      </el-row>
      <h2>2. Data sources</h2>
      <p>
        In order to design our calculation model, Ecoinvent was used for the primary data regarding equipment and electricity impacts [7]. Ecoinvent is a reference database for lifecycle inventory data with well documented process data for thousands of products. It is the most comprehensive, transparent, international LCI database. It is maintained by  a not-for-profit association founded by several institutes of the ETH Domain (ETH Zurich, EPF Lausanne, Paul Scherrer Institute and Empa) and by Agroscope. The Ecoinvent Database is trusted by more than 3'000 organisations worldwide, ranging from multinational corporations to leading universities [8].
      </p><p>
        In order to estimate electricity consumption of core networks and data centers based on data bandwidth, internet and electricity reports from Cisco and the International Energy Agency were used [9], [10]. Figures were cross-checked with different scientific papers to ensure consistency [11] [13].
      </p>
      <h2>3. Parameters</h2>
      <p>
        For each of  the elements needed for digitial activities, the entire life cycle must be considered, from the extraction of the resources necessary to manufacture the equipment, to its end of life. We must also not forget the indirect impacts. For example, a server in a data center requires not only energy for its power supply, but also energy for its cooling.
      </p><p>
        In order to simplify our model, the data center building and cables are excluded. With server and network equipment in use 24/7, the share of the manufacturing impact for data centers and the internet is considered negligible.
      </p><p>
        Our CarbonViz model will take into account the following impacts:
      </p>
      <ul>
        <li>the power consumption of the data center (server and indirect consumption such as air conditioning)</li>
        <li>the power consumption of the network between the data center and the user</li>
        <li>the manufacture and electricity consumption of the internet access system</li>
        <li>the manufacture of the computer</li>
        <li>the power consumption of the computer</li>
      </ul>
      <p>
        The various impacts related to manufacturing and electricity extracted from the Ecoinvent database allows a fine choice among different parameters:
      </p>
      <ul>
        <li>type of computer (laptop or desktop)</li>
        <li>computer life (amortization of the impact of manufacturing)</li>
        <li>additional peripherals or not (screen, mouse, keyboard)</li>
        <li>user source of electricity (standard Swiss mix or 100% renewable Swiss mix)</li>
        <li>grid electricity source (standard Swiss mix or 100% Swiss renewable, European mix, 100% European renewable mix)</li>
        <li>source of electricity for the data center (Swiss standard mix or 100% Swiss renewable, European mix, 100% European renewable mix)</li>
        <li>amount of data transferred</li>
      </ul>
      <p>The model definition is available here: <a href="https://github.com/MediaComem/carbonviz/tree/master/model">Carbonviz model</a></p>
      <p>
        In its generic version, CarbonViz does not integrate all these parameters and sets the generic values for some of them. For instance, the following parameters are set by default:
      </p>
      <ul>
        <li>Computer: laptop computer (lifetime 6.5 years – average office usage 1917 hours/year)</li>
        <li>No additional screen, keyboard or mouse</li>
        <li>Internet access and router lifetime: 6 years</li>
        <li>Data center electricity usage: 6.16e-11 kWh/bytes</li>
        <li>Core network average electricity usage: 8.39e-11 kWh/bytes</li>
        <li>Home/Office electricity source: standard CH electricity mix</li>
        <li>Core network electricity source: standard CH medium voltage</li>
        <li>Data center electricity source: standard EU medium voltage</li>
      </ul>
      <p>
        Whenever used by a company, these parameters can be modified to suit its specifications. For instance the following parameters could be customized: computer specifications, device lifetime, custom office electricity source in case of known electricity mix.
      </p>
      <h2>4. Electricity</h2>
      <p>
        An important part of the impact assessment is dependent on the energy source used to power the elements in the model: electricity used by data centers, electricity used by the core network, electricity used at home or at the office.
      </p><p>
        Electricity can be generated from renewable sources (solar, wind, biomass, etc.) or non-renewable sources (coal, oil, gaz, nuclear, etc.). The electricity used is then a mix of those different sources. Each country has a different mix of sources. For instance, the electricity mix consumed in Switzerland is composed of roughly 35% hydro power and 41% nuclear [14]. In some cases a user or a company can decide to purchase only electricity from renewable-energy, in that case a 100% renewable electricy mix is used. In Switzerland the 100% renewable mix is composed at 98% of electricity from hydro power plant.
        Some cloud providers like Google also purchased 100% renewable energy to cover the consumption of their data centers [15].
      </p><p>
        The climate impact from electricity can change drastically based on the electricity mix used. 1kWh of electricity from the 100% renewable mix in Switzerland will emit only 4.4g of fossil Co2 while the standard mix will emit 105g [14].
      </p><p>
        The grey energy encapsulated in 1kWh of electricity also depends a lot on the source of energy, electricity from fossil fuels will depend on much more primary energy, in particular due to the low efficiency while converting fossil energy to electricity and loss of energy through heat.
      </p>
      <h2>5. Example result for theoretical online activities in a browser</h2>
      <el-row justify="left">
        <img src="assets/web.png">
      </el-row>
      <el-row justify="left">
        <img src="assets/720p.png">
      </el-row>
      <el-row justify="left">
        <img src="assets/4K.png">
      </el-row>
      <p>
        <b>Disclamer</b>: Video size estimates are based on recommended encoding bitrate and may be smaller depending on actual video and youtube additionnal compression before publication.
      </p>
    </article>
    <article data-section="Modelshow">
      <h1>What the method shows for 1H of 720p video</h1>
      <h2>1. Global Warming and energy impact</h2>
      <p>
        Let's analyze the climate impact (measured by the Global Warming Potential in kg CO2 equivalent) of 1 hour video streaming at 720p.
      </p><p>
        The CarbonViz method clearly shows that the Global Warming Potential (GWP) of watching a 720p video for one hour on a 6.5 years lifespan laptop is significantly lower when renewable energy mix is used compared to a standard energy mix. In the case of video streaming, this is mainly due to the impact of the server electricity and the core network electricity which represents more than 2/3 of the impact in case of a standard mix.As can be seen below, in case of renewable mix, the embodied impact of the laptop (the impact coming from the full manufaturing and transport) becomes  predominant. Both end users and internet services have an impact on the GWP: the impact for internet services being highly dependent on the source of energy (renewable or standard), the end-user impact coming mainly from the device manufacturing.
      </p>
      <el-row justify="left">
        <img src="assets/standard_vs_renewable.png">
      </el-row>
      <p>
        The method also shows that the energy needed (primary energy to produce the electricity) to watch the video is much lower with a renewable mix. This is due to the large quantity of Non Renewable Energy (NRE) used in a standard mix compared to the renewable mix that is based more on Renewable Energy (RE). Indeed, the primary energy needed for non-renewable electricity production is higher in case of non renewable sources (in part due to loss in heating energy during electricity production from fossiel fuels for example).
      </p>
      <el-row justify="left">
        <img src="assets/energy.png">
      </el-row>
      <h2>2. Compared impact of a 6.5 and 4 year lifespan laptop</h2>
      <p>
        CarbonViz assumes by default a 6.5 years lifetime for computers. Let’s check the impact if the user renews his computer after only 4 years.
      </p><p>
        When watching a 720p video for 1 hour, we observe that the GWP is noticeably lower with a 6.5 year lifespan laptop than a 4 year one. The end user choice of computer lifespan also has an influence on the impact to reduce the GWP.
      </p><p>
        It is already the case in the video streaming scenario where internet services impact is predominant. That is even more relevant in a more usual scenario where most of the active time of the computer is office work.
      </p>
      <el-row justify="left">
        <img src="assets/lifespan.png">
      </el-row>
    </article>
    <article data-section="Analogies">
      <h1>Analogies</h1>
      <p>
        As explained by the CarbonViz model, data centers, the core network, and your computer need electricity to function to allow you to conduct web activities. But do you really realize how much energy is involved? According to the results of our model, 1 hour of video streaming can represent up to 1KWh of energy. To what this amount of energy can be compared ?
      </p><p>
        This is the question we asked several people while conducting brainstorming sessions with the goal to understand more what’s their understanding of energy and how can we compare a specific amount of energy to make it more tangible. The brainstorming sessions brought us many possible analogies to talk about a quantity of energy. We choose and implemented multiple and heterogeneous analogies to help bridge the gap between web activities and the real world.
      </p><p>
        In addition to energy analogies, we also wanted to find analogies for data consumption with the same goal in mind; help the users realize what represents a certain amount of data.
      </p><p>
        <b>Disclaimer</b> : It is important to keep in mind that the calculation model of these analogies is not 100% accurate and presents an order of magnitude, based on various sources.
      </p>
      <p>
        <span class="bold">1 hour of 1080p Video streaming can represent:</span>
        <el-row justify="center" align="center">
          <el-col :span="22">
            <el-carousel trigger="click" :interval="10000" height="260px" class="analogies">
              <el-carousel-item v-for="(item, index) in analogies" :key="index">
                <el-row justify="center" align="center">
                  <img :src="`assets/${item.image}`">
                </el-row>
                <el-row justify="center" align="center" class="title">
                  <el-col :span="20">
                    <span> {{item.title }} </span>
                  </el-col>
                </el-row>
                <el-row justify="center" align="center">
                  <el-col :span="20">
                    <span v-html="item.explanation"></span>
                  </el-col>
                </el-row>
                <el-row justify="center" align="center" class="sources">
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
</template>

<style lang="scss">
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
a {
  color: black;
  font-style: italic;
}
a:visited {
  color: black;
}
</style>