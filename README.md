# Vite-сборка для верстки (HTML/SCSS/JS)

## Что внутри

| Задача                       | Решение |
|---|---|
| SCSS                          | встроено в Vite (нужен только пакет `sass`) |
| Подключаемые HTML-блоки (header/footer) | `vite-plugin-handlebars` |
| Мультистраничность            | любой `.html` в корне подхватывается автоматически (`fast-glob`) |
| Картинки: jpg/png → webp, svg → копия | свой плагин `plugins/images.js` — единая папка `src/images`, следит в реальном времени в dev, обрабатывает перед `build` |
| Дожатие webp/svg при сборке   | `vite-plugin-image-optimizer` |
| SVG-спрайт иконок             | свой плагин `plugins/svg-sprite.js` → `public/images/sprite.svg`, следит за `src/icons` в реальном времени |
| Шрифты                        | `vite-plugin-static-copy` — копирует как есть |
| JS                             | нативные ES-модули, бандлятся Vite/Rollup |

## Команды

```bash
npm install
npm run dev       # дев-сервер с HMR на localhost:3000 + конвертация картинок в реальном времени
npm run build     # перед сборкой конвертирует картинки, дальше сборка в dist/
npm run preview   # локальный просмотр собранного dist/
npm run images    # конвертация картинок вручную, разово (без запуска dev/build)
```

## Структура проекта

```
├── index.html              # страница (entry point)
├── about.html               # вторая страница (пример)
├── vite.config.js
├── plugins/
│   ├── images.js              # vite-плагин: следит за src/images в dev, обрабатывает перед build
│   └── svg-sprite.js          # vite-плагин: собирает src/icons в public/images/sprite.svg
├── scripts/
│   ├── img-utils.mjs          # общая логика обработки картинок (использует плагин и CLI-скрипт)
│   └── convert-images.mjs     # разовый ручной запуск обработки (npm run images)
├── public/
│   └── images/                # ВСЁ генерируемое: фото/webp/svg + sprite.svg, не редактируй руками
└── src/
    ├── images/                # ЕДИНАЯ папка-источник для любых картинок (jpg/png/svg)
    ├── icons/                 # *.svg → собираются в public/images/sprite.svg
    ├── fonts/                 # .woff2/.woff → копируются в dist/fonts
    ├── partials/               # header.html, footer.html — подключаются через {{> header }}
    ├── scss/
    │   ├── style.scss          # точка входа стилей
    │   ├── base/                # variables, reset, mixins, fonts
    │   └── blocks/               # БЭМ-блоки (header, footer, hero...)
    └── js/
        ├── main.js
        └── modules/
```

## Структура dist после сборки

Без обёртки `assets/` — всё разложено плоско по типу прямо в `dist`:

```
dist/
├── images/      # фото (webp/svg), sprite.svg, + хэшированные картинки из SCSS/JS
├── fonts/       # .woff2 как есть, без хэшей
├── css/         # *.hash.css
├── js/          # *.hash.js
├── index.html
└── about.html
```

## Как добавить новую страницу

Просто создай `contacts.html` в корне проекта (скопируй структуру `about.html`) — больше ничего
делать не нужно. `vite.config.js` сам сканирует корень на `*.html` и подключает каждый файл
как отдельную точку входа сборки.

## Как добавить иконку в спрайт

1. Запусти `npm run dev` (если ещё не запущен).
2. Положи `.svg` в `src/icons/` — **прямо во время работы дев-сервера**. Плагин сам заметит
   файл и пересоберёт `public/images/sprite.svg` (смотри лог `[sprite] ...` в терминале).
   Перезапускать сервер не нужно.
3. В HTML используй так:

```html
<svg class="icon"><use xlink:href="/images/sprite.svg#имя-файла"></use></svg>
```

Id символа — это имя файла без расширения (например, `src/icons/arrow.svg` → `#arrow`).
Путь `/images/sprite.svg` одинаковый и в dev, и после `build` — никаких хэшей и виртуальных
роутов, поэтому работает сразу.

## Как добавить картинку (фото, логотип, любой svg)

Один и тот же путь для любого типа картинки — растровой или векторной:

1. Запусти `npm run dev` (если ещё не запущен).
2. Положи файл в `src/images/` — **прямо во время работы дев-сервера**, неважно,
   `photo.jpg`, `photo.png` или `logo.svg`. Плагин сам разберётся:
   - `.jpg`/`.jpeg`/`.png` → сконвертирует в `public/images/photo.webp`
   - `.svg` → скопирует как есть (оптимизированный) в `public/images/logo.svg`

   Смотри в терминал — там лог `[img] ...`. Перезапускать сервер и запускать
   `npm run images` не нужно.
3. Используй итоговый файл напрямую, без фолбеков:

```html
<img src="/images/photo.webp" alt="..." loading="lazy">
<img src="/images/logo.svg" alt="Logo">
```

Если файл изменить (перезаписать тем же именем) — результат пересоздастся автоматически.
Если удалить из `src/images` — соответствующий файл тоже удалится из `public/images`.

`src/images/` — твои мастер-файлы (оригиналы), их можно хранить в любом качестве,
обработка не трогает исходники. `public/images/` — генерируемая папка, файлы в ней не редактируй
руками, они перезапишутся.

Качество webp настраивается в `scripts/img-utils.mjs` (константа `QUALITY`, по умолчанию 75).

`npm run images` остаётся как разовая ручная команда — например, если нужно пересобрать
`public/images` без запущенного дев-сервера (в CI, или просто по привычке).

## Как добавить шрифт

1. Положи `.woff2` в `src/fonts/`.
2. Допиши `@font-face` в `src/scss/base/_fonts.scss`, путь — `/fonts/имя-файла.woff2`.

## Подключение картинок через SCSS/JS (хэшируемые ассеты)

Если картинка используется как фон в SCSS (`background: url(...)`) или импортируется в JS —
подключай её относительным путём прямо из того файла, где она используется. Vite сам
обработает, захэширует и оптимизирует такой файл — он тоже попадёт в `dist/images/`,
просто с хэшем в имени (`photo.a1b2c3.webp`). Для основного сценария (картинка в `<img>`,
без хэшей в пути) используй `src/images/` → `public/images/`, см. выше.
