(async () => {

  // send message to background script to check for minviz deactivation deadline if any
  chrome.runtime.sendMessage({ query: 'startMiniviz' }).then(async (response) => {
    if (response && response.show === true) {
      const miniVizScript = await import(chrome.runtime.getURL('content/miniViz-inner-script.js'));
      miniVizScript.start({ counters: response.counters });
    }
  }).catch(e => { /* service worker not active */ });

  chrome.runtime.onMessage.addListener(request => {
    if (request.query) {
      const minvizContainer = document.getElementById('miniviz');
      switch (request.query) {
        case 'removeMiniviz':
          if(minvizContainer) {
            if (minvizContainer.style.display !== 'none') {
              minvizContainer.style.display = 'none';
            }
          }
          break;
        case 'showMiniviz':
          if(minvizContainer) {
            if (minvizContainer.style.display === 'none') {
              minvizContainer.style.display = 'block';
            }
          }
          break;
        default:
          break;
      }
    }
    return true;
  });
})();