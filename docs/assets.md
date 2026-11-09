# Asset provenance

- `src/assets/anton-cv-portrait.png`: the existing 349 × 348 photograph extracted from the owner’s English CV. The owner explicitly selected it for the public site on 9 November 2026. Only the photograph is included; the source PDF stays in the ignored handoff folder. No AI image editing or upscaling was applied to this selected photo. Astro generates WebP variants, and CSS softly blends its edges into the background. The display size stays close to the source resolution.
- Nebula, project concept illustrations, favicon, and social-card artwork: original project artwork made with CSS and SVG. Concept illustrations describe themes, not actual product screenshots.
- Fonts: self-hosted Inter and Space Grotesk from Fontsource, under the SIL Open Font License. License copies are in `public/licenses/`.
- The official institutional mark and its source are documented in [support-notes.md](support-notes.md).
- The watermarked nebula reference and raw source documents are excluded from Git, the Docker context, and the website.
