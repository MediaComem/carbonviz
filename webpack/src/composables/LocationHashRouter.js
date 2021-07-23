import {ref, computed} from 'vue';

/**
 hashRoutes must be an object where the hash (anchor) routes are the properties
 and the hash's name must mach the Page's name in the pages folder.
 The first route will be taken as the default one. Example:

 const hashRoutes = {
   '#Home': 'Home',
   '#About': 'About me'
 };

*/
export default function (hashRoutes) {
  const hash = ref(window.location.hash);
  window.addEventListener('popstate', () => hash.value = window.location.hash);
  const currentHash = computed(() => hashRoutes[hash.value] ? hash.value : Object.keys(hashRoutes)[0]);
  const currentPage = computed(() => {
    let pageName = currentHash.value.substring(1);
    return require(`../pages/${pageName}.vue`).default;
  });

  return {currentHash, currentPage};
}