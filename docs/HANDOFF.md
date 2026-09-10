# Fenrax handoff

Complete dump for another coding agent (Claude Code, Cursor, etc.).

## Identity

| | |
|---|---|
| Product | Fenrax — private POD merch studio PWA |
| Owner | btala-alatd |
| GitHub | https://github.com/btala-alatd/Fenrax (public so Render can clone) |
| Live | https://fenrax.onrender.com |
| Device | Samsung Galaxy Z Flip 7, install as PWA from Chrome |
| Node | 22 (see `.nvmrc` if present, Render NODE_VERSION=22) |

## Stack

TanStack Start (file routes) + Vite 8 + Nitro 3 `render-com` + React 19 + Tailwind v4 + Zustand + IndexedDB.

Auth is **off**. No Postgres in production use. `better-auth` / pglite exist in the template; do not turn them on.

Image generation spends the **app owner's** xAI quota (`XAI_API_KEY`) and optional Google Gemini (`GEMINI_API_KEY` or key pasted in Settings).

## Tree (app code only)

```
src/routes/index.tsx          → <Studio />
src/routes/__root.tsx         → document shell, PWA meta, AuthProvider (noop), PreviewHostBridge
src/components/studio.tsx    → main UI, runPrint, printDrop (3 HD)
src/components/brand-sheet.tsx
src/components/export-buttons.tsx  → one Printify PNG
src/components/etsy-sheet.tsx
src/components/settings-sheet.tsx
src/components/save-to-sheet.tsx
src/components/install-app.tsx
src/lib/studio-data.ts        → PRODUCTS, STYLES, CATEGORIES, DROP_SLOTS, composePrompt
src/lib/brand.ts              → THEMES (no church), AUDIENCES, useBrand
src/lib/imagine.ts            → generateStill / editStill / testPrinter server fns
src/lib/printify.ts           → knockout, flatten, 4500×5400 canvas, DPI
src/lib/letter.ts             → typeset shop name under art
src/lib/export.ts             → leftover raster-to-svg (not offered in UI)
src/lib/pack.ts               → zip of printify PNGs
src/lib/etsy.ts               → listing title/tags/description (no app mention)
src/lib/gallery.ts            → IndexedDB stills
src/lib/printer.ts            → Google key in IDB
src/lib/save-to.ts            → Web Share / file save
render.yaml                   → Render web service
README.md                     → deploy steps for the owner
```

## Themes (shop looks)

street, resort, fishing, hunt, western, coastal, heritage, work, celestial, skate, luxe, bloom, buddy.

**Church was removed** (`08c72e5`). Saved `themeId: "church"` coerces to street.

Audiences: men | women | kids.

## Categories (picture buttons)

lockup, wordmark, box, tour, coords, crest, slogan, blueprint, trail, issue.

Prompts are **picture-first**. Tour does not paint city names. Slogan leaves the lower third empty for typeset name. Wordmark may paint ONLY the shop name letters.

## Styles

drop, chrome, vintage, type, line, tattoo, floral, liquid, grunge, vector.

Prefer **vector** with the owner — flat fills, no distress.

## Products → Printify canvases (`PRINTIFY_PRESETS`)

| id | canvas px | in | aspect |
|---|---|---|---|
| tee, back, long, hoodie, crew | 4500×5400 | 15×18 | 3:4 |
| tank | 3600×4800 | 12×16 | 3:4 |
| chest | 1800×1800 | 6×6 | 1:1 |
| tote | (see printify.ts) | | |
| hat, mug, tumbler, sticker, poster, pillow, phone, baby, canvas | see `src/lib/printify.ts` | | |

Tee is the default. PAD=0.08. DPI=300 with pHYs chunk.

## Drop (3 HD)

`DROP_SLOTS`: lockup, wordmark, crest. Sequential (not parallel) so each can request 4K. Button label **3 HD**.

## Prompt contract (`composePrompt`)

Direction block includes:

