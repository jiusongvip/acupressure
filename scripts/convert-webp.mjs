import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join, extname, parse, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const imagesDir = resolve(__dirname, '../public/images');

const files = readdirSync(imagesDir);
let converted = 0, skipped = 0;

for (const file of files) {
  const ext = extname(file).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;

  const inputPath = join(imagesDir, file);
  const name = parse(file).name;
  const outputPath = join(imagesDir, `${name}.webp`);

  const img = sharp(inputPath);
  const meta = await img.metadata();
  await img.webp({ quality: 82, effort: 6 }).toFile(outputPath);

  const origSize = statSync(inputPath).size;
  const webpSize = statSync(outputPath).size;
  const saved = ((1 - webpSize / origSize) * 100).toFixed(1);
  console.log(`${file} (${meta.width}x${meta.height}) ${(origSize/1024).toFixed(0)}KB → ${(webpSize/1024).toFixed(0)}KB (${saved}% saved)`);
  converted++;
}

console.log(`\nDone: ${converted} converted, ${skipped} skipped`);
