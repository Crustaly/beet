# Architecture Overview

## Layer 1: Hardware

- Offline ESP32 device captures symptom inputs.
- Local risk scoring runs on-device.
- Encrypted report is stored locally and queued for sync.

## Layer 2: ADI Public Proof

- Only report hashes and metadata are anchored.
- Anchoring creates immutable timestamp and proof of existence.
- No raw health payload is published.

## Layer 3: DAML + Canton

- `PatientReport` holds sensitive details under party-based visibility rules.
- `HospitalAggregate` is derived by authorized hospital workflows.
- `DataLicense` formalizes aggregate-data access agreements.

## Layer 4: UI

- Patient portal: consent and diagnosis visibility.
- Hospital dashboard: region-level planning and staffing inputs.
- Research interface: aggregate-only analytics.