- House name, initials, motifs, theme world, audience
- Palette: brand ink / paper / accent, two or three colors
- Isolated 2D Printify file, even #F2F3F5 field
- Fill 85–92%
- FAIL if black canvas or distress
- **COPY LOCK:** only initials, and shop name if wordmark. No slogans/verses/latin/cities
- User prompt is prefixed `PICTURE direction only — do not paint these words:`
- Empty prompt: draw a picture, no words except the mark

`letterPlate` then draws `brand.name` in accent under the art (not for wordmark).

## Generation (`imagine.ts`)

Order:

1. Google if key present: models `gemini-3.1-flash-image`, `gemini-2.5-flash-image`; sizes 4K then 2K
2. Keep largest plate; accept immediately if long edge ≥ `MIN_PRINT_EDGE` (2000)
3. Else xAI `grok-imagine-image-2.0` quality `medium` (not `high` — invalid)

`printWith` tries Google then Grok. Small 1K Google plates caused Printify "555×508 44 DPI" — always upscale in `buildPrintifyFromArt`.

## Knockout (`printify.ts`)

`knockOut`:

- Sample corners; detect dark field (luma < 48)
- Flood from edges with tols; dark field ignoreTick=36, skip `punchFieldHoles`
- Skip only if ratio > 0.994 on dark (so gold-on-black still knocks)
- If corners still black after knock, force black flood tol 40
- Then `merchFlatten` (few solid inks), `merchDespeckle` (fill pinholes, drop isolated specks), `dropSmallBlobs`, `trimTransparent`

`finishPrintFile` = `toTransparentPng` (no SVG).

`buildPrintifyFromArt`: try canvas 4500 → 3600 → 3000 (mobile OOM), high-quality smoothing, center fit, pHYs 300 DPI.

## State

- `useBrand` persist IDB `fenrax-brand`
- `useGallery` persist IDB `fenrax-prints`
- `usePrinter` persist IDB `fenrax-printer` (googleKey)
- `useSaveTo` for download destination

Hydration: `skipHydration: true` then rehydrate on client.

## UI chrome (studio)

- Shop name / audience / theme
- 1 design | 3 HD
- More options bar (full width)
- Product, style, category chips
- Prompt textarea (picture)
- Gallery strip
- Export: Printify PNG, zip, Etsy copy
- Start over wipes local prints

## Etsy copy (`etsy.ts`)

Listing language for the **customer**. Do not mention Fenrax or "the app". Personalization idea (paused with church): kid name becomes the brand; five samples. Keep copy ready but do not auto-paint names.

## Deploy

`render.yaml` web service `fenrax`:

```
build: npm install --include=dev && npm run build
start: node .output/server/index.mjs
NITRO_PRESET=render-com
VITE_AUTH_ENABLED=false
```

Optional Render env: `XAI_API_KEY`, `GEMINI_API_KEY`.

Push `main` → Render builds. DevDependencies must install (Nitro/Vite).

## History the next agent must not undo

| commit | meaning |
|---|---|
| 2938660 | Mockups deleted. Print files only |
| 6a7a76b | No Vector/SVG download |
| c7816d6 | Transparent PNG, not black canvas |
| 1c5f64d | Always 15×18 Printify PNG |
| 374d57e | 3 HD not 10 |
| 08c72e5 | Church gone; picture-first prompts |
| 3036425 | Typeset only studio shop name |

## Open problems (still true)

1. Image models still sometimes return black-field gold crests. Knockout is the safety net; prompt also forbids black canvas.
2. Google may still return 1K despite 4K request. Upscale is mandatory.
3. 4500×5400 canvas can OOM on Flip 7 — fallback sizes exist; do not remove them.
4. Typeset name sits **under** leftover model-drawn garbage if the model ignores COPY LOCK. New gens should be illustration-only; old gallery stills stay dirty until reprinted.
5. `src/lib/export.ts` still has imagetracer helpers. UI must not expose them.

## What the owner will say

Casual, short, sometimes photos of Printify. "Still bad" + screenshot = inspect pixels (size, mode RGB vs RGBA, corners black, garbled type) then fix the pipeline, don't argue.

If they paste a PNG: check dimensions, alpha, corner colors, long-edge, whether it's 1250×1500 RGB black (failed knock) vs 4500×5400 RGBA (good).
