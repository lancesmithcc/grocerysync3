import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure icons directory exists
const iconsDir = path.resolve(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Source SVG file
const svgPath = path.resolve(__dirname, '../src/assets/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

// Define iOS icon sizes
const iosIcons = [
  { size: 120, name: 'apple-touch-icon-120x120.png' },
  { size: 152, name: 'apple-touch-icon-152x152.png' },
  { size: 167, name: 'apple-touch-icon-167x167.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  // Extra sizes for better coverage
  { size: 192, name: 'apple-touch-icon-192x192.png' },
  { size: 128, name: 'apple-touch-icon-128x128.png' },
  { size: 144, name: 'apple-touch-icon-144x144.png' },
  { size: 60, name: 'apple-touch-icon-60x60.png' },
  { size: 76, name: 'apple-touch-icon-76x76.png' },
];

// Process each iOS icon
async function generateIOSIcons() {
  console.log('Generating iOS icons...');
  
  for (const icon of iosIcons) {
    try {
      const outputPath = path.resolve(iconsDir, icon.name);
      
      // Create a high-quality PNG with no transparency (iOS doesn't like transparency in icons)
      await sharp(svgBuffer)
        .resize(icon.size, icon.size, { fit: 'contain' })
        .flatten({ background: { r: 65, g: 62, b: 150 } }) // Similar to #413e96 but in RGB
        .png({ compressionLevel: 9, quality: 100 })
        .toFile(outputPath);
      
      console.log(`Generated iOS icon: ${icon.name}`);
    } catch (err) {
      console.error(`Error generating ${icon.name}:`, err);
    }
  }
  
  console.log('iOS icon generation complete!');
}

generateIOSIcons().catch(console.error); 