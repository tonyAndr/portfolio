# Validation

## Local checks

Validated on 9 November 2026 with Node 22.23.4 and pinned npm dependencies:

- `npm run check`: Astro and strict TypeScript; no diagnostics.
- `npm run build`: complete static English and Spanish pages, 404, sitemap, robots, optimized responsive portrait variants.
- `npm test`: route/metadata/navigation/asset and private-source regression checks; deployment receiver paths are exercised with isolated command mocks.
- `npm run format:check`: source and documentation formatting.
- Independent deployment review: corrected failed-first-deployment cleanup and made revision verification reject a failed HTTP request.

The small language-switch enhancement is an external module so nginx's `script-src 'self'` policy permits it without inline JavaScript. Native links and complete content work without JavaScript. Motion is static by default, and smooth scrolling is disabled for reduced motion.

## Verification limits

The connected browser host was unavailable during implementation. Actual visual review at 320, 390, 768, 1024, and 1440 px, keyboard/screen-reader checks, Safari image-mask behavior, and Lighthouse measurements are still to be performed. Build success and HTTP checks do not establish accessibility conformance or a measured performance score.

## Production checks

The first successful Actions deployment is verified against its exact Git SHA and Docker health before switching public DNS. Live verification covers both language routes, www/HTTPS redirects, the sitemap, robots, a missing-page 404, and static asset responses. Deployment details and rollback instructions are in [deployment.md](deployment.md).
