import Swiper from 'swiper'; // подключение по месту, если уже импортируется глобально — оставь свой импорт

export function initAdvantagesTabs() {
  const advantages = document.querySelector('.js-advantages');
  if (!advantages) return;

  const navSections = Array.from(document.querySelectorAll('.js-advantages-nav-section'));
  const stageSections = Array.from(document.querySelectorAll('.js-advantages-section'));
  const prevBtn = document.querySelector('.js-advantages-nav-prev');
  const nextBtn = document.querySelector('.js-advantages-nav-next');

  const EXPANDED_WIDTH = 480;
  const TRANSITION_MS = 600; // должно совпадать с длительностью в SCSS

  let activeBtnId = null;
  let swiper = null;

  const mq = window.matchMedia('(max-width: 767.98px)');

  // ---------- замер и хранение "свёрнутого" размера (= размеру кнопки) ----------

  function measureBtnSize(btn) {
    // кнопка position:absolute + width:100%, поэтому чтобы узнать её
    // естественный размер — на мгновение возвращаем в обычный поток
    const prevPosition = btn.style.position;
    const prevWidth = btn.style.width;

    btn.style.position = 'static';
    btn.style.width = 'auto';

    const rect = btn.getBoundingClientRect();

    btn.style.position = prevPosition;
    btn.style.width = prevWidth;

    return { width: Math.ceil(rect.width), height: Math.ceil(rect.height) };
  }

  function initCollapsedSizes() {
    navSections.forEach((section) => {
      const btn = section.querySelector('.js-advantages-nav-btn');
      const { width, height } = measureBtnSize(btn);

      section.dataset.collapsedWidth = width;
      section.dataset.collapsedHeight = height;

      section.style.width = `${width}px`;
      section.style.height = `${height}px`;
    });
  }

  // ---------- сворачивание / разворачивание __nav-section ----------

  function collapseSection(section) {
    const btn = section.querySelector('.js-advantages-nav-btn');

    section.classList.remove('is-open');
    btn.classList.remove('is-hidden');

    section.style.width = `${section.dataset.collapsedWidth}px`;
    section.style.height = `${section.dataset.collapsedHeight}px`;
  }

  function expandSection(section) {
    const btn = section.querySelector('.js-advantages-nav-btn');
    const content = section.querySelector('.js-advantages-nav-content');

    section.classList.add('is-open');
    btn.classList.add('is-hidden');

    section.style.width = `${EXPANDED_WIDTH}px`;
    section.style.height = `${content.scrollHeight}px`;
  }

  // ---------- переключение __section (стейдж) с анимацией matrix ----------

  function switchStageSection(dataId) {
    const target = stageSections.find((s) => s.dataset.section === dataId);
    const current = stageSections.find((s) => s.classList.contains('is-active'));

    if (!target || target === current) return;

    if (current) {
      current.classList.remove('is-active');
      current.classList.add('is-leaving');

      setTimeout(() => {
        current.classList.remove('is-leaving');
      }, TRANSITION_MS);
    }

    target.classList.add('is-entering');
    void target.offsetWidth; // форсируем reflow, чтобы стартовая позиция применилась

    requestAnimationFrame(() => {
      target.classList.remove('is-entering');
      target.classList.add('is-active');
    });
  }

  // ---------- активация таба (клик / стрелки / свайпер — единая точка входа) ----------

  function activateTab(dataId, { syncSwiper = true } = {}) {
    if (dataId === activeBtnId) return;

    const nextSection = navSections.find(
      (section) => section.querySelector('.js-advantages-nav-btn').dataset.btn === dataId
    );
    if (!nextSection) return;

    navSections.forEach((section) => {
      if (section !== nextSection) collapseSection(section);
    });
    expandSection(nextSection);

    switchStageSection(dataId);

    activeBtnId = dataId;
    prevBtn.classList.add('is-visible');
    nextBtn.classList.add('is-visible');

    if (syncSwiper && swiper) {
      const index = navSections.indexOf(nextSection);
      if (swiper.activeIndex !== index) swiper.slideTo(index);
    }
  }

  function stepTab(delta) {
    if (!activeBtnId) return;

    const ids = navSections.map((s) => s.querySelector('.js-advantages-nav-btn').dataset.btn);
    const currentIndex = ids.indexOf(activeBtnId);
    const nextIndex = (currentIndex + delta + ids.length) % ids.length;

    activateTab(ids[nextIndex]);
  }

  // ---------- события ----------

  navSections.forEach((section) => {
    const btn = section.querySelector('.js-advantages-nav-btn');
    btn.addEventListener('click', () => activateTab(btn.dataset.btn));
  });

  prevBtn.addEventListener('click', () => stepTab(-1));
  nextBtn.addEventListener('click', () => stepTab(1));

  // ---------- свайпер только на 767.98 и ниже ----------

  function initSwiper() {
    if (swiper) return;

    swiper = new Swiper('.advantages__nav-sections', {
      slidesPerView: 1,
      spaceBetween: 12,
      on: {
        slideChange(sw) {
          const section = navSections[sw.activeIndex];
          if (!section) return;
          const btn = section.querySelector('.js-advantages-nav-btn');
          activateTab(btn.dataset.btn, { syncSwiper: false });
        },
      },
    });
  }

  function destroySwiper() {
    if (!swiper) return;
    swiper.destroy(true, true);
    swiper = null;
  }

  function handleBreakpoint(e) {
    if (e.matches) {
      initSwiper();
    } else {
      destroySwiper();
    }
  }

  mq.addEventListener('change', handleBreakpoint);
  handleBreakpoint(mq);

  // ---------- начальное состояние ----------

  initCollapsedSizes();

  const previewSection = stageSections.find((s) => s.dataset.section === 'preview');
  if (previewSection) previewSection.classList.add('is-active');
}