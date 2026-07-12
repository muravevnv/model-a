import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollSequence() {
    const frameCount = 150;
    const canvas = document.getElementById("canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const images = [];
    const state = { frame: 0 };
    let loaded = 0;
    let isReady = false;

    // ---------- RESIZE ----------
    function resizeCanvas() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        if (isReady) draw(state.frame);
    }

    // ---------- DRAW ----------
    function draw(index) {
        if (!isReady) return;

        const img = images[Math.round(index)];
        if (!img || !img.complete || img.naturalWidth === 0) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;

        ctx.drawImage(img, x, y, w, h);
    }

    // ---------- PRELOAD ----------
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = `images/frames/${String(i).padStart(4, "0")}.webp`;
        img.onload = () => {
            loaded++;
            if (loaded === frameCount) {
                isReady = true;
                resizeCanvas();
                draw(state.frame);
            }
        };
        images.push(img);
    }

    window.addEventListener("resize", resizeCanvas);

    // ---------- GSAP ----------
    // Триггер создаётся сразу, синхронно — не ждём загрузки картинок,
    // чтобы порядок пересчёта совпадал с порядком остальных триггеров в DOM.
    gsap.to(state, {
        frame: frameCount - 1,
        ease: "none",
        onUpdate: () => draw(state.frame),
        scrollTrigger: {
            trigger: ".sequence",
            start: "top 30%",
            end: "+=2000",
            scrub: 0.5,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: 1, // ниже, чем у history, но выше обычных триггеров
        }
    });
}