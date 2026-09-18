# SK@S DIGITAL V7.1

Sistem Evidens Digital SK@S. V7.1 is connected to the configured Supabase project and uses Supabase cloud mode while retaining local mode if Supabase is not configured.

## Files
- `index.html` — main app
- `app.js` — application logic
- `style.css` — interface
- `config.js` — Supabase URL + Publishable key
- `instrument.json` — SK@S structure supplied for this project
- `schema.sql` — database, RLS and Storage policies

## Setup Supabase
1. Create a Supabase project.
2. In SQL Editor, run `schema.sql`.
3. `config.js` is already configured with the Supabase Project URL and Publishable key for this project. Do NOT replace it with a `service_role`/secret key.
4. Deploy the folder to GitHub Pages.
5. In Supabase Auth, enable Email/Password sign-in.
6. Register users. New users start with role `guru`.
7. Change selected users to `admin` or `nazir` in the `profiles` table.

## Cloud behaviour
- Signed-in users see the shared evidence list.
- Guru can add evidence and edit/delete their own evidence.
- Nazir/Admin can edit/delete any evidence.
- Uploaded files go to the private `skas-eviden` bucket.
- External Google Drive/OneDrive links remain supported.

## Local fallback
If `SUPABASE_URL` or `SUPABASE_KEY` is empty, the app uses the previous browser-local mode (localStorage + IndexedDB). This is useful before the Supabase project is configured.
