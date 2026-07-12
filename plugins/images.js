// plugins/images.js
//
// Единая точка обработки картинок из src/images/:
//   - jpg/jpeg/png -> конвертируются в public/images/*.webp
//   - svg          -> копируются как есть (оптимизированные) в public/images/*.svg
//
// В dev-режиме: конвертирует существующие картинки при старте сервера
// и следит за src/images — любое добавление/изменение/удаление файла
// сразу же отражается в public/images/, без перезапуска и ручных команд.
//
// В build-режиме: обрабатывает всё перед сборкой (buildStart).

import { SRC_DIR, convertAll, convertFile, removeWebpFor } from '../scripts/img-utils.mjs';

export default function imagesPlugin() {
  return {
    name: 'vite-plugin-images-source',

    // Сборка (vite build): один проход перед стартом бандлинга
    async buildStart() {
      await convertAll();
    },

    // Дев-сервер (vite dev): первичная обработка + watcher в реальном времени
    configureServer(server) {
      convertAll();

      server.watcher.add(SRC_DIR);

      server.watcher.on('add', (file) => {
        if (file.startsWith(SRC_DIR)) convertFile(file);
      });

      server.watcher.on('change', (file) => {
        if (file.startsWith(SRC_DIR)) convertFile(file);
      });

      server.watcher.on('unlink', (file) => {
        if (file.startsWith(SRC_DIR)) removeWebpFor(file);
      });
    },
  };
}
