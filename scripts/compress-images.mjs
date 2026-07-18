import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../public/images');
const outDir = path.join(dir, '_compressed');

fs.mkdirSync(outDir, { recursive: true });

const files = fs
  .readdirSync(dir)
  .filter(
    (f) =>
      f.endsWith('.webp') &&
      !f.includes('original') &&
      !f.startsWith('.tmp-'),
  );

const results = [];

for (const file of files) {
  const input = path.join(dir, file);
  const output = path.join(outDir, file);
  const before = fs.statSync(input).size;
  const isLogo = file.includes('logo');
  const maxEdge = isLogo ? 480 : 1000;
  const quality = isLogo ? 68 : 52;

  await sharp(input)
    .rotate()
    .resize({
      width: maxEdge,
      height: maxEdge,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toFile(output);

  const after = fs.statSync(output).size;
  results.push({
    file,
    beforeKB: Math.round(before / 1024),
    afterKB: Math.round(after / 1024),
    savedKB: Math.round((before - after) / 1024),
  });
}

console.table(results);
console.log(
  'Wrote compressed files to public/images/_compressed — copy over originals next.',
);
console.log(
  'total before',
  results.reduce((s, r) => s + r.beforeKB, 0),
  'KB → after',
  results.reduce((s, r) => s + r.afterKB, 0),
  'KB',
);
