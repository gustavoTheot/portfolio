/**
 * Main Application Controller
 * Handles Typewriter effect, Language Switching (PT-BR / EN), and Scroll Reveal.
 */
let currentLang = 'pt';
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

function startTypewriter() {
    const typeEl = document.getElementById('typewriter-text');
    if (!typeEl) return;

    function typeStep() {
        const roles = rolesByLang[currentLang];
        const currentWord = roles[roleIndex % roles.length];

        charIndex += isDeleting ? -1 : 1;
        typeEl.textContent = currentWord.substring(0, charIndex);

        let speed = isDeleting ? 32 : 58;

        if (!isDeleting && charIndex === currentWord.length) {
            speed = 2200;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            speed = 400;
        }

        setTimeout(typeStep, speed);
    }

    typeStep();
}

function setLanguage(lang) {
    if (!i18n[lang]) return;
    currentLang = lang;

    document.getElementById('btn-pt')?.classList.toggle('active', lang === 'pt');
    document.getElementById('btn-en')?.classList.toggle('active', lang === 'en');
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) {
            el.innerHTML = i18n[lang][key];
        }
    });
}

function initScrollReveal() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        },
        { threshold: 0.12 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
    startTypewriter();
    initScrollReveal();
    initNeuralNetwork();
});
