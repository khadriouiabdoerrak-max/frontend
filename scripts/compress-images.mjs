import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../public/images');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png'));
const results = [];

for (const file of files) {
  const input = path.join(dir, file);
  const out = path.join(dir, file.replace(/\.png$/i, '.webp'));
  const before = fs.statSync(input).size;

  await sharp(input)
    .rotate()
    .resize({
      width: 1400,
      height: 1400,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 78, effort: 5 })
    .toFile(out);

  const after = fs.statSync(out).size;
  results.push({
    file,
    beforeKB: Math.round(before / 1024),
    afterKB: Math.round(after / 1024),
    out: path.basename(out),
  });
}

console.table(results);
console.log(
  'total before',
  results.reduce((s, r) => s + r.beforeKB, 0),
  'KB',
);
console.log(
  'total after',
  results.reduce((s, r) => s + r.afterKB, 0),
  'KB',
);
