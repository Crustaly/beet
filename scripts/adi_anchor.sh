#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 3 ]; then
  echo "Usage: $0 <sha256-hash> <device-id> <region-general>"
  exit 1
fi

REPORT_HASH="$1"
DEVICE_ID="$2"
REGION_GENERAL="$3"

if [ -z "${ADI_ANCHOR_CMD:-}" ]; then
  echo "Set ADI_ANCHOR_CMD to the exact CLI command template for your ADI environment."
  echo "Template variables available: {HASH}, {DEVICE_ID}, {REGION_GENERAL}, {RPC_URL}"
  echo "Example:"
  echo "  export ADI_ANCHOR_CMD='adi tx anchor --hash {HASH} --device {DEVICE_ID} --region {REGION_GENERAL} --rpc {RPC_URL}'"
  exit 1
fi

RPC_URL="${ADI_RPC_URL:-}"
CMD="${ADI_ANCHOR_CMD//\{HASH\}/$REPORT_HASH}"
CMD="${CMD//\{DEVICE_ID\}/$DEVICE_ID}"
CMD="${CMD//\{REGION_GENERAL\}/$REGION_GENERAL}"
CMD="${CMD//\{RPC_URL\}/$RPC_URL}"

echo "Executing ADI anchor command..."
echo "$CMD"
eval "$CMD"
