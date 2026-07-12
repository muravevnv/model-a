import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initHistoryScroll() {
    const history = document.querySelector('.js-history');
    const historyInfo = document.querySelector('.js-history-info');

    if (!history || !historyInfo) return;

    gsap.to(historyInfo, {
        y: '0%',
        opacity: 1,
        duration: 3,
        ease: 'expo.out',
        scrollTrigger: {
            trigger: history,
            start: 'bottom bottom',
            end: '+=1000', // явный end обязателен при pin: true — подберите под нужную длительность
            scrub: true,
            pin: true,
            refreshPriority: 2, // считается раньше секвенции, т.к. выше в DOM
        },
    });
}