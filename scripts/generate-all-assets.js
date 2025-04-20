import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execPromise = promisify(exec);

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define scripts to run in sequence
const scripts = [
  'generate-icons.js', 
  'create-screenshots.js',
  'create-shortcut-icons.js',
  'create-wide-tile.js',
  'create-ios-icons.js',
  'create-ios-splash.js'
];

async function runScripts() {
  console.log('🚀 Starting generation of all PWA assets...\n');
  
  for (const script of scripts) {
    const scriptPath = path.join(__dirname, script);
    console.log(`\n📋 Running ${script}...`);
    
    try {
      const { stdout, stderr } = await execPromise(`node ${scriptPath}`);
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error) {
      console.error(`Error running ${script}:`, error);
    }
  }
  
  console.log('\n✅ All PWA assets generated successfully!');
}

runScripts().catch(console.error); 