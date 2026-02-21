"""
Beet Backend API
----------------
Receives ESP32 triage submissions, creates Canton PendingDiagnosis contracts
via `daml script` subprocess (gRPC port 6865), and anchors finalized record
hashes in ADI.

Endpoints:
  GET  /health          — liveness check
  POST /submit          — accept ESP32 submission
  POST /confirm         — confirm a PendingDiagnosis (promote to DiagnosisRecord)
  GET  /records         — list DiagnosisRecord contracts from Canton
"""

import hashlib
import json
import logging
import os
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path

# Load .env file before reading any os.getenv() calls
_ENV_FILE = Path(__file__).parent / ".env"
if _ENV_FILE.exists():
    with open(_ENV_FILE) as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _, _v = _line.partition("=")
                os.environ.setdefault(_k.strip(), _v.strip())

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

# ---------------------------------------------------------------------------
# Config (set via environment variables in production)
# ---------------------------------------------------------------------------
CANTON_HOST   = os.getenv("CANTON_HOST", "localhost")
CANTON_PORT   = os.getenv("CANTON_PORT", "6865")

# Path to the compiled DAR — relative to this file, or override via env
_HERE = Path(__file__).parent
DAR_PATH = os.getenv(
    "DAR_PATH",
    str((_HERE / ".." / "daml" / ".daml" / "dist" / "beet-0.0.1.dar").resolve()),
)

ADI_API_URL   = os.getenv("ADI_API_URL", "https://api.adi.example.com")
ADI_API_KEY   = os.getenv("ADI_API_KEY", "")

CLINIC_PARTY          = os.getenv("CLINIC_PARTY",          "clinic::1220f9b117c208827a8a8eb3c343dae5f65e836859ed529359e4bfafcd14f7bdfbd4")
PATIENT_PARTY         = os.getenv("PATIENT_PARTY",         "patient::1220f9b117c208827a8a8eb3c343dae5f65e836859ed529359e4bfafcd14f7bdfbd4")
PUBLIC_HEALTH_AUTH    = os.getenv("PUBLIC_HEALTH_AUTH_PARTY", "publicHealthAuth::1220f9b117c208827a8a8eb3c343dae5f65e836859ed529359e4bfafcd14f7bdfbd4")

VALID_DIAGNOSES = {"Flu", "Cold", "COVID", "Healthy", "Unknown"}

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# In-memory store of all accepted submissions (survives only while server is running)
_submissions: list[dict] = []


# ---------------------------------------------------------------------------
# Canton helpers (daml script over gRPC)
# ---------------------------------------------------------------------------

def _run_daml_script(script_name: str, args: dict) -> str:
    """
    Run a DAML script against the local Canton sandbox and return its result.

    The script must be of type  SomeArgs -> Script Text  (or Script [Text])
    and the args dict must match the DAML record fields exactly.
    Returns the raw JSON string from the output file.
    """
    input_f  = tempfile.NamedTemporaryFile(mode="w",  suffix=".json", delete=False, prefix="beet_in_")
    output_f = tempfile.NamedTemporaryFile(mode="w",  suffix=".json", delete=False, prefix="beet_out_")
    input_path  = input_f.name
    output_path = output_f.name
    input_f.close()
    output_f.close()

    try:
        json.dump(args, open(input_path, "w"))
        cmd = [
            "daml", "script",
            "--dar",            DAR_PATH,
            "--script-name",    script_name,
            "--ledger-host",    CANTON_HOST,
            "--ledger-port",    CANTON_PORT,
            "--input-file",     input_path,
            "--output-file",    output_path,
        ]
        logger.info(f"[daml script] running: {' '.join(cmd)}")
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=60,
        )
        logger.info(f"[daml script] stdout: {result.stdout!r}")
        logger.info(f"[daml script] stderr: {result.stderr[-500:]!r}")
        if result.returncode != 0:
            raise RuntimeError(
                f"daml script exited {result.returncode}:\n{result.stderr}"
            )
        # Read from the output file daml script wrote to
        raw = Path(output_path).read_text().strip()
        logger.info(f"[daml script] output file content: {raw!r}")
        return raw
    finally:
        for p in (input_path, output_path):
            try:
                os.unlink(p)
            except OSError:
                pass


