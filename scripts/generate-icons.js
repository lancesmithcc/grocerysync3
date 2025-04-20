import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directories exist
const publicDir = path.resolve(__dirname, '../public');
const iconsDir = path.resolve(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Source SVG file
const svgPath = path.resolve(__dirname, '../src/assets/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

// Define icon sizes for different platforms
const icons = [
  // Favicons
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 64, name: 'favicon.ico', format: 'ico' },
  
  // PWA icons
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  
  // Apple touch icons
  { size: 120, name: 'apple-touch-icon-120x120.png' },
  { size: 152, name: 'apple-touch-icon-152x152.png' },
  { size: 167, name: 'apple-touch-icon-167x167.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  
  // Microsoft tile icons
  { size: 70, name: 'mstile-70x70.png' },
  { size: 144, name: 'mstile-144x144.png' },
  { size: 150, name: 'mstile-150x150.png' },
  { size: 310, name: 'mstile-310x310.png' },
  
  // Maskable icon (with padding for safe area)
  { size: 512, name: 'maskable-icon.png', padding: true },
];

// Create a maskable icon with padding for the safe area
async function createMaskableIcon(size) {
  // Add 10% padding around the icon for the safe area
  const padding = Math.floor(size * 0.1);
  const actualSize = size - (padding * 2);
  
  return sharp(svgBuffer)
    .resize(actualSize, actualSize, { fit: 'contain', background: { r: 66, g: 62, b: 152, alpha: 1 } })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 66, g: 62, b: 152, alpha: 1 }
    })
    .toBuffer();
}

// Process each icon
async function generateIcons() {
  console.log('Generating icons...');
  
  for (const icon of icons) {
    try {
      const outputPath = path.resolve(iconsDir, icon.name);
      let buffer;
      
      if (icon.padding) {
        buffer = await createMaskableIcon(icon.size);
      } else {
        buffer = await sharp(svgBuffer)
          .resize(icon.size, icon.size)
          .toBuffer();
      }
      
      if (icon.format === 'ico') {
        // For .ico files, we need special handling
        // This is a simplified approach; ideally use a dedicated ICO generator
        await sharp(buffer).toFile(outputPath);
      } else {
        await sharp(buffer).toFile(outputPath);
      }
      
      console.log(`Generated: ${icon.name}`);
    } catch (err) {
      console.error(`Error generating ${icon.name}:`, err);
    }
  }
  
  console.log('Icon generation complete!');
}

generateIcons().catch(console.error); 