<script>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check, Close } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus'


export default {
	setup() {
		const { t } = useI18n({});
		const showMiniViz = ref(true);
		const miniVizStatusUpdating = ref(false);
		const shareData = ref(false);
		const shareDataStatusUpdating = ref(false);
		const disablePeriod = ref(0);
		const marks = ref({
			30: '30min',
			60: '1H',
			120: '2H',
			180: '3H'
		})
		const devicePurchaseDate = ref('');

		const setMinvizDisplay = (status) => {
			miniVizStatusUpdating.value = true;
			const text = status ? "visable" : "hidden";
			return new Promise((resolve) => {
				setTimeout(() => {
					miniVizStatusUpdating.value = false;
					ElMessage.success(
						t('components.settings.confirmMiniVizStatus', { text })
					);
					return resolve(true)
				}, 500)
			});
		};
		const setShareData = (status) => {
			shareDataStatusUpdating.value = true;
			const text = status ? "shared" : "not shared";
			return new Promise((resolve) => {
				setTimeout(() => {
					shareDataStatusUpdating.value = false;
					ElMessage.success(
						t('components.settings.confirmShareData', { text })
					);
					return resolve(true)
				}, 500)
			});
		};
		onMounted(async () => {
			// ** need to confirm user settings logic to store in local storage
		});

		return {
			showMiniViz, miniVizStatusUpdating, shareData, shareDataStatusUpdating, disablePeriod, marks, devicePurchaseDate,
			Check, Close, t, setMinvizDisplay, setShareData
		};
	}
}
</script>

<template>
	<div id="settingsWrapper">
		<div id="calender">
			<div>
				<h3> {{ t('components.settings.usingSince') }} </h3>
				<el-date-picker
					v-model="devicePurchaseDate"
					type="date"
					:placeholder="t('components.settings.datePlaceholder')"
					size="small"
				/>
			</div>
			<p> {{ t('components.settings.dataUseCase') }} </p>
		</div>
		<div id="showMiniViz">
			<h3> {{ t('components.settings.showMiniViz') }} </h3>
			<el-switch
				v-model="showMiniViz"
				class="mt-2"
				size="large"
				:active-icon="Check"
				:inactive-icon="Close"
				inline-prompt
				style="--el-switch-on-color: var(--green)"
				:loading="miniVizStatusUpdating"
				@change="setMinvizDisplay"
			/>
		</div>
		<div id="disable">
			<h3> {{ t('components.settings.disablePlugin') }} </h3>
			<div class="sliderWrapper">
				<el-slider
					v-model="disablePeriod"
					:marks="marks"
					:max="180"
					:step="10"
				/>
			</div>
		</div>
		<div id="share">
			<h3> {{ t('components.settings.shareData') }} </h3>
			<p> {{ t('components.settings.shareDataInfo') }} </p>
			<el-switch
				v-model="shareData"
				class="mt-2"
				size="large"
				:active-icon="Check"
				:inactive-icon="Close"
				inline-prompt
				style="--el-switch-on-color: var(--green)"
				:loading="shareDataStatusUpdating"
				@change="setShareData" />
		</div>
		<div id="delete">
			<h3> {{ t('components.settings.deleteData') }} </h3>
			<p> {{ t('components.settings.deleteDataInfo') }} </p>
		</div>
	</div>
</template>

<style scoped>
#settingsWrapper {
	/*  height: 490px;
    width: 480px; */
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 100px 80px 100px 110px 100px;
	grid-template-areas:
		"calender"
		"showMiniViz"
		"disable"
		"share"
		"delete";
	border-radius: 10px 10px 10px 10px;
	box-shadow: inset 0px 0px 5px 0px var(--dark-grey);
	background-color: var(--activeBackground);
}

#settingsWrapper>div {
	margin: 10px;
}

#calender {
	grid-area: calender;
}

#calender h3 {
	float: left;
	margin-right: 20px;
}

#showMiniViz {
	grid-area: showMiniViz;
}

#disable {
	grid-area: disable;
}

.sliderWrapper .el-slider {
	margin-top: 10px;
	width: 300px;
}

#share {
	grid-area: share;
}

#delete {
	grid-area: delete;
}

h3 {
	margin: 0;
}

#settingsWrapper p {
	width: 230px;
	margin: 0px;
	margin-top: 3px;
}
</style>

<style>
.sliderWrapper .el-slider .el-slider__button {
	background-color: var(--dark-grey);
}

.el-slider__stop.el-slider__marks-stop {
	--el-border-radius-circle: 0;
	height: 8px;
	width: 2px;
	top: -2px;
}
</style>