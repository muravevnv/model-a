export function initAccordion() {
    const accordions = document.querySelectorAll('[data-accordion]');

    if(accordions.length < 0) return

    accordions.forEach(initAccordion);

    function initAccordion(accordion) {
        const breakpoint = +accordion.dataset.breakpoint || 768;
        const items = accordion.querySelectorAll('[data-accordion-item]');

        const check = () => {
            if (window.innerWidth <= breakpoint) {
                enable();
            } else {
                disable();
            }
        };

        const toggle = (item) => {
            const isActive = item.classList.contains('is-active');

            items.forEach((el) => {
                const content = el.querySelector('[data-accordion-content]');

                el.classList.remove('is-active');
                content.style.height = 0;
            });

            if (!isActive) {
                const content = item.querySelector('[data-accordion-content]');

                item.classList.add('is-active');
                content.style.height = `${content.scrollHeight}px`;
            }
        };

        function enable() {
            if (accordion.classList.contains('is-enabled')) return;

            accordion.classList.add('is-enabled');

            items.forEach((item) => {
                const button = item.querySelector('[data-accordion-button]');
                const content = item.querySelector('[data-accordion-content]');

                content.style.height = item.classList.contains('is-active')
                    ? `${content.scrollHeight}px`
                    : '0px';

                button.addEventListener('click', item._handler = () => toggle(item));
            });
        }

        function disable() {
            if (!accordion.classList.contains('is-enabled')) return;

            accordion.classList.remove('is-enabled');

            items.forEach((item) => {
                const button = item.querySelector('[data-accordion-button]');
                const content = item.querySelector('[data-accordion-content]');

                button.removeEventListener('click', item._handler);

                item.classList.remove('is-active');
                content.style.height = '';
            });
        }

        check();
        window.addEventListener('resize', check);
    }
}