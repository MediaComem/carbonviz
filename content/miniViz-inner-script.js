import '../bundle/miniviz.js';

function createMiniVizContainer() {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '300px';
  container.style.right = '0px';
  container.style.width = '50px';
  container.style.height = '300px';
  container.style.borderRadius = '25px';
  container.style.backgroundColor = 'tomato';  
  container.style['z-index'] = '10000';
  container.id = 'miniViz_container';
  document.body.appendChild(container);
}

const handleMessage = (request) => {
  if (request.query) {
    switch (request.query) {
      case 'removeMiniviz':
        const minvizContainer = document.getElementById('miniViz_container');
        const minvizPopupContainer = document.getElementById('miniViz_popup_container');
        if(minvizContainer && minvizPopupContainer) {
          if (minvizContainer.style.display != 'none') {
            minvizContainer.style.display = 'none';
          }
          if(minvizPopupContainer.style.display != 'none') {
            minvizPopupContainer.style.display = 'none';
          }
        }
      default:
        break;
    }
  }
  return true;
}

export function main() {
  const MiniViz = window.document.getElementById("miniViz_container");
  if (MiniViz) {
    MiniViz.addEventListener('click', toggleMiniVizPopup)
  }
  
  function toggleMiniVizPopup () {
    let minivizPopup = document.getElementById('miniViz_popup_container');
    if(minivizPopup.style.display === 'block') {
      minivizPopup.style.display = 'none';      
    } else {
      minivizPopup.style.display = 'block';
    }
  }
}

export function configure() {
  createMiniVizContainer();
  chrome.runtime.onMessage.addListener(handleMessage);
}
