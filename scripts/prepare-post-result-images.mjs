import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const dir = path.resolve('public/images/post-result');
const partial = process.argv.includes('--partial');
const manifestPath = 'docs/post-result-image-prompts.json';
const originals = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')).assets ?? [] : [];
const assets = [];
for (let index = 1; index <= 20; index++) {
  const name = `creative-${String(index).padStart(2, '0')}`;
  const temporary = path.join(dir, `${name}.png`);
  const recorded = originals.find(asset => asset.id === String(index).padStart(2, '0'))?.original?.path;
  const source = fs.existsSync(temporary) ? temporary : recorded ?? temporary;
  if (!fs.existsSync(source)) {
    if (partial) continue;
    throw new Error(`Missing generated asset ${source}`);
  }
  const destination = path.join(dir, `${name}.webp`);
  const original = await sharp(source).metadata();
  if (original.width !== 1536 || original.height !== 1024) throw new Error(`${name}: expected the original 3:2 landscape`);
  await sharp(source).resize({ width: 960, withoutEnlargement: true }).webp({ quality: 80 }).toFile(destination);
  const content = fs.readFileSync(destination);
  const output = await sharp(content).metadata();
  if (output.width !== 960 || output.height !== 640 || content.length > 200000) throw new Error(`${name}: invalid optimized output`);
  assets.push({ id: String(index).padStart(2, '0'), path: `/images/post-result/${name}.webp`, width: output.width, height: output.height, bytes: content.length, sha256: crypto.createHash('sha256').update(content).digest('hex') });
}
if (!partial) fs.writeFileSync('docs/post-result-web-assets.json', JSON.stringify({ conversion: 'WebP quality 80, 960x640, no compositional edits', assets }, null, 2) + '\n');
console.log(JSON.stringify({ optimized: assets.length, totalBytes: assets.reduce((sum, item) => sum + item.bytes, 0), assets }, null, 2));
