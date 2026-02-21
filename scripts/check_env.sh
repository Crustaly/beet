#!/usr/bin/env bash
set -euo pipefail

check_cmd() {
  local name="$1"
  if command -v "$name" >/dev/null 2>&1; then
    echo "[ok] $name: $(command -v "$name")"
  else
    echo "[missing] $name"
  fi
}

echo "Checking required tooling..."
check_cmd brew
check_cmd daml
check_cmd docker
check_cmd docker-compose
check_cmd java
check_cmd node
check_cmd npm
check_cmd curl
check_cmd jq

if ! command -v daml >/dev/null 2>&1 && [ -x "$HOME/.daml/bin/daml" ]; then
  echo "[ok] daml (fallback): $HOME/.daml/bin/daml"
fi

echo
echo "If daml or docker are missing, run: make install"
