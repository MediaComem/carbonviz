import PubSub from '../unplug/js/modules/pubsub.mjs';
import conf from '../unplug/js/conf.mjs';

const pubSub = new PubSub();
const icon = window.document.getElementById("tab-icon");
const title = window.document.getElementById("tab-title");

const handleMessage = (request, _sender, sendResponse) => {
  if (request.query) {
    switch (request.query) {
      case 'isLoaded':
        container.style.display = 'block';
        sendResponse({isLoaded: true});
      default:
        break;
    }
  }
  if (request.data) {
    if (request.data.url === icon.src) {
      // only loading tab favicon in the animation
      return;
    }
    pubSub.publish('input-data', request.data);
    // update icon / title
    if (request.data.tabIcon) {
      icon.hidden = false;
      if ( icon.src !== request.data.tabIcon) {
        // do not trigger redownload of icon if already correct icon
        icon.src = request.data.tabIcon;
      }
    } else {
      icon.hidden = true;
    }
    title.innerText = request.data.tabTitle ?? '';
  }
  return true;
}

let draggable = true;
let active = false;
let dragHandle;
let container;
let closeBt;
let pinBt;
let detachBt;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

function setTranslate(xPos, yPos, el) {
  el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
}

function dragStart(e) {
  if (!draggable) {
    return;
  }

  if (e.type === "touchstart") {
    initialX = e.touches[0].clientX - xOffset;
    initialY = e.touches[0].clientY - yOffset;
  } else {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
  }

  if (e.target === dragHandle) {
    active = true;
  }
}

function dragEnd(e) {
  initialX = currentX;
  initialY = currentY;

  active = false;
}

function drag(e) {
  if (active) {

    e.preventDefault();

    if (e.type === "touchmove") {
      currentX = e.touches[0].clientX - initialX;
      currentY = e.touches[0].clientY - initialY;
    } else {
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
    }

    xOffset = currentX;
    yOffset = currentY;

    setTranslate(currentX, currentY, container);
  }
}

function hoverStart(e) {
  dragHandle.style.cursor = "pointer";
}

function hoverEnd(e) {
  dragHandle.style.cursor = "none";
  active = false;
}

function initDraggableMgmt() {
  // draggable area
  dragHandle = document.querySelector("#unplug_draggable");

  // event handler
  dragHandle.addEventListener("touchstart", dragStart, false);
  dragHandle.addEventListener("touchend", dragEnd, false);
  dragHandle.addEventListener("touchmove", drag, false);

  dragHandle.addEventListener("mousedown", dragStart, false);
  dragHandle.addEventListener("mouseup", dragEnd, false);
  dragHandle.addEventListener("mousemove", drag, false);

  dragHandle.addEventListener("mouseenter", hoverStart, false);
  dragHandle.addEventListener("mouseleave", hoverEnd, false);

}

function close(e) {
  container.style.display = 'none';
  document.body.style.width= `${window.innerWidth}px`
}

function pin(e) {
  document.body.style.width= `${window.innerWidth - 600}px`
  pinBt.style.fill = 'gray';
  detachBt.style.fill = 'initial';
  container.style.transform = ''
  draggable = false;
  xOffset = 0;
  yOffset = 0;
}

function detach(e) {
  document.body.style.width= `${window.innerWidth}px`
  detachBt.style.fill = 'gray';
  pinBt.style.fill = 'initial';
  draggable = true;
}


function initLayoutMgmt() {
  closeBt = document.querySelector("#unplug_icon_close");
  pinBt = document.querySelector("#unplug_icon_pin");
  detachBt = document.querySelector("#unplug_icon_detach");
  detachBt.style.fill = 'gray';

  // event handler
  closeBt.addEventListener("click", close, false);
  pinBt.addEventListener("click", pin, false);
  detachBt.addEventListener("click", detach, false);

}

export function configure() {
  const assetCo2 = chrome.extension.getURL('../unplug/assets/co2.png');
  const assetData = chrome.extension.getURL('../unplug/assets/data.png');
  conf.assets.co2 = assetCo2;
  conf.assets.data = assetData;
  conf.matterOpts.co2.render = {sprite: {texture: assetCo2}};
  conf.matterOpts.data.render = {sprite: {texture: assetData}};
  const assetCo2Hover = chrome.extension.getURL('../unplug/assets/co2Hover.png');
  const assetDataHover = chrome.extension.getURL('../unplug/assets/dataHover.png');
  conf.assets.co2Hover = assetCo2Hover;
  conf.assets.dataHover = assetDataHover;
  const assetCo2Active = chrome.extension.getURL('../unplug/assets/co2Active.png');
  const assetDataActive = chrome.extension.getURL('../unplug/assets/dataActive.png');
  conf.assets.co2Active = assetCo2Active;
  conf.assets.dataActive = assetDataActive;
}

export function main() {
  // document.body.style.width= `${window.innerWidth - 600}px`
  container = document.querySelector("#unplug_container");
  initDraggableMgmt();
  initLayoutMgmt();
  chrome.runtime.onMessage.addListener(handleMessage);
}
