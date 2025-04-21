# GrocerySync3 Tasks

## Analysis and Understanding Phase
- [x] Review Home.tsx to understand app structure
- [x] Review ListView.tsx to understand list functionality
- [x] Review db.ts to understand database interactions
- [x] Review useSupabase hook to understand authentication

## Issues Found
1. In the `createList` function in db.ts:
   - [x] Using `owner` field when inserting into 'lists' table, but the type definition shows `owner_uuid`
   - [x] Inconsistency in field naming between code and database schema
2. Database functions lacked comprehensive error handling:
   - [x] Missing input validation
   - [x] Inconsistent error logging
   - [x] Insufficient error messages
3. The Invite page was not implemented yet (just a placeholder)
4. Items not persisting in the database:
   - [x] The createItem function was using a fallback that returned temporary items with 'temp-id' instead of properly saving to the database

## Tasks to Complete
- [x] Fix the `createList` function in db.ts to use the correct field names
- [x] Add input validation to all database functions
- [x] Improve error handling to provide specific error messages
- [x] Add consistent error logging across all database functions
- [x] Implement the Invite feature to allow users to accept invitations
- [x] Add invite generation functionality to ListView
- [x] Fix item persistence issue in createItem function
- [x] Fix shared lists not appearing on Home page by modifying getLists to rely on RLS
- [ ] Test list creation functionality
- [ ] Add any missing features to the application
- [ ] Consider code refactoring if any file exceeds 500 lines

## Future Enhancements
- [ ] Improve UI/UX of the application
- [ ] Add unit tests for critical functionality
- [ ] Create a loading state for asynchronous operations
- [ ] Add confirmation dialogs for destructive actions

## Application Analysis
- [x] Explore src directory structure
- [x] Review components directory
- [x] Review pages directory 
- [x] Understand current routing

## Development Tasks
- [ ] Create main grocery list management interface
- [ ] Implement real-time sync functionality
- [ ] Add user authentication
- [ ] Create shared list functionality
- [ ] Implement item categories and sorting
- [ ] Add offline support
- [ ] Optimize for mobile

## Component Tasks
- [ ] Create GroceryList component
- [ ] Create GroceryItem component
- [ ] Create AddItemForm component
- [ ] Create ListSharing component
- [ ] Create CategoryFilter component

## Backend/Data Tasks
- [ ] Set up data models
- [ ] Implement CRUD operations for grocery items
- [ ] Implement real-time database listeners
- [ ] Set up user authentication system
- [ ] Implement sharing permissions

## UI Improvements
- [ ] Design responsive layout
- [ ] Implement dark/light mode
- [ ] Create animations for list interactions
- [ ] Implement drag and drop functionality
- [x] Left align grocery list items with stars below much smaller and no backgrounds
- [x] Tighten line height between title and notes
- [x] Increase input field padding
- [x] Ensure all input fields have white background with black text
- [x] Use Header component on ListView for consistent shopping cart icon and text
- [x] Make star buttons fully transparent with no default button background or padding
- [x] Allow ListView page to scroll when content exceeds viewport height
- [x] Add confirmation dialogs for destructive actions (list deletions and item deletions)

## Testing & Performance
- [ ] Write unit tests for key components
- [ ] Test real-time sync performance
- [ ] Test offline functionality
- [ ] Optimize loading times

1. Kick‑off

[x] Make a fresh Git repo named grocerysync.
[x] pnpm create vite@latest grocerysync -- --template react-ts.
[x] Push the first commit.

2. Tooling

[x] Add Tailwind CSS, PostCSS, Autoprefixer (installed and initialized)
[x] Drop jost font link tag into index.html.
[x] Install helpers: pnpm add @supabase/supabase-js gsap react-icons

3. Theme

[x] In tailwind.config.ts, set darkMode: 'class'.
[x] Extend palette: purple: '#8b5cf6', background: '#0d0d0d'.
[x] Add borderRadius: { aurora: '33px' }.
[x] Write global CSS for aurora border pulse.

4. Supabase

[x] Open app.supabase.com and make project grocerysync.
[x] Copy project URL and anon token into .env as VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=...
[x] Run SQL in the web editor (see /supabase/schema.sql).

5. Auth

[x] Turn on email magic‑link auth in the dashboard.
[x] Test sign‑up flow with one account.

6. Data Tables

