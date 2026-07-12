// plugins/svg-sprite.js
//
// Собирает все src/icons/*.svg в один файл public/images/sprite.svg
// с <symbol id="имя-файла">. Путь одинаковый и в dev, и после build —
// никаких хэшей и виртуальных роутов, поэтому <use xlink:href="/images/sprite.svg#arrow">
// работает одинаково везде.
//
// В dev следит за src/icons в реальном времени, в build пересобирает перед стартом.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { optimize } from 'svgo';

const ICONS_DIR = path.resolve('src/icons');
const OUT_FILE = path.resolve('public/images/sprite.svg');

function extractSymbol(svgContent, id) {
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/i);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

  const innerMatch = svgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  const inner = innerMatch ? innerMatch[1] : '';

  return `<symbol id="${id}" viewBox="${viewBox}">${inner}</symbol>`;
}

async function buildSprite() {
  let entries;
  try {
    entries = await fs.readdir(ICONS_DIR);
  } catch {
    return; // папки с иконками ещё нет
  }

  const svgFiles = entries.filter((file) => file.toLowerCase().endsWith('.svg'));
  if (svgFiles.length === 0) return;

  const symbols = await Promise.all(
    svgFiles.map(async (file) => {
      const id = path.basename(file, '.svg');
      const raw = await fs.readFile(path.join(ICONS_DIR, file), 'utf-8');

      let optimized = raw;
      try {
        optimized = optimize(raw, { multipass: true }).data;
      } catch (err) {
        console.error(`[sprite] Не удалось оптимизировать ${file}:`, err.message);
      }

      return extractSymbol(optimized, id);
    })
  );

  const sprite =
    `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n` +
    symbols.join('\n') +
    `\n</svg>\n`;

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, sprite, 'utf-8');
  console.log(`[sprite] собрано иконок: ${svgFiles.length} → ${path.relative(process.cwd(), OUT_FILE)}`);
}

export default function svgSpritePlugin() {
  let building = false;

  // на случай если несколько событий watcher прилетят почти одновременно —
  // не запускаем пересборку параллельно поверх самой себя
  async function rebuild() {
    if (building) return;
    building = true;
    try {
      await buildSprite();
    } finally {
      building = false;
    }
  }

  return {
    name: 'vite-plugin-svg-sprite-source',

    async buildStart() {
      await rebuild();
    },

    configureServer(server) {
      rebuild();

      server.watcher.add(ICONS_DIR);

      const isIcon = (file) => file.startsWith(ICONS_DIR) && file.toLowerCase().endsWith('.svg');

      server.watcher.on('add', (file) => isIcon(file) && rebuild());
      server.watcher.on('change', (file) => isIcon(file) && rebuild());
      server.watcher.on('unlink', (file) => isIcon(file) && rebuild());
    },
  };
}
