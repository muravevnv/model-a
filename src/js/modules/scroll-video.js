export function initScrollVideos(selector = '[data-scroll-video]') {
    const videos = document.querySelectorAll(selector);
    if (!videos.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const video = entry.target;

            if (entry.isIntersecting) {
                video.play().catch(() => {
                    // автоплей может быть заблокирован браузером, если видео не muted
                });
            } else {
                video.pause();
            }
        });
    }, {
        threshold: 0.5, // видео должно быть видно на 50%, чтобы запуститься
    });

    videos.forEach((video) => observer.observe(video));
}