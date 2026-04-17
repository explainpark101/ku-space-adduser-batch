import sharp from 'sharp';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const srcPath = join(__dirname, '..', 'src');
const svgPath = join(srcPath, 'icons', 'icon.svg');
const sizes = [16, 32, 48, 128];

// create icons folder if not exists
if (!existsSync(join(distDir, "icons"))) {
  mkdirSync(join(distDir, "icons"), { recursive: true });
}

await Promise.all(
  sizes.map((size) =>
    sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(join(distDir, "icons", `icon-${size}.png`))
  )
);

console.log('Icons built:', sizes.map((s) => `icon-${s}.png`).join(', '));
