import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Разбивает заголовок на слова и прячет их.
// Возвращает функцию-запускатор анимации.
export function prepareTitle(title) {
    const delay = title.dataset.delay ? parseFloat(title.dataset.delay) : 0.4;

    const wordsContainer = document.createElement('div');
    wordsContainer.classList.add('words');

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = title.innerHTML;

    function traverseNodes(node, parent) {
        if (node.nodeType === Node.TEXT_NODE) {
            const words = node.textContent.split(/(\s+)/);
            words.forEach((word) => {
                if (word.trim() !== '') {
                    const wordSpan = document.createElement('span');
                    wordSpan.classList.add('word');
                    wordSpan.textContent = word;
                    parent.appendChild(wordSpan);
                } else if (word !== '') {
                    parent.appendChild(document.createTextNode(word));
                }
            });
        } else {
            const clone = node.cloneNode(false);
            parent.appendChild(clone);
            node.childNodes.forEach((child) => traverseNodes(child, clone));
        }
    }

    tempDiv.childNodes.forEach((child) => traverseNodes(child, wordsContainer));

    title.innerHTML = '';
    title.appendChild(wordsContainer);

    const wordsList = wordsContainer.querySelectorAll('.word');
    gsap.set(wordsList, { y: '100%', opacity: 0 });

    // возвращаем функцию запуска с опциональным delay
    return (withDelay = true) => {
        gsap.to(wordsList, {
            y: '0%',
            opacity: 1,
            delay: 0.1,
            duration: 0.25,
            ease: 'power1.out',
            stagger: { amount: 0.4 },
        });
    };
}

// Заголовки по скроллу — data-animation="title"
export function initTitleAnimations() {
    const titles = document.querySelectorAll('[data-animation="title"]');

    titles.forEach((title) => {
        const play = prepareTitle(title);

        ScrollTrigger.create({
            trigger: title,
            start: 'top 100%',
            onEnter: () => play(true), // с delay из data-delay
        });
    });
}