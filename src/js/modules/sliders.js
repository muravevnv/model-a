import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

export function initSliders() {

    const benefitsSlider = document.querySelector('.js-benefits-slider');

    if (benefitsSlider) {
        new Swiper(benefitsSlider, {
            modules: [Navigation],
            slidesPerView: 'auto',
            spaceBetween: 40,
            observer: true,
            observeSlideChildren: true,
            breakpoints: {
                768: {
                    spaceBetween: 64,
                },
                1024: {
                    spaceBetween: 80,
                }
            },
            navigation: {
                prevEl: '.js-benefits-slider-prev',
                nextEl: '.js-benefits-slider-next',
            },
        });
    }

    const intPropertySlider = document.querySelector('.js-int-property-slider');

    if (intPropertySlider) {
        const intPropertySliderSwiper = new Swiper(intPropertySlider, {
            modules: [Navigation],
            slidesPerView: 'auto',
            spaceBetween: 40,
            observer: true,
            observeSlideChildren: true,
            breakpoints: {
                768: {
                    spaceBetween: 64,
                },
                1220: {
                    spaceBetween: 80,
                }
            },
            navigation: {
                prevEl: '.js-int-property-slider-prev',
                nextEl: '.js-int-property-slider-next',
            },
        });
    }

    const featuresSlider = document.querySelector('.js-features-slider');

    if (featuresSlider) {
        new Swiper(featuresSlider, {
            modules: [Navigation],
            slidesPerView: 'auto',
            spaceBetween: 16,
            autoHeight: true,
            breakpoints: {
                768: {
                    slidesPerView: 'auto',
                    spaceBetween: 32,
                },
                1024: {
                    slidesPerView: 4,
                    spaceBetween: 48,
                }
            },
            navigation: {
                prevEl: '.js-features-slider-prev',
                nextEl: '.js-features-slider-next',
            },
        });
    }
}

window.addEventListener('load', () => {

    if (document.querySelector('.js-benefits-slider')) {
        benefitsSliderSwiper.update();
        benefitsSliderSwiper.navigation.update();
    }

});