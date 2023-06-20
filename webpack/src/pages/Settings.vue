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
		<h1>Settings</h1>
	</el-scrollbar>
</template>

<style scoped lang="scss">
article h2 {
	margin-left: 0px;
}
</style>