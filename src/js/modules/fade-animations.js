import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Базовая fade-up анимация появления блоков при скролле.
// Разметка:
// <div data-animation="fade-up">...</div>
// <div data-animation="fade-up" data-delay="0.2" data-distance="60" data-duration="0.8">...</div>
//
// data-delay    — задержка перед стартом (секунды), по умолчанию 0
// data-distance — сдвиг по Y в px, откуда появляется блок, по умолчанию 40
// data-duration — длительность анимации (секунды), по умолчанию 0.6

export function initFadeAnimations(selector = '[data-animation="fade-up"]') {
    const blocks = document.querySelectorAll(selector);

    blocks.forEach((block) => {
        const delay = block.dataset.delay ? parseFloat(block.dataset.delay) : 0;
        const distance = block.dataset.distance ? parseFloat(block.dataset.distance) : 40;
        const duration = block.dataset.duration ? parseFloat(block.dataset.duration) : 0.6;

        gsap.set(block, { y: distance, opacity: 0 });

        ScrollTrigger.create({
            trigger: block,
            start: 'top 85%',
            once: true, 
            onEnter: () => {
                gsap.to(block, {
                    y: 0,
                    opacity: 1,
                    delay,
                    duration,
                    ease: 'power2.out',
                });
            },
        });
    });
}