def _create_pending_diagnosis(data: dict) -> dict:
    """Create a PendingDiagnosis contract on Canton via daml script."""
    args = {
        "clinicParty":  CLINIC_PARTY,
        "sessionId":    data["session_id"],
        "diagnosis":    data["diagnosis"],
        "symptomHash":  data["symptom_hash"],
        "confidence":   round(float(data["confidence"]), 6),
    }
    raw = _run_daml_script("Scripts:createPendingDiagnosis", args)
    # Script returns the contract ID as a JSON string e.g. "\"00abc123...\""
    contract_id = json.loads(raw) if raw else "unknown"
    return {"contractId": contract_id, "payload": args}


def _confirm_pending_diagnosis(contract_id: str, patient: str, pha: str) -> dict:
    """Exercise Confirm choice on a PendingDiagnosis → DiagnosisRecord."""
    args = {
        "clinicParty":      CLINIC_PARTY,
        "pendingCid":       contract_id,
        "patientParty":     patient,
        "publicHealthAuth": pha,
    }
    raw = _run_daml_script("Scripts:confirmDiagnosis", args)
    new_cid = json.loads(raw) if raw else "unknown"
    return {"exerciseResult": new_cid}


def _list_diagnosis_records() -> list:
    """Fetch all DiagnosisRecord contracts visible to the clinic party."""
    args = {"clinicParty": CLINIC_PARTY}
    raw = _run_daml_script("Scripts:listDiagnosisRecords", args)
    # Script returns [Text] — list of contract IDs
    cids = json.loads(raw) if raw else []
    return [{"contractId": cid} for cid in cids]


# ---------------------------------------------------------------------------
# ADI helper — calls the ADI anchor microservice (server.js on port 8787)
# ---------------------------------------------------------------------------

ADI_SERVICE_URL = os.getenv("ADI_SERVICE_URL", "http://localhost:8787")

def anchor_to_adi(session_id: str, data: dict, contract_id: str) -> dict:
    """
    POST a DiagnosisRecord to the ADI anchor service (server.js).

    The service hashes the payload with keccak256 and writes it on-chain
    to the ADI testnet smart contract.

    Expected body shape matches server.js validate():
      { contractId, payload: { clinic, patient, publicHealthAuth,
        sessionId, diagnosis, symptomHash, confidence, submittedAt, anchored } }
    """
    now_iso = datetime.now(timezone.utc).isoformat()

    body = {
        "contractId": contract_id,
        "payload": {
            "clinic":           CLINIC_PARTY,
            "patient":          PATIENT_PARTY,
            "publicHealthAuth": PUBLIC_HEALTH_AUTH,
            "sessionId":        session_id,
            "diagnosis":        data.get("diagnosis", "Unknown"),
            "symptomHash":      data.get("symptom_hash", ""),
            "confidence":       str(data.get("confidence", 0)),
            "submittedAt":      now_iso,
            "anchored":         False,
        },
    }

    resp = requests.post(
        f"{ADI_SERVICE_URL}/anchor",
        headers={"Content-Type": "application/json"},
        json=body,
        timeout=15,
    )
    resp.raise_for_status()
    result = resp.json()
    return {
        "tx_hash":     result.get("txHash"),
        "block":       result.get("blockNumber"),
        "payload_hash": result.get("payloadHash"),
        "record_hash": result.get("payloadHash"),   # alias for UI compat
    }


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

def validate_submission(data: dict) -> tuple[bool, str]:
    required = ["session_id", "symptom_hash", "diagnosis", "confidence"]
    for field in required:
        if field not in data:
            return False, f"Missing required field: '{field}'"
    if not isinstance(data["confidence"], (int, float)):
        return False, "'confidence' must be a number"
    if not (0.0 <= float(data["confidence"]) <= 1.0):
        return False, "'confidence' must be between 0.0 and 1.0"
    if data["diagnosis"] not in VALID_DIAGNOSES:
        return False, f"Unknown diagnosis '{data['diagnosis']}'. Valid: {sorted(VALID_DIAGNOSES)}"
    if not isinstance(data["session_id"], str) or len(data["session_id"]) < 8:
        return False, "'session_id' must be a non-empty string"
    if not isinstance(data["symptom_hash"], str) or len(data["symptom_hash"]) != 64:
        return False, "'symptom_hash' must be a 64-character SHA-256 hex string"
    return True, ""


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "beet-backend", "version": "0.1.0"})


