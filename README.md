# 家 Kitchen Planner v1

A family meal-planning and household top-up app for a Singapore household with parent and helper workflows.

## What v1 includes

- Separate family profiles and preferences
- Non-spicy child meal constraints and progressive Chinese-food exposure
- Monday–Friday AI-generated draft meal plan
- Single-meal swap without regenerating the full week
- Week approval workflow
- Persistent inventory with `plenty / low / out`
- Helper top-up requests and household notes
- Routed shopping list: `already_have / helper_buys / online_delivery`
- Meal ratings and recent-meal memory
- Mobile helper portal
- Dinner Party planner parity
- Local browser persistence
- Optional Supabase login + shared household state

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`.

Do not open the app directly as `file://`; browser/API CORS restrictions can break AI generation.

## Tests

```bash
npm test
```

Tests use Node's built-in test runner and do not require package installation.

## Anthropic API

The API key is entered at runtime by the parent. It is intentionally not stored in localStorage or the Supabase household payload.

## Shared household login with Supabase

The app works in local-only mode by default. To allow a parent and helper to use different devices against the same household state:

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Create Auth users for the parent(s) and helper.
4. Insert one row into `households`.
5. Insert each Auth user's UUID into `household_members` with the same `household_id` and role `parent` or `helper`.
6. Put the Project URL and public anon key into `config.js`:

```js
window.KITCHEN_CLOUD_CONFIG = {
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_PUBLIC_ANON_KEY'
};
```

The anon key is browser-visible by design. Security relies on Supabase Row Level Security policies in `supabase/schema.sql`. Never place a Supabase service-role key in this app.

### Role behavior

When cloud login is enabled:

- `parent` members open the Parent workflow.
- `helper` members open the Helper workflow.
- Both share the same household state.

The app uses a single JSON household state record, so v1 role restrictions are primarily UX-level. If strict field-level authorization is needed later, normalize inventory/shopping/plans into separate tables and add role-specific RLS policies.

## Hosting

This is a static app and can be hosted on Vercel, Cloudflare Pages, Netlify, or GitHub Pages.

### Vercel

- Import the GitHub repository into Vercel.
- Framework preset: `Other`
- Build command: none
- Output directory: repository root

### Cloudflare Pages

- Connect the GitHub repository.
- Framework preset: `None`
- Build command: none
- Build output directory: `/`

## Repository structure

```text
index.html
styles.css
config.js
src/
  app.js
  cloud.js
  feedback.js
  helper.js
  inventory.js
  planner.js
  prompts.js
  shopping.js
  storage.js
supabase/
  schema.sql
tests/
```

## Data model and persistence

Local mode stores state under `kitchenPlanner.v1.state` in browser localStorage. Corrupt payloads are preserved under a recovery key before falling back to defaults.

Cloud mode mirrors the same v1 state into the authenticated household's `household_state.payload` JSONB record.
