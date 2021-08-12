(async () => {
  // send message to background script to check for minviz deactivation deadline if any
  chrome.runtime.sendMessage({ query: 'startMiniviz' }, async (response) => {
    if (response && response.show === true) {
      const miniVizScript = await import(chrome.extension.getURL('content/miniViz-inner-script.js'));       
      miniVizScript.configure();
      miniVizScript.main();
    }
  });
})();