<script>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Check, Close } from '@element-plus/icons-vue'
import { saveSettings, retrieveSettings } from '../../../settings/settings.js';
import { formatCo2, roundToPrecision } from '../../../utils/format.js';
import { ONE_DAY_SEC, co2ImpactHomeHardware } from '../../../model/model.js';
import { downloadData } from '../../../storage/dataDownload.js'
import { eraseAll } from '../../../storage/resetData.js'

import 'dayjs/locale/fr'

// Use flag for Mniviz position
const POSITION_TOP = 1;
const POSITION_BOTTOM = 2;
const POSITION_RIGHT = 4;
const POSITION_LEFT = 8;

export default {
	setup() {
		const { t } = useI18n({});
		const showMiniViz = ref(true);
		const positionMiniviz = ref(3); // Top Right
		const positionOptions = computed(() => [
			{ label: t('components.settings.position.topRight'), value: 5 },
			{ label: t('components.settings.position.bottomRight'), value: 6 },
			{ label: t('components.settings.position.topLeft'), value: 9 },
			{ label: t('components.settings.position.bottomLeft'), value: 10 }
		]);
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
			positionMiniviz.value = settings.positionMiniviz;
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

		const setMinivizDisplay = (status) => {
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
			if (value > 0) {
				const timerObj = new Date();
				timerObj.setMinutes(timerObj.getMinutes() + value);
				saveSettings('deactivateUntil', timerObj.getTime());
				saveSettings('showMiniViz', false);
				deactivateUntil.value = timerObj.getTime();
				showMiniViz.value = false;
				chrome.runtime.sendMessage({ query: 'deactivateDataStorage' });
			} else {
				chrome.runtime.sendMessage({ query: 'reactivateDataStorage' });
				saveSettings('deactivateUntil', 0);
				saveSettings('showMiniViz', true);
				showMiniViz.value = true;
			}
		}
		const triggerDownloadData = () => {
			downloadData();
		};
		const triggerDeletedData = () => {
			eraseAll();
		};
		const setPosition = (position) => {
			saveSettings('positionMiniviz', position);
			chrome.runtime.sendMessage({ query: 'updatePosition' });
		};

		return {
			showMiniViz, miniVizStatusUpdating, marks, yearsSincePurchase, yearsRemaining, lifetimeLaptopYears, disableTimer,
			co2ImpactDefault, co2ImpactCustom, co2VsDefault,
			t, roundToPrecision, formatCo2, setMinivizDisplay, lifetimeUpdate, triggerDownloadData, triggerDeletedData, updateDisablePeriod,
			setPosition, positionMiniviz, positionOptions,
			Check, Close
		};
	}
}
</script>

