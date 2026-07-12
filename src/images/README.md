# src/images — единая папка-источник для всех картинок

Складывай сюда любые картинки — jpg, png, svg, в любом качестве (это твои мастер-файлы,
обработка их не трогает).

При `npm run dev` (в реальном времени) или `npm run build` плагин `plugins/images.js`
сам разберётся, что с чем делать:

- `.jpg` / `.jpeg` / `.png` → конвертируются в `public/images/имя.webp`
- `.svg` → копируется как есть (с оптимизацией через svgo) в `public/images/имя.svg`

Структура подпапок сохраняется: `src/images/gallery/photo.jpg` → `public/images/gallery/photo.webp`

Использование в HTML — всегда напрямую, без `<picture>`/фолбеков:

```html
<img src="/images/photo.webp" alt="...">
<img src="/images/logo.svg" alt="...">
```
