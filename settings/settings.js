let settings = {
  lifetimeComputer: 6,
  yearsSinceComputerPurchase: 6,
  yearsComputerRemaining: 0,
  computer: 'laptop',
  showMiniViz: true,
  positionMiniviz: 5, // Top Right
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

const resetSettings = () => {
  settings = {
    lifetimeComputer: 6,
    yearsSinceComputerPurchase: 6,
    yearsComputerRemaining: 0,
    computer: 'laptop',
    showMiniViz: true,
    positionMiniviz: 5,
    deactivateUntil: undefined,
    lang: 'fr'
  }
  chrome.storage.local.set({'settings' : JSON.stringify(settings)});
}

export { saveSettings, retrieveSettings, resetSettings };