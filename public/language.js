function changeLanguage(lang) {
  const elements = document.querySelectorAll('[data-key]');
  elements.forEach(el => {
    const key = el.getAttribute('data-key');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  localStorage.setItem('lang', lang);
}

document.querySelectorAll('.language-switch button').forEach(button => {
  button.addEventListener('click', () => {
    const lang = button.getAttribute('data-lang');
    changeLanguage(lang);
  });
});

window.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('lang') || 'it';
  changeLanguage(savedLang);
});