# Deployment

GitHub Actions validates pull requests and builds a static nginx image for pushes to `main` and manual runs. It streams a gzip-compressed Docker image to the VPS over a dedicated SSH key. The key should be restricted to `deploy-image.sh` with `authorized_keys`' `command="..."`, `no-port-forwarding`, `no-agent-forwarding`, `no-X11-forwarding`, and `no-pty` options. The receiver accepts only `deploy <40-character-lowercase-git-sha>` and consumes the image archive on stdin.

## One-time VPS setup

Run these commands as `tony` on the VPS. Install Docker Compose v2, `flock`, `curl`, and `gzip` if they are not already available.

```sh
install -d -m 0755 /home/tony/docker/portfolio
```

Copy `deploy/compose.yml` to `/home/tony/docker/portfolio/compose.yml` and `deploy/deploy-image.sh` to `/home/tony/docker/portfolio/deploy-image.sh`; make the receiver executable and owned by `tony`. Create a separate SSH key for the workflow, then add a forced-command entry to `/home/tony/.ssh/authorized_keys` using the absolute receiver path:

```text
command="/home/tony/docker/portfolio/deploy-image.sh",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty ssh-ed25519 AAAA... portfolio-deploy
```

The key holder can then send deployment archives only; the receiver ignores the requested SSH command except for its narrowly validated deploy argument. Configure repository Actions secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, and `VPS_KNOWN_HOSTS`. `VPS_KNOWN_HOSTS` must contain the pinned host-key entry for the server. `VPS_USER` should be `tony`.

## Routing and DNS

The container listens only on `127.0.0.1:8089`. The existing Traefik instance uses its file provider and host networking, so Docker labels and container network attachment do not configure routes. Add an HTTPS router for `apov.dev` (and `www.apov.dev` only if DNS and canonical redirects are set up) to Traefik's dynamic config, pointing to `http://127.0.0.1:8089`, with the existing `letsencrypt` certificate resolver. Traefik already redirects HTTP to HTTPS. Configure Cloudflare DNS for the apex and `www` to the VPS origin and verify proxy/SSL mode and the HTTP-01 challenge path before expecting certificate issuance.

The one-time routing file is tracked in `deploy/traefik.yml`. Copy it to `/home/tony/docker/traefik/config/portfolio.yml`; the existing file provider reloads it without restarting other services. It routes the apex to the portfolio and permanently redirects `www` to the apex while preserving the path and query.

The production base image is pinned to the verified nginx unprivileged stable image digest. Update that digest intentionally when applying base-image security updates. GitHub Actions builds and smoke-tests the same image on pull requests and production pushes before streaming it to the VPS.

## Rollback

After a successful deployment the receiver stores the active image in `.current-image` and the prior image in `.previous-image`. To roll back manually on the VPS:

```sh
cd /home/tony/docker/portfolio
IMAGE="$(cat .previous-image)" docker compose -f compose.yml up -d --wait
printf '%s\n' "$(cat .previous-image)" > .current-image
```

The receiver retains Docker images; it does not run a broad image prune, so operators can choose a rollback horizon and remove older `portfolio:<sha>` images deliberately.
