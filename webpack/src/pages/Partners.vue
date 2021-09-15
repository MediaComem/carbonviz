<script>
import { inject, onMounted } from 'vue';

const subNav = {
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
      <h1>Institutional Partners</h1>
    <p>
      The CarbonViz project is supported by <a href="https://www.innosuisse.ch">Innosuisse</a>, the scientific teams of the <a href="https://heig-vd.ch/rad/instituts/mei">Media Engineering Institute </a>(MEI) and the <a href="https://heig-vd.ch/rad/instituts/igt">Institut de Génie Thermique</a> (IGT) of the <a href="https://heig-vd.ch/">Haute Ecole d’Ingénierie et de Gestion du canton de Vaud</a> (HEIG-VD).
    </p>
    </article>
    <el-row justify="center" align="center" class="logos">
      <el-col :span="6"><img src="assets/innosuisse.svg"></el-col>
      <el-col :span="6"><img src="assets/mei.svg"></el-col>
      <el-col :span="6"><img src="assets/igt.svg"></el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
a {
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
</style>