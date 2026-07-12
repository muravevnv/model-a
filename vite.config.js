import { defineConfig } from 'vite';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';
import handlebars from 'vite-plugin-handlebars';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import imagesPlugin from './plugins/images.js';
import svgSpritePlugin from './plugins/svg-sprite.js';

const root = fileURLToPath(new URL('.', import.meta.url));

// ---------- Автообнаружение страниц ----------
// Любой .html в корне проекта становится отдельной точкой входа сборки.
// Просто создаёшь файл — ничего прописывать руками не нужно.
function getHtmlInputs() {
  const files = fg.sync('*.html', { cwd: root, absolute: true });
  return Object.fromEntries(
    files.map((file) => [basename(file, '.html'), file])
  );
}

export default defineConfig({
  root: '.',
  base: './',

  // Не очищать терминал при старте/перезапуске — иначе пропадают логи
  // плагинов (images.js, svg-sprite.js) при каждом сохранении файла.
  clearScreen: false,

  build: {
    outDir: 'dist',
    assetsDir: 'images', // фолбэк для ассетов, не подпавших под правила ниже
    emptyOutDir: true,
    rollupOptions: {
      input: getHtmlInputs(),
      output: {
        // Плоская раскладка в dist — без обёртки assets/
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: (asset) => {
          const name = asset.name ?? '';
          if (/\.css$/.test(name)) return 'css/[name].[hash][extname]';
          if (/\.(woff2?|ttf|eot)$/.test(name)) return 'fonts/[name][extname]';
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(name)) return 'images/[name].[hash][extname]';
          return '[name].[hash][extname]';
        },
      },
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
    devSourcemap: true,
  },

  plugins: [
    // ---------- Картинки: src/images/* -> public/images/ ----------
    // jpg/jpeg/png конвертируются в .webp, svg копируется как есть (оптимизированный).
    // В dev следит за папкой в реальном времени, в build конвертирует перед сборкой.
    imagesPlugin(),

    // ---------- HTML partials (header/footer/общие блоки) ----------
    handlebars({
      partialDirectory: resolve(root, 'src/partials'),
      // Сюда можно прокинуть переменные, доступные во всех html через {{var}}
      context: {
        siteName: 'My Site',
      },
    }),

    // ---------- SVG-спрайт из src/icons/*.svg ----------
    // Собирается в public/images/sprite.svg — путь одинаковый в dev и build.
    // Использование в html: <svg><use xlink:href="/images/sprite.svg#arrow"></use></svg>
    svgSpritePlugin(),

    // ---------- Копирование шрифтов как есть ----------
    viteStaticCopy({
      targets: [
        { src: 'src/fonts/*', dest: 'fonts', rename: { stripBase: true } },
      ],
    }),

    // ---------- Дожатие картинок при сборке ----------
    // .webp/.svg уже сгенерированы imagesPlugin() выше, этот плагин дополнительно
    // оптимизирует их (и любые svg-иконки) на финальном build.
    ViteImageOptimizer({
      includePublic: true,
      webp: { quality: 78 },
      svg: {
        multipass: true,
      },
    }),
  ],

  server: {
    port: 3000,
    open: true,
  },
});
