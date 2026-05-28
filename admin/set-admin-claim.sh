#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_ACCOUNT_PATH="$SCRIPT_DIR/service-account.json"

if [[ $# -eq 0 ]]; then
  cat >&2 <<'EOF'
Usage:
  ./admin/set-admin-claim.sh --email user@example.com --claims '{"admin":true}'
  ./admin/set-admin-claim.sh user@example.com '{"admin":true}'
  ./admin/set-admin-claim.sh --uid USER_UID --claims '{"admin":true}'
  ./admin/set-admin-claim.sh --email user@example.com --clear
EOF
  exit 1
fi

if [[ ! -f "$SERVICE_ACCOUNT_PATH" ]]; then
  echo "Missing service account file: $SERVICE_ACCOUNT_PATH" >&2
  exit 1
fi

ARGS=("$@")

if [[ "${ARGS[0]}" != --* ]]; then
  if [[ ${#ARGS[@]} -lt 2 ]]; then
    echo "When using positional arguments, provide email and claims JSON." >&2
    exit 1
  fi

  if [[ "${ARGS[1]}" == "--clear" ]]; then
    ARGS=(--email "${ARGS[0]}" --clear "${ARGS[@]:2}")
  else
    ARGS=(--email "${ARGS[0]}" --claims "${ARGS[1]}" "${ARGS[@]:2}")
  fi
fi

GOOGLE_APPLICATION_CREDENTIALS="$SERVICE_ACCOUNT_PATH" \
  npm run --prefix "$SCRIPT_DIR" set-claim -- "${ARGS[@]}"
