#!/usr/bin/env python3
"""
Beet ADI Anchoring Script
─────────────────────────────────────────────────────────────────────────────
Polls Canton for finalized DiagnosisRecord contracts that have not yet been
anchored, hashes each one, POSTs the hash to ADI, then exercises the
MarkAnchored choice back on Canton to mark it complete.

Run manually:
  python anchor.py

Or on a cron / loop (pass --watch to poll continuously):
  python anchor.py --watch --interval 30

Environment variables:
  DAML_JSON_API_URL   Canton Daml JSON API base URL  (default: http://localhost:7575)
  ADI_API_URL         ADI anchoring API base URL      (required in production)
  ADI_API_KEY         Bearer token for ADI API        (optional for testnet)
  CLINIC_PARTY        Canton party ID for the clinic  (required)
  LEDGER_ID           Canton ledger ID                (default: beet-sandbox)
─────────────────────────────────────────────────────────────────────────────
"""

import argparse
import base64
import hashlib
import json
import logging
import os
import sys
import time
from datetime import datetime, timezone
from typing import Optional

import requests

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
DAML_JSON_API_URL = os.getenv("DAML_JSON_API_URL", "http://localhost:7575")
ADI_API_URL       = os.getenv("ADI_API_URL",       "https://api.adi.example.com")
ADI_API_KEY       = os.getenv("ADI_API_KEY",       "")
CLINIC_PARTY      = os.getenv("CLINIC_PARTY",      "clinic::beet-sandbox")
LEDGER_ID         = os.getenv("LEDGER_ID",         "beet-sandbox")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("beet.anchor")


# ---------------------------------------------------------------------------
# Canton auth
# ---------------------------------------------------------------------------

def get_jwt_token() -> str:
    """
    Build an unsigned Canton sandbox JWT.
    Replace with a proper signed token from your auth service in production.
    """
    claims = {
        "https://daml.com/ledger-api": {
            "ledgerId":     LEDGER_ID,
            "applicationId": "beet-anchor",
            "actAs":        [CLINIC_PARTY],
            "readAs":       [CLINIC_PARTY],
        }
    }
    header  = base64.urlsafe_b64encode(b'{"alg":"RS256","typ":"JWT"}').rstrip(b"=").decode()
    payload = base64.urlsafe_b64encode(json.dumps(claims).encode()).rstrip(b"=").decode()
    return f"{header}.{payload}."


def canton_headers() -> dict:
    return {
        "Content-Type":  "application/json",
        "Authorization": f"Bearer {get_jwt_token()}",
    }


# ---------------------------------------------------------------------------
# Hashing
# ---------------------------------------------------------------------------

def hash_contract(payload: dict) -> str:
    """Canonical SHA-256 of the sorted-key JSON payload."""
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode()).hexdigest()


# ---------------------------------------------------------------------------
# Canton queries
# ---------------------------------------------------------------------------

