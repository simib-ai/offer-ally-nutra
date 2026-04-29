# offer-ally-nutra

Offer/campaign landing site for Ally Nutra — lives at **offer.allynutra.com**.

Built with Vite + React + TypeScript + shadcn-ui + Tailwind CSS.

---

## ⚠️ Deployment — MANUAL step required

This site deploys to **GitHub Pages** via the `gh-pages` branch.

**Pushing to `main` does NOT update the live site.** After committing and pushing source changes, you must also run the deploy command:

```sh
# Install deps if node_modules is missing
npm install

# Build + publish to GitHub Pages in one step
npm run deploy
# (equivalent to: ./node_modules/.bin/vite build && ./node_modules/.bin/gh-pages -d dist)
```

GitHub Pages takes ~1–2 minutes to go live after publishing. Users should hard-refresh (`Cmd+Shift+R`) if they see the old version.

---

## Supabase

Both this repo and the main `ally-nutra` repo share the **same Supabase project** (`dxoljsccupfiqjccjeze`). The env vars in `.env` point there. This means:

- Edge functions deployed from `ally-nutra/supabase/functions/` apply to both sites
- `submit-quote` edge function tags every submission with `lead_source: 'Campaign'`
- Schedule booking uses `get_public_scheduling_pool` RPC + `book-appointment` edge function

---

## Local development

```sh
npm install
npm run dev        # starts on http://localhost:5173
```

---

## Key routes

| Route | Description |
|---|---|
| `/` | Landing / index page |
| `/quote` | 3-step quote form |
| `/schedule-call` | Real-time booking (DB slots) |
