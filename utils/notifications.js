let notificationsStatus = {
  lastDisplayedWeeklyTimeStamp: '',
  lastDisplayedDailyTimeStamp: '',
  dailyNotificationBacklog: [],
};

const saveNotifications = async (key, value) => {
  notificationsStatus[key] = value;
  return chrome.storage.local.set({'notificationsStatus' : JSON.stringify(notificationsStatus)});
}

const retrieveNotifications = () => {
  return chrome.storage.local.get(['notificationsStatus']).then(storage => {
    const notificationsPreviousState = storage.notificationsStatus;
    if (notificationsPreviousState) {
      notificationsStatus = JSON.parse(notificationsPreviousState);
    }
    return notificationsStatus;
  });
}

export { saveNotifications, retrieveNotifications };