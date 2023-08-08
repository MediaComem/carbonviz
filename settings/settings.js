let settings = {
  lifetimeComputer: 6,
  yearsSinceComputerPurchase: 6,
  yearsComputerRemaining: 0,
  computer: 'laptop',
  showMiniViz: true,
  deactivateUntil: undefined,
  lang: 'fr',
  mvPositionRight: true,
  mvPositionTop: true
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
    deactivateUntil: undefined,
    lang: 'fr',
    mvPositionRight: true,
    mvPositionTop: true
  }
  chrome.storage.local.set({'settings' : JSON.stringify(settings)});
}

export { saveSettings, retrieveSettings, resetSettings };