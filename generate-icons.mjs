import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Crear un ícono SVG simple
const createSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size * 0.3}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">🛒</text>
  <text x="50%" y="75%" font-family="Arial" font-size="${size * 0.15}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">365</text>
</svg>
`;

const sizes = [144, 192, 512];

Promise.all(
  sizes.map(async (size) => {
    const svg = Buffer.from(createSVG(size));
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(join('public', `icon-${size}x${size}.png`));
    console.log(`✅ Generado icon-${size}x${size}.png`);
  })
).then(() => {
  console.log('✅ Todos los iconos generados correctamente');
  process.exit(0);
}).catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
