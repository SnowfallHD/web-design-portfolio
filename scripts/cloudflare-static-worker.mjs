const RAW_BASE = 'https://raw.githubusercontent.com/SnowfallHD/web-design-portfolio/main/dist';
const VERSION = '20260620-smooth-flythrough';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

function extname(pathname) {
  const match = pathname.match(/\.[a-zA-Z0-9]+$/);
  return match ? match[0].toLowerCase() : '';
}

function assetPathFor(url) {
  const pathname = decodeURIComponent(url.pathname);
  if (pathname.includes('..')) return null;
  if (pathname === '/' || pathname === '') return '/index.html';
  if (!extname(pathname)) return '/index.html';
  return pathname;
}

function upstreamUrl(assetPath) {
  return `${RAW_BASE}${assetPath}?v=${VERSION}`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const assetPath = assetPathFor(url);
    if (!assetPath) return new Response('Bad request', { status: 400 });

    let response = await fetch(upstreamUrl(assetPath), {
      cf: { cacheTtl: assetPath === '/index.html' ? 30 : 31536000, cacheEverything: true },
      headers: { 'User-Agent': 'web-design-portfolio-worker' },
    });

    if (response.status === 404 && assetPath !== '/index.html') {
      response = await fetch(upstreamUrl('/index.html'), {
        cf: { cacheTtl: 30, cacheEverything: true },
        headers: { 'User-Agent': 'web-design-portfolio-worker' },
      });
    }

    const headers = new Headers(response.headers);
    ['content-security-policy', 'x-frame-options', 'cross-origin-resource-policy', 'x-xss-protection'].forEach((header) => headers.delete(header));
    headers.set('content-type', MIME[extname(assetPath)] || MIME['.html']);
    headers.set('cache-control', assetPath === '/index.html' ? 'public, max-age=30' : 'public, max-age=31536000, immutable');
    headers.set('x-web-design-portfolio-version', VERSION);

    return new Response(response.body, { status: response.status, headers });
  },
};
