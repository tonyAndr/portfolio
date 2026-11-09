# Repository Guidelines

## Project Structure & Module Organization

This repository is currently empty: no source code, assets, tests, or build configuration exist yet. When adding the initial implementation, organize application code under `src/`, static assets under `public/` or `assets/`, and tests alongside source files or in `tests/`. Choose the layout that fits the selected framework and document it in `README.md`.

Keep related components, styles, and supporting utilities together. Avoid introducing directories before they are needed.

## Build, Test, and Development Commands

No development, build, lint, or test commands are configured. When selecting the toolchain:

- Define repeatable commands for running locally, building, linting, and testing.
- Document exact commands and required runtime versions in `README.md`.
- Commit the appropriate dependency lockfile and use its package manager consistently.

Do not document commands as available until their configuration exists.

## Coding Style & Naming Conventions

Follow the chosen language and framework conventions. Add formatter and linter configuration early so contributors share one enforceable style.

Use descriptive names, keep modules focused, and follow established neighboring files once code exists. Prefer lowercase, hyphen-separated names for static assets, such as `profile-photo.webp`.

## Testing Guidelines

No testing framework or coverage target is configured. Establish these with the initial application. Name tests consistently, for example `feature.test.ts` if supported by the selected tooling. Cover important behavior and bug regressions, and document how to run the suite.

## Commit & Pull Request Guidelines

No Git history exists to establish a commit convention. Use concise, imperative commit subjects, such as `Add portfolio landing page`, and keep changes focused.

Pull requests should describe the change, link relevant issues, report validation performed, and include screenshots for visual changes. Explain any setup changes or checks that could not be run.

## Security & Configuration

Keep credentials and local environment files out of version control. Provide placeholder configuration examples when environment variables are required.
