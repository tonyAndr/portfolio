# Asset provenance

- `src/assets/anton-nebula-portrait.png`: the owner-supplied 1254 × 1254 stylized portrait from `64fa030d-3739-4913-a605-4aa5c3c3d654.png`, selected for the public hero on 9 November 2026. The source is unchanged. CSS mirrors it horizontally with `scaleX(-1)`, and Astro generates responsive WebP variants. Soft edge masks blend the artwork into the surrounding hero.
- Nebula, project concept illustrations, favicon, and social-card artwork: original project artwork made with CSS and SVG. Concept illustrations describe themes, not actual product screenshots.
- Fonts: self-hosted Inter and Space Grotesk from Fontsource, under the SIL Open Font License. License copies are in `public/licenses/`.
- The official institutional mark and its source are documented in [support-notes.md](support-notes.md).
- `public/cv/anton-andropov-cv-en.pdf` and `public/cv/anton-andropov-cv-es.pdf`: public copies of the owner-supplied CVs, made on 24 November 2026. The phone number and its icon were removed with true PDF redaction (text deleted, not covered), and the English PDF title was corrected. Nothing else changed. Linked from each locale's contact section. `/cv/` is disallowed in `robots.txt`, served with `X-Robots-Tag: noindex`, and linked with `rel="nofollow"`.
- The watermarked nebula reference and raw source documents are excluded from Git, the Docker context, and the website.
- The full-page fading polygon field uses tsParticles 4.5.3: the basic bundle, polygon shape, and rotation updater. Packages are bundled locally; no CDN, telemetry, remote images, or third-party requests are needed. The MIT license is included at `public/licenses/tsparticles-MIT.txt`.
