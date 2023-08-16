const permissionsToRequest = {
  permissions: ['webRequest'],
  origins: ['<all_urls>']
}

async function requestPermissions() {
  function onResponse(response) {
    if (response) {
      console.log('Permission was granted');
    } else {
      console.log('Permission was refused');
    }

    return browser.permissions.getAll();
  }

  const response = await browser.permissions.request(permissionsToRequest);
  const currentPermissions = await onResponse(response);

  const origins = currentPermissions.origins;
  const permissions = currentPermissions.permissions;
  if (origins.includes('<all_urls>') && permissions.includes('webRequest')) {
    document.getElementById('ok').classList.remove('hidden');
  } else {
    document.getElementById('error').classList.remove('hidden');
  }
  console.log(`Current permissions:`, currentPermissions);
}

document.addEventListener('click', function (event) {
  // If the clicked element doesn't have the right selector, bail
  if (!event.target.matches('#permissions')) return;
  // Don't follow the link
  event.preventDefault();
  requestPermissions();
  }, false);