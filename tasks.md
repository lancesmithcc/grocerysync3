GrocerySync Tasks

1. Kick‑off

[ ] Make a fresh Git repo named grocerysync.
[ ] pnpm create vite@latest grocerysync -- --template react-ts.
[ ] Push the first commit.

2. Tooling

[ ] Add Tailwind CSS, PostCSS, Autoprefixer.pnpm add -D tailwindcss postcss autoprefixernpx tailwindcss init -p
[ ] Drop Lexend font link tag into index.html.
[ ] Install helpers:pnpm add @supabase/supabase-js gsap react-icons

3. Theme

[ ] In tailwind.config.ts, set darkMode: 'class'.
[ ] Extend palette: purple: '#8b5cf6', background: '#0d0d0d'.
[ ] Add borderRadius: { aurora: '33px' }.
[ ] Write global CSS for aurora border pulse.

4. Supabase

[ ] Open app.supabase.com and make project grocerysync.
[ ] Copy project URL and anon token into .env asVITE_SUPABASE_URL=...VITE_SUPABASE_ANON_KEY=...
[ ] Run SQL in the web editor (see /supabase/schema.sql).

5. Auth

[ ] Turn on email magic‑link auth in the dashboard.
[ ] Test sign‑up flow with one account.

6. Data Tables

[ ] lists (id, name, owner)[ ] list_users (list_id, user_id, role)[ ] items (id, list_id, creator_id, title, stars, notes, done, created_at)
[ ] Write RLS so members read; writers insert; admins delete.

7. App Pages

[ ] / — choose or make list
[ ] /list/:id — show items, add item form
[ ] /invite/:code — accept invite

8. UI bits

[ ] Header bar with cart icon and GrocerySync name.
[ ] GSAP loop that floats 🍌🍞🥕🥛🥦 emojis behind content.
[ ] Animated aurora glow around focused inputs and cards.

9. Logic

[ ] Hook: useSupabase() wraps auth and queries.
[ ] CRUD helpers in /lib/db.ts.

10. Deploy

[ ] Push to GitHub; set up Netlify.Supply env vars in site settings.
[ ] Add grocerysync.lancesmith.cc custom domain.

11. Test & polish

[ ] Vitest unit checks for helpers.
[ ] Play in mobile view, fix issues.

12. Docs

[ ] Update README with set‑up and usage.