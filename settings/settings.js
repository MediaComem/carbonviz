let settings = {
  lifetimeComputer: 6,
  yearsSinceComputerPurchase: 6,
  yearsComputerRemaining: 0,
  lifetimeComputer: 6,
  computer: 'laptop',
  showMiniviz: true,
  deactivateUntil: undefined,
  lang: 'fr'
}

const saveSettings = async (key, value) => {
  settings[key] = value;
  return chrome.storage.local.set({'settings' : JSON.stringify(settings)});
}

const retrieveSettings = () => {
  return chrome.storage.local.get(['settings']).then(storage => {
    const settingsPreviousState = storage.settings;
    if (settingsPreviousState) {
      settings = JSON.parse(settingsPreviousState);
    }
    return settings;
  });
}

export { saveSettings, retrieveSettings };