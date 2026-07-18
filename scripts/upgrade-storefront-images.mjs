import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public/images');

/** Better sources from marketing → storefront webps (sharp but mobile-safe). */
const jobs = [
  {
    from: 'marketing/instagram/photos-reelles/12-lifestyle-cheveux.webp',
    to: 'oxiprime-hair-lifestyle-hero.webp',
    max: 1400,
    quality: 78,
  },
  {
    from: 'marketing/instagram/photos-reelles/11-resultat-cheveux.webp',
    to: 'oxiprime-smooth-hair-result.webp',
    max: 1400,
    quality: 78,
  },
  {
    from: 'marketing/instagram/photos-reelles/01-groupe-clair.webp',
    to: 'oxiprime-bundle-clear-products.webp',
    max: 1400,
    quality: 78,
  },
  {
    from: 'marketing/instagram/photos-reelles/02-groupe-bundle.webp',
    to: 'oxiprime-complete-bundle-realistic.webp',
    max: 1400,
    quality: 78,
  },
  {
    from: 'marketing/instagram/photos-reelles/03-shampoo.webp',
    to: 'oxiprime-shampoo-realistic.webp',
    max: 1200,
    quality: 76,
  },
  {
    from: 'marketing/instagram/photos-reelles/04-conditioner.webp',
    to: 'oxiprime-conditioner-realistic.webp',
    max: 1200,
    quality: 76,
  },
  {
    from: 'marketing/instagram/photos-reelles/05-mask.webp',
    to: 'oxiprime-mask-realistic.webp',
    max: 1200,
    quality: 76,
  },
  {
    from: 'marketing/instagram/photos-reelles/06-serum.webp',
    to: 'oxiprime-serum-realistic.webp',
    max: 1200,
    quality: 76,
  },
  {
    from: 'marketing/instagram/photos-reelles/07-shampoo-usage.webp',
    to: 'oxiprime-shampoo-use-realistic.webp',
    max: 1200,
    quality: 74,
  },
  {
    from: 'marketing/instagram/photos-reelles/08-conditioner-usage.webp',
    to: 'oxiprime-conditioner-use-realistic.webp',
    max: 1200,
    quality: 74,
  },
  {
    from: 'marketing/instagram/photos-reelles/09-mask-usage.webp',
    to: 'oxiprime-mask-use-realistic.webp',
    max: 1200,
    quality: 74,
  },
  {
    from: 'marketing/instagram/photos-reelles/10-serum-usage.webp',
    to: 'oxiprime-serum-use-realistic.webp',
    max: 1200,
    quality: 74,
  },
];

const results = [];

for (const job of jobs) {
  const input = path.join(root, job.from);
  const output = path.join(outDir, job.to);
  if (!fs.existsSync(input)) {
    console.warn('MISSING', job.from);
    continue;
  }
  const before = fs.statSync(input).size;
  await sharp(input)
    .rotate()
    .resize({
      width: job.max,
      height: job.max,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: job.quality, effort: 6, smartSubsample: true })
    .toFile(output);
  const after = fs.statSync(output).size;
  results.push({
    to: job.to,
    fromKB: Math.round(before / 1024),
    outKB: Math.round(after / 1024),
  });
}

console.table(results);
console.log(
  'total out',
  results.reduce((s, r) => s + r.outKB, 0),
  'KB',
);