@app.route("/submit", methods=["POST"])
def submit():
    """
    Primary ingestion endpoint — called by the ESP32 after a triage session.

    Expected body:
    {
      "session_id":   "uuid-string",
      "symptom_hash": "sha256hex",
      "diagnosis":    "Flu" | "Cold" | "COVID" | "Healthy" | "Unknown",
      "confidence":   0.78
    }
    """
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    valid, error = validate_submission(data)
    if not valid:
        return jsonify({"error": error}), 422

    logger.info(f"[submit] session={data['session_id']} diagnosis={data['diagnosis']} conf={data['confidence']}")

    # Step 1 — Create Canton PendingDiagnosis contract via daml script
    try:
        canton_resp = _create_pending_diagnosis(data)
    except Exception as e:
        logger.error(f"[submit] Canton error: {e}")
        return jsonify({"error": "Failed to create Canton contract", "detail": str(e)}), 502

    contract_id = canton_resp.get("contractId", "unknown")
    logger.info(f"[submit] Canton PendingDiagnosis created: {contract_id}")

    # Step 2 — Anchor to ADI anchor service (non-fatal)
    adi_result = {}
    try:
        adi_result = anchor_to_adi(
            data["session_id"],
            data,
            contract_id,
        )
        logger.info(f"[submit] ADI anchor hash={adi_result.get('record_hash', '')[:12]}...")
    except requests.exceptions.RequestException as e:
        logger.warning(f"[submit] ADI anchoring failed (non-fatal): {e}")
        adi_result = {"error": str(e), "record_hash": None}

    # Step 3 — Cache full record for the UI
    record = {
        "session_id":         data["session_id"],
        "canton_contract_id": contract_id,
        "diagnosis":          data["diagnosis"],
        "confidence":         float(data["confidence"]),
        "symptom_hash":       data["symptom_hash"],
        "adi_hash":           adi_result.get("record_hash"),
        "submitted_at":       datetime.now(timezone.utc).isoformat(),
        "status":             "pending",
    }
    _submissions.insert(0, record)   # newest first

    return jsonify({
        "status":             "accepted",
        "session_id":         data["session_id"],
        "canton_contract_id": contract_id,
        "adi_hash":           adi_result.get("record_hash"),
        "adi_asset_id":       adi_result.get("asset_id"),
    }), 201


@app.route("/confirm", methods=["POST"])
def confirm():
    """
    Confirm a PendingDiagnosis and bind patient + authority observers.

    Expected body:
    {
      "pending_contract_id": "...",
      "patient":             "patient::...",
      "public_health_auth":  "pha::..."
    }
    """
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    for field in ["pending_contract_id", "patient", "public_health_auth"]:
        if field not in data:
            return jsonify({"error": f"Missing field: '{field}'"}), 422

    try:
        result = _confirm_pending_diagnosis(
            data["pending_contract_id"],
            data["patient"],
            data["public_health_auth"],
        )
    except Exception as e:
        logger.error(f"[confirm] Canton error: {e}")
        return jsonify({"error": "Failed to confirm contract", "detail": str(e)}), 502

    logger.info(f"[confirm] DiagnosisRecord created: {result.get('exerciseResult')}")
    return jsonify({"status": "confirmed", **result}), 200


@app.route("/records", methods=["GET"])
def list_records():
    """Return cached submissions with full payload for the UI dashboard."""
    try:
        records = _submissions
        return jsonify({"count": len(records), "records": records}), 200
    except Exception as e:
        logger.error(f"[records] Canton query error: {e}")
        return jsonify({"error": "Failed to query Canton", "detail": str(e)}), 502


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    port  = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    logger.info(f"Beet backend starting on port {port} — Canton gRPC: {CANTON_HOST}:{CANTON_PORT}")
    logger.info(f"DAR path: {DAR_PATH}")
    app.run(host="0.0.0.0", port=port, debug=debug)
