# Asset provenance

- `src/assets/anton-portrait.webp`: transparent cutout prepared from the owner's `IMG20250716170616.jpg`, supplied on 9 November 2026. Prepared with the built-in image generation editor, then encoded as WebP with alpha. The original photograph stays in the ignored handoff folder. Owner authorized its use in the public portfolio.
- Nebula, project concept illustrations, favicon, and social-card artwork: original project artwork made with CSS and SVG. Concept illustrations describe themes, not actual product screenshots.
- Fonts: self-hosted Inter and Space Grotesk from Fontsource, under the SIL Open Font License. License copies are in `public/licenses/`.
- The watermarked nebula reference is inspiration only and is excluded from Git, the Docker context, and the website.

## Portrait edit prompt

Built-in imagegen edit with the original photo as the sole reference and transparent background requested:

> Use case: background-extraction / identity-preserve. Edit target: the attached original photograph of Anton standing on a seaside cliff, patterned short-sleeve white shirt, pink shorts, glasses, facing left. Asset type: cutout photograph for his professional portfolio hero. Primary request: isolate the EXACT real man from the photo, removing the entire sea, sky, rocks, vegetation and ground to actual transparency. Composition: crop from slightly above his hair to approximately mid-thigh, including his original head, glasses, shoulders, torso, arms and clasped hands. Keep his original left-facing profile, original pose, precise facial features, skin, hair, glasses, shirt pattern and hands unchanged. This is a photographic cutout, not a generated new portrait. Do not rotate him, turn his face towards camera, retouch his identity, change clothing or add any objects. Subject centered with modest transparent padding, crisp natural face and edges. Fully transparent background, no artificial shadow, no gradients, no text, no watermark.

The full-resolution edited intermediate is retained locally outside the public repository. Review the prepared cutout against the original when changing the composition.
