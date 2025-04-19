GrocerySync Tasks

1. Kick‑off

[x] Make a fresh Git repo named grocerysync.
[x] pnpm create vite@latest grocerysync -- --template react-ts.
[x] Push the first commit.

2. Tooling

[x] Add Tailwind CSS, PostCSS, Autoprefixer (installed and initialized)
[x] Drop Lexend font link tag into index.html.
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

10. Deploy

[ ] Push to GitHub; set up Netlify.Supply env vars in site settings.
[ ] Add grocerysync.lancesmith.cc custom domain.

11. Test & polish

[ ] Vitest unit checks for helpers.
[ ] Play in mobile view, fix issues.

12. Docs

[ ] Update README with set‑up and usage.