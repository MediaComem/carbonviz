<script>
import { useI18n } from 'vue-i18n'
import { inject, onMounted } from 'vue';
import { ElRow, ElCol } from 'element-plus';

const subNav = {};

export default {
	components: { ElRow, ElCol},
	setup(props, context) {
		const { t } = useI18n({});
		const setSubNav = inject('setSubNav');
		onMounted(() => setSubNav(subNav));
		return { t };
	}
}
</script>

<template>
	<el-scrollbar>
		<article>
			<h2> {{ t('pages.settings.partnersInstitution') }}</h2>
			<p> {{ t('pages.settings.institutionSupport.one') }}
				<a href="https://www.innosuisse.ch"> {{ t('pages.settings.institutionSupport.link1') }} </a>, 
				{{ t('pages.settings.institutionSupport.two') }}
				<a href="https://heig-vd.ch/rad/instituts/mei"> {{ t('pages.settings.institutionSupport.link2') }} </a>
				{{ t('pages.settings.institutionSupport.three') }}
				<a href="https://heig-vd.ch/rad/instituts/igt"> {{ t('pages.settings.institutionSupport.link3') }} </a>
				{{ t('pages.settings.institutionSupport.four') }}
				<a href="https://heig-vd.ch/"> {{ t('pages.settings.institutionSupport.link3') }} </a>
				{{ t('pages.settings.institutionSupport.end') }}
			</p>
		</article>
		<el-row justify="center" align="middle" class="logos">
			<el-col :span="6"><img src="../../../icons/logos/innosuisse1.svg"></el-col>
			<el-col :span="6"><img src="../../../icons/logos/mei.svg"></el-col>
			<el-col :span="6"><img src="../../../icons/logos/igt.svg"></el-col>
		</el-row>
		<article>
			<h2> {{ t('pages.settings.partnersInd') }} </h2>
			<p> {{ t('pages.settings.indSupport') }} </p>
		</article>
			<el-row justify="center" align="middle" class="logos">
				<el-col :span="6"><img src="../../../icons/logos/logoSil.svg" alt="" width="183" height="73"></el-col>
				<el-col :span="6"><img src="../../../icons/logos/logo-equiwatt-large.png" alt="" width="200" height="60"></el-col>
			</el-row>
	</el-scrollbar>
</template>

<style scoped lang="scss">
article h2 {
	margin-left: 0px;
}
a {
	color: black;
  font-style: italic;
}
a:visited {
  color: black;
}
.logos {
	margin-top: 30px;
  img {
    height: 50px;
    width: auto;
  }
}
</style>