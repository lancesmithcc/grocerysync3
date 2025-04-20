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

// Read the source SVG file for logo
const svgPath = path.resolve(__dirname, '../src/assets/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

// Create iOS splash screens with app logo
async function createSplashScreen(width, height, filename) {
  try {
    // Calculate logo size (about 30% of the smallest dimension)
    const logoSize = Math.min(width, height) * 0.3;
    
    // Create the background with app's theme color
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#413e96"/>
      <text x="50%" y="75%" font-family="Arial" font-size="${Math.floor(logoSize/4)}px" fill="white" text-anchor="middle">GrocerySync</text>
    </svg>`;
    
    // Create the logo at the right size
    const logoBuffer = await sharp(svgBuffer)
      .resize(Math.floor(logoSize), Math.floor(logoSize))
      .toBuffer();
    
    // Calculate the position for the logo (centered horizontally, slightly above center vertically)
    const logoLeft = Math.floor((width - logoSize) / 2);
    const logoTop = Math.floor((height - logoSize) / 2) - Math.floor(logoSize / 3); // Move up slightly
    
    // Create the splash screen with logo
    await sharp(Buffer.from(svg))
      .composite([
        {
          input: logoBuffer,
          top: logoTop,
          left: logoLeft
        }
      ])
      .toFile(path.resolve(iconsDir, filename));
    
    console.log(`Created iOS splash screen: ${filename}`);
  } catch (err) {
    console.error(`Error creating iOS splash screen ${filename}:`, err);
  }
}

// Generate all iOS splash screens
async function createIOSSplashScreens() {
  console.log('Generating iOS splash screens...');
  
  // iPhone X (1125px x 2436px)
  await createSplashScreen(1125, 2436, 'apple-launch-1125x2436.png');
  
  // iPhone 8, 7, 6s, 6 (750px x 1334px)
  await createSplashScreen(750, 1334, 'apple-launch-750x1334.png');
  
  // iPhone 8 Plus, 7 Plus, 6s Plus, 6 Plus (1242px x 2208px)
  await createSplashScreen(1242, 2208, 'apple-launch-1242x2208.png');
  
  console.log('iOS splash screen generation complete!');
}

createIOSSplashScreens().catch(console.error); 