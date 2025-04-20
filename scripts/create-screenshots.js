import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure screenshots directory exists
const screenshotsDir = path.resolve(__dirname, '../public/screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Create mobile screenshot (350x750)
async function createMobileScreenshot() {
  try {
    const width = 350;
    const height = 750;
    const text = 'GrocerySync Mobile';
    
    // Create a blank image with dark background
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#333333"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle">${text}</text>
      <text x="50%" y="58%" font-family="Arial" font-size="16" fill="#8b5cf6" text-anchor="middle">Placeholder Screenshot</text>
    </svg>`;
    
    await sharp(Buffer.from(svg))
      .toFile(path.resolve(screenshotsDir, 'mobile.png'));
    
    console.log('Created mobile screenshot');
  } catch (err) {
    console.error('Error creating mobile screenshot:', err);
  }
}

// Create desktop screenshot (1280x800)
async function createDesktopScreenshot() {
  try {
    const width = 1280;
    const height = 800;
    const text = 'GrocerySync Desktop';
    
    // Create a blank image with dark background
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#333333"/>
      <text x="50%" y="50%" font-family="Arial" font-size="36" fill="white" text-anchor="middle">${text}</text>
      <text x="50%" y="58%" font-family="Arial" font-size="24" fill="#8b5cf6" text-anchor="middle">Placeholder Screenshot</text>
    </svg>`;
    
    await sharp(Buffer.from(svg))
      .toFile(path.resolve(screenshotsDir, 'desktop.png'));
    
    console.log('Created desktop screenshot');
  } catch (err) {
    console.error('Error creating desktop screenshot:', err);
  }
}

// Generate screenshots
async function createScreenshots() {
  console.log('Generating screenshots...');
  await createMobileScreenshot();
  await createDesktopScreenshot();
  console.log('Screenshot generation complete!');
}

createScreenshots().catch(console.error); 