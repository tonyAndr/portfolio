#!/bin/sh
set -eu

DEPLOY_DIR=/home/tony/docker/portfolio
COMPOSE_FILE="$DEPLOY_DIR/compose.yml"
LOCK_FILE="$DEPLOY_DIR/.deploy.lock"

fail() {
  echo "portfolio deploy: $*" >&2
  exit 1
}

command=${SSH_ORIGINAL_COMMAND:-}
case "$command" in
  "deploy "*) image_tag=${command#deploy } ;;
  *) fail "unsupported command" ;;
esac
case "$image_tag" in
  ''|*[!0-9a-f]*) fail "invalid image tag" ;;
esac
[ "${#image_tag}" -eq 40 ] || fail "invalid image tag"

[ -f "$COMPOSE_FILE" ] || fail "missing compose file"
mkdir -p "$DEPLOY_DIR"
exec 9>"$LOCK_FILE"
flock -n 9 || fail "another deployment is in progress"

archive=$(mktemp "$DEPLOY_DIR/.image.XXXXXX.tar.gz")
cleanup() { rm -f "$archive"; }
trap cleanup EXIT HUP INT TERM
cat > "$archive"
gzip -t "$archive" || fail "invalid image archive"
docker load -i "$archive"

image="portfolio:$image_tag"
docker image inspect "$image" >/dev/null 2>&1 || fail "loaded image $image not found"

current_file="$DEPLOY_DIR/.current-image"
previous_file="$DEPLOY_DIR/.previous-image"
previous=
if [ -s "$current_file" ]; then
  previous=$(cat "$current_file")
fi

if IMAGE="$image" docker compose -f "$COMPOSE_FILE" up -d --wait --wait-timeout 90; then
  if revision=$(curl --fail --silent --show-error --max-time 5 http://127.0.0.1:8089/version.txt) && [ "$revision" = "$image_tag" ]; then
    [ -z "$previous" ] || printf '%s\n' "$previous" > "$previous_file"
    printf '%s\n' "$image" > "$current_file"
    echo "portfolio deployed: $image"
    exit 0
  fi
fi

echo "portfolio deploy: health verification failed for $image" >&2
if [ -n "$previous" ] && docker image inspect "$previous" >/dev/null 2>&1; then
  echo "portfolio deploy: restoring $previous" >&2
  IMAGE="$previous" docker compose -f "$COMPOSE_FILE" up -d --wait --wait-timeout 90 || true
  exit 1
fi
IMAGE="$image" docker compose -f "$COMPOSE_FILE" down || true
exit 1
