# HeartLink

HeartLink is a small Vite + React + TypeScript project for a Truth-or-Dare style multiplayer game backed by Supabase.

## Deployment notes — Supabase environment variables

This project expects Supabase configuration to be available at build time as Vite env vars:

- `VITE_SUPABASE_URL` — your Supabase project URL (e.g. https://xxxx.supabase.co)
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon (public) key

Recommended options:

1. Vercel (recommended):
	- In the Vercel dashboard for your project, go to Settings → Environment Variables and add the two keys above. Then trigger a redeploy.

2. Local development:
	- Create a `.env` file in the project root with the same variable names and run `npm run dev`.

3. Runtime injection (no rebuild):
	- If you cannot rebuild for every env change, you can provide a runtime `/env.json` file served from the site root containing the keys (see `public/env.json.example`).
	- The app will attempt to use build-time Vite envs first; if not present, it will try `window.__SUPABASE_URL`/`window.__SUPABASE_ANON_KEY`, then `/env.json`.

Security note: The anon key is intended for public (client-side) use with Supabase. Do not publish service_role keys in the browser.

