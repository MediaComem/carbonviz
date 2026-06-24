const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.transferSize > 0) {
      chrome.runtime.sendMessage({
        query: 'resourceSize',
        url: entry.name,
        transferSize: entry.transferSize,
      }).catch(() => {});
    }
  }
});
observer.observe({ type: 'resource' });
