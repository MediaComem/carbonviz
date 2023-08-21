 // We assume embodied energy is spanned on full lifespan (vs assuming span on 8 working hours on working days (1917.3))
 // We still assumes around 8 hours usage per day
const usageDevicePerYear = 8 * 365.25;
const lifetimeLaptopYears = 6;
const lifetimeInternetAccessEquipmentYears = 6;
const lifetimeRouterYears = 6;

const laptopEnergyConsumptionKWh = 0.03;
const laptopPowerAdaptorEnergyConsumptionKWh = 0.001;
const internetEquipmentEnergyConsumptionKWh = 0.005;
const routerEnergyConsumptionKWh = 0.0076;

const ONE_DAY_SEC = 8 * 3600; // 1 day computer usage based on 8 hours

// Simplify methods with same lifetime for all equipments + electricity out of scope
const energyImpactHomeHardware = (timeElapsedSec = ONE_DAY_SEC, lifetime = lifetimeLaptopYears) => {
  const timeHour = timeElapsedSec / 3600;

  const impactManufacturingLaptopNRE = 2098.3146;
  const impactManufacturingLaptopRE = 185.389;
  const impactManufacturingPowerAdaptorLaptopNRE = 57.620504;
  const impactManufacturingPowerAdaptorLaptopRE = 8.814852;

  const laptopNREPerHour = (impactManufacturingLaptopNRE+impactManufacturingPowerAdaptorLaptopNRE)/(lifetime*usageDevicePerYear);
  const laptopREPerHour = (impactManufacturingLaptopRE+impactManufacturingPowerAdaptorLaptopRE)/(lifetime*usageDevicePerYear);

  const impactManufacturingInternetAccessEquipmentNRE = 98.930851;
  const impactManufacturingInternetAccessEquipmentRE = 8.698307;

  const internetEquipementNREPerHour = impactManufacturingInternetAccessEquipmentNRE/(lifetime*usageDevicePerYear);
  const internetEquipementREPerHour = impactManufacturingInternetAccessEquipmentRE/(lifetime*usageDevicePerYear);

  const impactManufacturingRouterNRE = 449.28912;
  const impactManufacturingRouterRE = 39.83213;

  const routerNREPerHour = impactManufacturingRouterNRE/(lifetime*usageDevicePerYear);
  const routerREPerHour = impactManufacturingRouterRE/(lifetime*usageDevicePerYear);

  const energyNREHomePerHour = laptopNREPerHour + internetEquipementNREPerHour + routerNREPerHour;
  const energyREHomePerHour = laptopREPerHour + internetEquipementREPerHour + routerREPerHour;

  const energyNRE = energyNREHomePerHour * timeHour;
  const energyRE = energyREHomePerHour * timeHour;
  return energyNRE + energyRE;
}
// get co2 emissions
const co2ImpactHomeHardware = (timeElapsedSec = ONE_DAY_SEC, lifetime = lifetimeLaptopYears) => {
  const timeHour = timeElapsedSec / 3600;
  const impactManufacturingLaptop = 173.7;
  const impactManufacturingPowerAdaptorLaptop = 4.7;

  const co2LaptopPerHour = (impactManufacturingLaptop+impactManufacturingPowerAdaptorLaptop)/(lifetime*usageDevicePerYear);

  const impactManufacturingInternetAccessEquipment = 7.7;

  const co2InternetEquipementPerHour = impactManufacturingInternetAccessEquipment/(lifetime*usageDevicePerYear);

  const impactManufacturingRouter = 35;

  const co2RouterPerHour = impactManufacturingRouter/(lifetime*usageDevicePerYear);

  const co2HomePerHour = co2LaptopPerHour + co2InternetEquipementPerHour + co2RouterPerHour;

  return co2HomePerHour * timeHour;
}

const energyImpactHome = (timeElapsedSec = ONE_DAY_SEC, lifetime = lifetimeLaptopYears) => {
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
const co2ImpactHome = (timeElapsedSec = ONE_DAY_SEC, lifetime = lifetimeLaptopYears) => {
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

export { ONE_DAY_SEC, energyImpactHome, energyImpactHomeHardware, co2ImpactHome, co2ImpactHomeHardware };