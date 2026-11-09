# Validation

## Local checks

Validated on 9 November 2026 with Node 22.23.4 and pinned npm dependencies:

- `npm run check`: Astro and strict TypeScript; no diagnostics.
- `npm run build`: complete static English and Spanish pages, 404, sitemap, robots, optimized responsive portrait variants.
- `npm test`: route/metadata/navigation/asset and private-source regression checks; deployment receiver paths are exercised with isolated command mocks.
- `npm run format:check`: source and documentation formatting.
- Independent deployment review: corrected failed-first-deployment cleanup and made revision verification reject a failed HTTP request.

The language switch and motion controllers are bundled as external modules so nginx's `script-src 'self'` policy permits them without inline JavaScript. Native links and complete content work without JavaScript. Three hero wireframes and orbital rings drift automatically; fine pointers also get damped cursor inertia. The user-requested interface has no pause button. The full website has a fixed animated purple aurora and a locally bundled tsParticles starfield with faint constellation links. It stays behind every page section as the visitor scrolls, with no click/hover interactions. Hidden tabs suspend rendering; offscreen hero geometry suspends independently. Reduced-motion preferences retain a static background. The hero JavaScript frame loop stops after the spring settles.

## Verification limits

The connected browser host was unavailable during implementation. Actual visual review at 320, 390, 768, 1024, and 1440 px, keyboard/screen-reader checks, Safari image-mask behavior, and Lighthouse measurements are still to be performed. Build success and HTTP checks do not establish accessibility conformance or a measured performance score.

## Production checks

The first Actions deployment passed all checks and the exact Git SHA was verified on the healthy Hetzner container before changing public DNS. Live HTTP checks passed for both language routes, static assets, the sitemap, robots, missing-page 404s, and protected private paths. HTTP and www permanently redirect to the canonical HTTPS origin, preserving paths and queries. Both edge and origin certificates are checked with normal trust verification.

Public checks also identified Cloudflare email rewriting; the contact link is explicitly excluded so it remains usable without JavaScript. Container checks identified and corrected a redirect that included the internal port. Deployment details and rollback instructions are in [deployment.md](deployment.md).
