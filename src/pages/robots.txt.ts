export function GET() {
  return new Response(
    'User-agent: *\nDisallow: /cv/\nAllow: /\nSitemap: https://apov.dev/sitemap.xml\n',
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
