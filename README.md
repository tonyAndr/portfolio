# Anton Andropov · Portfolio

Bilingual personal portfolio at **https://apov.dev**. English lives at `/`, Spanish at `/es/`. Built as static HTML with Astro, TypeScript, and Tailwind CSS, served from an unprivileged nginx Docker container on Hetzner.

## Development

Use Node **22.23.4** (`nvm use`) and npm. Exact dependencies are pinned in `package-lock.json`.

```sh
npm ci
npm run dev
```

Open the local URL printed by Astro (normally `http://127.0.0.1:4321`).

```sh
npm run check         # Astro and strict TypeScript diagnostics
npm run build         # Generate dist/; includes optimized responsive portrait images
npm test              # Validate built routes, metadata, links, and private-source exclusion
npm run format:check  # Check formatting
npm run format        # Apply formatting
npm run preview       # Serve the production build locally
node scripts/smoke.mjs http://127.0.0.1:54321 # Verify a running nginx container
```

## Structure and editing

- `src/content/`: typed English and Spanish copy; keep project IDs aligned.
- `src/data/`: confirmed public identity and links.
- `src/components/`: shared page and original conceptual project illustrations.
- `src/layouts/`: document language, canonical, social, and alternate-language metadata.
- `src/styles/`: responsive layout, self-hosted fonts, full-page aurora composition, reduced-motion rules.
- `src/scripts/`: inertial hero geometry and the autonomous tsParticles background lifecycle.
- `src/assets/`: prepared portrait; Astro emits appropriately sized WebP variants.
- `public/`: favicon, social cards, official institutional assets, and font licenses.
- `tests/`: built-site regression checks using Node's test runner.
- `deploy/`: container, static-server configuration, and restricted deployment receiver.

Raw CVs, private award paperwork, reference images, and interview notes are deliberately excluded from Git and the Docker context. `portfolio-agent-handoff/` is local input, never web content. CV downloads are omitted until public versions are selected. No analytics, cookies, database, or contact backend is used. The page-wide background uses locally bundled tsParticles modules and CSS auroras; it has no external runtime requests or cursor interactions. Animation starts automatically, suspends in hidden tabs, and respects the system reduced-motion preference.

## Production

GitHub Actions checks each pull request. A successful push to `main` builds and streams a revision-tagged Docker image to Hetzner via a dedicated restricted SSH key. The receiver checks container health and the exact deployed revision; a failed release restores the previous image. HTTPS is handled by the existing Traefik instance. No production Node runtime is needed.

See [deployment and rollback](docs/deployment.md), [asset provenance](docs/assets.md), [institutional support](docs/support-notes.md), and [validation notes](docs/validation.md).

The existing `AGENTS.md` is retained unchanged; this README documents the actual initialized project.
