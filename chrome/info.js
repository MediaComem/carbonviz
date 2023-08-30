function checkLanguage() {
  if (/^fr\b/.test(navigator.language)) {
    document.getElementById('fr').classList.remove('hidden');
    document.getElementById('en').classList.add('hidden');
  }
}

window.onload = (event) => {
  checkLanguage();
};