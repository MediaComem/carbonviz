<script>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check, Close } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { saveSettings, retrieveSettings } from '../../../settings/settings.js';
import { formatCo2, roundToPrecision } from '../../../utils/format.js';
import { ONE_DAY_SEC, co2ImpactHomeHardware } from '../../../model/model.js';
import { downloadData } from '../../../storage/dataDownload.js'
import { eraseAll } from '../../../storage/resetData.js'

import 'dayjs/locale/fr'

export default {
	setup() {
		const { t } = useI18n({});
		const showMiniViz = ref(true);
		const miniVizStatusUpdating = ref(false);
		const deactivateUntil = ref(undefined);
		const disableTimer = ref(0);
		const marks = ref({
			30: '30min',
			60: '1H',
			120: '2H',
			180: '3H'
		})
		const onSetupTimestamp = new Date();
		const nowMinus6HalfYears = new Date();
		nowMinus6HalfYears.setMonth(onSetupTimestamp.getMonth() - 78);
		const computer = ref('laptop');
		const yearsSincePurchase = ref(6);
		const yearsRemaining = ref(0);
		const lifetimeLaptopYears = computed(() => yearsSincePurchase.value + yearsRemaining.value);

		const co2ImpactDefault = co2ImpactHomeHardware();
		const co2ImpactCustom = computed(() => co2ImpactHomeHardware(ONE_DAY_SEC, lifetimeLaptopYears.value));
		const co2VsDefault = computed(() => {
			const percent = (co2ImpactCustom.value - co2ImpactDefault) / co2ImpactDefault * 100;
			return `${percent > 0 ? '+' : ''}${percent.toFixed(0)} %`
		})

		retrieveSettings().then(settings => {
			yearsSincePurchase.value = settings.yearsSinceComputerPurchase;
			yearsRemaining.value = settings.yearsComputerRemaining;
			showMiniViz.value = settings.showMiniViz;
			computer.value = settings.computer;
			deactivateUntil.value = settings.deactivateUntil;
		}).then(() => {
			// check if plugin deactivation is still active
			if (deactivateUntil.value) {
				const endDate = new Date(deactivateUntil.value);
				const now = new Date();
				if (endDate < now) {
					return;
				} else {
					const diffInMilliseconds = Math.abs(endDate.getTime() - now.getTime());
					disableTimer.value = Math.floor(diffInMilliseconds / (1000 * 60));
				}
			}
		});

		const setMinvizDisplay = (status) => {
			miniVizStatusUpdating.value = true;
			saveSettings('showMiniViz', status).then(() => {
				miniVizStatusUpdating.value = false;
				if (status) {
					chrome.runtime.sendMessage({ query: 'showMiniviz' });
					ElMessage.success(
						t('components.settings.confirmMiniVizVisible')
					);
				} else {
					chrome.runtime.sendMessage({ query: 'removeMiniviz' });
					ElMessage.success(
						t('components.settings.confirmMiniVizHidden')
					);
				}

			});
		};
		const lifetimeUpdate = () => {
			saveSettings('yearsSinceComputerPurchase', yearsSincePurchase.value);
			saveSettings('yearsComputerRemaining', yearsRemaining.value);
			saveSettings('lifetimeComputer', lifetimeLaptopYears.value);
		};
		const updateDisablePeriod = (value) => {
			const timerObj = new Date();
			timerObj.setMinutes(timerObj.getMinutes() + value);
			saveSettings('deactivateUntil', timerObj.getTime());
			saveSettings('showMiniViz', false);
			disableTimer.value = value;
			deactivateUntil.value = timerObj.getTime();
			chrome.runtime.sendMessage({ query: 'deactivateDataStorage' });
		}
		const triggerDownloadData = () => {
			downloadData();
		};
		const triggerDeletedData = () => {
			eraseAll();
		};
		return {
			showMiniViz, miniVizStatusUpdating, marks,
			yearsSincePurchase, yearsRemaining, lifetimeLaptopYears, disableTimer,
			co2ImpactDefault, co2ImpactCustom, co2VsDefault,
			Check, Close,
			t, roundToPrecision, formatCo2, setMinvizDisplay, lifetimeUpdate, triggerDownloadData, triggerDeletedData, updateDisablePeriod
		};
	}
}
</script>

