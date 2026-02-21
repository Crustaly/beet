#!/usr/bin/env bash
set -euo pipefail

echo "Installing project dependencies for macOS..."

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew not found. Install from https://brew.sh and re-run."
  exit 1
fi

echo "Installing base dependencies..."
brew install jq curl docker docker-compose

if ! command -v daml >/dev/null 2>&1; then
  echo "Installing DAML SDK via installer..."
  curl -sSL https://get.daml.com/ | sh
  if [ -x "$HOME/.daml/bin/daml" ]; then
    export PATH="$HOME/.daml/bin:$PATH"
  fi
fi

if ! command -v daml >/dev/null 2>&1 && [ ! -x "$HOME/.daml/bin/daml" ]; then
  echo "DAML install did not place daml on PATH. Add ~/.daml/bin to PATH."
  exit 1
fi

echo "DAML version:"
"${HOME}/.daml/bin/daml" version

echo
echo "Tooling install complete."
echo "If Docker Desktop is not running, launch it before running Canton."
