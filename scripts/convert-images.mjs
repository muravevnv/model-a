// scripts/convert-images.mjs
//
// Разовая ручная обработка всех картинок (например, для CI или если
// нужно пересобрать public/img без запуска dev-сервера). В обычной работе
// этого скрипта не нужно — за обработку уже отвечает plugins/images.js.

import { convertAll } from './img-utils.mjs';

convertAll()
  .then(() => console.log('[img] Готово.'))
  .catch((err) => {
    console.error('[img] Ошибка обработки:', err);
    process.exit(1);
  });
