(async () => {
  // Create element for animation
  const container = document.createElement("div");
  container.style.position = 'fixed';
  container.style.top = '0px';
  container.style.right = '0px';
  container.style.width = '400px';
  container.style.height = '640px';
  container.style['z-index'] = '10000';
  container.style.backgroundColor = 'black';
  container.style.boxShadow = '5px 5px 2px grey';
  container.id = 'unplug_container';

  const info = document.createElement("div");
  info.innerHTML = '<div class="data-info"><span><img id="tab-icon" style="max-height: 20px"></span><span id="tab-title"></span></div>';
  info.style.position = 'absolute';
  info.style.bottom = '10px';
  info.style.color = 'white';
  info.style.position = 'absolute';
  info.style.bottom = '10px';
  info.style.width = '100%';
  info.style.textAlign = 'center';

  const bar = document.createElement("div");
  bar.id = 'unplug_draggable';
  bar.innerText = 'CarbonViz';
  bar.style.height = '40px';
  bar.style.backgroundColor = 'white';
  bar.style.color = 'DimGrey';
  bar.style.verticalAlign = 'center';
  bar.style.textAlign = 'center';
  bar.style.fontSize = '20px';
  bar.style.fontWeight = '700';
  bar.style.border = 'solid 1px LightSlateGray';
  bar.style.paddingTop = '8px';

  const iconDetach = document.createElement("div");
  iconDetach.innerHTML = '<svg class="svg-icon" viewBox="0 0 20 20"><path d="M17.391,2.406H7.266c-0.232,0-0.422,0.19-0.422,0.422v3.797H3.047c-0.232,0-0.422,0.19-0.422,0.422v10.125c0,0.232,0.19,0.422,0.422,0.422h10.125c0.231,0,0.422-0.189,0.422-0.422v-3.797h3.797c0.232,0,0.422-0.19,0.422-0.422V2.828C17.812,2.596,17.623,2.406,17.391,2.406 M12.749,16.75h-9.28V7.469h3.375v5.484c0,0.231,0.19,0.422,0.422,0.422h5.483V16.75zM16.969,12.531H7.688V3.25h9.281V12.531z"></path></svg>';
  iconDetach.id = 'unplug_icon_detach';
  iconDetach.style.position = 'absolute';
  iconDetach.style.top = '4px';
  iconDetach.style.right = '65px';
  iconDetach.style.width = '1em';
  iconDetach.style.height = '1em';

  const iconClose = document.createElement("div");
  iconClose.innerHTML = '<svg class="svg-icon" viewBox="0 0 20 20"><path d="M10.185,1.417c-4.741,0-8.583,3.842-8.583,8.583c0,4.74,3.842,8.582,8.583,8.582S18.768,14.74,18.768,10C18.768,5.259,14.926,1.417,10.185,1.417 M10.185,17.68c-4.235,0-7.679-3.445-7.679-7.68c0-4.235,3.444-7.679,7.679-7.679S17.864,5.765,17.864,10C17.864,14.234,14.42,17.68,10.185,17.68 M10.824,10l2.842-2.844c0.178-0.176,0.178-0.46,0-0.637c-0.177-0.178-0.461-0.178-0.637,0l-2.844,2.841L7.341,6.52c-0.176-0.178-0.46-0.178-0.637,0c-0.178,0.176-0.178,0.461,0,0.637L9.546,10l-2.841,2.844c-0.178,0.176-0.178,0.461,0,0.637c0.178,0.178,0.459,0.178,0.637,0l2.844-2.841l2.844,2.841c0.178,0.178,0.459,0.178,0.637,0c0.178-0.176,0.178-0.461,0-0.637L10.824,10z"></path></svg>';
  iconClose.id = 'unplug_icon_close';
  iconClose.style.position = 'absolute';
  iconClose.style.top = '4px';
  iconClose.style.right = '15px';
  iconClose.style.width = '1em';
  iconClose.style.height = '1em';

  const iconPin = document.createElement("div");
  iconPin.innerHTML = '<svg class="svg-icon" viewBox="0 0 20 20"><path d="M17.592,8.936l-6.531-6.534c-0.593-0.631-0.751-0.245-0.751,0.056l0.002,2.999L5.427,9.075H2.491c-0.839,0-0.162,0.901-0.311,0.752l3.683,3.678l-3.081,3.108c-0.17,0.171-0.17,0.449,0,0.62c0.169,0.17,0.448,0.17,0.618,0l3.098-3.093l3.675,3.685c-0.099-0.099,0.773,0.474,0.773-0.296v-2.965l3.601-4.872l2.734-0.005C17.73,9.688,18.326,9.669,17.592,8.936 M3.534,9.904h1.906l4.659,4.66v1.906L3.534,9.904z M10.522,13.717L6.287,9.48l4.325-3.124l3.088,3.124L10.522,13.717z M14.335,8.845l-3.177-3.177V3.762l5.083,5.083H14.335z"></path></svg>';
  iconPin.id = 'unplug_icon_pin';
  iconPin.style.position = 'absolute';
  iconPin.style.top = '4px';
  iconPin.style.right = '40px';
  iconPin.style.width = '1em';
  iconPin.style.height = '1em';

  const animation = document.createElement("div");
  animation.id = 'unplug';

  document.body.appendChild(container);
  container.appendChild(bar);
  bar.appendChild(iconDetach);
  bar.appendChild(iconClose);
  bar.appendChild(iconPin);
  container.appendChild(animation);
  container.appendChild(info);
  // Content script
  const src = chrome.extension.getURL('content/inner-script.js');
  const contentScript = await import(src);
  contentScript.configure();

  // Unplug
  const unplug = chrome.extension.getURL('../unplug/js/main.mjs');
  await import(unplug);


  contentScript.main();
})();