[x] lists (id, name, owner)[ ] list_users (list_id, user_id, role)[ ] items (id, list_id, creator_id, title, stars, notes, done, created_at)
[x] Write RLS so members read; writers insert; admins delete.

7. App Pages

[ ] / — choose or make list
[ ] /list/:id — show items, add item form
[ ] /invite/:code — accept invite

8. UI bits

[x] Header bar with cart icon and GrocerySync name.
[x] GSAP loop that floats 🍌🍞🥕🥛🥦 emojis behind content.
[x] Animated aurora glow around focused inputs and cards.

9. Logic

[x] Hook: useSupabase() wraps auth and queries.
[x] CRUD helpers in /lib/db.ts.


11. Test & polish

[ ] Vitest unit checks for helpers.
[ ] Play in mobile view, fix issues.

12. Docs

[ ] Update README with set‑up and usage.

# Tasks

- [x] Implement background emoji decoration
- [x] Implement header layout with Grocery cart icon and styled text
- [x] Create interface container with black rounded corners and aurora style borders
- [x] Fix floating emojis visibility
- [x] Add size variation to floating emoji animation
- [ ] Investigate and fix star rating display (emojis and background)
- [x] Investigate and fix item creation failure (400 error)
- [x] Applied workaround for item creation using direct REST API call
- [x] Create tasks.md file to outline tasks
- [x] Align list items left and reduce line-height (update AuroraBox and classes in ListView.tsx)
- [x] Test and verify styling changes in the application

# PWA Implementation Tasks

## Icon Generation
- [x] Identify the source icon (src/assets/icon.svg)
- [x] Generate favicons in various sizes (16x16, 32x32, 48x48, 64x64, 128x128, 256x256)
- [x] Generate Apple touch icons (180x180, 120x120, 152x152, 167x167, 76x76, 60x60, etc.)
- [x] Generate Android/PWA icons (192x192, 512x512, maskable icons)
- [x] Generate Microsoft tile icons (70x70, 150x150, 310x310, 310x150)
- [x] Generate shortcut icons for manifest (shopping list, recipes)
- [x] Generate iOS splash screens for various device sizes

## Configuration Files
- [x] Create manifest.json with proper icon references
- [x] Update HTML with appropriate meta tags and manifest link
- [x] Add favicon links to HTML
- [x] Add Apple touch icon links with comprehensive size coverage
- [x] Add iOS splash screen links for different device sizes
- [x] Add Microsoft tile meta tags

## Service Worker
- [x] Set up basic service worker for caching
- [x] Register service worker in the application

## Testing
- [x] Verify icons display correctly on various platforms
- [x] Enhanced iOS support for proper home screen icon display

## Installation Instructions

All the necessary files for PWA functionality have been created. To maintain icon assets:

1. The sharp package has been installed:
   ```
   pnpm add sharp
   ```

2. The following scripts have been created:
   - `scripts/generate-icons.js` - Generates all the main icon sizes from the SVG source
   - `scripts/create-screenshots.js` - Creates placeholder screenshots for the manifest
   - `scripts/create-shortcut-icons.js` - Creates shortcut icons for the manifest
   - `scripts/create-wide-tile.js` - Creates wide tile icon for Microsoft browsers
   - `scripts/create-ios-icons.js` - Creates high-quality iOS-specific icons
   - `scripts/create-ios-splash.js` - Creates iOS splash screens for different devices
   - `scripts/generate-all-assets.js` - Runs all the above scripts in sequence

3. All the required directories have been created:
   - `public/icons` - Contains all icon assets
   - `public/screenshots` - Contains placeholder screenshots

4. The following configuration files have been created/updated:
   - `public/manifest.json` - Web app manifest
   - `public/browserconfig.xml` - Microsoft browser configuration
   - `public/service-worker.js` - Service worker for offline support
   - `public/index.html` - Updated with comprehensive meta tags and links for iOS support

5. To regenerate all assets with a single command:
   ```
   node scripts/generate-all-assets.js
   ```

6. For iOS-specific testing:
   - Add to home screen from Safari browser
   - Test on multiple iOS devices if possible
   - Verify the icon appears correctly on the home screen
   - Verify the splash screen appears on app launch

# GrocerySync Tasks

- [x] Refine ListView item layout
  - [x] Adjust title style (font size, line height)
  - [x] Adjust notes style (font size, line height)
  - [x] Convert interactive stars to static display
  - [x] Reposition delete button to the far right
  - [x] Optimize spacing for compactness
- [ ] ... Add more tasks as needed ...