<template>
	<el-scrollbar class="wrapper">
		<div id="settingsWrapper">
			<div id="lifetime">
				<el-row align="middle">
					<el-col :span="24">
						<h3> {{ t('components.settings.computerImpact') }} </h3>
					</el-col>
				</el-row>
				<el-row align="middle" class="mb4">
					<el-col :span="12">
						{{ t('components.settings.usingSince') }}
					</el-col>
					<el-col :span="12">
						{{ t('components.settings.usingUntil') }}
					</el-col>

				</el-row>
				<el-row align="middle">
					<el-col :span="12">
						<el-input-number
						  v-model="yearsSincePurchase"
							:min="0"
							size="small"
							style="--el-fill-color-light: var(--grey); --color: var(--dark-grey);"
							@change="lifetimeUpdate"
						/>
						&nbsp;{{ t('global.years') }}
					</el-col>
					<el-col :span="12">
						<el-input-number
							v-model="yearsRemaining"
							:min="0"
							size="small"
							style="--el-fill-color-light: var(--grey); --color: var(--dark-grey);"
							@change="lifetimeUpdate"
						/>
						&nbsp;{{ t('global.years') }}
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="24" class="mt16">{{ t('components.settings.computerUsageOneDay') }}: <b>{{ formatCo2(co2ImpactCustom, 0) }} / {{ t('global.day') }}</b></el-col>
				</el-row>
				<el-row>
					<el-col :span="24" class="mt8">
						{{ t('components.settings.dataUseCase') }}
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="24" class="mt8 tip">
						💡 {{ t('components.settings.longerUsageTip') }}
					</el-col>
				</el-row>
			</div>
			<div class="hr"></div>
			<div id="minivizDisplay">
				<h3> {{ t('components.settings.display') }} </h3>
  			<el-row align="middle">
					<el-col :span="12">
						{{ t('components.settings.visible') }}
						<el-switch
							v-model="showMiniViz"
							inline-prompt
							size="large"
							class="miniviz-switch"
							:active-icon="Check"
    					:inactive-icon="Close"
							style="--el-switch-on-color: #95e466; --el-switch-off-color: var(--light-grey)"
							:loading="miniVizStatusUpdating"
							@change="setMinivizDisplay"
						/>
					</el-col>
					<el-col :span="12">
						<span> {{ t('components.settings.miniVizPosition') }} </span>
					  <el-select class="position-select" v-model="positionMiniviz" @change="setPosition" placeholder="">
							<el-option
								v-for="position in positionOptions"
								:key="position.value"
								:label="position.label"
								:value="position.value"
							>
							  <img :src="`../../../icons/miniviz_pos_${position.value}.svg`" class="position-icon">
								<span>{{ position.label }}</span>
							</el-option>
						</el-select>
				</el-col>
				</el-row>
			</div>
			<!--
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
		-->
			<div class="hr"></div>
			<div id="download">
				<h3> {{ t('components.settings.downloadData') }} </h3>
				<el-row class="mt3">
					<el-col :span="24">{{ t('components.settings.downloadDataInfo') }}</el-col>
				</el-row>
				<el-row>
					<el-col :span="24">
						<el-button @click='triggerDownloadData()'>{{ t('components.settings.downloadAction') }} </el-button>
					</el-col>
				</el-row>
			</div>
			<div class="hr"></div>
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
							<el-button type="danger">{{ t('components.settings.deleteAction') }}</el-button>
						</template>
					</el-popconfirm>
				</el-col>
			</el-row>
		</div>
	</div>
	</el-scrollbar>
</template>

<style lang="scss" scoped>
.wrapper {
	width: 100%;
	height: 476px;
	position: relative;
	border-radius: 10px 10px 10px 10px;
	box-shadow: inset 0px 0px 8px rgba(0, 0, 0, 0.25);
	background-color: var(--background-grey);
	color: var(--dark-grey);
}


#settingsWrapper>div {
	margin: 10px;
	&#lifetime, &#minivizDisplay, &#download, &#delete {
		margin-left: 26px;
	}
}

#settingsWrapper > div.hr {
	width: 95%;
	height: 1px;
	background-color: var(--grey);
	margin: auto;
}

.mt3 {
	margin-top: 3px;
}

.mt8 {
	margin-top: 8px;
}

.mt16 {
	margin-top: 16px;
}

.mb4 {
	margin-bottom: 4px;
}

h3 {
	margin: 0;
	color: black;
	margin-top: 16px;
	margin-bottom: 14px;
	font-size: 13px;
	font-weight: 700;
}

#lifetime {
	:deep(.el-input-number--small ) {
		width: 95px;
		:deep(.el-input--small) {
			font-size: 13px;
		}
	}
  :deep(.el-input-number--small .el-input-number__decrease .el-icon),
	:deep(.el-input-number--small .el-input-number__increase .el-icon) {
		transform: scale(1.1);
	}
}

.tip {
	border-radius: 5px;
    background-color: white;
    padding: 4px;
}

.miniviz-switch, .position-select {
	margin-left: 10px;
}

.position-select {
	margin-top: -2px;
	:deep(.el-input__inner) {
		width: 110px;
	}
}

.position-icon {
	margin-right: 3px;
}

:deep(.el-button) {
	width: 143px;
	height: 30px;
	margin-top: 10px;
	margin-bottom: 10px;
	cursor: pointer;
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

:deep(.el-switch .el-switch__label) {
	margin-right: 2px;
	margin-left: 2px;
}
</style>