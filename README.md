# Fenrax

Private merch studio. Printify-ready graphics for Men, Women, and Kids shops.

## For Claude / other coding agents

Start here, in order:

1. [CLAUDE.md](./CLAUDE.md) — how to work on this repo
2. [AGENTS.project.md](./AGENTS.project.md) — product rules that must not regress
3. [docs/HANDOFF.md](./docs/HANDOFF.md) — full architecture, pipeline, known failures

Repo: https://github.com/btala-alatd/Fenrax

## Render (use this)

The GitHub repo is **public** so Render can clone it without connecting GitHub.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/btala-alatd/Fenrax)

1. Open https://render.com/deploy?repo=https://github.com/btala-alatd/Fenrax
2. Sign in to Render if asked
3. Click **Apply** / **Deploy**
4. Skip any API key / environment prompt
5. Wait until the **fenrax** service is **Live**
6. Open the `*.onrender.com` URL in **Chrome** on the Flip 7 → menu → **Add to Home screen**

Do not commit API keys. After it is live you can paste `GEMINI_API_KEY` in Render → Environment, or in Fenrax → Settings.

To lock the GitHub repo private again after deploy, say so in chat.
