let offlineNotifications = {
  weeklynotificationTimeStamp: '',
  dailyNotificationTimeStamp: ''
};
const saveNotifications = async (key, value) => {
  offlineNotifications[key] = value;
  return chrome.storage.local.set({'offlineNotifications' : JSON.stringify(offlineNotifications)});
}

const retrieveNotifications = () => {
  return chrome.storage.local.get(['offlineNotifications']).then(storage => {
    const notificationsPreviousState = storage.offlineNotifications;
    if (notificationsPreviousState) {
      offlineNotifications = JSON.parse(notificationsPreviousState);
    }
    return offlineNotifications;
  });
}

export { saveNotifications, retrieveNotifications };