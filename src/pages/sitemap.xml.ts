export function GET() {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${['https://apov.dev/', 'https://apov.dev/es/'].map((url) => `<url><loc>${url}</loc><xhtml:link rel="alternate" hreflang="en" href="https://apov.dev/"/><xhtml:link rel="alternate" hreflang="es" href="https://apov.dev/es/"/><xhtml:link rel="alternate" hreflang="x-default" href="https://apov.dev/"/></url>`).join('')}
</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
