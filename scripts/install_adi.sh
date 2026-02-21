#!/usr/bin/env bash
set -euo pipefail

if command -v adi >/dev/null 2>&1; then
  echo "adi already installed: $(command -v adi)"
  exit 0
fi

if [ -z "${ADI_INSTALL_URL:-}" ]; then
  echo "Set ADI_INSTALL_URL to your ADI foundation installer URL, then re-run."
  echo "Example:"
  echo "  ADI_INSTALL_URL=https://example.com/install-adi.sh ./scripts/install_adi.sh"
  exit 1
fi

curl -sSL "$ADI_INSTALL_URL" | sh

if command -v adi >/dev/null 2>&1; then
  echo "adi installed: $(command -v adi)"
else
  echo "adi binary not found on PATH after install."
  exit 1
fi
