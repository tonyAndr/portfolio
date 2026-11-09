# Asset provenance

- `src/assets/anton-nebula-portrait.png`: the owner-supplied 1254 × 1254 stylized portrait from `64fa030d-3739-4913-a605-4aa5c3c3d654.png`, selected for the public hero on 9 November 2026. The source is unchanged. CSS mirrors it horizontally with `scaleX(-1)`, and Astro generates responsive WebP variants. Soft edge masks blend the artwork into the surrounding hero.
- Nebula, project concept illustrations, favicon, and social-card artwork: original project artwork made with CSS and SVG. Concept illustrations describe themes, not actual product screenshots.
- Fonts: self-hosted Inter and Space Grotesk from Fontsource, under the SIL Open Font License. License copies are in `public/licenses/`.
- The official institutional mark and its source are documented in [support-notes.md](support-notes.md).
- The watermarked nebula reference and raw source documents are excluded from Git, the Docker context, and the website.
- The full-page particle field uses tsParticles 4.5.3: the basic bundle, interactivity foundation, and particle-links module. Packages are bundled locally; no CDN, telemetry, remote images, or third-party requests are needed. The MIT license is included at `public/licenses/tsparticles-MIT.txt`.
