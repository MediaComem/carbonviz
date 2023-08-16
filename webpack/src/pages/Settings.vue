<script>
import { useI18n } from 'vue-i18n'
import { inject, onMounted, ref } from 'vue';
import { ElRow, ElCol } from 'element-plus';
import Settings from '../components/Settings.vue'

const subNav = {};


export default {
	components: { ElRow, ElCol, Settings},
	setup(props, context) {
		const { t } = useI18n({});
		const scroll = ref(null);

		const setSubNav = inject('setSubNav', scroll);
		onMounted(() => setSubNav(subNav));
		return { t, scroll };
	}
}
</script>

<template>
	<el-scrollbar ref="scroll">
		<h1 class="title">Settings</h1>
		<div class="content">
			<Settings></Settings>
		</div>
	</el-scrollbar>
</template>

<style scoped lang="scss">
.content {
	max-width: 800px;
	height: 800px;
  padding-bottom: 20px;
	font-size: 14px;
}
.content :deep(.wrapper) {
	height: unset;
	background-color: initial;
	box-shadow: initial;

}
.content :deep(h3) {
	margin: 0;
	color: black;
	margin-top: 16px;
	margin-bottom: 14px;
	font-weight: 700;
}

</style>