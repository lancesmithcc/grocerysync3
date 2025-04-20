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

// Create shopping list icon
async function createShoppingListIcon() {
  try {
    const size = 192;
    const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#413e96"/>
      <text x="50%" y="50%" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">Shopping List</text>
      <text x="50%" y="70%" font-family="Arial" font-size="60" fill="white" text-anchor="middle" dominant-baseline="middle">🛒</text>
    </svg>`;
    
    await sharp(Buffer.from(svg))
      .toFile(path.resolve(iconsDir, 'shopping-list-192x192.png'));
    
    console.log('Created shopping list icon');
  } catch (err) {
    console.error('Error creating shopping list icon:', err);
  }
}

// Create recipes icon
async function createRecipesIcon() {
  try {
    const size = 192;
    const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#413e96"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">Recipes</text>
      <text x="50%" y="70%" font-family="Arial" font-size="60" fill="white" text-anchor="middle" dominant-baseline="middle">🍳</text>
    </svg>`;
    
    await sharp(Buffer.from(svg))
      .toFile(path.resolve(iconsDir, 'recipes-192x192.png'));
    
    console.log('Created recipes icon');
  } catch (err) {
    console.error('Error creating recipes icon:', err);
  }
}

// Generate shortcut icons
async function createShortcutIcons() {
  console.log('Generating shortcut icons...');
  await createShoppingListIcon();
  await createRecipesIcon();
  console.log('Shortcut icon generation complete!');
}

createShortcutIcons().catch(console.error); 