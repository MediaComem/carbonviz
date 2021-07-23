(async () => {
    // Create element for popup
    const container = document.createElement("div");
    container.style.cssText = 'position: fixed; top: 300px; right: 70px; width: 170px; height: 300px; background-color: white; box-shadow: 2px 2px 2px 2px #888888';
    container.style['z-index'] = '10000';
    container.id = 'miniViz_popup_container';
    //header
    const header = document.createElement("div");
    header.innerHTML = "Consumption";
    header.style.cssText = 'font-size: 20px; font-weight: bold; text-align:center; margin-top: 10px;';
    container.appendChild(header);
    //co2 and data totals
    const data = document.createElement("div");
    data.id = "vue-co2-data-counter";
    
    const co2History = document.createElement('div');
    co2History.id = '#vue-history-co2';
    const dataHistory = document.createElement('div');
    dataHistory.id = '#vue-history-data';

    const CarbonVueSrc = chrome.extension.getURL('../bundle/popup.js');
    const CarbonVue = await import(CarbonVueSrc);


    data.style.cssText = 'margin-top: 30px; padding: 10px';
    data.innerHTML = "co2 and data icons here";
    container.appendChild(data);
    //open extension, deactivate buttion icons
    const iconContainer = document.createElement("div");
    iconContainer.style.cssText = 'margin-top: 10px; padding: 10px';
    const openIcon = document.createElement("div");
    openIcon.style.cssText = 'padding: 5px; cursor: pointer;';
    openIcon.innerHTML = '<svg width="20" height="20" style=float:left; viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M5.56068 3.51027H3.51027V11.4897H11.4854V9.43932H12.9957V11.8139C12.9957 12.468 12.4637 13 11.8096 13H3.18609C2.53202 13 2 12.468 2 11.8139V3.18609C2 2.53202 2.53202 2 3.18609 2H5.56068V3.51027ZM7.93124 2.04474C7.41618 2.04474 6.99685 2.46406 6.99685 2.97912V7.07324C6.99685 7.5883 7.41618 8.00762 7.93124 8.00762H12.0254C12.5404 8.00762 12.9597 7.5883 12.9597 7.07324V2.97912C12.9597 2.46406 12.5404 2.04474 12.0254 2.04474H7.93124Z" fill="#333333"/></svg><span style=padding-left:10px;>Open Extension</span>'
    iconContainer.appendChild(openIcon);
    const deactivateIcon = document.createElement("div");
    deactivateIcon.id='deactivateIcon';
    deactivateIcon.style.cssText = 'padding: 5px; cursor: pointer; margin-top: 10px;';
    deactivateIcon.innerHTML = '<svg width="20" height="20" style=float:left; viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 3.75C9.86875 3.75 11.9812 5.08125 13.0125 7.1875C12.6438 7.95 12.125 8.60625 11.5063 9.1375L12.3875 10.0188C13.2562 9.25 13.9438 8.2875 14.375 7.1875C13.2937 4.44375 10.625 2.5 7.5 2.5C6.70625 2.5 5.94375 2.625 5.225 2.85625L6.25625 3.8875C6.6625 3.80625 7.075 3.75 7.5 3.75ZM6.83125 4.4625L8.125 5.75625C8.48125 5.9125 8.76875 6.2 8.925 6.55625L10.2188 7.85C10.2688 7.6375 10.3062 7.4125 10.3062 7.18125C10.3125 5.63125 9.05 4.375 7.5 4.375C7.26875 4.375 7.05 4.40625 6.83125 4.4625ZM1.25625 2.41875L2.93125 4.09375C1.9125 4.89375 1.10625 5.95625 0.625 7.1875C1.70625 9.93125 4.375 11.875 7.5 11.875C8.45 11.875 9.3625 11.6938 10.2 11.3625L12.3375 13.5L13.2188 12.6188L2.1375 1.53125L1.25625 2.41875ZM5.94375 7.10625L7.575 8.7375C7.55 8.74375 7.525 8.75 7.5 8.75C6.6375 8.75 5.9375 8.05 5.9375 7.1875C5.9375 7.15625 5.94375 7.1375 5.94375 7.10625ZM3.81875 4.98125L4.9125 6.075C4.76875 6.41875 4.6875 6.79375 4.6875 7.1875C4.6875 8.7375 5.95 10 7.5 10C7.89375 10 8.26875 9.91875 8.60625 9.775L9.21875 10.3875C8.66875 10.5375 8.09375 10.625 7.5 10.625C5.13125 10.625 3.01875 9.29375 1.9875 7.1875C2.425 6.29375 3.0625 5.55625 3.81875 4.98125Z" fill="#323232"/></svg><span style=padding-left:10px;>Deactivate...</span>'
    iconContainer.appendChild(deactivateIcon);
    container.appendChild(iconContainer);
    deactivateIcon.addEventListener("click", function() {
      console.log('Heeeel');
    });
    //positions
    const positionContainer = document.createElement("div");
    positionContainer.style.cssText = 'padding: 10px';
    positionContainer.innerHTML='<p>Position</p>'
    const positionIcon1 = document.createElement("div");
    positionIcon1.innerHTML='<svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="31" height="19" rx="1.5" fill="#F8F8F8" stroke="black"/><rect opacity="0.3" x="25" y="8" width="4" height="4" rx="2" fill="#906C0D"/><rect x="3" y="8" width="4" height="4" rx="2" fill="#906C0D"/></svg>'
    positionIcon1.style.cssText='float: left; cursor: pointer;'
    positionContainer.appendChild(positionIcon1);
    const positionIcon2 = document.createElement("div");
    positionIcon2.innerHTML='<svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="31" height="19" rx="1.5" fill="#F8F8F8" stroke="black"/><rect x="0.5" y="0.5" width="31" height="19" rx="1.5" fill="#F8F8F8" stroke="black"/><rect opacity="0.3" x="25" y="7" width="4" height="4" rx="2" fill="#906C0D"/><rect x="25" y="13" width="4" height="4" rx="2" fill="#906C0D"/></svg>'
    positionIcon2.style.cssText='float: right; margin-right: 80px; cursor: pointer;'
    positionContainer.appendChild(positionIcon2);
    container.appendChild(positionContainer);


    document.body.appendChild(container);
    
  })();