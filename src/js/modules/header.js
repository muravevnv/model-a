export function initFixedHeader(selector = '.js-header', threshold = 0) {
    const header = document.querySelector(selector);
    if (!header) return;

    function toggleFixed() {
        if (window.scrollY > threshold) {
            header.classList.add('is-fixed');
        } else {
            header.classList.remove('is-fixed');
        }
    }

    toggleFixed();

    window.addEventListener('scroll', toggleFixed, { passive: true });
}