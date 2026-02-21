# 🟢 Beet — Decentralized Public Health Triage Infrastructure

> **"Canton enforces agreement. ADI enforces integrity."**

Beet is a workflow-governed edge health triage system combining IoT biosensors, Canton smart contracts, and ADI Chain anchoring to deliver tamper-proof, privacy-preserving disease detection for hospitals, NGOs, and governments.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Privacy Model](#privacy-model)
- [Repository Structure](#repository-structure)
- [Setup & Installation](#setup--installation)
- [Canton DevNet Deployment](#canton-devnet-deployment)
- [ADI Chain Integration](#adi-chain-integration)
- [Demo](#demo)

---

## Overview

Global health infrastructure was not built for the speed of modern pandemics. Health data passes through multiple intermediaries, creating opportunities for suppression, alteration, or political manipulation — and millions die from diseases that could have been contained with earlier detection.

**Beet solves this with three layers:**

| Layer | Technology | Role |
|---|---|---|
| **Edge** | ESP32 + LCD | Offline symptom capture, deterministic inference |
| **Governance** | Canton + DAML | Multi-party workflow enforcement, privacy-first access control |
| **Integrity** | ADI Chain | Immutable public anchoring of record hashes |

Beet is **not a medical AI**. It is a deterministic, rule-based triage tool whose outputs become governed records via Canton smart contracts and are integrity-anchored on ADI Chain.

---

## Architecture

```
ESP32 (Beet Device)
      │  HTTP POST /submit
      ▼
Backend API (Flask)
      │  Daml JSON API
      ▼
Canton Network ──── Multi-party workflow, privacy, authorization
      │  SHA-256 hash of finalized contract
      ▼
ADI Chain ────────── Immutable public anchoring
      │
      ▼
ADI Explorer ──────── Public audit trail
```

### Data Flow

1. Patient interacts with the ESP32 device via LCD and buttons
2. ESP32 runs deterministic weighted inference — no ML, fully explainable
3. ESP32 computes SHA-256 of symptom bitmask — raw symptom data stays on device
4. ESP32 POSTs `{ session_id, symptom_hash, diagnosis, confidence }` to backend
5. Backend creates a `PendingDiagnosis` contract on Canton
6. Clinic confirms → promoted to a `DiagnosisRecord` with patient + authority as observers
7. Backend hashes the finalized contract payload and anchors it on ADI Chain
8. ADI Explorer shows record hash, timestamp, and asset type — publicly auditable

---

## Privacy Model

This is the core of Beet's Canton implementation. Different parties see different data — enforced at the protocol level, not the application level.

### Party Roles

| Party | Role | What They Can See |
|---|---|---|
| `clinic` | **Signatory** | Full contract: diagnosis, symptom hash, confidence, patient ref, timestamps |
| `patient` | **Observer** | Their own record — diagnosis and session ID |
| `publicHealthAuth` | **Observer** | Aggregate metadata for outbreak monitoring — no individual patient data |

### Canton Contract Hierarchy

```
PendingDiagnosis          ← Created on ESP32 submission (clinic signatory only)
      │ Confirm()
      ▼
DiagnosisRecord           ← Finalized record (patient + authority added as observers)
      │ EscalateToAuthority()
      ▼
AgreementPending          ← Awaiting authority co-sign (clinic signatory, authority observer)
      │ Authorize()
      ▼
JointRecord               ← Co-signed by BOTH clinic AND authority (outbreak-level artifact)
```

**Key guarantees enforced by Canton:**
- Only the `clinic` signatory can create or modify contracts
- `patient` and `publicHealthAuth` can read records but cannot modify them
- `JointRecord` requires co-signature from both clinic AND authority — neither can act unilaterally
- Once a contract is finalized, modifications require re-authorization by all signatories
- Soft-discard (`Discard` choice) does NOT remove the ADI anchor — immutability is preserved

### Why Canton + ADI Together

Canton alone is a private, permissioned network — the outside world cannot independently verify that records haven't been altered. ADI alone has no workflow enforcement. Together:

- **Canton** guarantees the right parties agreed to a record
- **ADI** guarantees that record cannot be silently altered retroactively

An auditor verifies integrity by re-computing `SHA-256(contract payload)` and checking it against the ADI anchor. A mismatch proves tampering.

---

## Repository Structure

```
beet/
├── daml/                      # Canton smart contracts
│   ├── daml.yaml              # Project config (DAML SDK 3.4.11)
│   └── daml/
│       └── Main.daml          # DiagnosisRecord, PendingDiagnosis, AgreementPending, JointRecord
│
├── backend/                   # Flask API server
│   ├── app.py                 # /submit, /confirm, /records endpoints
│   ├── requirements.txt
│   └── .env.example           # Environment variable template
│
├── hardware/                  # ESP32 firmware
│   └── beet_device.ino        # Symptom questionnaire, inference engine, HTTP POST
│
├── infra/
│   └── adi/
│       └── anchor.py          # ADI anchoring script (single-pass or --watch mode)
│
├── app/                       # Next.js web UI
│   ├── page.tsx               # Landing page
│   ├── hospital-operations/   # Hospital dashboard
│   └── ngo-governments/       # NGO & Government portal
│
└── components/                # Shared React components
```

---

## Setup & Installation

### Prerequisites

- [DAML SDK 3.4.11](https://docs.digitalasset.com/build/3.4/dpm/dpm.html)
- Python 3.9+
- Node.js 18+
- Arduino IDE (for ESP32 firmware only)

### 1. Clone the Repo

```bash
git clone https://github.com/your-org/beet.git
cd beet
```

### 2. DAML Contracts (Local Sandbox)

```bash
cd daml

# Build the DAR
daml build

# Start sandbox with JSON API on port 7575
daml sandbox --json-api-port 7575 --dar .daml/dist/beet-0.0.1.dar

# New terminal — allocate parties
daml ledger allocate-parties clinic patient publicHealthAuth
# Copy the clinic::... party ID for the backend config
```

### 3. Backend API

```bash
cd backend
pip3 install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set CLINIC_PARTY to the ID from step 2

PORT=8000 python3 app.py
```

Verify it's running:
```bash
curl http://localhost:8000/health
# → {"service":"beet-backend","status":"ok","version":"0.1.0"}
```

Submit a test triage record:
```bash
curl -X POST http://localhost:8000/submit \
  -H "Content-Type: application/json" \
  -d '{
    "session_id":   "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "symptom_hash": "a3f1c2b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
    "diagnosis":    "Flu",
    "confidence":   0.78
  }'
```

### 4. Web UI

```bash
# From repo root
npm install
npm run dev
# → http://localhost:3000
```

### 5. ESP32 Firmware

1. Open `hardware/beet_device.ino` in Arduino IDE
2. Install libraries via Library Manager: `LiquidCrystal_I2C`, `ArduinoJson`
3. Edit the config block at the top of the file:
   ```cpp
   const char* WIFI_SSID     = "your-wifi";
   const char* WIFI_PASSWORD = "your-password";
   const char* BACKEND_URL   = "http://your-backend-ip:8000/submit";
   ```
4. Flash to ESP32 (tested on ESP32 DevKit)

### 6. ADI Anchoring Script

```bash
cd infra/adi
pip3 install requests

# Set environment variables
export ADI_API_URL=https://your-adi-endpoint
export ADI_API_KEY=your_api_key
export CLINIC_PARTY=clinic::...
export DAML_JSON_API_URL=http://localhost:7575

# Single pass
python3 anchor.py

# Continuous watch mode (polls every 30s)
python3 anchor.py --watch --interval 30
```

---

## Canton DevNet Deployment

Beet is deployed on Canton L1 DevNet for the ETHDenver hackathon.

### Validator Setup

```bash
# SSH into a devnet machine
ssh dev1@34.173.195.33   # password: CantonDev1!

# Start validator
cd ~/splice-node/docker-compose/validator
export IMAGE_TAG=0.5.10
COMPOSE_PROJECT_NAME=splice_dev1 docker compose up -d

# Get onboarding secret
curl --max-time 30 -X POST \
  https://sv.sv-1.dev.global.canton.network.sync.global/api/sv/v0/devnet/onboard/validator/prepare \
  -H "Content-Type: application/json" \
  -d '{}'

# Configure validator with the secret
echo "ONBOARDING_SECRET=<secret-from-above>" >> .env
COMPOSE_PROJECT_NAME=splice_dev1 docker compose up -d
```

### Upload DAR to DevNet

```bash
cd daml
daml ledger upload-dar .daml/dist/beet-0.0.1.dar \
  --host <devnet-participant-host> \
  --port 5001
```

### Allocate Parties on DevNet

```bash
daml ledger allocate-parties clinic patient publicHealthAuth \
  --host <devnet-participant-host> \
  --port 5001
```

---

## ADI Chain Integration

Beet uses ADI Chain as the public integrity layer. After a Canton contract is finalized, the backend computes a canonical SHA-256 hash of the contract payload and anchors it on ADI Chain.

**What is anchored on ADI (public):**
```json
{
  "asset_type": "DiagnosisRecord",
  "session_id": "a1b2c3d4-...",
  "hash":       "8f3a9c2d...",
  "metadata": {
    "diagnosis":    "Flu",
    "anchored_at":  "2026-02-21T04:33:05Z"
  }
}
```

**What stays private (Canton only):**
- Patient identity
- Raw symptom data
- Full clinical metadata

The hash cannot be reversed. Auditors verify integrity by re-computing `SHA-256(contract payload)` locally and comparing against the ADI anchor. Any mismatch proves the record was altered after anchoring.

---

## Demo

**Demo flow:**
1. Patient answers 6 yes/no symptom questions on the ESP32 device
2. LCD displays diagnosis (Flu / Cold / COVID / Strep / Healthy) and confidence score
3. Backend creates a Canton `PendingDiagnosis` contract (clinic signatory)
4. Clinic confirms → `DiagnosisRecord` — patient and authority added as observers
5. Record hash anchored on ADI Chain via `infra/adi/anchor.py`
6. ADI Explorer shows public proof of record integrity
7. Hospital dashboard (`/hospital-operations`) shows live clinical data
8. NGO & Government portal (`/ngo-governments`) shows outbreak intelligence

---

## Design Philosophy

Beet separates three concerns that are often conflated in health data systems:

- **Computation** → Edge (ESP32): deterministic, explainable, offline-capable
- **Governance** → Canton: who can create, see, and modify records
- **Integrity** → ADI: cryptographic proof that records were not tampered with

It is not an AI replacement for doctors. It is trust-minimized infrastructure for the places that need it most.

---

*Built at ETHDenver 2026*
