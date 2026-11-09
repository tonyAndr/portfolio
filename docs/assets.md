# Asset provenance

- `src/assets/anton-portrait.webp`: transparent cutout prepared from the owner's `IMG20250716170616.jpg`, supplied on 9 November 2026. Prepared with the built-in image generation editor, then encoded as WebP with alpha. The original photograph stays in the ignored handoff folder. Owner authorized its use in the public portfolio.
- Nebula, project concept illustrations, favicon, and social-card artwork: original project artwork made with CSS and SVG. Concept illustrations describe themes, not actual product screenshots.
- Fonts: self-hosted Inter and Space Grotesk from Fontsource, under the SIL Open Font License. License copies are in `public/licenses/`.
- The watermarked nebula reference is inspiration only and is excluded from Git, the Docker context, and the website.

## Portrait edit prompt

Built-in imagegen edit with the original photo as the sole reference and transparent background requested:

> Isolate the exact real man from the seaside photograph, removing sea, sky, rocks, vegetation and ground to actual transparency. Crop from slightly above his hair to mid-thigh, including the head, glasses, shoulders, torso, arms and clasped hands. Preserve the left-facing profile, pose, facial features, skin, hair, glasses, shirt pattern and hands. Do not rotate him, turn his face towards the camera, change clothing, or add objects. Center the photographic cutout with modest transparent padding and natural edges. No shadows, gradients, text or watermark.

The full-resolution edited intermediate is retained locally outside the public repository. Review the prepared cutout against the original when changing the composition.
