// Cloudflare Worker fallback used when deploying through the authenticated API client.
// The source repo still keeps Wrangler static-assets config (`wrangler.jsonc`) for the normal
// `npm run deploy` path when CLOUDFLARE_API_TOKEN is available locally.

const RAW_BASE = 'https://raw.githubusercontent.com/SnowfallHD/web-design-portfolio/main/dist';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function extname(pathname) {
  const match = pathname.match(/\.[a-zA-Z0-9]+$/);
  return match ? match[0].toLowerCase() : '';
}

function assetPathFor(url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.includes('..')) return null;
  if (pathname === '/' || pathname === '') return '/index.html';
  if (!extname(pathname)) return '/index.html';
  return pathname;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const assetPath = assetPathFor(url);
    if (!assetPath) return new Response('Bad request', { status: 400 });

    const upstream = `${RAW_BASE}${assetPath}`;
    const cache = caches.default;
    const cacheKey = new Request(upstream, request);
    let response = await cache.match(cacheKey);
    if (!response) {
      response = await fetch(upstream, {
        cf: { cacheTtl: assetPath === '/index.html' ? 60 : 31536000, cacheEverything: true },
        headers: { 'User-Agent': 'web-design-portfolio-worker' },
      });
      if (response.status === 404 && assetPath !== '/index.html') {
        response = await fetch(`${RAW_BASE}/index.html`, { headers: { 'User-Agent': 'web-design-portfolio-worker' } });
      }
      const headers = new Headers(response.headers);
      headers.set('content-type', MIME[extname(assetPath)] || MIME['.html']);
      headers.set('cache-control', assetPath === '/index.html' ? 'public, max-age=60' : 'public, max-age=31536000, immutable');
      headers.set('x-web-design-portfolio', 'github-dist-worker');
      response = new Response(response.body, { status: response.status, headers });
      if (response.ok) ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }
    return response;
  },
};