<template>
	<el-scrollbar class="wrapper">
		<div id="settingsWrapper">
			<div id="lifetime">
				<el-row align="middle">
					<el-col :span="15">
						<h3> {{ t('components.settings.usingSince') }} </h3>
					</el-col>
					<el-col :span="7">
						<el-input-number v-model="yearsSincePurchase" :min="0" size="small" @change="lifetimeUpdate" />
					</el-col>
					<el-col :span="2">
						{{ t('global.years') }}
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
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="24">
						{{ t('components.settings.dataUseCase') }}
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="24">{{ t('components.settings.computerUsageOneDay') }}:</el-col>
				</el-row>
				<el-row>
					<el-col :span="6" justify="center"> {{ t('components.settings.computerLifetimeDefault') }} </el-col>
					<el-col :span="6" justify="center"> {{ formatCo2(co2ImpactDefault, 0) }} </el-col>
					<el-col :span="6"> {{ roundToPrecision(lifetimeLaptopYears, 1) }} {{ t('global.years') }} </el-col>
					<el-col :span="6"> {{ formatCo2(co2ImpactCustom, 0) }} ({{ co2VsDefault }})</el-col>
				</el-row>
				<el-row>
					<el-col :span="24">
						{{ t('components.settings.longerUsageTip') }}
					</el-col>
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
				<el-row>
					<el-col :span="18">
						<el-slider
							v-model="disableTimer"
							:marks="marks"
							:max="180"
							:step="10"
							@change="updateDisablePeriod"
						/>
					</el-col>
				</el-row>
			</div>
			<div id="download">
				<h3> {{ t('components.settings.downloadData') }} </h3>
				<el-row class="mt3">
					<el-col :span="24">{{ t('components.settings.downloadDataInfo') }}</el-col>
				</el-row>
				<el-row>
					<el-col :span="24">
						<el-button style="margin: 10px; cursor: pointer;" @click='triggerDownloadData()'>{{ t('components.settings.downloadAction') }} </el-button>
					</el-col>
				</el-row>
			</div>
			<div id="delete">
				<h3> {{ t('components.settings.deleteData') }} </h3>
				<el-row class="mt3">
					<el-col :span="24">{{ t('components.settings.deleteDataInfo') }}</el-col>
				</el-row>
				<el-row>
					<el-col :span="24">
						<el-popconfirm
							width="320"
							:hide-icon="true"
							:confirm-button-text="t('components.settings.deleteAction')"
							confirm-button-type="danger"
							:cancel-button-text="t('global.cancel')"
							:title="t('components.settings.deleteConfirmation')"
							@confirm='triggerDeletedData()'
						>
							<template #reference>
								<el-button type="danger" style="margin: 10px; cursor: pointer;">{{ t('components.settings.deleteAction') }}</el-button>
							</template>
						</el-popconfirm>
					</el-col>
				</el-row>
			</div>
		</div>
	</el-scrollbar>
</template>

<style scoped>
.wrapper {
	width: 100%;
	height: 476px;
	position: relative;
	border-radius: 10px 10px 10px 10px;
	box-shadow: inset 0px 0px 8px rgba(0, 0, 0, 0.25);
	background-color: var(--background-grey);
}

.mt3 {
	margin-top: 3px;
}

#settingsWrapper {
	/*  height: 490px;
    width: 480px; */
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 180px 80px 80px 120px 100px;
	grid-template-areas:
		"lifetime"
		"showMiniViz"
		"disable"
		"download"
		"delete";
}

#settingsWrapper>div {
	margin: 10px;
}

#lifetime {
	grid-area: lifetime;
}

#lifetime h3 {
	float: left;
	margin-right: 20px;
}

#lifetime .el-row {
	margin-bottom: 5px;
}

#showMiniViz {
	grid-area: showMiniViz;
}

#disable {
	grid-area: disable;
}

#download {
	grid-area: download;
}

#delete {
	grid-area: delete;
}

h3 {
	margin: 0;
}

:deep(.el-slider) {
	margin-left: 9px;
}

:deep(.el-slider__marks .el-slider__marks-text) {
	font-size: 10px;
}

:deep(.el-slider .el-slider__button) {
	background-color: var(--dark-grey);
	margin-top: -3px;
}

:deep(.el-slider__stop.el-slider__marks-stop) {
	--el-border-radius-circle: 0;
	height: 6px;
	width: 2px;
	top: -2px;
}
</style>