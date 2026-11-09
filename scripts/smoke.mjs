import assert from 'node:assert/strict';

const origin = process.argv[2];
assert.ok(origin, 'Usage: node scripts/smoke.mjs <origin>');
const fetchPage = (pathname) =>
  fetch(new URL(pathname, origin), {
    redirect: 'manual',
    signal: AbortSignal.timeout(15000),
  });
for (const [pathname, language] of [
  ['/', 'en'],
  ['/es/', 'es'],
]) {
  const response = await fetchPage(pathname);
  assert.equal(response.status, 200, pathname);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.match(
    response.headers.get('content-security-policy'),
    /script-src 'self'/,
  );
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  const html = await response.text();
  assert.match(html, /mailto:andropov.anton@gmail.com/);
  assert.doesNotMatch(html, /cdn-cgi\/l\/email-protection/);
  assert.match(html, new RegExp(`<html lang="${language}"`));
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/);
  const assets = new Set(
    [
      ...html.matchAll(
        /(?:src|href)="(\/(?:_astro|og|institutional)\/[^"?#]+)"/g,
      ),
    ].map((match) => match[1]),
  );
  for (const asset of assets) {
    const result = await fetchPage(asset);
    assert.equal(result.status, 200, asset);
    await result.arrayBuffer();
  }
  console.log(`PASS ${pathname} (${language}, ${assets.size} assets)`);
}
const redirect = await fetchPage('/es?from=smoke');
assert.equal(redirect.status, 308);
const destination = new URL(redirect.headers.get('location'), origin);
assert.equal(destination.pathname, '/es/');
assert.equal(destination.search, '?from=smoke');
assert.equal(destination.origin, new URL(origin).origin);
console.log('PASS Spanish slash redirect preserves origin and query');
for (const pathname of [
  '/not-a-real-page/',
  '/.env',
  '/portfolio-agent-handoff/sources/cv-en.pdf',
]) {
  const response = await fetchPage(pathname);
  assert.ok(
    [403, 404].includes(response.status),
    `${pathname}: ${response.status}`,
  );
  console.log(`PASS missing/private ${pathname}: ${response.status}`);
}
for (const pathname of [
  '/sitemap.xml',
  '/robots.txt',
  '/og/en.png',
  '/og/es.png',
  '/healthz',
]) {
  const response = await fetchPage(pathname);
  assert.equal(response.status, 200, pathname);
  console.log(`PASS ${pathname}`);
}
