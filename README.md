# Web Design Portfolio

Interactive one-page portfolio of website concepts for gyms, real estate, landscaping, e-commerce, blogs, restaurants, and wellness studios.

Built for Coop as a personal-projects repo, separate from Kryden.

## Stack

- Astro 6
- React islands
- Tailwind CSS 4
- Three.js WebGL scenes
- SVG path drawing and custom CSS motion
- Cloudflare Workers static assets deploy (not Pages)

## Local commands

```bash
npm install
npm run dev
npm run build
npm run cf:preview
npm run deploy
```

The Cloudflare worker is configured in `wrangler.jsonc` with `assets.directory = ./dist` and no custom domain.
