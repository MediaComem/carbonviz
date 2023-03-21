<script>
import { inject, onMounted } from 'vue';
import { ElRow, ElCol } from 'element-plus';

const subNav = {
};

export default {
  components: {
    ElRow, ElCol
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
    <article>
      <h1>Institutional Partners</h1>
    <p>
      The CarbonViz project is supported by <a href="https://www.innosuisse.ch">Innosuisse</a>, the scientific teams of the <a href="https://heig-vd.ch/rad/instituts/mei">Media Engineering Institute </a>(MEI) and the <a href="https://heig-vd.ch/rad/instituts/igt">Institut de Génie Thermique</a> (IGT) of the <a href="https://heig-vd.ch/">Haute Ecole d’Ingénierie et de Gestion du canton de Vaud</a> (HEIG-VD).
    </p>
    </article>
    <el-row justify="center" align="middle" class="logos">
      <el-col :span="6"><img src="assets/innosuisse.svg"></el-col>
      <el-col :span="6"><img src="assets/mei.svg"></el-col>
      <el-col :span="6"><img src="assets/igt.svg"></el-col>
    </el-row>
    <article>
      <h1>Project team</h1>
      <el-row justify="center" align="middle" class="logos">
        <el-col :span="8"><span class="bold">Project Management</span></el-col> <el-col :span="16"><a href="mailto:laurent.bolli@heig-vd.ch">Laurent Bolli</a></el-col>
      </el-row>
      <el-row justify="center" align="middle" class="logos">
        <el-col :span="8"><span class="bold">Interaction design</span></el-col> <el-col :span="16"> Yoann Douillet, Gaël Paccard</el-col>
      </el-row>
      <el-row justify="center" align="middle" class="logos">
        <el-col :span="8"><span class="bold">User tests</span></el-col> <el-col :span="16"> Romain Sandoz</el-col>
      </el-row>
      <el-row justify="center" align="middle" class="logos">
        <el-col :span="8"><span class="bold">Web development</span></el-col> <el-col :span="16"> <a href="mailto:stephane.lecorney@heig-vd.ch">Stéphane Lecorney</a> (Lead developer), Nicolas Chabloz (front-end), James Taylor (data management)</el-col>
      </el-row>
      <el-row justify="center" align="middle" class="logos">
        <el-col :span="8"><span class="bold">Computation model</span></el-col> <el-col :span="16"> Pierryves Padey</el-col>
      </el-row>
    </article>
    <article>
      <h1>Contact / Feedback</h1>
      <el-row justify="center" align="middle" class="logos">
        <el-col :span="8"><span class="bold">Media / Business</span></el-col> <el-col :span="16"><a href="mailto:laurent.bolli@heig-vd.ch">Laurent Bolli</a></el-col>
      </el-row>
     <el-row justify="center" align="middle" class="logos">
        <el-col :span="8"><span class="bold">Feedback / Bugs</span></el-col> <el-col :span="16"> <a href="mailto:stephane.lecorney@heig-vd.ch">Stéphane Lecorney</a></el-col>
      </el-row>
    </article>
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
.bold {
  font-weight: 700;
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