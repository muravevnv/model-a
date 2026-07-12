import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initCalcScroll() {
    const calc = document.querySelector('.js-calc');
    const calcVideo = document.querySelector('.js-calc-video');

    if (!calc || !calcVideo) return;

    gsap.to(calcVideo, {
        scale: 1,
        duration: 2,
        ease: 'expo.ease',
        scrollTrigger: {
            trigger: calc,
            start: 'top 20%',
            end: 'bottom bottom',
            scrub: true,
        },
    });
}