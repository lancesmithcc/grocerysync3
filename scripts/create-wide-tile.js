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

// Create wide tile icon for Microsoft browsers
async function createWideTile() {
  try {
    const width = 310;
    const height = 150;
    
    // Create a blank image with app's theme color
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#413e96"/>
      <text x="50%" y="50%" font-family="Arial" font-size="36" fill="white" text-anchor="middle" dominant-baseline="middle">GrocerySync</text>
    </svg>`;
    
    await sharp(Buffer.from(svg))
      .toFile(path.resolve(iconsDir, 'mstile-310x150.png'));
    
    console.log('Created wide tile icon for Microsoft browsers');
  } catch (err) {
    console.error('Error creating wide tile icon:', err);
  }
}

// Generate wide tile icon
async function createWideTileIcon() {
  console.log('Generating wide tile icon...');
  await createWideTile();
  console.log('Wide tile icon generation complete!');
}

createWideTileIcon().catch(console.error); 