(async () => {
    const containerHeight = 270;
    let svgColor = '#333333';
    // Create popup container
    const container = document.createElement("div");
    container.style.all = 'initial';
    container.style.display = 'none';
    container.style.position = 'fixed';
    container.style.top = '50%';
    container.style.right = "70px";
    container.style.width = "120px";
    container.style.height = `${containerHeight}px`;
    container.style['margin-top'] = `${-containerHeight/2}px`;
    container.style['box-shadow'] = 'rgba(136, 136, 136, 0.5) 0px 1px 8px -1px';
    container.style['z-index'] = '10000';
    container.style['font-family'] = 'Roboto, Arial, sans-serif' ;
    container.style['font-weight'] = 'bold';
    container.style['font-size'] = '10px';
    // styles for dark mode
    if( window.matchMedia('(prefers-color-scheme: dark)').matches ) {
      container.style['background-color'] = '#262626';
      container.style['color'] = '#BFBFBF';
      svgColor = '#BFBFBF';
    } else {
      container.style['background-color'] = 'white';
    }
    // Event lsitener to toggle darkMode
    const mediaQueryDark = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQueryDark.onchange = (e) => {
      // Check if the media query is true
      if (e.matches) {
        // Then apply dark stlyes
        container.style['background-color'] = '#262626';
        container.style['color'] = '#BFBFBF';
        svgColor = '#BFBFBF';
      } else {
        container.style['background-color'] = 'white';
        container.style['color'] = 'initial';
      }
    }
    container.id = 'miniViz_popup_container';
    //*********************** */
    //consumption container
    //*********************** */
    const consumptionDiv = document.createElement("div");
    consumptionDiv.id = "consumption";
    container.appendChild(consumptionDiv);
    //header
    const header = document.createElement("div");
    header.innerHTML = 'Consumption <svg id="close" width="14" height="14" style="float:right; margin-right:6px; margin-top: 2px; cursor:pointer;" data-prefix="far" data-icon="times-circle" class="svg-inline--fa fa-times-circle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z"></path></svg>';
    header.style.cssText = 'font-size: 14px; text-align:center; margin-top: 10px; margin-left: 4px;';
    consumptionDiv.appendChild(header);

    //co2 and data totals
    const data = document.createElement("div");
    data.id = "vue-co2-data-counter";

    data.style.cssText = 'margin-top: 20px;';
    data.innerHTML = "co2 and data icons here";
    consumptionDiv.appendChild(data);
    //open extension, deactivate buttion icons
    const iconContainer = document.createElement("div");
    iconContainer.style.cssText = 'margin-top: 10px; padding: 10px';
    const openIcon = document.createElement("div");
    openIcon.style.cssText = 'cursor: pointer;';
    openIcon.innerHTML = `<svg width="15" height="15" style=float:left; viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M5.56068 3.51027H3.51027V11.4897H11.4854V9.43932H12.9957V11.8139C12.9957 12.468 12.4637 13 11.8096 13H3.18609C2.53202 13 2 12.468 2 11.8139V3.18609C2 2.53202 2.53202 2 3.18609 2H5.56068V3.51027ZM7.93124 2.04474C7.41618 2.04474 6.99685 2.46406 6.99685 2.97912V7.07324C6.99685 7.5883 7.41618 8.00762 7.93124 8.00762H12.0254C12.5404 8.00762 12.9597 7.5883 12.9597 7.07324V2.97912C12.9597 2.46406 12.5404 2.04474 12.0254 2.04474H7.93124Z" fill="${svgColor}"/></svg><span style=padding-left:5px;>Open Extension</span>`

    openIcon.addEventListener('click', function() {
      chrome.runtime.sendMessage({ query: 'openExtension' });
    });

    iconContainer.appendChild(openIcon);
    const deactivateIcon = document.createElement("div");
    deactivateIcon.id='deactivateIcon';
    deactivateIcon.style.cssText = 'cursor: pointer; padding-top: 12px; padding-bottom: 12px;';
    deactivateIcon.innerHTML = `<svg width="15" height="15" style=float:left; viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 3.75C9.86875 3.75 11.9812 5.08125 13.0125 7.1875C12.6438 7.95 12.125 8.60625 11.5063 9.1375L12.3875 10.0188C13.2562 9.25 13.9438 8.2875 14.375 7.1875C13.2937 4.44375 10.625 2.5 7.5 2.5C6.70625 2.5 5.94375 2.625 5.225 2.85625L6.25625 3.8875C6.6625 3.80625 7.075 3.75 7.5 3.75ZM6.83125 4.4625L8.125 5.75625C8.48125 5.9125 8.76875 6.2 8.925 6.55625L10.2188 7.85C10.2688 7.6375 10.3062 7.4125 10.3062 7.18125C10.3125 5.63125 9.05 4.375 7.5 4.375C7.26875 4.375 7.05 4.40625 6.83125 4.4625ZM1.25625 2.41875L2.93125 4.09375C1.9125 4.89375 1.10625 5.95625 0.625 7.1875C1.70625 9.93125 4.375 11.875 7.5 11.875C8.45 11.875 9.3625 11.6938 10.2 11.3625L12.3375 13.5L13.2188 12.6188L2.1375 1.53125L1.25625 2.41875ZM5.94375 7.10625L7.575 8.7375C7.55 8.74375 7.525 8.75 7.5 8.75C6.6375 8.75 5.9375 8.05 5.9375 7.1875C5.9375 7.15625 5.94375 7.1375 5.94375 7.10625ZM3.81875 4.98125L4.9125 6.075C4.76875 6.41875 4.6875 6.79375 4.6875 7.1875C4.6875 8.7375 5.95 10 7.5 10C7.89375 10 8.26875 9.91875 8.60625 9.775L9.21875 10.3875C8.66875 10.5375 8.09375 10.625 7.5 10.625C5.13125 10.625 3.01875 9.29375 1.9875 7.1875C2.425 6.29375 3.0625 5.55625 3.81875 4.98125Z" fill="${svgColor}"/></svg><span style=padding-left:5px;>Deactivate...</span>`
    iconContainer.appendChild(deactivateIcon);
    consumptionDiv.appendChild(iconContainer);
    //positions
    const positionContainer = document.createElement("div");
    positionContainer.style.cssText = 'margin-left: 10px;';
    positionContainer.innerHTML='Position'
    const positionIcons = document.createElement("div");
    positionIcons.style.display = 'flex';
    const positionIcon1 = document.createElement("div");
    positionIcon1.id='positionLeftRight';
    positionIcon1.innerHTML='<svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="31" height="19" rx="1.5" fill="#F8F8F8" stroke="black"/><rect x="25" y="8" width="4" height="4" rx="2" fill="#906C0D"/><rect opacity="0.3" x="3" y="8" width="4" height="4" rx="2" fill="#906C0D"/></svg>'
    positionIcon1.style.cssText='float: left; cursor: pointer;'
    positionIcons.appendChild(positionIcon1);
    const positionIcon2 = document.createElement("div");
    positionIcon2.id='positionUpDown';
    positionIcon2.innerHTML='<svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="31" height="19" rx="1.5" fill="#F8F8F8" stroke="black"/><rect x="0.5" y="0.5" width="31" height="19" rx="1.5" fill="#F8F8F8" stroke="black"/><rect x="25" y="7" width="4" height="4" rx="2" fill="#906C0D"/><rect opacity="0.3" x="25" y="13" width="4" height="4" rx="2" fill="#906C0D"/></svg>'
    positionIcon2.style.cssText='cursor: pointer; padding-left: 6px';
    positionIcons.appendChild(positionIcon2);
    positionContainer.appendChild(positionIcons);
    consumptionDiv.appendChild(positionContainer);


    //carbonViz logo
    const carbonvizIcon = document.createElement("div");
    carbonvizIcon.style.cssText = 'margin-top:10px; padding:10px; opacity:.5; font-weight: normal';
    carbonvizIcon.innerHTML = `<div style="margin-top: 2px; float: left">CarbonViz</div> <svg style="float:right" width="16" height="16" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.0898439 19.7018C0.785599 20.8818 1.45507 22.023 2.42488 23.0091C2.84909 23.4408 3.53483 23.7261 4.07417 23.9989C4.58973 24.2592 5.17536 24.3631 5.74973 24.3018C6.94853 24.1729 7.91959 23.4621 8.49271 22.5023C9.10337 22.929 9.7766 23.2168 10.4573 23.5459C11.984 24.2817 13.4894 24.736 15.1725 24.95C15.9395 25.0476 16.0872 23.775 15.3526 23.6148C15.1474 23.5697 14.9435 23.5222 14.7407 23.4721C15.3314 23.2957 15.8982 23.0191 16.4376 22.6187C16.7316 22.3997 17.0019 22.1582 17.2497 21.8979C17.5926 22.2483 17.963 22.5649 18.3534 22.8364C19.367 23.5422 20.6309 24.084 21.886 23.8463C22.2063 23.785 22.5029 23.6698 22.7719 23.5134C23.0122 23.6561 23.2612 23.7862 23.519 23.9026C24.1359 24.1804 24.8016 24.3531 25.4799 24.3556C26.1106 24.3581 26.6336 24.1504 27.2305 24.0039C27.6072 23.9113 27.9538 23.81 28.2729 23.6786C28.771 23.6986 29.269 23.6273 29.7207 23.4546C29.986 23.3532 30.23 23.2281 30.4553 23.0842C31.2924 24.0452 32.5663 24.7085 33.7238 25.0276C35.2467 25.4468 36.9623 25.453 38.3351 24.5896C39.7053 23.7274 40.4912 22.0744 39.3074 20.6991C38.3088 19.5391 36.6332 18.7145 34.9627 18.5355C35.3556 18.1601 35.7485 17.786 36.1415 17.4105C36.3066 17.2529 36.4243 17.0952 36.5131 16.9313C37.7895 17.0139 38.972 17.7497 39.8154 18.7357C40.4636 19.4941 41.5523 18.3954 40.9091 17.642C39.8692 16.4245 38.4965 15.6186 36.9273 15.4409C37.0662 14.8866 37.2464 14.2959 37.2014 13.7441C37.1651 13.2961 37.0587 12.8443 36.8998 12.4239C36.5569 11.5192 35.9775 10.7746 35.1942 10.209C34.7549 9.89239 34.3758 9.54952 33.9603 9.2592C34.138 8.46709 34.2144 7.65371 34.1581 6.82281C34.0717 5.56019 33.5712 4.20873 32.2022 3.86961C30.7418 3.50671 29.488 4.66047 28.557 5.62276C28.3517 5.83424 28.159 6.05698 27.9713 6.28348C27.7849 5.83174 27.5797 5.385 27.387 4.92951C26.9715 3.94594 26.3884 3.04872 25.6588 2.26912C25.2784 1.86368 24.8467 1.4157 24.3437 1.17544C23.743 0.888874 23.0986 0.671138 22.4816 0.422118C21.8447 0.164338 21.3204 -0.00960021 20.6246 0.000410646C20.1078 0.00791879 19.5747 0.0792462 19.0792 0.231912C18.5611 0.392085 18.0618 0.633597 17.6189 0.946437C17.2347 1.21673 16.833 1.45324 16.4526 1.72603C15.5904 2.34295 15.1987 3.29523 14.7457 4.21623C14.6606 4.38892 14.5881 4.56411 14.5205 4.74055C14.3879 4.86319 14.299 5.03587 14.3028 5.25236C14.304 5.30241 14.3053 5.35247 14.3065 5.40377C14.2152 5.75165 14.1564 6.10703 14.1238 6.46617C13.4331 6.17836 12.7348 6.04447 12.0028 6.10954C11.8776 6.05197 11.7462 6.00818 11.6098 5.98315C10.7789 5.83048 9.98057 6.14332 9.42372 6.7665C9.05457 7.17945 8.7605 7.69626 8.54026 8.25812C7.68683 9.48195 7.20506 11.0424 7.04489 12.4452C6.46926 12.8756 6.12889 13.5326 6.10637 14.336C6.09135 14.3372 6.07759 14.3372 6.06257 14.3385C5.74973 13.7729 5.19788 13.3974 4.52591 13.2548C4.45833 13.241 4.38575 13.2335 4.31192 13.2335C4.29941 13.191 4.28815 13.1484 4.27939 13.1046C4.13924 12.4589 4.18554 11.8057 4.37699 11.175C4.58347 10.4968 5.05022 9.94119 5.44565 9.35931C5.65588 9.05023 5.73221 8.93385 6.06508 8.78244C6.229 8.70735 6.39293 8.63227 6.55811 8.55719C6.74331 8.6598 6.92726 8.76367 7.11246 8.86628C7.98341 9.3518 8.76175 8.01535 7.89331 7.53108C7.5154 7.32085 7.04989 6.92667 6.5969 6.92042C6.1802 6.91541 5.64962 7.28081 5.28673 7.44724C4.88004 7.63369 4.65229 7.79011 4.39952 8.15175C4.1017 8.57596 3.81639 9.00893 3.52607 9.4369C3.02303 10.1777 2.74397 11.0186 2.66764 11.9133C2.59006 12.8306 2.85034 13.5751 3.09686 14.4336C3.10937 14.4786 3.12188 14.5237 3.1344 14.5675C2.77401 15.5097 2.7665 16.5546 3.06307 17.5557C3.16943 17.9123 3.32836 18.2227 3.52857 18.493C3.461 18.4755 3.39092 18.4529 3.31709 18.4229C2.72395 18.1751 2.19212 17.7484 1.63026 17.4381C0.819385 16.9888 0.219985 18.1163 0.918242 18.6481C0.403935 18.4729 -0.239263 19.1449 0.0898439 19.7018ZM20.2755 15.6424C20.8348 15.8051 21.4367 15.8889 22.0199 15.8776C22.0912 15.8764 22.1638 15.8739 22.2351 15.8701C22.2589 15.949 22.2877 16.0253 22.3202 16.0991C21.926 16.2493 21.5131 16.3506 21.0876 16.3932C20.6734 16.4357 20.323 16.4733 19.9627 16.2668C19.7612 16.1517 19.566 16.0278 19.3758 15.8952C19.377 15.7375 19.3733 15.5786 19.3683 15.4209C19.6711 15.4935 19.9789 15.556 20.2755 15.6424ZM16.6628 11.2276C16.6128 11.0099 16.5602 10.7921 16.5077 10.5744C16.5715 10.6895 16.6328 10.8059 16.6916 10.9248C16.6803 11.0249 16.6716 11.1262 16.6628 11.2276ZM19.342 11.4904C19.3107 11.8833 19.2131 12.265 19.0554 12.6216C19.0467 12.4289 19.0266 12.2324 18.9916 12.0322C18.9028 11.5204 18.6913 11.0624 18.4911 10.5957C18.5236 10.5606 18.5574 10.5268 18.5937 10.493C18.8264 10.6294 19.0617 10.7471 19.332 10.8046C19.3532 11.0311 19.3607 11.2601 19.342 11.4904ZM11.7938 15.9177C12.0015 15.7337 12.1892 15.5273 12.3494 15.2995C12.3657 15.3158 12.3819 15.3295 12.3969 15.3458C12.5947 15.5598 12.7361 15.8026 12.8362 16.0653C12.6672 16.2806 12.4708 16.4695 12.243 16.6259C12.208 16.5571 12.1717 16.4883 12.1392 16.4195C12.0503 16.2355 11.9339 16.0653 11.7938 15.9177ZM10.3923 14.5462C10.6263 14.5562 10.8565 14.5787 11.0805 14.625C10.9178 14.8127 10.7164 14.9804 10.4936 15.1043C10.4661 15.0868 10.4361 15.0718 10.4085 15.0555C10.3985 14.8866 10.3948 14.7176 10.3923 14.5462ZM6.69576 16.8775C6.71203 16.9238 6.7308 16.9701 6.75082 17.0164C6.71703 17.0101 6.68325 17.0039 6.64946 17.0001C6.66447 16.9638 6.67949 16.9275 6.69201 16.8887C6.69326 16.8837 6.69451 16.88 6.69576 16.8775ZM10.4486 12.8118C10.4724 12.7342 10.5024 12.6591 10.5412 12.5853C10.7739 12.1411 11.0918 12.1911 11.5197 12.081C11.8801 11.9872 11.8914 11.8858 12.2255 12.0835C12.2706 12.1098 12.3169 12.1348 12.3644 12.1598C12.3018 12.3813 12.2255 12.5991 12.1329 12.8093C11.5673 13.0771 10.9391 13.0934 10.4486 12.8118ZM18.7426 8.21682C18.6412 8.30442 18.5411 8.39827 18.4372 8.50088C18.3734 8.4283 18.3121 8.3357 18.2458 8.20556C18.0744 7.8702 17.8967 7.69376 17.9179 7.42972C17.9855 7.43097 18.0531 7.43097 18.1219 7.43222C18.3371 7.6875 18.5611 7.94278 18.7426 8.21682ZM20.5708 8.94511C20.8323 8.86753 21.1076 8.82248 21.3792 8.80871C21.2766 8.91258 21.1702 9.00893 21.0501 9.08026C20.9162 9.15909 20.771 9.18788 20.6221 9.20039C20.6046 9.1153 20.5883 9.03021 20.5708 8.94511ZM15.1487 17.5707C15.1437 17.5745 15.1374 17.5795 15.1312 17.5832C15.0661 17.6333 15.001 17.6871 14.9347 17.7434C14.8571 17.7059 14.7783 17.6696 14.6994 17.6345C14.6369 17.338 14.538 17.0414 14.4404 16.716C14.4216 16.6547 14.4066 16.5947 14.3916 16.5333C14.5017 16.3569 14.6006 16.1705 14.6819 15.9752C14.8584 16.0566 15.0336 16.1367 15.21 16.2155C15.1287 16.6647 15.1111 17.119 15.1487 17.5707ZM12.5947 10.5081C12.0766 10.3053 11.6399 10.4405 11.1331 10.5731C10.6463 10.6995 10.172 10.7658 9.74782 11.1312C9.69151 11.18 9.63895 11.2313 9.58765 11.2852C9.5451 10.9673 9.5451 10.642 9.56387 10.3166C9.58139 10.0138 9.62268 9.6221 9.70402 9.21916C9.70653 9.21415 9.71028 9.20915 9.71278 9.20414C10.122 8.50714 10.7089 7.92526 11.4947 7.68374C11.6048 7.64996 11.7137 7.62368 11.8201 7.60241C12.0115 7.85643 12.1542 8.18178 12.2618 8.43456C12.5283 9.05774 12.6134 9.79103 12.5947 10.5081ZM14.2202 8.13799C14.1513 8.64979 14.1126 9.16535 13.9899 9.6734C13.9762 9.73222 13.9611 9.79228 13.9461 9.85235C13.9148 9.44816 13.8535 9.05523 13.7584 8.68733C13.6821 8.39326 13.5695 8.06666 13.4218 7.74506C13.6746 7.83891 13.9274 7.9628 14.1814 8.11171C14.1939 8.12172 14.2064 8.13048 14.2202 8.13799ZM26.8839 7.7826C26.6299 8.17553 26.3871 8.57596 26.1494 8.9789C26.073 8.92384 25.9979 8.86753 25.9191 8.81622C25.4974 8.53967 25.0344 8.35197 24.5651 8.17428C24.4137 8.11671 24.2673 8.04914 24.1234 7.97781C24.3011 7.61617 24.4312 7.232 24.5101 6.83532C24.5977 6.3961 24.5188 6.00317 24.46 5.56144C24.4087 5.17602 24.4287 4.70301 24.1522 4.40143C23.4514 3.6356 22.4779 3.64687 21.5419 3.66188C20.5458 3.67815 20.547 5.22358 21.5419 5.20856C21.8122 5.20481 22.2201 5.12097 22.4791 5.19354C22.618 5.23234 22.7594 5.31618 22.8958 5.40627C22.9897 6.10453 23.036 6.73396 22.6919 7.39218C21.8484 7.19321 20.9575 7.23576 20.1253 7.48102C19.8951 7.14816 19.606 6.83532 19.3545 6.51998C19.1605 6.27722 18.9991 6.01819 18.69 5.91683C18.3271 5.7992 17.769 5.88179 17.3924 5.87804C17.1208 5.87553 16.8618 6.0282 16.7254 6.26095C16.3775 6.85159 16.2624 7.43222 16.4226 8.01911C16.2599 7.86019 16.0935 7.70502 15.917 7.56111C15.907 7.47602 15.897 7.38968 15.8882 7.30458C15.9283 6.72896 15.9233 6.15459 15.8482 5.59148C16.0296 5.02836 16.3813 4.56661 16.5902 4.02227C16.7579 3.58805 16.9882 3.2189 17.3836 2.95487C17.6038 2.80846 17.8454 2.72086 18.0581 2.56569C18.2896 2.39676 18.4923 2.20405 18.7426 2.05639C19.6335 1.53082 20.7335 1.38191 21.6945 1.76232C22.3077 2.00509 22.9684 2.21907 23.5565 2.51564C23.9783 2.72837 24.3174 3.09377 24.6352 3.44164C25.3285 4.19997 25.8027 5.07717 26.1594 6.0332C26.3658 6.58505 26.6799 7.07684 26.8476 7.64871C26.8626 7.69376 26.8726 7.7388 26.8839 7.7826ZM26.4397 14.9028C26.4985 15.2207 26.5448 15.5273 26.6174 15.8213C26.2395 15.7563 25.8515 15.76 25.4636 15.8489C25.8102 15.5485 26.1381 15.2357 26.4397 14.9028ZM32.6264 7.62743C32.6176 7.96405 32.5788 8.29816 32.52 8.62852C31.5427 8.43206 30.5078 8.52966 29.6582 9.05273C29.3165 9.26421 28.9699 9.47068 28.627 9.68091C28.6471 9.20164 28.6208 8.72487 28.5532 8.24936C28.5445 8.1918 28.5357 8.13548 28.5257 8.07917C28.7372 7.77885 28.9574 7.48853 29.1939 7.21449C29.747 6.57004 30.7456 5.29615 31.6916 5.35372C32.7015 5.41503 32.6452 6.92417 32.6264 7.62743ZM31.6478 10.0876C31.8005 10.0889 31.9507 10.1026 32.0983 10.1264C32.0195 10.3304 31.9331 10.5306 31.8405 10.7295C31.5552 10.4743 31.2549 10.3003 30.9383 10.1852C31.151 10.1214 31.3763 10.0851 31.6478 10.0876ZM33.9653 15.8801C34.0191 15.6862 34.0579 15.4872 34.0905 15.2907C34.2419 14.3848 34.1405 13.4513 33.6462 12.6616C33.4635 12.3701 33.2383 12.1136 32.983 11.8858C33.1657 11.5292 33.3322 11.1663 33.4798 10.7959C33.6813 10.9811 33.869 11.1788 34.098 11.3352C34.8938 11.877 35.4469 12.5891 35.6159 13.5589C35.7235 14.1708 35.4645 14.8578 35.3356 15.4572C35.3343 15.4659 35.3318 15.4747 35.3306 15.4835C34.8651 15.5635 34.4083 15.6999 33.9653 15.8801ZM32.067 20.9269C32.236 20.7367 32.4249 20.5802 32.6301 20.4551C33.1745 20.6203 33.7126 20.8117 34.2632 21.0094C34.7337 21.1784 35.1929 21.306 35.5971 21.6001C36.0238 21.9117 36.4318 22.2533 36.8435 22.5874C36.8347 22.6675 36.8247 22.7476 36.8159 22.8264C36.3642 22.9128 35.9074 22.9415 35.4432 22.8727C34.8288 22.7814 34.3433 22.4911 33.7814 22.2646C32.9668 21.938 32.3824 21.6914 32.067 20.9269ZM30.4891 16.6685C31.0484 16.1129 31.3988 15.4134 31.3312 14.4436C31.6266 14.0619 31.9119 13.669 32.1784 13.2635C32.3186 13.435 32.4337 13.6264 32.51 13.8392C32.6514 14.2308 32.6427 14.6651 32.5663 15.0705C32.4537 15.6699 32.1571 15.9227 31.7404 16.3569C31.4914 16.6159 31.2699 16.9225 30.9871 17.1227C30.8332 16.9588 30.6668 16.8074 30.4891 16.6685ZM28.5908 15.2082C28.6033 15.0042 28.5995 14.8002 28.5807 14.5987C28.4957 13.7015 28.4806 12.8106 28.2591 11.9634C28.2904 11.9146 28.323 11.867 28.358 11.8207C28.4393 11.7106 28.5357 11.6093 28.6421 11.5154C28.7622 11.5367 28.8811 11.5567 29.0037 11.5642C29.2377 11.5805 29.463 11.5116 29.6982 11.5016C30.0874 11.4841 30.454 11.5817 30.7581 11.8307C30.8807 11.9309 30.9683 12.0485 31.0522 12.1686C30.683 12.7517 30.2763 13.3073 29.8584 13.8254C29.4655 14.3122 29.0412 14.7739 28.5908 15.2082ZM26.5911 21.2572C26.2007 20.8856 25.7439 20.5327 25.4061 20.1135C25.351 20.0447 25.2984 19.9683 25.2484 19.8882C25.5324 19.7105 25.814 19.5316 26.0981 19.3527C26.959 19.479 27.8212 19.5917 28.6834 19.7118C28.6859 19.7206 28.6884 19.7281 28.6909 19.7368C28.323 19.8244 27.9526 19.9045 27.5809 19.9721C26.8051 20.116 26.9878 21.4462 27.7674 21.3511C28.079 21.3135 28.388 21.2697 28.6959 21.2209C28.6571 21.3298 28.6095 21.4349 28.5482 21.5388C28.4031 21.7853 28.2379 21.9655 28.0477 22.1031C27.4433 21.9905 27.0278 21.6727 26.5911 21.2572ZM23.9082 22.4097C24.1184 22.0894 24.2861 21.7377 24.405 21.3773C24.4112 21.3561 24.4175 21.3361 24.4237 21.3148C24.4913 21.3874 24.5601 21.4587 24.6327 21.5275C25.0419 21.9167 25.4461 22.3809 25.8903 22.7563C25.4724 22.8264 25.0519 22.8339 24.5601 22.675C24.3361 22.6024 24.1197 22.5123 23.9082 22.4097ZM22.2514 14.3134C21.4881 14.3497 20.7698 14.1558 20.029 13.9768C20.2542 13.6352 20.4632 13.2986 20.6134 12.8856C20.8761 12.1636 20.9162 11.4478 20.8574 10.7308C21.2553 10.6645 21.6407 10.5494 21.9811 10.3128C22.2589 10.1214 22.4516 9.85485 22.6956 9.64462C22.8533 9.50947 23.0122 9.38559 23.1661 9.2542C23.3063 9.32678 23.4477 9.40186 23.5978 9.47444C24.0834 9.71094 24.5964 9.80605 25.0632 10.1026C25.1758 10.1739 25.2822 10.2528 25.3873 10.3354C25.3397 10.4242 25.2934 10.5118 25.2471 10.6007C24.6139 10.9585 24.0496 11.4378 23.6404 12.0247C23.1136 12.778 22.5054 13.4688 22.2514 14.3134ZM22.4816 21.3673C22.593 21.3223 22.7031 21.2747 22.812 21.2272C22.7644 21.3323 22.7094 21.4362 22.6468 21.535C22.5905 21.48 22.5367 21.4236 22.4816 21.3673ZM21.4418 19.6355C21.3216 19.2613 21.204 18.777 21.3792 18.4104C21.8197 18.5268 22.2626 18.6369 22.7081 18.7382C22.7995 19.0185 22.8896 19.2901 22.9534 19.5629C22.5379 19.8006 22.1125 20.0134 21.6607 20.1823C21.5756 20.0059 21.5031 19.8244 21.4418 19.6355ZM19.4321 21.7402C19.5109 21.7553 19.5897 21.7703 19.6698 21.7815C20.084 21.8429 20.4732 21.8454 20.8536 21.8041C21.0013 22.0018 21.1577 22.1907 21.3254 22.3672C20.6872 22.4022 20.024 22.1307 19.4321 21.7402ZM18.5336 19.9821C18.645 19.7393 18.7438 19.489 18.8314 19.2325C18.9941 18.7545 19.1167 18.2627 19.2056 17.7647C19.4471 17.8448 19.6899 17.9211 19.9339 17.9949C19.6924 18.7432 19.8037 19.6342 20.1141 20.4538C19.561 20.4176 19.0366 20.2361 18.5336 19.9821ZM13.8197 20.9807C13.8898 20.853 13.9536 20.7204 14.0087 20.5827C14.1101 20.3325 14.1739 20.0722 14.2677 19.8207C14.4905 19.7744 14.7095 19.7068 14.9209 19.6154C15.0586 19.5554 15.1925 19.4828 15.3264 19.4002C15.4528 19.4828 15.5791 19.5666 15.7043 19.653C15.7919 19.8457 15.887 20.0346 15.9921 20.2211C15.7518 20.4726 15.4628 20.6766 15.1337 20.793C14.7095 20.9444 14.2565 20.9093 13.8197 20.9807ZM10.5462 19.1212C10.5424 19.1161 10.5412 19.1099 10.5374 19.1049C10.5887 19.0986 10.6388 19.0924 10.6888 19.0849C10.8515 19.0598 11.0029 19.0185 11.1481 18.9685C11.1431 19.0235 11.1406 19.0786 11.1406 19.1337C11.1418 19.3214 11.108 19.5366 11.0417 19.7456C10.8991 19.5153 10.6851 19.3514 10.5462 19.1212ZM8.92443 19.464C8.86812 19.2613 8.82557 19.0611 8.77426 18.8696C8.80305 18.8821 8.83308 18.8947 8.86311 18.9072C8.86812 18.9359 8.87312 18.966 8.87813 18.9948C8.93569 19.3214 9.05582 19.6142 9.2185 19.8895C9.14717 19.8582 9.07709 19.8244 9.00952 19.7856C9.00451 19.7831 9.00076 19.7794 8.99575 19.7769C8.97448 19.6717 8.95196 19.5679 8.92443 19.464ZM1.20355 18.8659C1.96438 19.4478 2.74522 20.0409 3.74381 20.0935C4.03037 20.1085 4.29065 20.0709 4.52591 19.9946C4.57721 20.0897 4.63853 20.1848 4.71236 20.2787C5.29299 21.0232 5.80604 21.6289 6.71953 21.9742C6.78961 22.0005 6.86094 22.0256 6.93227 22.0481C6.83216 22.1932 6.72204 22.3259 6.58939 22.4072C6.29407 22.5899 5.78352 22.7776 5.43689 22.7776C4.46459 22.7776 3.5073 21.9054 2.92167 21.2247C2.29098 20.4901 1.80295 19.6355 1.20355 18.8659Z" fill="${svgColor}"/><path d="M25.0646 48.0001C21.8073 48.0001 18.7915 46.4947 16.8332 43.9332C15.7382 44.5651 14.5044 44.8954 13.218 44.8954C9.21366 44.8954 5.95638 41.6382 5.95638 37.6338C3.49746 37.2184 1.61792 35.0735 1.61792 32.497C1.61792 29.6239 3.95546 27.2876 6.82732 27.2876H34.9215C37.7947 27.2876 40.1309 29.6251 40.1309 32.497C40.1309 35.1987 38.0637 37.4261 35.4283 37.6826C35.4046 43.3763 30.7645 48.0001 25.0646 48.0001ZM17.0609 41.8684C17.1122 41.8684 17.1635 41.8734 17.2148 41.8822C17.4538 41.9247 17.6641 42.0661 17.7942 42.2701C19.3909 44.7666 22.1076 46.2569 25.0646 46.2569C29.8198 46.2569 33.689 42.3877 33.689 37.6326C33.689 37.4098 33.6777 37.1721 33.6564 36.9068C33.6364 36.664 33.719 36.4238 33.8829 36.2448C34.0481 36.0659 34.2796 35.9633 34.5236 35.9633H34.9228C36.8349 35.9633 38.3903 34.4078 38.3903 32.4957C38.3903 30.5837 36.8349 29.0282 34.9228 29.0282H6.82857C4.9165 29.0282 3.36106 30.5837 3.36106 32.4957C3.36106 34.4078 4.9165 35.9633 6.82857 35.9633H6.87988C7.13015 35.9633 7.36791 36.0709 7.53309 36.2573C7.69827 36.445 7.77585 36.694 7.74457 36.9418C7.71453 37.1833 7.69952 37.4086 7.69952 37.6326C7.69952 40.6759 10.176 43.1523 13.2193 43.1523C14.4268 43.1523 15.5743 42.7694 16.5366 42.0436C16.6893 41.9297 16.8732 41.8684 17.0609 41.8684Z" fill="${svgColor}"/></svg>`
    consumptionDiv.appendChild(carbonvizIcon);
    //*********************** */
    //deactivate container
    //*********************** */
    const deactivateDiv = document.createElement("div");
    deactivateDiv.style.cssText = 'display: none;'
    deactivateDiv.id = "deactivate";
    //header
    const deactivateHeader = document.createElement("div");
    deactivateHeader.innerHTML = "Deactivate";
    deactivateHeader.style.cssText = 'font-size: 14px; font-weight: bold; text-align:center; margin-top: 10px;';
    deactivateDiv.appendChild(deactivateHeader);
    //user options
    const deactivateOptions = document.createElement("div");
    deactivateOptions.innerHTML = '<p style="font-weight: normal; cursor:pointer;padding-bottom: 10px" id="oneHour">1 hour</p><p style="font-weight: normal; cursor:pointer;padding-bottom: 10px" id="twoHour">2 hours</p><p style="font-weight: normal; cursor:pointer;padding-bottom: 10px" id="tomorrow">Until tomorrow</p><p style="font-weight: normal; cursor:pointer;padding-bottom: 10px" id="cancel">Cancel</p>';
    deactivateOptions.style.cssText = 'text-align:left; margin: 20px 0 0 30px;';
    deactivateDiv.appendChild(deactivateOptions);
    container.appendChild(deactivateDiv);

    document.body.appendChild(container);

    let positionRight = true;
    let positionTop = true;
    positionIcon1.addEventListener('click', function() {
      const minivizAnimation = document.getElementById('miniViz_container');
      const minivizPopup = document.getElementById('miniViz_popup_container');

      if(!positionRight) {
        minivizAnimation.style.right='0px';
        minivizAnimation.style.left='auto';
        minivizPopup.style.right='55px';
        minivizPopup.style.left='auto';
        positionRight = true;
        positionIcon1.innerHTML='<svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="31" height="19" rx="1.5" fill="#F8F8F8" stroke="black"/><rect x="25" y="8" width="4" height="4" rx="2" fill="#906C0D"/><rect opacity="0.3" x="3" y="8" width="4" height="4" rx="2" fill="#906C0D"/></svg>'
      } else {
        minivizAnimation.style.left='0px';
        minivizAnimation.style.right='auto';
        minivizPopup.style.left='55px';
        minivizPopup.style.right='auto';
        positionRight = false;
        positionIcon1.innerHTML='<svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="31" height="19" rx="1.5" fill="#F8F8F8" stroke="black"/><rect opacity="0.3" x="25" y="8" width="4" height="4" rx="2" fill="#906C0D"/><rect x="3" y="8" width="4" height="4" rx="2" fill="#906C0D"/></svg>'
      }
    });

    positionIcon2.addEventListener('click', function() {
      const minivizAnimation = document.getElementById('miniViz_container');
      const minivizPopup = document.getElementById('miniViz_popup_container');
      if(!positionTop) {
        minivizAnimation.style.top='50%';
        minivizAnimation.style['margin-top'] = '-150px';
        minivizAnimation.style.bottom='initial';
        minivizPopup.style.top='50%';
        minivizPopup.style['margin-top'] = `${-containerHeight/2}px`;
        minivizPopup.style.bottom='initial';
        positionTop = true;
        positionIcon2.innerHTML='<svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="31" height="19" rx="1.5" fill="#F8F8F8" stroke="black"/><rect x="0.5" y="0.5" width="31" height="19" rx="1.5" fill="#F8F8F8" stroke="black"/><rect x="25" y="7" width="4" height="4" rx="2" fill="#906C0D"/><rect opacity="0.3" x="25" y="13" width="4" height="4" rx="2" fill="#906C0D"/></svg>'
      } else {
        minivizAnimation.style.top='initial';
        minivizAnimation.style['margin-top'] = '0px';
        minivizAnimation.style.bottom='60px';
        minivizPopup.style.top='initial';
        minivizPopup.style['margin-top'] = '0px';
        minivizPopup.style.bottom='60px';
        positionTop = false;
        positionIcon2.innerHTML='<svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="31" height="19" rx="1.5" fill="#F8F8F8" stroke="black"/><rect x="0.5" y="0.5" width="31" height="19" rx="1.5" fill="#F8F8F8" stroke="black"/><rect opacity="0.3" x="25" y="7" width="4" height="4" rx="2" fill="#906C0D"/><rect x="25" y="13" width="4" height="4" rx="2" fill="#906C0D"/></svg>'
      }
    });

    const oneHour = 1000 * 60 * 60;
    const twoHour = oneHour * 2;
    const tomorrow = oneHour * 3;

    function deactivate(timePeriod) {
      chrome.runtime.sendMessage({ query: 'removeMiniviz', time: timePeriod });
    }

    deactivateIcon.addEventListener("click", function() {
      if (consumptionDiv.style.display === "none") {
        consumptionDiv.style.display = "block";
      } else {
        consumptionDiv.style.display = "none";
        deactivateDiv.style.display = "block";
      }
    });

    deactivateOptions.querySelector('#oneHour').addEventListener('click', function() {
      deactivate(oneHour);
    });
    deactivateOptions.querySelector('#twoHour').addEventListener('click', function() {
      deactivate(twoHour);
    });
    deactivateOptions.querySelector('#tomorrow').addEventListener('click', function() {
      deactivate(tomorrow);
    });
    deactivateOptions.querySelector('#cancel').addEventListener('click', cancel);

    // events to apply bold text only when mouse is over the options
    deactivateOptions.querySelector('#oneHour').addEventListener('mouseenter', function( event ) {
      event.target.style.fontWeight="bold";
    });
    deactivateOptions.querySelector('#twoHour').addEventListener('mouseenter', function( event ) {
      event.target.style.fontWeight="bold";
    });
    deactivateOptions.querySelector('#tomorrow').addEventListener('mouseenter', function( event ) {
      event.target.style.fontWeight="bold";
    });
    deactivateOptions.querySelector('#cancel').addEventListener('mouseenter', function( event ) {
      event.target.style.fontWeight="bold";
    });
    // Again on mouseout we need to remove the bold style
    deactivateOptions.querySelector('#oneHour').addEventListener('mouseout', function( event ) {
      event.target.style.fontWeight="normal";
    });
    deactivateOptions.querySelector('#twoHour').addEventListener('mouseout', function( event ) {
      event.target.style.fontWeight="normal";
    });
    deactivateOptions.querySelector('#tomorrow').addEventListener('mouseout', function( event ) {
      event.target.style.fontWeight="normal";
    });
    deactivateOptions.querySelector('#cancel').addEventListener('mouseout', function( event ) {
      event.target.style.fontWeight="normal";
    });
    // close miniviz popup
    container.querySelector('#close').addEventListener('click', function( event ) {
      let minivizPopup = document.getElementById('miniViz_popup_container');
      minivizPopup.style.display = 'none';
    });


    function cancel() {
      if (consumptionDiv.style.display === "none") {
        consumptionDiv.style.display = "block";
        deactivateDiv.style.display = "none";
      }
    }

  })();