(async () => {
    // Create element for animation
    const container = document.createElement("div");
    container.style.position = 'fixed';
    container.style.top = '300px';
    container.style.right = '0px';
    container.style.width = '50px';
    container.style.height = '300px';
    container.style.borderRadius = '25px';
    container.style.backgroundColor = 'none';
    //container.style.opacity = 0.5;
    container.style['z-index'] = '10000';
    container.id = 'miniViz_container';
  
 /*    const iconClose = document.createElement("div");
    iconClose.innerHTML = '<svg class="svg-icon" viewBox="0 0 20 20"><path d="M10.185,1.417c-4.741,0-8.583,3.842-8.583,8.583c0,4.74,3.842,8.582,8.583,8.582S18.768,14.74,18.768,10C18.768,5.259,14.926,1.417,10.185,1.417 M10.185,17.68c-4.235,0-7.679-3.445-7.679-7.68c0-4.235,3.444-7.679,7.679-7.679S17.864,5.765,17.864,10C17.864,14.234,14.42,17.68,10.185,17.68 M10.824,10l2.842-2.844c0.178-0.176,0.178-0.46,0-0.637c-0.177-0.178-0.461-0.178-0.637,0l-2.844,2.841L7.341,6.52c-0.176-0.178-0.46-0.178-0.637,0c-0.178,0.176-0.178,0.461,0,0.637L9.546,10l-2.841,2.844c-0.178,0.176-0.178,0.461,0,0.637c0.178,0.178,0.459,0.178,0.637,0l2.844-2.841l2.844,2.841c0.178,0.178,0.459,0.178,0.637,0c0.178-0.176,0.178-0.461,0-0.637L10.824,10z"></path></svg>';
    iconClose.id = 'miniViz_icon_close';
    iconClose.style.position = 'absolute';
    iconClose.style.top = '4px';
    iconClose.style.right = '15px';
    iconClose.style.width = '1em';
    iconClose.style.height = '1em'; */
  
    const animation = document.createElement("div");
    animation.id = 'unplug';
    animation.style.borderRadius = '25px';
    animation.style.backgroundColor = 'none';
    //animation.style.opacity = 0.5;
  
    document.body.appendChild(container);
    //container.appendChild(iconClose);
    container.appendChild(animation);
    // Content script
    const src = chrome.extension.getURL('content/miniViz-inner-script.js');
    const miniVizScript = await import(src);
    miniVizScript.configure();
    // Unplug
    const unplug = chrome.extension.getURL('../unplug/js/main.mjs');
    await import(unplug);
  
    miniVizScript.main();
  })();