# Fenrax — Claude Code instructions

You are working on **Fenrax**, a private Print-on-Demand merch studio PWA.
Owner: btala-alatd. English is a second language — read intent generously.

Repo: https://github.com/btala-alatd/Fenrax
Live: https://fenrax.onrender.com
Render blueprint: `render.yaml` (NITRO_PRESET=render-com, Node 22)

Read `AGENTS.project.md` and `docs/HANDOFF.md` before changing print, export, or prompts.

## What Fenrax is

A phone-first PWA that generates **isolated Printify DTG art files** (transparent PNG on a 15×18 in / 4500×5400 tee canvas at 300 DPI). Not a mockup app. Not a listing designer. Not a social feed.

The user sells merch on Etsy via Printify. They generate graphics here, download one PNG, drop it on a blank in Printify Product Creator.

## Hard product rules

1. **Print file only.** No shirt photos, no models, no lookbooks, no stamps, no mockups, no lifestyle shots. Those were deleted on purpose (`2938660 Drop shirt mockups`).
2. **One primary download:** transparent PNG named `{brand}-{product}-printify.png`. Do not bring back SVG / Vector export — auto-trace is unusable on POD (`6a7a76b`).
3. **No invented type.** The only letters on a plate are the **studio shop name** and **initials** from Your shop (`src/lib/brand.ts`). The prompt box is picture direction, not copy. Fenrax typesets the name in `src/lib/letter.ts`. The model must not paint slogans, verses, city names, fake latin, or psalms.
4. **Church theme is removed.** Do not add it back unless the owner asks. They will work on faith merch later.
5. **Auth is OFF.** `VITE_AUTH_ENABLED=false`. Zustand + IndexedDB only. Do not add login.
6. **Talk in product terms.** No ports, no localhost, no container jargon to the owner.

## Stack

- TanStack Start + Router + Vite 8 + Nitro 3 (`render-com` preset)
- React 19, Tailwind v4, Zustand, IndexedDB (`src/lib/idb.ts`)
- Image gen: Google Gemini (`gemini-3.1-flash-image` then `gemini-2.5-flash-image`, 4K then 2K) then xAI `grok-imagine-image-2.0`
- Client print pipeline in `src/lib/printify.ts` (canvas knockout, flatten, despeckle, upscale)

## Where to edit

| Job | File |
|---|---|
| UI / print flow / drop of 3 | `src/components/studio.tsx` |
| Prompts, categories, styles, products, DROP_SLOTS | `src/lib/studio-data.ts` |
| Themes, audiences, brand store | `src/lib/brand.ts` |
| Image APIs | `src/lib/imagine.ts` |
| Knockout / flatten / 4500×5400 canvas | `src/lib/printify.ts` |
| Typeset shop name | `src/lib/letter.ts` |
| Download buttons | `src/components/export-buttons.tsx` |
| Zip pack | `src/lib/pack.ts` |
| Shop sheet | `src/components/brand-sheet.tsx` |
| Etsy listing copy | `src/lib/etsy.ts` + `src/components/etsy-sheet.tsx` |
| Google key | `src/lib/printer.ts` + `src/components/settings-sheet.tsx` |
| Deploy | `render.yaml`, `README.md` |

Do not touch `public/__grok/`, `server/`, `scripts/grok-pwa-*`, or branding injectors.

## Print pipeline (do not skip steps)

`runPrint` in `studio.tsx`:
1. `composePrompt(...)` — picture-first, COPY LOCK, brand name/initials only
2. `generateStill` / `editStill` (`imagine.ts`) — prefer 4K, reject long-edge < 2000 when a larger plate exists
3. `finishPrintFile` → `toTransparentPng` → `prepareArt` (`knockOut` + `merchFlatten` + `merchDespeckle` + `dropSmallBlobs` + `trimTransparent`)
4. `letterPlate` — draw shop name in Impact/Arial Black under the art (skip for wordmark)
5. Store Still in IndexedDB gallery
6. Export `buildPrintifyFromArt` upscales onto product canvas (tee = 4500×5400, 8% pad, 300 DPI pHYs). Mobile fallback 3600 then 3000 if canvas OOM.

## Known failures (fix these, don't regress)

- Model paints black canvases → knockout must punch outer black; never ship RGB-opaque black boxes
- Model paints distress/crackle → flatten + despeckle + prompt ban
- Model misspells long text (`SERVE HE ORD`) → never let the model write sentences
- Google returns ~1K plates → 4K/2K retry, then upscale to full canvas (Printify 555px/44 DPI was a bug)
- Auto-trace SVG is dusty photo-trace — do not re-enable Vector download

## Commands

```
npm run dev          # 0.0.0.0:8080 via scripts/with-app-env.mjs
npm run typecheck    # tsc --noEmit
npm run build        # vite build + db:migrate
```

Render: `npm install --include=dev && npm run build` then `node .output/server/index.mjs`.

Env (server only, never commit): `XAI_API_KEY`, optional `GEMINI_API_KEY`. Owner can also paste a Google key in Settings (IndexedDB).

## Git

Push to `origin/main` on `https://github.com/btala-alatd/Fenrax.git`. Render auto-deploys from main.

Owner uses a Samsung Galaxy Z Flip 7. Every change must work on a small phone PWA.
