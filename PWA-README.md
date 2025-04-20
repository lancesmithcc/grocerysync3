# GrocerySync PWA Implementation

This document outlines the Progressive Web App (PWA) implementation for GrocerySync.

## Features Implemented

- **Cross-platform icon support**:
  - Favicons (16x16, 32x32, 48x48, 64x64)
  - Android/PWA icons (192x192, 512x512)
  - Apple Touch icons (120x120, 152x152, 167x167, 180x180)
  - Microsoft Tile icons (70x70, 144x144, 150x150, 310x310)
  - Maskable icon (512x512) for Android adaptive icons

- **Web App Manifest**:
  - Proper display settings
  - Theme colors
  - Shortcuts for quick access
  - Screenshot references for app stores

- **Service Worker**:
  - Basic caching of app resources
  - Offline capability
  - Fast loading on return visits

- **Browser Integration**:
  - Meta tags for iOS web app capabilities
  - Microsoft browser configuration
  - Theme color integration

## Icon Generation

All icons are generated from the source SVG file located at `src/assets/icon.svg`. The generation is handled by a Node.js script using the Sharp image processing library:

```bash
node scripts/generate-icons.js
```

## Directory Structure

- `/public/icons/` - All generated icon files
- `/public/screenshots/` - App screenshots for stores and manifest
- `/public/manifest.json` - Web app manifest
- `/public/service-worker.js` - Service worker for offline capability
- `/public/browserconfig.xml` - Microsoft browser configuration

## Testing the PWA

To verify the PWA is working correctly:

1. Build for production (`npm run build`)
2. Serve the production build
3. Open the Chrome DevTools and navigate to the Application tab
4. Check the "Manifest" section to verify all icons and settings
5. Check the "Service Workers" section to verify registration
6. Use Lighthouse to audit PWA functionality

## Installation on Different Platforms

### Android
- Open the app in Chrome
- Tap the menu button (three dots)
- Select "Add to Home Screen"

### iOS
- Open the app in Safari
- Tap the Share button
- Select "Add to Home Screen"

### Desktop (Chrome/Edge)
- Open the app in the browser
- Look for the install icon in the address bar
- Click it and follow the prompts

## Resources

- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Checklist](https://web.dev/pwa-checklist/) 