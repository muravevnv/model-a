export function initPopup() {
    const closePopup = (popup) => {
        popup.classList.remove('is-active');
    };

    const openPopup = (id) => {
        const popup = document.querySelector(`[data-popup="${id}"]`);

        if (popup) {
            popup.classList.add('is-active');
        }
    };

    document.addEventListener('click', (e) => {
        const openBtn = e.target.closest('[data-popup-open]');

        if (openBtn) {
            openPopup(openBtn.dataset.popupOpen);
            return;
        }

        const closeBtn = e.target.closest('[data-popup-close]');

        if (closeBtn) {
            closePopup(closeBtn.closest('[data-popup]'));
            return;
        }

        const popup = e.target.closest('[data-popup]');

        if (popup && e.target === popup) {
            closePopup(popup);
        }
    });
}