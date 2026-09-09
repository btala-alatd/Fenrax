# Fenrax

Private merch studio. Printify-ready graphics for Men, Women, and Kids shops.

## Render

1. New Blueprint (or Web Service) from this repo
2. Set `GEMINI_API_KEY` in the dashboard
3. Open the live URL in Chrome on your phone → Add to Home screen

Build: `npm ci --include=dev && npm run build`  
Start: `node .output/server/index.mjs`

Do not commit API keys. Put them in Render env or in the in-app Settings screen.
