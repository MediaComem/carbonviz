<script>
import { inject, onMounted } from 'vue';
import { ElRow, ElCol } from 'element-plus';
import { useI18n } from 'vue-i18n'

const subNav = {
};

export default {
  components: {
    ElRow, ElCol
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
      <article>
        <h1> {{ t('pages.partners.partnersInstitution') }}</h1>
        <p> {{ t('pages.partners.institutionSupport.one') }}
          <a href="https://www.innosuisse.ch"> {{ t('pages.partners.institutionSupport.link1') }} </a>, 
          {{ t('pages.partners.institutionSupport.two') }}
          <a href="https://heig-vd.ch/rad/instituts/mei"> {{ t('pages.partners.institutionSupport.link2') }} </a>
          {{ t('pages.partners.institutionSupport.three') }}
          <a href="https://heig-vd.ch/rad/instituts/igt"> {{ t('pages.partners.institutionSupport.link3') }} </a>
          {{ t('pages.partners.institutionSupport.four') }}
          <a href="https://heig-vd.ch/"> {{ t('pages.partners.institutionSupport.link3') }} </a>
          {{ t('pages.partners.institutionSupport.end') }}
        </p>
      </article>
      <el-row justify="center" align="middle" class="logos">
        <el-col :span="6"><img src="../../../icons/logos/innosuisse.svg"></el-col>
        <el-col :span="6"><img src="../../../icons/logos/mei.svg"></el-col>
        <el-col :span="6"><img src="../../../icons/logos/igt.svg"></el-col>
      </el-row>
      <article>
        <h1> {{ t('pages.partners.partnersIndustrial') }}</h1>
        <p> {{ t('pages.partners.industrialSupport.one') }}
          <a href="https://www.lausanne.ch/vie-pratique/energies-et-eau/services-industriels.html"> {{ t('pages.partners.industrialSupport.link1') }} </a>, 
          <a href="https://www.equiwatt-lausanne.ch/"> {{ t('pages.partners.industrialSupport.link2') }} </a>
          {{ t('pages.partners.industrialSupport.three') }}
          <a href="https://www.lausanne.ch/vie-pratique/energies-et-eau/services-industriels/a-propos-sil/notre-engagement/politique/fonds-efficacite-energetique"> {{ t('pages.partners.industrialSupport.link3') }} </a>
        </p>
      </article>
      <el-row justify="center" align="middle" class="logos">
        <el-col :span="6"><img src="../../../icons/logos/logoSiL.svg"></el-col>
        <el-col :span="6"><img src="../../../icons/logos/logo-equiwatt-large.png"></el-col>
        <el-col :span="6"><img src="../../../icons/logos/logo-fond-FEE.png"></el-col>
      </el-row>
      <article>
        <h1>{{ t('pages.partners.team.project') }}</h1>
        <el-row justify="center" align="middle" class="logos">
          <el-col :span="8"><span class="bold">{{ t('pages.partners.team.management') }}</span></el-col> <el-col :span="16"><a href="mailto:laurent.bolli@heig-vd.ch">Laurent Bolli</a></el-col>
        </el-row>
        <el-row justify="center" align="middle" class="logos">
          <el-col :span="8"><span class="bold">{{ t('pages.partners.team.ux') }}</span></el-col> <el-col :span="16"> Yoann Douillet, Gaël Paccard</el-col>
        </el-row>
        <el-row justify="center" align="middle" class="logos">
          <el-col :span="8"><span class="bold">{{ t('pages.partners.team.tests') }}</span></el-col> <el-col :span="16"> Romain Sandoz</el-col>
        </el-row>
        <el-row justify="center" align="middle" class="logos">
          <el-col :span="8"><span class="bold">{{ t('pages.partners.team.dev') }}</span></el-col> <el-col :span="16"> <a href="mailto:stephane.lecorney@heig-vd.ch">Stéphane Lecorney</a> (Lead developer), Nicolas Chabloz (front-end), James Taylor (data management)</el-col>
        </el-row>
        <el-row justify="center" align="middle" class="logos">
          <el-col :span="8"><span class="bold">{{ t('pages.partners.team.model') }}</span></el-col> <el-col :span="16"> Pierryves Padey</el-col>
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
  </el-scrollbar>
</template>

<style scoped lang="scss">
.content {
  max-width: 1000px;
  padding-bottom: 20px;
}
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