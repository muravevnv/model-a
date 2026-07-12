// scripts/img-utils.mjs
//
// Единая папка-источник для всех картинок: src/images/.
// Растровые (jpg/jpeg/png) -> конвертируются в public/images/*.webp
// SVG                       -> копируются как есть (с оптимизацией svgo) в public/images/*.svg
//
// Используется как из CLI (scripts/convert-webp.mjs), так и из vite-плагина
// (plugins/webp.js), который следит за папкой в реальном времени в dev-режиме.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { optimize } from 'svgo';

export const SRC_DIR = path.resolve('src/images');
export const OUT_DIR = path.resolve('public/images');
export const QUALITY = 75;

const RASTER_EXT = new Set(['.jpg', '.jpeg', '.png']);
const SVG_EXT = new Set(['.svg']);
const VIDEO_EXT = new Set(['.mp4', '.webm', '.ogg', '.mov']);


function ext(file) {
  return path.extname(file).toLowerCase();
}

export function isRaster(file) {
  return RASTER_EXT.has(ext(file));
}

export function isSvg(file) {
  return SVG_EXT.has(ext(file));
}

export function isVideo(file) {
  return VIDEO_EXT.has(ext(file));
}

export function isSupported(file) {
  return isRaster(file) || isSvg(file) || isVideo(file);
}

export function outPathFor(file) {
  const relative = path.relative(SRC_DIR, file);
  if (isRaster(file)) {
    return path.join(OUT_DIR, relative).replace(/\.(jpe?g|png)$/i, '.webp');
  }
  return path.join(OUT_DIR, relative); // svg — то же имя, то же расширение
}

async function convertRaster(file, outPath) {
  await sharp(file).webp({ quality: QUALITY }).toFile(outPath);
}

async function copySvg(file, outPath) {
  const raw = await fs.readFile(file, 'utf-8');
  let optimized = raw;
  try {
    optimized = optimize(raw, { multipass: true }).data;
  } catch (err) {
    console.error(`[img] Не удалось оптимизировать svg ${file}:`, err.message);
  }
  await fs.writeFile(outPath, optimized, 'utf-8');
}

export async function convertFile(file) {
  if (!isSupported(file)) return;

  const outPath = outPathFor(file);
  await fs.mkdir(path.dirname(outPath), { recursive: true });

  try {
    if (isRaster(file)) {
      await convertRaster(file, outPath);
    } else if (isVideo(file)) {
      await fs.copyFile(file, outPath);
    } else {
      await copySvg(file, outPath);
    }
    console.log(`[img] ${path.relative(process.cwd(), file)} → ${path.relative(process.cwd(), outPath)}`);
  } catch (err) {
    console.error(`[img] Ошибка обработки ${file}:`, err.message);
  }
}

export async function removeWebpFor(file) {
  if (!isSupported(file)) return;

  const outPath = outPathFor(file);
  try {
    await fs.unlink(outPath);
    console.log(`[img] удалён ${path.relative(process.cwd(), outPath)}`);
  } catch {
    // файла и так не было — ничего страшного
  }
}

async function walk(dir, files = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return files; // папки нет — нечего обрабатывать
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, files);
    } else if (isSupported(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

export async function convertAll() {
  const files = await walk(SRC_DIR);
  if (files.length === 0) return;
  await Promise.all(files.map(convertFile));
}
