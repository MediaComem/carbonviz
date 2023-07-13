const usageDevicePerYear = 1917.3;
const lifetimeLaptopYears = 6;
const lifetimeInternetAccessEquipmentYears = 6;
const lifetimeRouterYears = 6;

const laptopEnergyConsumptionKWh = 0.03;
const laptopPowerAdaptorEnergyConsumptionKWh = 0.001;
const internetEquipmentEnergyConsumptionKWh = 0.005;
const routerEnergyConsumptionKWh = 0.0076;

const energyImpactHome = (timeElapsedSec, lifetime = lifetimeLaptopYears) => {
  const timeHour = timeElapsedSec / 3600;
  // NRE stands for Non renewable primary energy
  // RE stands for renewable energy
  // Low voltage standard CH electricity
  const electricityCHLowNRE = 7.0625547;
  const electricityCHLowRE = 2.300712;

  const impactManufacturingLaptopNRE = 2098.3146;
  const impactManufacturingLaptopRE = 185.389;
  const impactManufacturingPowerAdaptorLaptopNRE = 57.620504;
  const impactManufacturingPowerAdaptorLaptopRE = 8.814852;

  const laptopNREPerHour = (impactManufacturingLaptopNRE+impactManufacturingPowerAdaptorLaptopNRE)/(lifetime*usageDevicePerYear);
  const laptopREPerHour = (impactManufacturingLaptopRE+impactManufacturingPowerAdaptorLaptopRE)/(lifetime*usageDevicePerYear);

  const impactManufacturingInternetAccessEquipmentNRE = 98.930851;
  const impactManufacturingInternetAccessEquipmentRE = 8.698307;

  const internetEquipementNREPerHour = impactManufacturingInternetAccessEquipmentNRE/(lifetimeInternetAccessEquipmentYears*usageDevicePerYear);
  const internetEquipementREPerHour = impactManufacturingInternetAccessEquipmentRE/(lifetimeInternetAccessEquipmentYears*usageDevicePerYear);

  const impactManufacturingRouterNRE = 449.28912;
  const impactManufacturingRouterRE = 39.83213;

  const routerNREPerHour = impactManufacturingRouterNRE/(lifetimeRouterYears*usageDevicePerYear);
  const routerREPerHour = impactManufacturingRouterRE/(lifetimeRouterYears*usageDevicePerYear);

  const homeElectricityNREPerHour = (laptopEnergyConsumptionKWh + laptopPowerAdaptorEnergyConsumptionKWh + internetEquipmentEnergyConsumptionKWh + routerEnergyConsumptionKWh) * electricityCHLowNRE;
  const homeElectricityREPerHour = (laptopEnergyConsumptionKWh + laptopPowerAdaptorEnergyConsumptionKWh + internetEquipmentEnergyConsumptionKWh + routerEnergyConsumptionKWh) * electricityCHLowRE;

  const energyNREHomePerHour = laptopNREPerHour + internetEquipementNREPerHour + routerNREPerHour + homeElectricityNREPerHour;
  const energyREHomePerHour = laptopREPerHour + internetEquipementREPerHour + routerREPerHour + homeElectricityREPerHour;

  const energyNRE = energyNREHomePerHour * timeHour;
  const energyRE = energyREHomePerHour * timeHour;
  return energyNRE + energyRE;
}

// get co2 emissions
const co2ImpactHome = (timeElapsedSec, lifetime = lifetimeLaptopYears) => {
  const timeHour = timeElapsedSec / 3600;
  // Low voltage standard CH electricity
  const electricityCHLowFactor = 0.129;

  const impactManufacturingLaptop = 173.7;
  const impactManufacturingPowerAdaptorLaptop = 4.7;

  const co2LaptopPerHour = (impactManufacturingLaptop+impactManufacturingPowerAdaptorLaptop)/(lifetime*usageDevicePerYear);

  const impactManufacturingInternetAccessEquipment = 7.7;

  const co2InternetEquipementPerHour = impactManufacturingInternetAccessEquipment/(lifetimeInternetAccessEquipmentYears*usageDevicePerYear);

  const impactManufacturingRouter = 35;

  const co2RouterPerHour = impactManufacturingRouter/(lifetimeRouterYears*usageDevicePerYear);

  const co2HomeElectricityPerHour = (laptopEnergyConsumptionKWh + laptopPowerAdaptorEnergyConsumptionKWh + internetEquipmentEnergyConsumptionKWh + routerEnergyConsumptionKWh) * electricityCHLowFactor;
  const co2HomePerHour = co2LaptopPerHour + co2InternetEquipementPerHour + co2RouterPerHour + co2HomeElectricityPerHour;

  return co2HomePerHour * timeHour;
}

export { energyImpactHome, co2ImpactHome };