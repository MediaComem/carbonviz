<script>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check, Close } from '@element-plus/icons-vue';
import { ElConfigProvider, ElMessage } from 'element-plus';
import { saveSettings, retrieveSettings } from '../utils/settings.js';
import { formatCo2, roundToPrecision } from '../utils/format.js';
import { co2ImpactHome } from '../../../model/model.js';;

import en from 'element-plus/dist/locale/fr.mjs'
import fr from 'element-plus/dist/locale/fr.mjs'
import 'dayjs/locale/fr'

export default {
	setup() {
		const { t, locale } = useI18n({});
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
		const now = new Date();
		const nowMinus6HalfYears = new Date();
		nowMinus6HalfYears.setMonth(now.getMonth() - 78);
		const deviceMonthStart = ref(nowMinus6HalfYears);
		const deviceMonthEnd = ref(now);
		//const lifetimeLaptopYears = computed(()=> (deviceMonthEnd.value - deviceMonthStart.value)/(365.25 * 24 * 3600 * 1000));
		const computer = ref('laptop');
		const yearsSincePurchase = ref(6);
		const yearsRemaining = ref(0);
		const lifetimeLaptopYears = computed(() => yearsSincePurchase.value + yearsRemaining.value);

		retrieveSettings().then(settings => {
			yearsSincePurchase.value = settings.yearsSinceComputerPurchase;
			yearsRemaining.value = settings.yearsComputerRemaining;
			showMiniViz.value = settings.showMiniviz;
			computer.value = settings.computer;
			disablePeriod.value = settings.deactivateUntil;
		});

		const setMinvizDisplay = (status) => {
			miniVizStatusUpdating.value = true;
			const text = status ? "visible" : "hidden";
			saveSettings('showMiniviz', status).then(() => {
				miniVizStatusUpdating.value = false;
				ElMessage.success(
					t('components.settings.confirmMiniVizStatus', { text })
				);
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
		const lifetimeUpdate = () => {
			saveSettings('yearsSinceComputerPurchase', yearsSincePurchase.value);
			saveSettings('yearsComputerRemaining', yearsRemaining.value);
			saveSettings('lifetimeComputer', lifetimeLaptopYears.value);
		}

		return {
			showMiniViz, miniVizStatusUpdating, shareData, shareDataStatusUpdating, disablePeriod, marks,
			yearsSincePurchase, yearsRemaining, lifetimeLaptopYears, locale, en, fr,
			Check, Close,
			t, roundToPrecision, formatCo2, setMinvizDisplay, setShareData, lifetimeUpdate, co2ImpactHome
		};
	}
}
</script>

<template>
	<el-config-provider :locale="locale === 'en' ? en : fr">
		<div id="settingsWrapper">
			<div id="calendar">
				<el-row align="middle">
					<el-col :span="15">
						<h3> {{ t('components.settings.usingSince') }} </h3>
					</el-col>
					<el-col :span="7">
						<el-input-number v-model="yearsSincePurchase" :min="0" size="small" @change="lifetimeUpdate" />
					</el-col>
					<el-col :span="2">
						{{ t('global.years') }}
						<!--
						<el-date-picker
						v-model="deviceMonthStart"
						type="month"
						:placeholder="t('components.settings.datePlaceholder')"
						size="small"
					/>
						-->
					</el-col>
				</el-row>
				<el-row align="middle">
					<el-col :span="15">
						<h3> {{ t('components.settings.usingUntil') }} </h3>
					</el-col>
					<el-col :span="7">
						<el-input-number v-model="yearsRemaining" :min="0" size="small" @change="lifetimeUpdate" />
					</el-col>
					<el-col :span="2">
						{{ t('global.years') }}
						<!--
						<el-date-picker
							v-model="deviceMonthEnd"
							type="month"
							:placeholder="t('components.settings.datePlaceholder')"
							size="small"
						/>
						-->
					</el-col>
				</el-row>
				<p> {{ t('components.settings.dataUseCase') }} </p>
				<el-row>
					<el-col :span="12" justify="center">6.5 years (default)</el-col>
					<el-col :span="12" justify="center"> {{ roundToPrecision(lifetimeLaptopYears, 1) }} years </el-col>
				</el-row>
				<el-row>
					<el-col :span="12">8 hours of computer usage represents: {{ formatCo2(co2ImpactHome(8 * 3600), 0)
					}}</el-col>
					<el-col :span="12">8 hours of computer usage represents: {{ formatCo2(co2ImpactHome(8 * 3600,
						lifetimeLaptopYears), 0) }} -XX%</el-col>
				</el-row>
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
	</el-config-provider>
</template>

<style scoped>
#settingsWrapper {
	/*  height: 490px;
    width: 480px; */
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 150px 80px 80px 100px 80px;
	grid-template-areas:
		"calendar"
		"showMiniViz"
		"disable"
		"share"
		"delete";
	border-radius: 10px 10px 10px 10px;
	box-shadow: inset 0px 0px 8px rgba(0, 0, 0, 0.25);
	background-color: var(--background-grey);
}

#settingsWrapper>div {
	margin: 10px;
}

#calendar {
	grid-area: calendar;
}

#calendar h3 {
	float: left;
	margin-right: 20px;
}

#calendar .el-row {
	margin-bottom: 5px;
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