<script>
import { inject, onMounted } from 'vue';

const subNav = {
  'Observations': 'Observations',
  'Model': 'CarbonViz Model',
  'Modelshow': 'What the model shows',
  'Analogies': 'Analogies',
  'Sources': 'Sources'
};

export default {

  setup() {
    const setSubNav = inject('setSubNav');
    onMounted(() => setSubNav(subNav));
    return {};
  }

}
</script>

<template>
  <div>
    <article>
      <h1>Observations</h1>
      <p>
        According to the International Telecommunication Union, there were around 4 billions internet users in 2019 [1]. It is 4 times the number of 2015's users. This user growth imply that the data traffic also drastically increased to reach around 20.6 zettabyte (ZB), which represent 2e13 gigabyte (GB), and is 12 times the 2010's consumption [2] [3]. Accordingly, the electricity consumption of internet significantly raised to reach around 5% of world's consumption in 2012, and could reach 20% by 2025 [4] [5].
      </p><p>
        The increase of online uses, and the growth of data, raise the question of the environmental footprint of digital technology. What impact our digital activities have on climate change? How much energy do we consume for those activities? How much non-renewable resources are used to build our devices? How much energy was needed to build our devices or servers inside the data centers?
      </p><p>
        It is at the moment hard to find answers to such questions and many sources are in contradiction [6]. In addition, current models are not always transparent and not suitable for Switzerland, specially regarding the specific swiss energy mix that is constituted in majority of hydro power. That's why we decided to design a new transparent calculation model to understand the environmental impact of digital activities to be used in Switzerland.
      </p><p>
        This model was developed as part of the CarbonViz project supported by Innosuisse, the scientific teams of the Media Engineering Institute (MEI) and the Institut de Génie Thermique (IGT) of the Haute Ecole d'Ingénierie et de Gestion du canton de Vaud (HEIG-VD).
      </p>
    </article>
    <article>
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
      <!-- todo [Link to model on Github] -->
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
        Whenever used by a company, these parameters can be modified to suit its specifications. For instance the following parameters could be customize: computer specifications, device lifetime, custom office electricity source in case of known electricity mix.
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
      <p>
        <b>Disclamer</b>: Video size estimates are based on recommended encoding bitrate and may be smaller depending on actual video and youtube additionnal compression before publication.
      </p>
    </article>
    <article>
      <h1>What the method shows for 1H of 720p video</h1>
      <h2>1. Global Warming and energy impact</h2>
      <p>
        Let's analyze the climate impact (measured by the Global Warming Potential in kg CO2 equivalent) of 1 hour video streaming at 720p.
      </p><p>
        The CarbonViz method clearly shows that the Global Warming Potential (GWP) of watching a 720p video for one hour on a 6.5 years lifespan laptop is significantly lower when renewable energy mix is used compared to a standard energy mix. In the case of video streaming, this is mainly due to the impact of the server electricity and the core network electricity which represents more than 2/3 of the impact in case of a standard mix.As can be seen below, in case of renewable mix, the embodied impact of the laptop (the impact coming from the full manufaturing and transport) becomes  predominant. Both end users and internet services have an impact on the GWP: the impact for internet services being highly dependent on the source of energy (renewable or standard), the end-user impact coming mainly from the device manufacturing.
      </p><p>
        The method also shows that the needed energy (primary energy to produce the electricity) to watch the video is much lower with a renewable mix. This is due to the large quantity of Non Renewable Energy (NRE) used in a standard mix compared to the renewable mix that is based more on Renewable Energy (RE). Indeed, the primary energy needed for non-renewable electricity production is higher in case of non renewable sources (in part due to loss in heating energy during electricity production from fossiel fuels for example).
      </p>
      <h2>2. Compared impact of a 6.5 and 4 year lifespan laptop</h2>
      <p>
        CarbonViz assumes by default a 6.5 years lifetime for computers. Let’s check the impact if the user renews his computer after only 4 years.
      </p><p>
        When watching a 720p video for 1 hour, we observe that the GWP is noticeably lower with a 6.5 year lifespan laptop than a 4 year one. The end user choice of computer lifespan also has an influence on the impact to reduce the GWP.
      </p><p>
        It is already the case in the video streaming scenario where internet services impact is a predominant. That is even more relevant in a more usual scenario where most of the active time of the computer is office work.
      </p>
    </article>
    <article>
      <h1>Analogies</h1>
      <p>
        As explained by the CarbonViz model, data centers, the core network, and your computer need electricity to function to allow you to conduct web activities. But do you really realize how much energy is involved? According to the results of our model, 1 hour of video streaming can represent up to 1KWh of energy. To what this amount of energy can be compared ?
      </p><p>
        This is the question we asked several people while conducting brainstorming sessions with the goal to understand more what’s their understanding of energy and how can we compare a specific amount of energy to make it more tangible. The brainstorming sessions brought us many possible analogies to talk about a quantity of energy. We chose and implemented multiple and heterogeneous analogies to help bridge the gap between web activities and the real world.
      </p><p>
        In addition to energy analogies, we also wanted to find analogies for data consumption with the same goal in mind; help the users realize what represents a certain amount of data.
      </p><p>
        <b>Disclaimer</b> : It is important to keep in mind that the calculation model of these analogies is not 100% accurate and presents an order of magnitude, based on various sources.
      </p>
    </article>
  </div>
</template>

<style scoped>

</style>