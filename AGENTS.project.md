# Fenrax — project instructions

These override generic app-builder habits when they conflict.

Fenrax is a **Printify art studio**, not a clothing mockup tool and not a general image app.

## Owner intent (stable)

- Generate merch graphics for **his** Printify / Etsy shop.
- Audiences: Men, Women, Kids (shop setting).
- Output: isolated 2D graphic, transparent PNG, Printify-ready.
- Brand text comes from **Your shop** (name + initials). Prompt box = picture only.
- Church / scripture merch is paused. Do not restore the Church theme.
- 3 HD plates per drop (lockup, wordmark, crest), one at a time, high-res. Not 10.

## Always

- Isolated graphic on even #F2F3F5 that knocks to transparent.
- Art fills 85–92% of the frame.
- Flat ink, 2–3 colors. No grain, crackle, speckle, photocopy, mockup, garment, model.
- Fail if the canvas is a black rectangle.
- Typeset the shop name in code. Do not trust the image model to spell.

## Never

- Shirt photos, face cards, lookbooks, stamps on garments
- SVG / Vector download (imagetracer junk)
- Invented slogans, verses, city lists, dummy latin
- Auth, accounts, cloud gallery
- Feature flags / backwards-compat shims for deleted mockups

## Voice to the owner

Short. Direct. Product language. He is not a developer. If a file is bad, say what is wrong (black box, tiny, misspelled) and what button to use after deploy.
