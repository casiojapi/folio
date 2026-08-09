# folio

A minimal, mobile-first photo portfolio. Drop photos in a folder, run one command, deploy.

Built as a reusable template — the current copy is set up as a graffiti lookbook
(pitching property owners on free wall work), but swapping `npm run setup`
repurposes it for anything else, e.g. a straight photography portfolio.

## TL;DR

```bash
# 1. get the code
git clone <your-fork-url> folio && cd folio
# (or: fork this repo on GitHub, then clone your fork)

# 2. install deps
npm install

# 3. configure the site — answer the prompts (name, pitch, contact, meta)
npm run setup

# 4. drop your full-res photos into photos-source/
mkdir -p photos-source
cp ~/path/to/your/photos/*.jpg photos-source/

# 5. compress + extract metadata for everything in photos-source/
npm run photos

# 6. run it
npm run dev
# -> http://localhost:3000
```

Optional: open `data/photos.json` to add a `title`/`location`/`description` per
photo — see step 4 below. When ready, deploy with `vercel deploy` (or connect
the repo in the Vercel dashboard).

## How it works

1. **Configure the site** — `npm run setup`. A terminal wizard asks for your
   name, one-line pitch, contact email/Instagram, and page title/description,
   then writes `src/lib/site-config.ts`. Re-run it any time to change these.

2. **Add photos** — drop full-resolution originals into `photos-source/`
   (already gitignored — these stay local, only the compressed output ships).

3. **Process photos** — `npm run photos`. This reads every image in
   `photos-source/`, extracts EXIF (camera, lens, date taken), generates a
   blurred placeholder, compresses each photo to WebP (capped at 2400px,
   quality 82 — big size savings with no visible quality loss), and writes the
   result to `public/photos/` + `data/photos.json`.

   Safe to re-run whenever you add or remove photos — it merges with what's
   already there instead of overwriting hand-edited fields.

4. **Add captions (optional)** — open `data/photos.json` and fill in `title`,
   `description`, or `location` for any photo. Set `order` (a number) to pin
   photos to a specific position, or `featured: true` to mark standouts. These
   fields are preserved across re-runs of `npm run photos`.

5. **Run locally** — `npm run dev`, then open http://localhost:3000.

6. **Deploy** — push to Vercel (`vercel deploy` or connect the repo). No
   config needed.

## Design

- Mobile-first single-column feed; 2–3 column masonry grid on wider screens.
- Tap/click any photo to open a fullscreen lightbox with swipe (mobile) or
  arrow-key/click navigation (desktop), plus title/location/date caption.
- Fixed dark theme, minimal type, no chrome.

## Structure

- `photos-source/` — your raw originals (gitignored, local only)
- `public/photos/` — compressed output actually served to visitors
- `data/photos.json` — per-photo metadata (auto EXIF + your captions)
- `scripts/setup.mjs` — interactive config wizard
- `scripts/process-photos.mjs` — the compression/EXIF pipeline
- `src/lib/site-config.ts` — name, pitch, contact info
- `src/components/Gallery.tsx`, `Lightbox.tsx`, `Header.tsx` — the UI
