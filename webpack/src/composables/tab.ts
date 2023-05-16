const setup = () => {
  // Default app settings
  const defaultOptions = { showTabConfirmation: true };
  let userOptions = defaultOptions;

  const openNewTabDialog = () => {
    const openTabDialog = window.document.getElementById("tabDialog") as HTMLDialogElement;
    if (typeof openTabDialog.showModal === "function") {
      openTabDialog.showModal();
    } else {
      // The <dialog> API is not supported by this browser
      addPluginToNewTab();
    }
  }

  const addPluginToNewTab = async () => {
    let fullpageTabIndex = undefined;

    await chrome.storage.local.get(['fullpageTabIndex']).then(storage => {
      fullpageTabIndex = storage.fullpageTabIndex;
    });

    if(fullpageTabIndex) {
      chrome.tabs.update(fullpageTabIndex,{active: true}, function() {
        // if tab was closed and no longer exists
        if (chrome.runtime.lastError) {
          createNewTab();
        }
      });
    }
    else {
      createNewTab();
    }
  }
  // set new tab index to local storage
  const  createNewTab = async () => {
    let page = 'Live';
    let url = `fullpage/fullpage.html#${page}`;
    const isFirefox = typeof(browser) !== 'undefined';
    if (isFirefox) {
      url = `../fullpage/fullpage.html#${page}`;
    }
    const options = {
      url,
      active: false // initial false value to allow any promise on chrome.tabs.create to run
    };
    await chrome.tabs.create(options,function(tab) {
        chrome.storage.local.set({'fullpageTabIndex': tab.id}, function() {
          chrome.tabs.update(tab.id,{active: true});
        });
      });
  }

  return { openNewTabDialog, addPluginToNewTab } ;
}

export { setup };