def fetch_unanchored_contracts() -> list[dict]:
    """
    Query Canton for all DiagnosisRecord contracts where anchored = False.
    Returns a list of contract objects (with contractId + payload).
    """
    body = {
        "templateIds": ["Main:DiagnosisRecord"],
        "query":       {"anchored": False},
    }
    resp = requests.post(
        f"{DAML_JSON_API_URL}/v1/query",
        headers=canton_headers(),
        json=body,
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json().get("result", [])


def mark_anchored(contract_id: str) -> None:
    """
    Exercise the MarkAnchored choice on a DiagnosisRecord contract.
    This creates a new contract version with anchored = True.
    """
    body = {
        "templateId": "Main:DiagnosisRecord",
        "contractId": contract_id,
        "choice":     "MarkAnchored",
        "argument":   {},
    }
    resp = requests.post(
        f"{DAML_JSON_API_URL}/v1/exercise",
        headers=canton_headers(),
        json=body,
        timeout=10,
    )
    resp.raise_for_status()
    logger.info(f"  ✓ Canton MarkAnchored exercised on {contract_id[:20]}...")


# ---------------------------------------------------------------------------
# ADI submission
# ---------------------------------------------------------------------------

def anchor_to_adi(session_id: str, payload: dict, record_hash: str) -> dict:
    """
    POST the record hash + metadata to ADI for immutable anchoring.
    Returns the ADI API response body.
    """
    body = {
        "asset_type": "DiagnosisRecord",
        "session_id": session_id,
        "hash":       record_hash,
        "metadata": {
            "diagnosis":    payload.get("diagnosis"),
            "confidence":   payload.get("confidence"),
            "clinic":       payload.get("clinic"),
            "submitted_at": payload.get("submittedAt"),
            "anchored_at":  datetime.now(timezone.utc).isoformat(),
        },
    }

    headers = {"Content-Type": "application/json"}
    if ADI_API_KEY:
        headers["Authorization"] = f"Bearer {ADI_API_KEY}"

    resp = requests.post(
        f"{ADI_API_URL}/v1/anchor",
        headers=headers,
        json=body,
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


# ---------------------------------------------------------------------------
# Core loop
# ---------------------------------------------------------------------------

def process_once() -> tuple[int, int]:
    """
    Fetch all unanchored DiagnosisRecord contracts, anchor them, mark them.
    Returns (success_count, failure_count).
    """
    contracts = fetch_unanchored_contracts()

    if not contracts:
        logger.info("No unanchored contracts found.")
        return 0, 0

    logger.info(f"Found {len(contracts)} unanchored contract(s) — processing...")

    success, failure = 0, 0

    for c in contracts:
        contract_id = c.get("contractId", "unknown")
        payload     = c.get("payload", {})
        session_id  = payload.get("sessionId", "unknown")

        logger.info(f"Processing session={session_id}  contract={contract_id[:20]}...")

        try:
            # Step 1 — compute canonical hash
            record_hash = hash_contract(payload)
            logger.info(f"  hash={record_hash[:16]}...")

            # Step 2 — anchor in ADI
            adi_resp = anchor_to_adi(session_id, payload, record_hash)
            adi_asset_id = adi_resp.get("asset_id", "N/A")
            logger.info(f"  ✓ ADI anchor accepted  asset_id={adi_asset_id}")

            # Step 3 — mark anchored in Canton
            mark_anchored(contract_id)

            success += 1

        except requests.exceptions.RequestException as e:
            logger.error(f"  ✗ Failed: {e}")
            failure += 1
        except Exception as e:
            logger.exception(f"  ✗ Unexpected error: {e}")
            failure += 1

    return success, failure


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Beet ADI anchoring — hashes Canton DiagnosisRecords and anchors them in ADI."
    )
    parser.add_argument(
        "--watch",
        action="store_true",
        help="Run in a continuous polling loop instead of exiting after one pass.",
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=30,
        help="Polling interval in seconds when --watch is set (default: 30).",
    )
    args = parser.parse_args()

    logger.info("Beet ADI Anchoring Script starting")
    logger.info(f"  Canton API : {DAML_JSON_API_URL}")
    logger.info(f"  ADI API    : {ADI_API_URL}")
    logger.info(f"  Clinic     : {CLINIC_PARTY}")

    if args.watch:
        logger.info(f"Watch mode: polling every {args.interval}s  (Ctrl-C to stop)")
        while True:
            try:
                success, failure = process_once()
                logger.info(f"Pass complete — {success} anchored, {failure} failed.")
            except KeyboardInterrupt:
                logger.info("Interrupted. Exiting.")
                sys.exit(0)
            except Exception as e:
                logger.error(f"Pass error: {e}")
            time.sleep(args.interval)
    else:
        success, failure = process_once()
        logger.info(f"Done — {success} anchored, {failure} failed.")
        sys.exit(0 if failure == 0 else 1)


if __name__ == "__main__":
    main()
