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

		const setSubNav = inject('setSubNav');
		onMounted(() => setSubNav(subNav));
		return { t };
	}
}
</script>

<template>
	<div class="settings">
		<div class="content">
			<h1 class="title">Settings</h1>
			<Settings></Settings>
		</div>
	</div>
</template>

<style scoped lang="scss">
.settings {
	display: flex;
}
.content {
	max-width: 600px;
	height: 800px;
  margin: auto;
  padding-bottom: 20px;
	font-size: 14px;
}
.content :deep(.wrapper) {
	height: unset;
	background-color: initial;
	box-shadow: initial;
}
.content :deep(#settingsWrapper > div#lifetime),
.content :deep(#settingsWrapper > div#minivizDisplay),
.content :deep(#settingsWrapper > div#download),
.content :deep(#settingsWrapper > div#delete) {
	margin-left: 0px;
}

.content :deep(h3) {
	margin: 0;
	color: black;
	margin-top: 16px;
	margin-bottom: 14px;
	font-weight: 700;
}

</style>