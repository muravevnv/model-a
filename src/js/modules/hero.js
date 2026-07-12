import gsap from 'gsap';
import { prepareTitle } from './title-animations.js';

function initHeroTitle(titleSelector) {
    const title = document.querySelector(titleSelector);
    if (!title) return null;

    const play = prepareTitle(title);
    return () => play(false);
}

export function initHero() {
    const video = document.querySelector('.js-hero-video');
    const overlay = document.querySelector('.js-hero-overlay');
    const playHeroTitle = initHeroTitle('.js-hero-title');
    const playHeroSubtitle = initHeroTitle('.js-hero-subtitle');

    if (video && playHeroTitle) {
        function showHero() {
            const tl = gsap.timeline();
            tl.to(overlay, { duration: 0.8, opacity: 1, ease: 'power2.out' })
                .add(playHeroTitle, '-=0.3')
                .add(playHeroSubtitle, '-=0.3');
        }

        const fallback = setTimeout(showHero, 3000);
        video.addEventListener('ended', () => {
            clearTimeout(fallback);
            showHero();
        });
    }
}