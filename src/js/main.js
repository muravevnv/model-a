import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { initFixedHeader } from './modules/header.js';
import { initSliders } from './modules/sliders.js';
import { initFadeAnimations } from './modules/fade-animations.js';
import { initTitleAnimations } from './modules/title-animations.js';
import { initHero } from './modules/hero.js';
import { initHistoryScroll } from './modules/history-scroll.js';
import { initCalcScroll } from './modules/calc-scroll.js';
import { initScrollSequence } from './modules/scroll-sequence.js';
import { initScrollVideos } from './modules/scroll-video.js';

import './modules/model.js';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

    initFixedHeader('.js-header');
    initSliders();
    initTitleAnimations();
    initFadeAnimations();
    initHero();

    // порядок ниже важен: должен соответствовать порядку блоков в DOM,
    // особенно для pin-триггеров (history и scroll-sequence)
    initHistoryScroll();
    initCalcScroll();
    initScrollSequence();

    initScrollVideos();

    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });
});

console.log('Сборка запущена ✅');